<template>
    <div class="input-container">
        <n-input ref="inputRef" v-model:value="messageContent" type="textarea"
            placeholder="Type a message, Shift + Enter for new line" :autosize="{
                minRows: 2,
                maxRows: 4
            }" :maxlength="1000" show-count :count-graphemes="customCountGraphemes" class="textarea"
            @keydown.enter.prevent="handleEnter">
            <template #count="{ value }">
                {{ customCountGraphemes(value) }} / 1000
            </template>
        </n-input>

        <div class="vertical-buttons">
            <n-popover trigger="click" placement="top-end" :to="false">
                <template #trigger>
                    <n-button secondary strong>
                        <template #icon>
                            <n-icon :component="HappyOutline"></n-icon>
                        </template>
                        Emoji
                    </n-button>
                </template>
                <div class="emoji-panel">
                    <span v-for="emoji in emojis" :key="emoji" class="emoji-item"
                        @mousedown="insertEmoji(emoji, $event)" title="Click to insert">
                        {{ emoji }}
                    </span>
                </div>
            </n-popover>

            <n-button type="primary" strong :disabled="!messageContent.trim()" @click="sendMessage"
                title="Send message">
                <template #icon>
                    <n-icon :component="SendOutline" />
                </template>
                Send
            </n-button>
        </div>
    </div>
</template>

<script setup lang="ts">
//
// ChatInput.vue
//
// The main chat message input component, featuring a textarea, Emoji panel, and send button.
// This component manages user input and interaction logic, including:
// 1. Real-time character counting (using Graphemes for accurate counting).
// 2. Keyboard event handling (Enter to send, Shift + Enter for new line).
// 3. Custom logic for inserting emojis while preserving cursor position.
//

import { ref, nextTick } from 'vue';
import { NInput, NButton, NIcon, NPopover } from 'naive-ui';
import { SendOutline, HappyOutline } from '@vicons/ionicons5';

const emit = defineEmits(['send']);

const messageContent = ref('');
const inputRef = ref<null | { $el: HTMLDivElement }>(null);

const customCountGraphemes = (value: string): number => {
    if (typeof (Intl as any).Segmenter === 'function') {
        const segmenter = new (Intl as any).Segmenter(undefined, { granularity: 'grapheme' });
        return [...segmenter.segment(value)].length;
    }
    return value.length;
};

const sendMessage = () => {
    const trimmedContent = messageContent.value.trim();
    if (trimmedContent) {
        emit('send', trimmedContent);
        messageContent.value = '';
    }
};

const handleEnter = (e: KeyboardEvent) => {
    if (e.shiftKey) {
        e.preventDefault();
        const target = e.target as HTMLTextAreaElement;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const newValue = messageContent.value.substring(0, start) + '\n' + messageContent.value.substring(end);
        messageContent.value = newValue;
        target.selectionStart = target.selectionEnd = start + 1;
    } else {
        sendMessage();
    }
};

const emojis = [
    '😂', '❤️', '😍', '😊', '🤣', '🥲', '🤩', '🥳', '😎', '🥰',
    '😘', '🤔', '🤫', '😶', '😅', '😭', '🥺', '🫠', '🤧',
    '👍', '👎', '👏', '🙏', '🙌', '💯', '💔', '✨',
    '🔥', '🎉', '🎁', '🎈', '🎂', '🍻',
    '🍕', '🍔', '☕', '🍺',
    '☀️', '🌧️', '🌈', '🐱', '🐶'
];

const insertEmoji = (emoji: string, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inputRef.value || !inputRef.value.$el) return;

    const textarea = inputRef.value.$el.querySelector('textarea') as HTMLTextAreaElement;

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = messageContent.value;

    const newValue = value.substring(0, start) + emoji + value.substring(end);
    messageContent.value = newValue;

    const newCursorPosition = start + emoji.length;

    nextTick(() => {
        textarea.focus();
        textarea.selectionStart = newCursorPosition;
        textarea.selectionEnd = newCursorPosition;
    });
};
</script>

<style scoped>
.input-container {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    width: 100%;
    margin-top: 8px;
}

.textarea {
    flex-grow: 1;
    font-size: 16px !important;
    min-height: 75px;
}

:deep(.n-input__textarea-el) {
    font-size: 16px !important;
    min-height: 100%;
}

.vertical-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    flex-shrink: 0;
}

.emoji-panel {
    display: flex;
    flex-wrap: wrap;
    max-width: 220px;
    gap: 5px;
    padding: 5px;
}

.emoji-item {
    cursor: pointer;
    font-size: 1.5rem;
    line-height: 1;
    padding: 2px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.emoji-item:hover {
    background-color: rgba(150, 150, 150, 0.2);
}
</style>
