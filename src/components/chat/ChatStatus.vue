<template>
    <div class="status-container" @click="showStatusDetails">
        <n-icon :component="statusIcon" :color="statusColor" size="20" />
        <n-text v-if="showText" class="status-text">
            {{ statusText }}
        </n-text>
    </div>
</template>

<script setup lang="ts">
//
// ChatStatus.vue
//
// WebSocket connection status indicator component. Responsible for displaying 
// the appropriate icon and text based on the backend connection status 
// (CONNECTED, RECONNECTING, DISCONNECTED, etc.).
//

import { computed } from 'vue';
import { NIcon, NText, useThemeVars, useMessage } from 'naive-ui';
import {
    CheckmarkCircleOutline,
    TimeOutline,
    AlertCircleOutline
} from '@vicons/ionicons5';
import type { ConnectionStatus } from '@/types/chat';

const props = defineProps<{
    status: ConnectionStatus;
    showText?: boolean;
}>();

const message = useMessage();
const themeVars = useThemeVars();

const statusColor = computed<string>(() => {
    switch (props.status) {
        case 'CONNECTED':
            return themeVars.value.successColor;
        case 'RECONNECT_DELAY':
            return themeVars.value.warningColor;
        case 'FINAL_DISCONNECT':
            return themeVars.value.errorColor;
        default:
            return themeVars.value.iconColor;
    }
});

const statusIcon = computed(() => {
    switch (props.status) {
        case 'CONNECTED':
            return CheckmarkCircleOutline;
        case 'RECONNECT_DELAY':
            return TimeOutline;
        case 'FINAL_DISCONNECT':
            return AlertCircleOutline;
        default:
            return AlertCircleOutline;
    }
});

const statusText = computed(() => {
    switch (props.status) {
        case 'CONNECTED':
            return 'Connected';
        case 'RECONNECT_DELAY':
            return 'Reconnecting...';
        case 'FINAL_DISCONNECT':
            return 'Disconnected';
        default:
            return 'Connecting...';
    }
});

const getStatusDetail = (status: ConnectionStatus) => {
    switch (status) {
        case 'CONNECTED':
            return 'You are currently live and connected to the chat server. Messages should send instantly.';
        case 'RECONNECT_DELAY':
            return 'Connection temporarily lost. Attempting to reconnect automatically in a moment...';
        case 'FINAL_DISCONNECT':
            return 'Connection permanently closed. Please refresh or leave the chat.';
        case 'INIT':
        case 'CONNECTING':
        default:
            return 'Attempting to establish a connection with the chat server.';
    }
};

const showStatusDetails = () => {
    const detail = getStatusDetail(props.status);
    let type: 'success' | 'warning' | 'error' | 'info';

    switch (props.status) {
        case 'CONNECTED':
            type = 'success';
            break;
        case 'RECONNECT_DELAY':
            type = 'warning';
            break;
        case 'FINAL_DISCONNECT':
            type = 'error';
            break;
        default:
            type = 'info';
            break;
    }

    message[type](`${statusText.value}: ${detail}`, { duration: 4000, closable: true });
};
</script>

<style scoped>
.status-container {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 2px 4px 2px 0;
}

.status-text {
    font-size: 14px;
    color: v-bind(statusColor)
}
</style>
