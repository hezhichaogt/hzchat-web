<template>
    <div :class="['flex w-full mb-8 items-start gap-3 px-1', message.isOwn ? 'flex-row-reverse' : 'flex-row']">
        <div class="shrink-0 transition-transform active:scale-95 shadow-sm rounded-full overflow-hidden">
            <Avatar class="h-8 w-8 border border-zinc-200 dark:border-zinc-800 rounded-full overflow-hidden">
                <AvatarImage v-if="message.sender.avatar" :src="message.sender.avatar" :alt="message.sender.nickname"
                    class="object-cover w-full h-full" />

                <AvatarFallback
                    class="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 font-bold text-[10px] select-none uppercase flex items-center justify-center rounded-full">
                    {{ message.sender.nickname?.slice(0, 2) || '?' }}
                </AvatarFallback>
            </Avatar>
        </div>

        <div :class="['flex flex-col max-w-[80%] md:max-w-[70%]', message.isOwn ? 'items-end' : 'items-start']">
            <span class="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mb-1.5 px-1 tracking-tight">
                {{ message.sender.nickname }}
            </span>

            <div :class="['flex items-end gap-2 w-full', message.isOwn ? 'flex-row-reverse' : 'flex-row']">
                <div :class="[
                    'relative flex flex-col group transition-all duration-200 shadow-sm overflow-hidden min-w-10',
                    message.isOwn
                        ? 'bg-zinc-800 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 rounded-2xl rounded-tr-none shadow-md shadow-zinc-200/50'
                        : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl rounded-tl-none text-zinc-800 dark:text-zinc-200'
                ]">
                    <div v-if="isAttachments" :class="[
                        'p-1 gap-1 grid w-full bg-black/5 dark:bg-white/5',
                        displayAttachments.length === 1 ? 'grid-cols-1 w-48 md:w-64' : '',
                        displayAttachments.length === 2 ? 'grid-cols-2 w-60' : '',
                        displayAttachments.length === 3 ? 'grid-cols-3 w-72' : '',
                        displayAttachments.length === 4 ? 'grid-cols-2 w-60' : '',
                        displayAttachments.length >= 5 ? 'grid-cols-3 w-72' : ''
                    ]">
                        <div v-for="attachment in displayAttachments" :key="attachment.fileKey"
                            class="relative overflow-hidden rounded-lg group/attach min-w-24 min-h-24 shrink-0" :class="[
                                displayAttachments.length === 1 ? 'w-full aspect-4/3' : 'aspect-square'
                            ]">

                            <AttachmentCard :file="attachment" @preview="emit('preview', attachment)" />
                        </div>
                    </div>

                    <div v-if="message.content.trim()"
                        class="px-4 py-2.5 text-[14px] leading-relaxed wrap-break-word whitespace-pre-wrap font-normal">
                        {{ message.content }}
                    </div>

                    <div :class="[
                        'text-[9px] pb-1.5 px-3 self-end font-medium tracking-tighter transition-opacity opacity-70',
                        message.isOwn ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-400 dark:text-zinc-500'
                    ]">
                        {{ relativeTimeText }}
                    </div>
                </div>

                <div v-if="message.isOwn" class="shrink-0 mb-1">
                    <div v-if="isPending" class="animate-spin text-zinc-400/60 dark:text-zinc-600">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                    </div>
                    <button v-else-if="isFailed" @click="handleResendClick"
                        class="flex items-center justify-center transition-transform active:scale-90 p-1 group hover:cursor-pointer">
                        <AlertCircle class="w-4 h-4 text-red-500 hover:text-red-600 transition-colors" />
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
import { AlertCircle } from 'lucide-vue-next';
import AttachmentCard from './Attachment.vue';

const props = defineProps<{
    message: UserMessage;
    onResend?: (message: UserMessage) => void;
    currentTime: number;
}>();

const emit = defineEmits<{
    (e: 'preview', file: Attachment): void
}>();

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

    const mapped = props.message.attachments!.map(a => ({
        ...a,
        url: `${VITE_API_BASE_URL}/file/presign-download?k=${encodeURIComponent(a.fileKey)}&n=${encodeURIComponent(a.fileName)}&t=${encodeURIComponent(currentToken)}`
    }));

    return mapped.sort((a, b) => {
        const aIsImage = a.mimeType.startsWith('image/') ? 1 : 0;
        const bIsImage = b.mimeType.startsWith('image/') ? 1 : 0;
        return bIsImage - aIsImage;
    });
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
</script>
