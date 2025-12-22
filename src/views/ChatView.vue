<template>
  <div class="chat-container">

    <template v-if="connectStatus === 'FATAL_ERROR'">
      <FatalErrorPage />
    </template>

    <template v-else-if="(connectStatus === 'INIT' || connectStatus === 'CONNECTING') && !hasConnectedEver">
      <LoadingPage :status="connectStatus" />
    </template>

    <template v-else>
      <div class="layout">

        <div class="main-section">
          <MobileHeader v-if="isMobile" :code="chatCode" :status="connectStatus" :users="onlineUsers"
            :max-users="maxUsers" @leave="handleLeaveChat" />

          <n-card class="messages-section" :bordered="true"
            content-style="padding: 0; flex: 1; display: flex; flex-direction: column; min-height: 0;">
            <Messages :messages="messages" :on-resend="handleResendMessage" />
          </n-card>

          <div class="input-section">
            <ChatInput ref="chatInputRef" @send="handleSendMessage" :disabled="!isReady"
              @upload-start="handleUploadStart" @file-removed="handleFileRemoved" :files="filesToUpload"
              :max-files="MAX_FILE_COUNT" />
          </div>
        </div>

        <div class="sidebar-section">
          <div class="info-section">
            <InfoHeader :code="chatCode" :status="connectStatus" @leave="handleLeaveChat" />
          </div>

          <div class="users-section">
            <Users :users="onlineUsers" :max-users="maxUsers" :status="connectStatus" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
//
// Real-time chat session view component. This is the application's core view, 
// responsible for handling the following key logic:
// 1. State Management: Renders loading, error, or main chat interface based on `connectStatus`.
// 2. WebSocket Communication: Manages connection, reconnection, and message exchange 
//    via the `useWebSocketReconnector` Hook.
// 3. Message Handling: Processes all inbound server messages (e.g., initial data, 
//    user messages, system events, message confirmation ACK).
// 4. Message Reliability: Implements temporary ID (tempID) and ACK mechanism, 
//    handling message status ('sending', 'failed', 'sent') and resend logic.
// 5. User Interface: Integrates the message list, input box, info header, and 
//    user list, adapting the layout for mobile/desktop.
//
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NCard, useMessage } from 'naive-ui';
import type { User } from '@/types/user';
import type { UserMessage, SystemMessage, TokenUpdatePayload, ClientMessage, SystemStyleType, ServerMessage, ErrorPayload, InitDataPayload, UserEventPayload, MessageConfirmPayload, TextPayload, OutboundMessage, AttachmentsPayload } from '@/types/chat';
import type { UploadAttachment, Attachment } from '@/types/file';
import { generateTempID } from '@/utils/idGenerator';
import { putFile } from '@/utils/fileUpload';
import { joinChat } from '@/services/chat';
import { presignUpload } from '@/services/file';
import { useUserStore } from '@/stores/user';
import { useRoomStore } from '@/stores/room';
import { useWebSocketReconnector } from '@/hooks/useWebSocketReconnector';
import FatalErrorPage from '@/components/chat/FatalErrorPage.vue';
import LoadingPage from '@/components/chat/LoadingPage.vue';
import MobileHeader from '@/components/chat/MobileHeader.vue';
import Messages from '@/components/chat/Messages.vue';
import InfoHeader from '@/components/chat/InfoHeader.vue';
import Users from '@/components/chat/Users.vue';
import ChatInput from '@/components/chat/ChatInput.vue';
import { useHead } from '@unhead/vue';
import imageCompression from 'browser-image-compression';

const route = useRoute();
const router = useRouter();
const message = useMessage();
const userStore = useUserStore();
const roomStore = useRoomStore();

const chatCode = ref<string | null>(null);
const maxUsers = ref<number>(0);
const currentUser = ref<User | null>(null);
const onlineUsers = ref<User[]>([]);
const messages = ref<ClientMessage[]>([]);
const ACK_TIMEOUT_MS = 5000;
const ackTimers = new Map<string, number>();
const hasSystemMessageShown = ref(false);

interface ChatInputExpose {
  clearInput: () => void;
}
const chatInputRef = ref<ChatInputExpose | null>(null);

//
// Responsive design
//
const MOBILE_BREAKPOINT = 768;
const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT);
const handleResize = () => {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
};

//
// SEO
//
const dynamicTitle = computed(() =>
  chatCode.value ? `Chat ${chatCode.value}` : 'Loading Chat...'
);
const BASE_URL = import.meta.env.VITE_BASE_URL || window.location.origin;
const dynamicUrl = computed(() =>
  chatCode.value ? `${BASE_URL}/chat/${chatCode.value}` : BASE_URL
);
const dynamicDescription = computed(() => {
  const baseDesc = 'Create your temporary, zero-record chat room instantly. No trace, no burden.';
  return chatCode.value ? `Join Chat ${chatCode.value}! ${baseDesc}` : baseDesc;
});

useHead({
  title: dynamicTitle,
  meta: [
    { name: 'description', content: dynamicDescription },
    { property: 'og:url', content: dynamicUrl },
    { property: 'og:title', content: dynamicTitle },
    { property: 'og:description', content: dynamicDescription },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:url', content: dynamicUrl },
    { name: 'twitter:title', content: dynamicTitle },
    { name: 'twitter:description', content: dynamicDescription },
  ],
});

//
// WebSocket
//
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

const wsUrl = computed(() => {
  const currentToken = roomStore.roomToken;
  if (!chatCode.value || !currentToken) return null;
  return `${WS_BASE_URL}/${chatCode.value}?token=${currentToken}`;
});

const handleAckTimeout = (tempId: string) => {
  const timerId = ackTimers.get(tempId);

  if (timerId !== undefined) {
    clearTimeout(timerId);
    ackTimers.delete(tempId);
  }

  const index = messages.value.findIndex(m =>
    m.messageType === 'user' && (m as UserMessage).tempId === tempId
  );

  if (index !== -1) {
    const msg = messages.value[index] as UserMessage;
    if (msg.status === 'sending') {
      msg.status = 'failed';
      message.error('Message confirmation timed out. Please try again.');
    }
  }
};

const addNewSystemMessage = ({ id, timestamp, content, style = 'default' }: {
  id: string,
  timestamp: number,
  content: string,
  style?: SystemStyleType
}) => {
  if (messages.value.some(m => m.id === id)) return;

  const newMessage: SystemMessage = {
    id,
    timestamp,
    messageType: "system",
    content,
    style,
  };

  messages.value.push(newMessage);
};

const handleUserEvent = (msg: ServerMessage) => {
  const { type: eventType, id, timestamp, payload } = msg;
  const { user: eventUser } = payload as UserEventPayload;

  if (!eventUser) return;

  if (eventType === 'USER_JOINED') {
    if (!onlineUsers.value.some(u => u.id === eventUser.id)) {
      onlineUsers.value.push(eventUser);
    }
  } else if (eventType === 'USER_LEFT') {
    onlineUsers.value = onlineUsers.value.filter(u => u.id !== eventUser.id);
  }

  const action = eventType === 'USER_JOINED' ? 'joined' : 'left';
  const content = `${eventUser.nickname} has ${action} the chat.`;

  addNewSystemMessage({
    id,
    timestamp,
    content
  });
}

const handleTextMessage = (message: ServerMessage) => {
  if (messages.value.some(m => m.id === message.id)) return;

  const payload = message.payload as TextPayload;

  messages.value.push({
    id: message.id,
    timestamp: message.timestamp,
    messageType: 'user',
    sender: message.sender,
    isOwn: message.sender.id === currentUser.value?.id,
    content: payload.content,
  } as UserMessage);
}

const handleACKMessage = (message: ServerMessage) => {
  const { tempId, id, timestamp } = message.payload as MessageConfirmPayload;

  if (!tempId) {
    console.error("Received MSG_CONFIRM without tempId:", message);
    return;
  }

  const index = messages.value.findIndex(m =>
    m.messageType === 'user' && (m as UserMessage).tempId === tempId
  );

  if (index === -1) {
    console.warn(`ACK for unknown tempId: ${tempId}`);
    return;
  }

  const timerId = ackTimers.get(tempId);
  if (timerId !== undefined) {
    clearTimeout(timerId);
    ackTimers.delete(tempId);
  }

  const localMsg = messages.value[index] as UserMessage;

  localMsg.id = id;
  localMsg.timestamp = timestamp;
  localMsg.status = 'sent';
  localMsg.tempId = undefined;
}

const handleTokenUpdateMessage = (message: ServerMessage) => {
  const { token } = message.payload as TokenUpdatePayload;

  if (token) {
    roomStore.setRoomToken(token);
    window.history.replaceState({ ...window.history.state, token }, '');
  }
};

const handleAttachmentMessage = (message: ServerMessage) => {
  if (messages.value.some(m => m.id === message.id)) return;

  const { id, timestamp, sender, payload } = message;
  const { description, attachments } = payload as AttachmentsPayload;

  const isOwn = sender.id === currentUser.value?.id;

  if (isOwn && messages.value.some(m => (m as UserMessage).tempId)) {
    return;
  }

  messages.value.push({
    id,
    timestamp,
    messageType: 'user',
    sender,
    isOwn,
    content: description || '',
    attachments,
  } as UserMessage);
}

const handleWsConnected = () => {
  if (!hasSystemMessageShown.value) {
    addNewSystemMessage({
      id: `sys_init_${Date.now()}`,
      timestamp: Date.now(),
      content: 'Chat is ready.'
    });
    hasSystemMessageShown.value = true;
  }
};

const handleWSMessage = (event: MessageEvent) => {
  let serverMsg: ServerMessage;

  try {
    if (!event.data) return;
    serverMsg = JSON.parse(event.data as string);
  } catch (e) {
    console.error("Failed to parse server message data:", event.data, e);
    return;
  }

  switch (serverMsg.type) {
    case 'ERROR': {
      const { message: errorMsg } = serverMsg.payload as ErrorPayload;
      addNewSystemMessage({
        id: serverMsg.id,
        timestamp: serverMsg.timestamp,
        content: errorMsg || 'An unexpected error occurred.',
        style: 'error'
      });
      break;
    }

    case 'INIT_DATA': {
      const { currentUser: user, onlineUsers: others, maxUsers: max } = serverMsg.payload as InitDataPayload;
      currentUser.value = user;
      onlineUsers.value = others;
      maxUsers.value = max;
      break;
    }

    case 'USER_JOINED':
    case 'USER_LEFT': {
      handleUserEvent(serverMsg);
      break;
    }

    case 'TEXT': {
      handleTextMessage(serverMsg);
      break;
    }

    case 'MSG_CONFIRM': {
      handleACKMessage(serverMsg);
      break;
    }

    case 'TOKEN_UPDATE': {
      handleTokenUpdateMessage(serverMsg);
      break;
    }

    case 'ATTACHMENTS': {
      handleAttachmentMessage(serverMsg);
      break;
    }

    default:
      console.warn(`Received unknown message type: ${serverMsg.type}`, serverMsg);
      break;
  }
};

const {
  connectStatus,
  sendData,
  closeConnectionByUser,
  initiateConnection,
  isReady,
  hasConnectedEver
} = useWebSocketReconnector({
  wsUrl,
  onMessage: handleWSMessage,
  onConnected: handleWsConnected,
});

//
// Send Message
//
const handleSendMessage = (content: string, attachmentsToResend?: Attachment[]) => {
  if (!isReady.value) {
    message.warning(`Connection status is: ${connectStatus.value}. Cannot send.`);
    return;
  }

  if (!attachmentsToResend) {
    const ongoingUploads = filesToUpload.value.filter(f =>
      f.status === 'uploading' || f.status === 'pending'
    );

    if (ongoingUploads.length > 0) {
      message.warning(`${ongoingUploads.length} files are still uploading. Please wait.`);
      return;
    }

    const failedUploads = filesToUpload.value.filter(f => f.status === 'failed');

    if (failedUploads.length > 0) {
      message.error(`${failedUploads.length} files failed to upload. Please remove or retry.`);
      return;
    }
  }

  let finalAttachments: Attachment[] = attachmentsToResend || filesToUpload.value
    .filter(f => f.status === 'success' && f.fileKey)
    .map(f => ({
      fileKey: f.fileKey!,
      fileName: f.fileName,
      mimeType: f.mimeType,
      fileSize: f.fileSize,
    }));

  const trimmedContent = content.trim();
  const hasAttachments = finalAttachments.length > 0;

  if (!trimmedContent && !hasAttachments) return;

  const tempId = generateTempID();

  const tempMessage: UserMessage = {
    id: tempId,
    timestamp: Date.now(),
    messageType: 'user',
    sender: currentUser.value!,
    isOwn: true,
    content: trimmedContent,
    tempId: tempId,
    status: 'sending',
    attachments: hasAttachments ? finalAttachments : undefined,
  };
  messages.value.push(tempMessage as ClientMessage);

  const outboundMessage: OutboundMessage = {
    type: hasAttachments ? "ATTACHMENTS" : "TEXT",
    tempId,
    payload: hasAttachments
      ? { description: trimmedContent || undefined, attachments: finalAttachments } as AttachmentsPayload
      : { content: trimmedContent } as TextPayload
  };

  const sent = sendData(outboundMessage);

  if (sent) {
    if (!attachmentsToResend) {
      filesToUpload.value = [];
      chatInputRef.value?.clearInput();
    }

    const timerId = setTimeout(() => {
      handleAckTimeout(tempId);
    }, ACK_TIMEOUT_MS);
    ackTimers.set(tempId, timerId as unknown as number);

  } else {
    handleAckTimeout(tempId);
  }
};

//
// Upload file
//
const MAX_FILE_COUNT = 3;
const filesToUpload = ref<UploadAttachment[]>([]);

const updateFileInArray = (updatedFile: UploadAttachment) => {
  filesToUpload.value = filesToUpload.value.map(f =>
    f.id === updatedFile.id ? { ...updatedFile } : f
  );
};

const uploadFile = async (file: UploadAttachment): Promise<UploadAttachment> => {
  let currentFile = { ...file };
  let fileToUpload: File = file.originFile;
  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

  try {

    if (file.mimeType.startsWith('image/') && file.mimeType !== 'image/gif') {
      const options = {
        maxSizeMB: 4.8,
        maxWidthOrHeight: 1920,
        initialQuality: 0.8,
        fileType: 'image/webp',
        useWebWorker: true,
      };

      const compressedBlob = await imageCompression(file.originFile, options);

      if (compressedBlob.size < file.fileSize) {
        const newFileName = file.fileName.replace(/\.[^/.]+$/, "") + '.webp';
        fileToUpload = new File([compressedBlob], newFileName, { type: 'image/webp' });

        currentFile.fileSize = fileToUpload.size;
        currentFile.mimeType = fileToUpload.type;
        currentFile.fileName = newFileName;
      }
    }

    if (fileToUpload.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File exceeds 5MB limit.`);
    }

    const { presignedUrl, fileKey, fileName } = await presignUpload(
      currentFile.fileName,
      currentFile.mimeType,
      currentFile.fileSize
    );

    await putFile(presignedUrl, fileToUpload);

    return {
      ...currentFile,
      status: 'success' as const,
      fileKey: fileKey,
      fileName: fileName,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    message.error(`Upload failed: ${errorMessage}`);

    return {
      ...currentFile,
      status: 'failed' as const,
    };
  }
}

const handleUploadStart = (newFiles: UploadAttachment[]) => {
  if (filesToUpload.value.length + newFiles.length > MAX_FILE_COUNT) {
    message.warning(`Maximum of ${MAX_FILE_COUNT} files are allowed.`);
    newFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
    return;
  }

  filesToUpload.value.push(...newFiles);

  newFiles.forEach(async (file) => {
    updateFileInArray({ ...file, status: 'uploading' as const });
    const updatedFile = await uploadFile(file);
    updateFileInArray(updatedFile);
  });
};

const handleFileRemoved = (fileId: string) => {
  const index = filesToUpload.value.findIndex(f => f.id === fileId);

  if (index !== -1) {
    const file = filesToUpload.value[index];
    if (file?.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }
    filesToUpload.value.splice(index, 1);
  }
};

const handleResendMessage = (failedMessage: UserMessage) => {
  if (!isReady.value) {
    message.error('Connection not ready. Cannot resend.');
    return;
  }

  const tempId = failedMessage.tempId;
  if (!tempId) return;

  const index = messages.value.findIndex(m =>
    m.messageType === 'user' && (m as UserMessage).tempId === tempId
  );

  if (index !== -1) {
    const timerId = ackTimers.get(tempId);
    if (timerId !== undefined) {
      clearTimeout(timerId);
      ackTimers.delete(tempId);
    }

    messages.value.splice(index, 1);
  }

  handleSendMessage(failedMessage.content, failedMessage.attachments);
};

const handleLeaveChat = () => {
  closeConnectionByUser();

  messages.value = [];
  onlineUsers.value = [];
  hasSystemMessageShown.value = false;

  ackTimers.forEach(timerId => clearTimeout(timerId));
  ackTimers.clear();

  filesToUpload.value.forEach(f => {
    if (f.previewUrl) {
      URL.revokeObjectURL(f.previewUrl);
    }
  });
  filesToUpload.value = [];

  roomStore.clearRoomContext();

  router.replace({ name: 'Home' });
};

const getValidToken = async (code: string): Promise<string | null> => {
  const tokenFromState = window.history.state?.token as string;

  if (tokenFromState) {
    roomStore.setRoomToken(tokenFromState);
    return tokenFromState;
  }

  try {
    const { token } = await joinChat(code);
    window.history.replaceState({ ...window.history.state, token: token }, '');
    roomStore.setRoomToken(token);
    return token;
  } catch (error) {
    roomStore.clearRoomContext();
    return null;
  }
};

onMounted(async () => {
  window.addEventListener('resize', handleResize);

  const code = route.params.code as string;
  if (!code) {
    connectStatus.value = 'FATAL_ERROR';
    return;
  }

  chatCode.value = code;

  const token = await getValidToken(code);
  if (!token) {
    connectStatus.value = 'FATAL_ERROR';
    return;
  }

  initiateConnection();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  handleLeaveChat();
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.chat-container .layout {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  gap: 16px;
  overflow: hidden;
}

.main-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.messages-section {
  flex: 1;
  min-height: 0;
}

.input-section {
  flex-shrink: 0;
}

.sidebar-section {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-section {
  flex-shrink: 0;
}

.users-section {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

@media (max-width: 767px) {
  .layout {
    flex-direction: column;
    gap: 0;
  }

  .sidebar-section {
    display: none;
  }
}
</style>
