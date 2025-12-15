<template>
    <div class="input-container">

        <div v-if="props.files.length > 0" class="file-preview-area">

            <div v-for="file in props.files" :key="file.id" class="preview-card" :title="file.fileName">

                <div class="image-wrapper">
                    <n-image v-if="file.mimeType.startsWith('image/') && file.previewUrl" :src="file.previewUrl"
                        :alt="file.fileName" class="preview-image" object-fit="cover" :show-toolbar="false">
                    </n-image>
                    <div v-else>
                        <n-icon :size="40">
                            <DocumentOutline />
                        </n-icon>
                    </div>
                </div>

                <div class="file-name">{{ file.fileName }}</div>

                <n-button text :color="errorColor" class="delete-btn" @click="removeFile(file.id, file.previewUrl)">
                    <n-icon :size="20" title="Remove file">
                        <CloseCircle />
                    </n-icon>
                </n-button>

                <div v-if="file.status === 'uploading'" class="status-overlay">
                    <n-spin size="small" />
                </div>

                <div v-if="file.status === 'failed'" class="status-overlay error-bg">
                    <n-icon :size="24" color="white">
                        <WarningOutline />
                    </n-icon>
                </div>

            </div>

        </div>

        <div class="input-and-actions">
            <n-input ref="inputRef" v-model:value="messageContent" type="textarea"
                placeholder="Type a message, Shift + Enter for new line" :autosize="{
                    minRows: 2,
                    maxRows: 4
                }" :maxlength="1000" :count-graphemes="customCountGraphemes" class="textarea"
                @keydown.enter.prevent="handleEnter">

                <template #suffix>
                    <div class="actions">
                        <n-button tertiary circle @click="selectFile" title="Attach file" :disabled="isMaxFilesReached">
                            <template #icon>
                                <n-icon>
                                    <AttachOutline />
                                </n-icon>
                            </template>
                        </n-button>

                        <input type="file" ref="fileInputRef" style="display: none;" :accept="allowedAttachmentTypes"
                            @change="handleFileChange">

                        <n-popover trigger="click" placement="top-end" :to="bodyElement">
                            <template #trigger>
                                <n-button tertiary circle>
                                    <template #icon>
                                        <n-icon>
                                            <HappyOutline />
                                        </n-icon>
                                    </template>
                                </n-button>
                            </template>
                            <div class="emoji-panel">
                                <span v-for="emoji in emojis" :key="emoji" class="emoji-item"
                                    @mousedown="insertEmoji(emoji, $event)" title="Click to insert">
                                    {{ emoji }}
                                </span>
                            </div>
                        </n-popover>

                        <n-button type="primary" circle :disabled="!messageContent.trim() && props.files.length === 0"
                            @click="sendMessage" title="Send message">
                            <template #icon>
                                <n-icon>
                                    <SendOutline />
                                </n-icon>
                            </template>
                        </n-button>
                    </div>
                </template>

            </n-input>
        </div>

    </div>
</template>

<script setup lang="ts">
//
// ChatInput.vue
//
// The main chat message input component, featuring a textarea, Emoji panel, and send button.
// This component manages user input and interaction logic.
//

import { ref, nextTick, computed } from 'vue';
import type { UploadAttachment } from '@/types/file';
import { NInput, NButton, NIcon, NPopover, useMessage, NSpin, useThemeVars, NImage } from 'naive-ui';
import { SendOutline, HappyOutline, AttachOutline, WarningOutline, CloseCircle, DocumentOutline } from '@vicons/ionicons5';

const props = defineProps<{
    files: UploadAttachment[];
    maxFiles: number;
}>();

const emit = defineEmits(['send', 'upload-start', 'file-removed']);

const message = useMessage();
const messageContent = ref('');

const bodyElement = document.body;

const inputRef = ref<null | { $el: HTMLDivElement }>(null);

const allowedAttachmentTypes = 'image/jpeg,image/png,image/webp,image/gif';
const fileInputRef = ref<null | HTMLInputElement>(null);
const isMaxFilesReached = computed(() => props.files.length >= props.maxFiles);

const themeVars = useThemeVars();
const borderColor = computed(() => themeVars.value.borderColor);
const errorColor = computed(() => themeVars.value.errorColor);

const customCountGraphemes = (value: string): number => {
    if (typeof (Intl as any).Segmenter === 'function') {
        const segmenter = new (Intl as any).Segmenter(undefined, { granularity: 'grapheme' });
        return [...segmenter.segment(value)].length;
    }
    return value.length;
};

const sendMessage = () => {
    const trimmedContent = messageContent.value.trim();
    const hasFiles = props.files.length > 0;

    if (!trimmedContent && !hasFiles) {
        return;
    }

    emit('send', trimmedContent);
};

const clearInput = () => {
    messageContent.value = '';

    if (fileInputRef.value) {
        fileInputRef.value.value = '';
    }

    nextTick(() => {
        const textarea = inputRef.value?.$el.querySelector('textarea') as HTMLTextAreaElement;
        textarea?.focus();
    });
};

defineExpose({
    clearInput,
});

const selectFile = () => {
    fileInputRef.value?.click();
};

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) {
        return;
    }

    const newFilesArray = Array.from(target.files);

    if (props.files.length + newFilesArray.length > props.maxFiles) {
        message.warning(`You can upload a maximum of ${props.maxFiles} files.`);
        target.value = '';
        return;
    }

    const filesToEmit: UploadAttachment[] = [];
    const allowedTypes = new Set(allowedAttachmentTypes.split(',').map(type => type.trim()));

    newFilesArray.forEach(file => {
        if (!allowedTypes.has(file.type)) {
            message.error(`File "${file.name}" has an unsupported type: ${file.type}.`);
            return;
        }

        let previewUrl = '';
        if (file.type.startsWith('image/')) {
            previewUrl = URL.createObjectURL(file);
        }

        const newUploadFile: UploadAttachment = {
            id: crypto.randomUUID(),
            originFile: file,
            previewUrl: previewUrl,
            status: 'pending',
            fileKey: '',
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
        };

        filesToEmit.push(newUploadFile);
    });

    if (filesToEmit.length > 0) {
        emit('upload-start', filesToEmit);
    }

    target.value = '';
};

const removeFile = (fileId: string, previewUrl: string) => {
    URL.revokeObjectURL(previewUrl);
    emit('file-removed', fileId);
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
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
    margin-top: 2px;
}

.input-and-actions {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    width: 100%;
}

.file-preview-area {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
    padding: 0 2px;
}

.preview-card {
    width: 80px;
    border: 1px solid v-bind(borderColor);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.image-wrapper {
    width: 100%;
    height: 80px;
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

.file-name {
    width: 100%;
    line-height: 1.25;
    font-size: 10px;
    padding: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
    box-sizing: border-box;
}

.delete-btn {
    position: absolute;
    top: 2px;
    right: 2px;
    z-index: 10;
}

.status-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 5;
}

.status-overlay.error-bg {
    background-color: rgba(255, 0, 0, 0.6);
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

.actions {
    height: 100%;
    display: flex;
    gap: 8px;
    align-items: end;
    flex-shrink: 0;
    padding-bottom: 4px;
}

.emoji-panel {
    display: flex;
    flex-wrap: wrap;
    max-width: 220px;
    gap: 5px;
    padding: 5px;
    z-index: 50;
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
