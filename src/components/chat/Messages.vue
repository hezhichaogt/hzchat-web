<template>
    <main ref="messageContainerRef"
        class="flex-1 min-h-0 relative bg-zinc-50 dark:bg-zinc-950 overflow-y-auto custom-scrollbar"
        @scroll="handleScroll">

        <Transition name="slide-down" mode="out-in">
            <NotificationBar v-if="notifications.length > 0" :notifications="notifications"
                @close="onRemoveNotification" @room-expired="emit('room-expired')" />
        </Transition>

        <div ref="messagesWrapperRef" class="w-full mx-auto py-4 px-4 md:px-6">
            <div class="space-y-8">
                <div v-for="(msg, index) in messages" :key="msg.id || msg.tempId"
                    :ref="(el) => { if (index === messages.length - 1) lastMessageRef = (el as any); }">
                    <template v-if="msg.messageType === 'user'">
                        <UserMessageRow :message="(msg as UserMessage)" :on-resend="onResend"
                            :current-time="currentTime" @preview="(file) => emit('preview', file)" />
                    </template>

                    <template v-else-if="msg.messageType === 'system'">
                        <SystemMessageRow :message="(msg as SystemMessage)" />
                    </template>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import type { ClientMessage, UserMessage, SystemMessage, ServerMessage } from '@/types/chat';
import type { Attachment, UploadAttachment } from '@/types/file';

import NotificationBar from './NotificationBar.vue';
import UserMessageRow from './UserMessageRow.vue';
import SystemMessageRow from './SystemMessageRow.vue';

const props = defineProps<{
    messages: ClientMessage[];
    onResend: (message: UserMessage) => void;
    notifications: ServerMessage[];
    onRemoveNotification: (id: string) => void;
}>();

const emit = defineEmits<{
    (e: 'preview', file: Attachment | UploadAttachment): void
    (e: 'room-expired'): void
}>();

const messageContainerRef = ref<HTMLElement | null>(null);
const lastMessageRef = ref<HTMLElement | null>(null);

const isNearBottom = ref(true);
const currentTime = ref(Date.now());
let intervalId: number | undefined;

const scrollToNewMessage = () => {
    if (lastMessageRef.value) {
        lastMessageRef.value.scrollIntoView({
            behavior: 'smooth',
            block: 'end'
        });
    }
};

const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement;
    const maxScroll = target.scrollHeight - target.clientHeight;
    const currentScroll = target.scrollTop;
    const threshold = 200;

    isNearBottom.value = maxScroll - currentScroll < threshold;
};

watch(() => props.messages.length, (newLength, oldLength) => {
    const previousLength = oldLength === undefined ? 0 : oldLength;

    if (newLength > previousLength) {
        const lastMessage = props.messages[newLength - 1];
        let shouldScroll = isNearBottom.value;

        if (
            lastMessage &&
            lastMessage.messageType === 'user' &&
            (lastMessage as UserMessage).isOwn
        ) {
            shouldScroll = true;
        }

        if (shouldScroll) {
            nextTick(() => {
                scrollToNewMessage();
                setTimeout(scrollToNewMessage, 800);
            });
        }
    }
}, { immediate: true });

onMounted(() => {
    if (messageContainerRef.value) {
        messageContainerRef.value.scrollTop = messageContainerRef.value.scrollHeight;
    }

    intervalId = window.setInterval(() => {
        currentTime.value = Date.now();
    }, 1000 * 60);
});

onUnmounted(() => {
    if (intervalId) {
        window.clearInterval(intervalId);
    }
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 20px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.4);
}

.scroll-smooth {
    scroll-behavior: smooth;
}
</style>