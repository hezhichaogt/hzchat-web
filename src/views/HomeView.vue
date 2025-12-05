<template>
  <div class="home-container">

    <div class="welcome-section">
      <n-h1 align-text prefix="bar" class="welcome-title">
        Zero-Record Messaging. Traceless. Start Now.
      </n-h1>

      <n-text depth="3" class="welcome-desc">
        No registration required. We never store your conversation content. Open-source verification.
      </n-text>
    </div>

    <n-card title="Nickname" size="small" class="nickname-section">
      <n-input v-model:value="nicknameInput" :placeholder="`${getDisplayName}`" :maxlength="16"
        @blur="handleNicknameChange" clearable />
      <n-alert type="info" :bordered="false" :show-icon="false" style="margin-top: 6px;">
        This nickname is stored locally in your browser and is only used as your display name in the chat.
      </n-alert>
    </n-card>

    <div class="create-chat-section">
      <n-flex size="large" align="center" class="create-chat-actions">
        <n-button type="primary" size="large" style="flex: 1;" :loading="isBusy" :disabled="isBusy"
          @click="createPrivateChat">
          <template #icon>
            <n-icon :component="ChatboxOutline" />
          </template>
          Create Private Chat
        </n-button>

        <n-button type="default" size="large" style="flex: 1;" :loading="isBusy" :disabled="isBusy"
          @click="createGroupChat">
          <template #icon>
            <n-icon :component="PeopleOutline" />
          </template>
          Create Group Chat
        </n-button>
      </n-flex>
    </div>

    <n-divider dashed style="margin: 8px 0;">OR</n-divider>

    <div class="join-chat-section">
      <n-input-group>
        <n-input v-model:value="chatCodeInput" size="large" placeholder="Enter Chat Code to Join" :loading="isBusy"
          :disabled="isBusy" maxlength="6" clearable />
        <n-button type="primary" size="large" attr-type="submit" :disabled="isBusy" :loading="isBusy"
          @click="handleJoinChat">
          <template #icon>
            <n-icon :component="LogInOutline" />
          </template>
          Join
        </n-button>
      </n-input-group>
    </div>
  </div>
</template>

<script setup lang="ts">
//
// The application's entry-point view component. Responsible for guiding users 
// to start a chat. Key functionalities include:
// 1. Identity Setup: Allows users to set and persist a nickname (via GuestStore).
// 2. Create Chat: Triggers the backend API (createChat) to initiate a new 
//    private or group chat session and navigates to `/chat/:code`.
// 3. Join Chat: Allows users to enter a chat code, check session status 
//    (checkChatStatus), and join.
// 4. UI/UX: Provides a clear process for creation and joining, along with 
//    loading state management.
//
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useMessage, NFlex, NH1, NText, NDivider, NInputGroup, NCard, NInput, NIcon, NButton, NAlert } from 'naive-ui';
import { ChatboxOutline, PeopleOutline, LogInOutline } from '@vicons/ionicons5';
import type { ChatType } from '@/types/chat';
import { useGuestStore } from '@/stores/guest';
import { createChat, joinChat } from '@/services/chat';
import { useHead } from '@unhead/vue';

//
// SEO
//
useHead({
  meta: [
    {
      name: 'description',
      content: 'HZ Chat offers traceless, instant messaging with a strict zero-record policy. Create a temporary, low-social-burden room for private, thematic discussions. No signup needed.',
    }
  ],
});

const message = useMessage();
const router = useRouter();
const guestStore = useGuestStore();

const userID = guestStore.guestID;
const { nickname, getDisplayName } = storeToRefs(guestStore);
const { setNickname } = guestStore;
const nicknameInput = ref(nickname.value || '');

watch(nickname, (newVal) => {
  nicknameInput.value = newVal || '';
}, { immediate: true });

const handleNicknameChange = () => {
  const trimmedInput = nicknameInput.value.trim();
  const currentNickname = nickname.value;

  if (trimmedInput === currentNickname) {
    return;
  }

  const validRegex = /^[\p{L}\p{N}_?!-]{1,16}$/u;

  if (trimmedInput && !validRegex.test(trimmedInput)) {
    message.error('Invalid nickname. Must be 1-16 chars (letters, numbers, -, _, ?, !).');
    nicknameInput.value = currentNickname || '';
    return;
  }

  setNickname(trimmedInput);

  if (trimmedInput) {
    message.success(`Nickname saved.`);
  } else {
    message.info('Nickname cleared. Using temporary ID.');
  }
};

const isBusy = ref(false);

const handleCreateChat = async (type: ChatType) => {
  if (isBusy.value) {
    return;
  }
  isBusy.value = true;

  try {
    const result = await createChat(type);
    router.push(`/chat/${result.chatCode}`);

  } catch (error) {
    let displayMessage = 'An unknown error occurred.';

    if (error instanceof Error) {
      displayMessage = error.message;
    } else if (typeof error === 'string') {
      displayMessage = error;
    }
    message.error(`Failed to create chat: ${displayMessage}`);
  } finally {
    isBusy.value = false;
  }
};

const createPrivateChat = () => {
  handleCreateChat('private');
};

const createGroupChat = () => {
  handleCreateChat('group');
};

const chatCodeInput = ref('');

const handleJoinChat = async () => {
  const trimmedCode = chatCodeInput.value.trim();
  const REQUIRED_LENGTH = 6;

  if (!trimmedCode) {
    message.warning('Please enter a chat code.');
    return;
  }
  if (trimmedCode.length !== REQUIRED_LENGTH) {
    message.error(`Chat code must be exactly ${REQUIRED_LENGTH} characters.`);
    return;
  }

  if (isBusy.value) return;
  isBusy.value = true;

  try {
    const joinResult = await joinChat(trimmedCode, userID);

    if (!joinResult.token) message.error(`Failed to join chat: No access token received.`);

    router.push({
      path: `/chat/${trimmedCode}`,
      state: { token: joinResult.token }
    });

  } catch (error) {
    let displayMessage = 'An unknown error occurred.';

    if (error instanceof Error) {
      displayMessage = error.message;
    } else if (typeof error === 'string') {
      displayMessage = error;
    }

    message.error(`Failed to join chat: ${displayMessage}`);

  } finally {
    isBusy.value = false;
  }
};
</script>

<style scoped>
.home-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: flex-start;
  padding: 16px;
}

.welcome-title {
  font-size: 26px;
  margin-bottom: 8px;
}

.welcome-desc {
  font-size: 16px;
}

.nickname-section {
  margin: 16px 0;
}

.collapse {
  margin-top: 8px;
  user-select: none;
}

@media (max-width: 639px) {
  .create-chat-actions {
    flex-direction: column;
  }
}

@media (min-width: 640px) {
  .home-container {
    margin-top: 80px;
    gap: 24px;
  }

  .welcome-section {
    padding: 0;
  }

  .welcome-title {
    font-size: 30px;
  }
}
</style>
