<template>
  <div class="chat-container">

    <template v-if="connectStatus === 'FATAL_ERROR'">
      <FatalErrorPage />
    </template>

    <template v-else-if="connectStatus === 'INIT' || connectStatus === 'CONNECTING'">
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
            <ChatInput @send="handleSendMessage" :disabled="!isReady" />
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
import type { UserMessage, SystemMessage, ClientMessage, SystemStyleType, ServerMessage, ErrorPayload, InitDataPayload, UserEventPayload, MessageConfirmPayload, TextPayload, OutboundMessage } from '@/types/chat';
import { generateTempID } from '@/utils/idGenerator';
import { checkChatStatus } from '@/services/chat';
import { useGuestStore } from '@/stores/guest';
import { useWebSocketReconnector } from '@/hooks/useWebSocketReconnector';
import FatalErrorPage from '@/components/chat/FatalErrorPage.vue';
import LoadingPage from '@/components/chat/LoadingPage.vue';
import MobileHeader from '@/components/chat/MobileHeader.vue';
import Messages from '@/components/chat/Messages.vue';
import InfoHeader from '@/components/chat/InfoHeader.vue';
import Users from '@/components/chat/Users.vue';
import ChatInput from '@/components/chat/ChatInput.vue';
import { useHead } from '@unhead/vue';

const route = useRoute();
const router = useRouter();
const message = useMessage();
const guestStore = useGuestStore();

const userID = guestStore.guestID;
const nickname = guestStore.getDisplayName;

const chatCode = ref<string | null>(null);
const maxUsers = ref<number>(0);
const currentUser = ref<User | null>(null);
const onlineUsers = ref<User[]>([]);
const messages = ref<ClientMessage[]>([]);
const ACK_TIMEOUT_MS = 5000;
const ackTimers = new Map<string, number>();

const MOBILE_BREAKPOINT = 768;
const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT);
const handleResize = () => {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
};

//
// SEO
//
const dynamicTitle = computed(() => {
  if (chatCode.value) {
    return `Chat ${chatCode.value}`;
  }
  return 'Loading Chat...';
});

const BASE_URL = import.meta.env.VITE_BASE_URL || window.location.origin;
const dynamicUrl = computed(() => {
  if (chatCode.value) {
    return `${BASE_URL}/chat/${chatCode.value}`;
  }
  return BASE_URL;
});

const dynamicDescription = computed(() => {
  if (chatCode.value) {
    return `Join Chat ${chatCode.value}! Create your temporary, zero-record room instantly. No trace, no burden.`;
  }
  return 'Create your temporary, zero-record chat room instantly. No trace, no burden.';
});

useHead({
  title: dynamicTitle,
  meta: [
    {
      property: 'og:url',
      content: dynamicUrl,
    },
    {
      property: 'og:title',
      content: dynamicTitle,
    },
    {
      property: 'og:description',
      content: dynamicDescription,
    },
    {
      name: 'twitter:url',
      content: dynamicUrl,
    },
    {
      name: 'twitter:title',
      content: dynamicTitle,
    },
    {
      name: 'twitter:description',
      content: dynamicDescription,
    },
    {
      name: 'description',
      content: dynamicDescription,
    },
  ],
});

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

const wsUrl = computed(() => {
  if (!chatCode.value) return null;

  const params = new URLSearchParams();
  params.append('uid', userID);
  params.append('nn', nickname);

  return `${WS_BASE_URL}/${chatCode.value}?${params.toString()}`;
});

const handleAckTimeout = (tempId: string) => {
  ackTimers.delete(tempId);

  const index = messages.value.findIndex(m => (m as UserMessage).tempID === tempId);

  if (index !== -1) {
    (messages.value[index] as UserMessage).status = 'failed';
    message.error('Message confirmation timed out. Please check connection and try again.');
  }
};

const addNewSystemMessage = ({ id, timestamp, content, style = 'default' }: { id: string, timestamp: number, content: string, style?: SystemStyleType }) => {
  const newMessage: SystemMessage = {
    id: id,
    timestamp: timestamp,
    messageType: "system",
    content: content,
    style: style,
  };
  messages.value.push(newMessage);
};

const handleUserEvent = (message: ServerMessage) => {
  const eventType = message.type;
  const payload = message.payload as UserEventPayload;
  const eventUser = payload.user;

  if (eventType === 'USER_JOINED') {
    const exists = onlineUsers.value.some(u => u.id === eventUser.id);
    if (!exists) {
      onlineUsers.value.push(eventUser);
    }

  } else if (eventType === 'USER_LEFT') {
    onlineUsers.value = onlineUsers.value.filter(u => u.id !== eventUser.id);
  }

  const action = eventType === 'USER_JOINED' ? 'joined' : 'left';
  const content = `${eventUser.nickname} has ${action} the chat.`;

  addNewSystemMessage({
    id: message.id,
    timestamp: message.timestamp,
    content: content
  });
}

const handleTextMessage = (message: ServerMessage) => {
  if (messages.value.some(m => m.id === message.id)) {
    return;
  }

  const isOwn = message.sender.id === currentUser.value?.id;
  const payload = message.payload as TextPayload;

  messages.value.push({
    id: message.id,
    timestamp: message.timestamp,
    messageType: 'user',
    sender: message.sender,
    isOwn: isOwn,
    content: payload.content,
    contentType: 'text',
  } as UserMessage);
}

const handleACKMessage = (message: ServerMessage) => {
  const ackPayload = message.payload as MessageConfirmPayload;
  const tempId = ackPayload.tempID;

  if (!tempId) {
    console.error("Received MSG_CONFIRM without tempID.", message);
    return;
  }

  const index = messages.value.findIndex(m =>
    m.messageType === 'user' && (m as UserMessage).tempID === tempId
  );

  if (index === -1) {
    console.warn(`ACK received for unknown message with tempID: ${tempId}. Possibly already deleted or ignored.`, message);
    return;
  }

  const timerId = ackTimers.get(tempId);
  if (timerId !== undefined) {
    clearTimeout(timerId);
    ackTimers.delete(tempId);
  }

  const localMessage = messages.value[index] as UserMessage;

  if (localMessage.messageType === 'user') {
    localMessage.id = ackPayload.id;
    localMessage.timestamp = ackPayload.timestamp;
    localMessage.status = 'sent';

    delete localMessage.tempID;
  }
}

const handleWsConnected = () => {
  if (retryCount.value === 0) {
    addNewSystemMessage({
      id: `sys_init_${Date.now()}`,
      timestamp: Date.now(),
      content: 'Chat session started.'
    });
  }
};

const handleWSMessage = (event: MessageEvent) => {
  let serverMsg: ServerMessage;

  try {
    serverMsg = JSON.parse(event.data as string);
  } catch (e) {
    console.error("Failed to parse server message data:", event.data, e);
    return;
  }

  switch (serverMsg.type) {
    case 'ERROR': {
      const payload = serverMsg.payload as ErrorPayload;
      addNewSystemMessage({
        id: serverMsg.id,
        timestamp: serverMsg.timestamp,
        content: payload.message,
        style: 'error'
      });
      break;
    }

    case 'INIT_DATA': {
      const payload = serverMsg.payload as InitDataPayload;
      currentUser.value = payload.currentUser;
      onlineUsers.value = payload.onlineUsers;
      maxUsers.value = payload.maxUsers;
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
  retryCount
} = useWebSocketReconnector({
  wsUrl,
  onMessage: handleWSMessage,
  onConnected: handleWsConnected,
});

const handleSendMessage = (content: string) => {
  if (!isReady.value) {
    message.warning(`Connection status is: ${connectStatus.value}. Cannot send.`);
    return;
  }

  const tempId = generateTempID();
  const currentTimestamp = Date.now();

  const tempMessage: UserMessage = {
    id: tempId,
    timestamp: currentTimestamp,
    messageType: 'user',
    sender: currentUser.value!,
    isOwn: true,
    content: content,
    contentType: 'text',
    tempID: tempId,
    status: 'sending',
  };

  messages.value.push(tempMessage as ClientMessage);

  const outboundMessage: OutboundMessage = {
    type: "TEXT",
    tempID: tempId,
    payload: { content: content }
  }

  const sent = sendData(outboundMessage);

  if (sent) {
    const timerId = setTimeout(() => {
      handleAckTimeout(tempId);
    }, ACK_TIMEOUT_MS);

    ackTimers.set(tempId, timerId as unknown as number);
  } else {
    const timerId = ackTimers.get(tempId);
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    handleAckTimeout(tempId);
  }
};

const handleResendMessage = (failedMessage: UserMessage) => {
  if (!isReady.value) {
    message.error('Connection not ready. Cannot resend.');
    return;
  }

  const index = messages.value.findIndex(m => m.tempID === failedMessage.tempID);
  if (index !== -1) {
    const originalMessage = messages.value[index] as UserMessage;

    const timerId = ackTimers.get(originalMessage.tempID!);
    if (timerId !== undefined) {
      clearTimeout(timerId);
      ackTimers.delete(originalMessage.tempID!);
    }

    messages.value.splice(index, 1);
  }

  handleSendMessage(failedMessage.content);
};

const handleLeaveChat = () => {
  closeConnectionByUser();

  messages.value = [];
  onlineUsers.value = [];

  ackTimers.forEach(timerId => clearTimeout(timerId));
  ackTimers.clear();

  router.replace({ name: 'Home' });
};

const doCheck = async () => {
  if (!chatCode.value) {
    connectStatus.value = 'FATAL_ERROR';
    return null;
  }

  try {
    const checkResult = await checkChatStatus(chatCode.value);
    return checkResult;
  } catch (e) {
    connectStatus.value = 'FATAL_ERROR';
    return null;
  }
}

const initConnection = async () => {
  const checkResult = await doCheck();
  if (!checkResult || !checkResult.canJoin) {
    return;
  }

  initiateConnection();
}

onMounted(() => {
  window.addEventListener('resize', handleResize);

  const code = route.params.code as string;
  chatCode.value = code;

  if (chatCode.value) {
    initConnection();
  } else {
    connectStatus.value = 'FATAL_ERROR';
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
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
