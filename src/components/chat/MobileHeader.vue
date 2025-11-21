<template>
    <div class="mobile-header-container">
        <div class="mobile-header-content">

            <div class="mobile-header-base-info">
                <ChatStatus :status="status" />
                <n-text depth="2" class="mobile-header-base-info-text">
                    {{ code }}
                </n-text>
                <Share :code="code" />
            </div>

            <MobileUsers :users="users" :max-users="maxUsers" />

            <LeaveChatButton :on-leave="handleLeaveFromChild" :is-quaternary="true" />

        </div>
    </div>
</template>

<script setup lang="ts">
//
// MobileHeader.vue
//
// Mobile chat session header component. Designed to consolidate and display 
// core session information within limited screen space, including:
// 1. WebSocket connection status (ChatStatus) and chat code.
// 2. Current user list (MobileUsers) and Share button.
// 3. The Leave Chat button (LeaveChatButton).
//

import { NText } from 'naive-ui';
import type { ConnectionStatus } from '@/types/chat';
import type { User } from '@/types/user';
import ChatStatus from './ChatStatus.vue';
import Share from './Share.vue';
import MobileUsers from './MobileUsers.vue';
import LeaveChatButton from './LeaveChatButton.vue';

const props = defineProps<{
    code: string | null;
    status: ConnectionStatus;
    users: User[];
    maxUsers: number;
}>();

const emit = defineEmits(['leave']);

const handleLeaveFromChild = () => {
    emit('leave');
};
</script>

<style scoped>
.mobile-header-container {
    padding: 0px 16px 8px;
}

.mobile-header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.mobile-header-base-info {
    display: flex;
    align-items: center;
}

.mobile-header-base-info-text {
    font-size: 14px;
    margin: 0px 0 0 2px;
}
</style>
