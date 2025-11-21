<template>
    <n-card size="small">
        <div class="header-row">
            <ChatStatus :status="status" :show-text="true" />
            <LeaveChatButton :on-leave="handleLeaveFromChild" />
        </div>

        <n-divider dashed style="margin: 10px 0;"></n-divider>

        <div class="header-row">
            <div class="header-code">
                <n-icon :component="LinkOutline" size="22" :depth="2" />
                <n-text depth="2">
                    {{ code }}
                </n-text>
            </div>

            <Share :code="code" :show-text="true" />
        </div>
    </n-card>
</template>

<script setup lang="ts">
//
// InfoHeader.vue
//
// Chat session information header component. It consolidates and displays the following 
// within a single card:
// 1. WebSocket connection status (ChatStatus).
// 2. The unique chat code (Code).
// 3. The Leave Chat button (LeaveChatButton) and Share button (Share).
//

import { NIcon, NDivider, NCard, NText } from 'naive-ui';
import { LinkOutline } from '@vicons/ionicons5';
import type { ConnectionStatus } from '@/types/chat';
import ChatStatus from './ChatStatus.vue';
import LeaveChatButton from './LeaveChatButton.vue';
import Share from './Share.vue';

const props = defineProps<{
    code: string | null;
    status: ConnectionStatus;
}>();

const emit = defineEmits(['leave']);

const handleLeaveFromChild = () => {
    emit('leave');
};
</script>

<style scoped>
.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-code {
    display: flex;
    align-items: center;
    gap: 2px;
}
</style>
