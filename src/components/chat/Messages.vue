<template>
    <div class="messages-container">
        <n-scrollbar ref="messageContainerRef" @scroll="handleScroll">
            <div ref="messagesWrapperRef" class="messages-wrapper">
                <div v-for="msg in messages" :key="msg.id || msg.tempID">

                    <template v-if="msg.messageType === 'user'">
                        <UserMessageRow :message="(msg as UserMessage)" :on-resend="onResend"
                            :current-time="currentTime" />
                    </template>

                    <template v-else-if="msg.messageType === 'system'">
                        <SystemMessageRow :message="(msg as SystemMessage)" />
                    </template>

                    <template v-else>
                        <div>
                            [DEBUG: Unknown message type received]
                        </div>
                    </template>
                </div>
            </div>
        </n-scrollbar>
    </div>
</template>

<script setup lang="ts">
//
// Messages.vue
//
// Chat message list component. Responsible for rendering all incoming messages 
// (user/system) and implementing scroll behavior management.
//

import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { NScrollbar } from 'naive-ui';
import type { ClientMessage, UserMessage, SystemMessage } from '@/types/chat';
import UserMessageRow from './UserMessageRow.vue';
import SystemMessageRow from './SystemMessageRow.vue';

const props = defineProps<{
    messages: ClientMessage[];
    onResend: (message: UserMessage) => void;
}>();

const messageContainerRef = ref<InstanceType<typeof NScrollbar> | null>(null);
const messagesWrapperRef = ref<HTMLDivElement | null>(null);

const isNearBottom = ref(true);

const scrollToBottom = () => {
    if (messageContainerRef.value && messagesWrapperRef.value) {
        const contentHeight = messagesWrapperRef.value.scrollHeight;
        setTimeout(() => {
            if (messageContainerRef.value) {
                messageContainerRef.value.scrollTo({
                    top: contentHeight,
                    behavior: 'smooth'
                });
            }
        }, 0);
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

        if (lastMessage && lastMessage.messageType === 'user' && (lastMessage as UserMessage).isOwn) {
            shouldScroll = true;
        }

        if (shouldScroll) {
            nextTick(() => {
                scrollToBottom();
            });
        }
    }
}, { immediate: true });

const currentTime = ref(Date.now());
let intervalId: number | undefined;

onMounted(() => {
    intervalId = window.setInterval(() => {
        currentTime.value = Date.now();
    }, 1000 * 15)
})

onUnmounted(() => {
    if (intervalId !== undefined) {
        window.clearInterval(intervalId);
    }
})
</script>

<style scoped>
.messages-container {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.messages-wrapper {
    padding: 8px 12px 8px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}
</style>
