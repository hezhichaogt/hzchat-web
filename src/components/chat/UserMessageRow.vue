<template>
    <div :class="['flex w-full mb-6 items-start gap-3', message.isOwn ? 'flex-row-reverse' : 'flex-row']">
        <div class="shrink-0 transition-transform active:scale-95">
            <Avatar class="h-8 w-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <AvatarImage v-if="message.sender.avatar" :src="message.sender.avatar" :alt="message.sender.nickname"
                    class="object-cover" />

                <AvatarFallback
                    class="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold text-[10px] select-none uppercase">
                    {{ message.sender.nickname?.slice(0, 2) || '?' }}
                </AvatarFallback>
            </Avatar>
        </div>

        <div :class="['flex flex-col max-w-[75%] md:max-w-[70%]', message.isOwn ? 'items-end' : 'items-start']">
            <span class="text-[12px] font-semibold text-zinc-400 mb-1 px-1">
                {{ message.sender.nickname }}
            </span>

            <div :class="['flex items-end gap-2 w-full', message.isOwn ? 'flex-row-reverse' : 'flex-row']">
                <div :class="[
                    'relative flex flex-col group transition-all duration-200 shadow-xs overflow-hidden flex-1',
                    message.isOwn
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl rounded-tr-none'
                        : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl rounded-tl-none text-zinc-800 dark:text-zinc-200'
                ]">
                    <div v-if="isAttachments" :class="[
                        'p-1 gap-1 grid w-full',
                        displayAttachments.length === 1 ? 'grid-cols-1' : '',
                        displayAttachments.length === 2 ? 'grid-cols-2 w-60' : '',
                        displayAttachments.length === 3 ? 'grid-cols-3 w-72' : '',
                        displayAttachments.length === 4 ? 'grid-cols-2 w-60' : '',
                        displayAttachments.length >= 5 ? 'grid-cols-3 w-72' : ''
                    ]">
                        <div v-for="attachment in displayAttachments" :key="attachment.fileKey"
                            class="relative overflow-hidden rounded-lg cursor-zoom-in group/img bg-zinc-100 dark:bg-zinc-700"
                            @click="handleImageClick(attachment.url)">
                            <img :src="attachment.url" :alt="attachment.fileName" :class="[
                                'object-cover transition-transform duration-500 group-hover/img:scale-105 w-full',
                                displayAttachments.length === 1 ? 'max-w-full max-h-80' : 'aspect-square'
                            ]" />
                        </div>
                    </div>

                    <div v-if="message.content.trim()"
                        class="px-3.5 py-2 text-[14px] leading-relaxed wrap-break-word whitespace-pre-wrap">
                        {{ message.content }}
                    </div>

                    <div :class="[
                        'text-[10px] pb-1.5 px-3 self-end font-medium transition-opacity',
                        message.isOwn ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-400 dark:text-zinc-500'
                    ]">
                        {{ relativeTimeText }}
                    </div>
                </div>

                <div v-if="message.isOwn" class="shrink-0">
                    <div v-if="isPending" class="animate-spin text-zinc-400 dark:text-zinc-600">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                    </div>
                    <button v-else-if="isFailed" @click="handleResendClick"
                        class="flex items-center justify-center transition-transform active:scale-90 p-1 group hover:cursor-pointer"
                        title="Resend message">
                        <svg class="w-4 h-4 text-red-500 hover:text-red-600 transition-colors" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                            stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoomStore } from '@/stores/room';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { UserMessage } from '@/types/chat';
import type { Attachment } from '@/types/file';

const props = defineProps<{
    message: UserMessage;
    onResend?: (message: UserMessage) => void;
    currentTime: number;
}>();

const emit = defineEmits(['preview']);

const roomStore = useRoomStore();
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface DisplayAttachment extends Attachment {
    url: string;
}

const isAttachments = computed(() =>
    !!props.message.attachments && props.message.attachments.length > 0
);

const displayAttachments = computed<DisplayAttachment[]>(() => {
    const currentToken = roomStore.roomToken;
    if (!isAttachments.value || !currentToken) return [];

    return props.message.attachments!
        .filter(a => a.mimeType.startsWith('image/'))
        .map(a => ({
            ...a,
            url: `${VITE_API_BASE_URL}/file/presign-download?k=${encodeURIComponent(a.fileKey)}&t=${encodeURIComponent(currentToken)}`
        }));
});

const isPending = computed(() => props.message.isOwn && props.message.status === 'sending');
const isFailed = computed(() => props.message.isOwn && props.message.status === 'failed');

const relativeTimeText = computed(() => {
    const diffInSeconds = Math.floor((props.currentTime - props.message.timestamp) / 1000);

    if (diffInSeconds < 10) return 'Just now';

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} ${diffInMinutes > 1 ? 'mins' : 'min'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours > 1 ? 'hours' : 'hour'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${diffInDays > 1 ? 'days' : 'day'} ago`;
});

const handleResendClick = () => {
    if (isFailed.value && props.onResend) {
        props.onResend(props.message);
    }
};

const handleImageClick = (url: string) => {
    emit('preview', url);
};
</script>
