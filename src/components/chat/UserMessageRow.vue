<template>
    <div :class="['message-row', message.isOwn ? 'message-row-own' : 'message-row-other']">

        <div class="message-avatar-wrapper">
            <UserAvatar :user="message.sender" size="small" />
        </div>

        <div class="message-content-wrapper">
            <div class="message-content">
                <n-text depth="3" class="nickname">
                    {{ message.sender.nickname }}
                </n-text>

                <div :class="['message-bubble', message.isOwn ? 'bubble-own' : 'bubble-other']">

                    <div v-if="isAttachments" class="attachment-area">
                        <div v-for="attachment in displayAttachments" :key="attachment.fileKey" class="attachment-card">

                            <div class="image-wrapper">
                                <n-image v-if="attachment.mimeType.startsWith('image/')" :src="attachment.url"
                                    :alt="attachment.fileName" class="preview-image" object-fit="cover"
                                    :show-toolbar="false" />

                                <div v-else class="file-icon-placeholder">
                                    <n-icon :size="40">
                                        <DocumentOutline />
                                    </n-icon>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div v-if="message.content.trim()" class="message-text-content">
                        {{ message.content }}
                    </div>

                    <div class="message-time">
                        <span v-if="shouldShowJustNow">
                            Just now
                        </span>
                        <n-time v-else :time="message.timestamp" :to="currentTime" type="relative" />
                    </div>
                </div>
            </div>

            <div v-if="message.isOwn" class="message-status-wrapper">
                <n-icon v-if="isPending" size="16" class="sync-icon" title="Sending...">
                    <SyncOutline />
                </n-icon>
                <n-icon v-else-if="isFailed" size="16" @click="handleResendClick" class="resend-icon"
                    title="Resend message">
                    <RefreshOutline />
                </n-icon>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
//
// UserMessageRow.vue
//
// Single user message row component. Responsible for rendering an individual 
// user chat bubble.
//

import { computed } from 'vue';
import { useThemeVars, NText, NTime, NIcon, NImage } from 'naive-ui';
import type { UserMessage } from '@/types/chat';
import type { Attachment } from '@/types/file';
import { useTokenStore } from '@/stores/token'
import { RefreshOutline, SyncOutline, DocumentOutline } from '@vicons/ionicons5';
import UserAvatar from '../UserAvatar.vue';

const props = defineProps<{
    message: UserMessage;
    onResend?: (message: UserMessage) => void;
    currentTime: number;
}>();

const tokenStore = useTokenStore();

const isAttachments = computed(() => !!props.message.attachments && props.message.attachments.length > 0);

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface DisplayAttachment extends Attachment {
    url: string;
}

const displayAttachments = computed<DisplayAttachment[]>(() => {
    const tokenValue = tokenStore.getToken;

    if (!isAttachments.value || !tokenValue) return [];

    return props.message.attachments!
        .filter(a => a.mimeType.startsWith('image/'))
        .map(a => {
            const presignUrl = `${VITE_API_BASE_URL}/file/presign-download?k=${encodeURIComponent(a.fileKey)}&t=${encodeURIComponent(tokenValue)}`;

            return {
                ...a,
                url: presignUrl
            };
        });
});

const isPending = computed(() => props.message.isOwn && props.message.status === 'sending');

const isFailed = computed(() => props.message.isOwn && props.message.status === 'failed');

const handleResendClick = () => {
    if (isFailed.value && props.onResend) {
        props.onResend(props.message);
    }
};

const timeDiffInMinutes = computed(() => {
    const diff = Math.abs(props.currentTime - props.message.timestamp);
    return diff / (1000 * 60);
});

const shouldShowJustNow = computed(() => {
    return timeDiffInMinutes.value <= 1;
});

const themeVars = useThemeVars();
const otherBubbleBackgroundColor = computed(() => themeVars.value.buttonColor2);
const primaryColor = computed(() => themeVars.value.primaryColor);
const selfBubbleTextColor = computed(() => themeVars.value.baseColor);
const errorColor = computed(() => themeVars.value.errorColor);
const borderColor = computed(() => themeVars.value.borderColor);
</script>

<style scoped>
.message-row {
    display: flex;
    align-items: flex-start;
    width: 100%;
}

.message-row-own {
    flex-direction: row-reverse;
}

.message-avatar-wrapper {
    flex-shrink: 0;
    margin-top: 0;
}

.message-content-wrapper {
    max-width: 75%;
}

.message-row-own .message-content-wrapper {
    display: flex;
    flex-direction: row-reverse;
    gap: 4px;
}

.message-content {
    display: flex;
    flex-direction: column;
}

.message-row-own .message-content {
    align-items: flex-end;
}

.message-status-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding-bottom: 2px;
}

.message-row-other .message-avatar-wrapper {
    margin-right: 8px;
}

.message-row-own .message-avatar-wrapper {
    margin-left: 8px;
}

.nickname {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--n-text-color-3);
    margin-bottom: 2px;
}

.message-bubble {
    padding: 8px 12px;
    border-radius: 12px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    word-break: break-word;
    overflow-wrap: break-word;
    display: flex;
    flex-direction: column;
    gap: 4px;
    white-space: pre-wrap;
}

.bubble-own {
    background-color: v-bind(primaryColor);
    color: v-bind(selfBubbleTextColor);
    border-top-right-radius: 4px;
    align-self: flex-end;
}

.bubble-other {
    background-color: v-bind(otherBubbleBackgroundColor);
    border-top-left-radius: 4px;
}

.message-text-content {
    white-space: pre-wrap;
}

.message-content {
    font-size: 0.875rem;
}

.message-time {
    align-self: flex-end;
    font-size: 10px;
    font-weight: 500;
    opacity: 0.7;
}

.attachment-area {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.attachment-card {
    width: 100px;
    height: 100px;
    border: 1px solid v-bind(borderColor);
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: v-bind(selfBubbleTextColor);
}

.image-wrapper {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
}

.preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.file-icon-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    color: var(--n-text-color-3);
    background-color: var(--n-color-target);
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.sync-icon {
    color: v-bind(primaryColor);
    animation: spin 1.2s ease-in-out infinite;
}

.resend-icon {
    color: v-bind(errorColor);
    cursor: pointer;
}
</style>
