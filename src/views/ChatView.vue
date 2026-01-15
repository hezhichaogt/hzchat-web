<template>
  <div class="h-dvh w-full overflow-hidden bg-background flex flex-col items-center justify-center">

    <template v-if="connectStatus === 'FATAL_ERROR'">
      <div class="max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-300">
        <div class="flex justify-center mb-6">
          <div class="p-4 rounded-full bg-destructive/10 text-destructive">
            <AlertCircle class="w-10 h-10" />
          </div>
        </div>

        <div class="space-y-2 mb-8">
          <h1 class="text-2xl font-bold text-foreground tracking-tight">
            Unable to Connect
          </h1>
          <p class="text-muted-foreground text-sm leading-relaxed">
            The room might be full, or the chat server is not responding.
          </p>
        </div>

        <div class="flex flex-col gap-3 w-full max-w-70 mx-auto">
          <Button @click="handleRetry" variant="outline"
            class="w-full border-border hover:bg-muted transition-all cursor-pointer">
            Retry
          </Button>

          <Button @click="handleLeaveChat" variant="default"
            class="w-full bg-primary text-primary-foreground hover:opacity-90 transition-all cursor-pointer font-bold">
            Leave Chat
          </Button>
        </div>
      </div>
    </template>

    <template v-else-if="(connectStatus === 'INIT' || connectStatus === 'CONNECTING') && !hasConnectedEver">
      <div class="flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-700">
        <div class="relative">
          <Zap class="w-12 h-12 text-foreground fill-current animate-scale-pulse" />
          <div class="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-scale-pulse">
          </div>
        </div>

        <div class="relative flex items-center justify-center">
          <p class="text-[11px] font-black text-muted-foreground/50 tracking-[0.3em] uppercase">
            {{ connectStatus === 'INIT' ? 'Initializing' : 'Connecting' }}
          </p>

          <span class="dot-loader absolute left-full ml-1 text-muted-foreground/50"></span>
        </div>
      </div>
    </template>

    <div v-else class="flex-1 w-full max-w-3xl mx-auto flex flex-col min-h-0 relative border-x border-border/40">

      <Header :code="chatCode" :connectStatus="connectStatus" :users="onlineUsers" :max-users="maxUsers"
        @leave="handleLeaveChat" />

      <Messages class="bg-transparent" :messages="messages" :on-resend="handleResendMessage" />

      <InputPanel :connectStatus="connectStatus" :files="filesToUpload" :maxFiles="MAX_FILE_COUNT"
        @send="handleSendMessage" @upload-start="handleUploadStart" @file-removed="handleFileRemoved" />

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHead } from '@unhead/vue';

import Header from '@/components/chat/Header.vue';
import Messages from '@/components/chat/Messages.vue';
import InputPanel from '@/components/chat/InputPanel.vue';
import { Button } from '@/components/ui/button';
import { AlertCircle, Zap } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

import { useRoomStore } from '@/stores/room';
import { useWebSocketReconnector } from '@/hooks/useWebSocketReconnector';

import { joinChat } from '@/services/chat';
import { presignUpload } from '@/services/file';
import { putFile } from '@/utils/fileUpload';
import { generateTempID } from '@/utils/idGenerator';
import imageCompression from 'browser-image-compression';

import type { UserBase, UserProfile } from '@/types/user';
import type { UploadAttachment, Attachment } from '@/types/file';
import type {
  UserMessage,
  SystemMessage,
  TokenUpdatePayload,
  ClientMessage,
  SystemStyleType,
  ServerMessage,
  ErrorPayload,
  InitDataPayload,
  UserEventPayload,
  MessageConfirmPayload,
  TextPayload,
  OutboundMessage,
  AttachmentsPayload
} from '@/types/chat';


const route = useRoute();
const router = useRouter();
const roomStore = useRoomStore();

const chatCode = ref<string | null>(null);
const maxUsers = ref<number>(0);
const currentUser = ref<UserProfile | null>(null);
const onlineUsers = ref<UserBase[]>([]);
const messages = ref<ClientMessage[]>([]);

const ACK_TIMEOUT_MS = 5000;
const ackTimers = new Map<string, number>();
const hasSystemMessageShown = ref(false);

interface ChatInputExpose {
  clearInput: () => void;
}
const chatInputRef = ref<ChatInputExpose | null>(null);


// SEO
const BASE_URL = import.meta.env.VITE_BASE_URL || window.location.origin;

const dynamicTitle = computed(() =>
  chatCode.value ? `${chatCode.value}` : 'Loading Chat...'
);

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


// WebSocket Logic
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
      toast.error('Message not sent. Please try again.');
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

  const content =
    eventType === 'USER_JOINED'
      ? `${eventUser.nickname} joined the chat.`
      : `${eventUser.nickname} left the chat.`;

  addNewSystemMessage({ id, timestamp, content });
};

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
};

const handleACKMessage = (message: ServerMessage) => {
  const { tempId, id, timestamp } = message.payload as MessageConfirmPayload;
  if (!tempId) return;

  const index = messages.value.findIndex(m =>
    m.messageType === 'user' && (m as UserMessage).tempId === tempId
  );
  if (index === -1) return;

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
};

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
};

const handleWsConnected = () => {
  if (!hasSystemMessageShown.value) {
    console.log('Chat is ready.');
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
        content: errorMsg || 'Something went wrong. Please try again.',
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
    case 'USER_LEFT':
      handleUserEvent(serverMsg);
      break;
    case 'TEXT':
      handleTextMessage(serverMsg);
      break;
    case 'MSG_CONFIRM':
      handleACKMessage(serverMsg);
      break;
    case 'TOKEN_UPDATE':
      handleTokenUpdateMessage(serverMsg);
      break;
    case 'ATTACHMENTS':
      handleAttachmentMessage(serverMsg);
      break;
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


// Message Sending
const handleSendMessage = (content: string, attachmentsToResend?: Attachment[]) => {
  if (!isReady.value) {
    toast.warning('Not connected yet. Please try again in a moment.');
    return;
  }

  if (!attachmentsToResend) {
    const ongoingUploads = filesToUpload.value.filter(f =>
      f.status === 'uploading' || f.status === 'pending'
    );

    if (ongoingUploads.length > 0) {
      toast.warning(`Uploading ${ongoingUploads.length} file(s). Please wait.`);
      return;
    }

    const failedUploads = filesToUpload.value.filter(f => f.status === 'failed');

    if (failedUploads.length > 0) {
      toast.error(`${failedUploads.length} file(s) couldn't be uploaded. Please retry or remove them.`);
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

const handleResendMessage = (failedMessage: UserMessage) => {
  if (!isReady.value) {
    toast.error('Connection not ready yet. Try again in a moment.');
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


// File Uploading
const MAX_FILE_COUNT = 3;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const compressibleImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const filesToUpload = ref<UploadAttachment[]>([]);

const updateFileInArray = (updatedFile: UploadAttachment) => {
  filesToUpload.value = filesToUpload.value.map(f =>
    f.id === updatedFile.id ? { ...updatedFile } : f
  );
};

const uploadFile = async (file: UploadAttachment): Promise<UploadAttachment> => {
  let currentFile = { ...file };
  let fileToUpload: File = file.originFile;

  try {
    const isMarkdown = currentFile.fileName.toLowerCase().endsWith('.md');
    if (isMarkdown) {
      currentFile.mimeType = 'text/markdown';
      fileToUpload = new File([fileToUpload], currentFile.fileName, { type: 'text/markdown' });
    }

    if (compressibleImageTypes.includes(file.mimeType)) {
      const options = {
        maxSizeMB: 9,
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
      throw new Error('File too large (max 10 MB).');
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
    console.error(error);
    toast.error(`Couldn't upload this file.`);
    return {
      ...currentFile,
      status: 'failed' as const,
    };
  }
};

const handleUploadStart = (newFiles: UploadAttachment[]) => {
  if (filesToUpload.value.length + newFiles.length > MAX_FILE_COUNT) {
    toast.warning(`You can upload up to ${MAX_FILE_COUNT} files.`);
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


// Room Management
const handleLeaveChat = () => {
  closeConnectionByUser();
  messages.value = [];
  onlineUsers.value = [];
  hasSystemMessageShown.value = false;

  ackTimers.forEach(timerId => clearTimeout(timerId));
  ackTimers.clear();

  filesToUpload.value.forEach(f => {
    if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
  });
  filesToUpload.value = [];

  roomStore.clearRoomContext();
  router.replace({ name: 'Home' });
};

const handleRetry = () => {
  window.location.reload();
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


// Lifecycle Hooks
onMounted(async () => {
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
  handleLeaveChat();
});
</script>

<style scoped>
@keyframes scale-pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(0.85);
    opacity: 0.6;
  }
}

.animate-scale-pulse {
  animation: scale-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.dot-loader::after {
  content: '';
  display: inline-block;
  animation: dots 1.5s steps(4, end) infinite;
}

@keyframes dots {

  0%,
  20% {
    content: '';
  }

  40% {
    content: '.';
  }

  60% {
    content: '..';
  }

  80%,
  100% {
    content: '...';
  }
}
</style>
