<template>
    <footer class="w-full px-0 md:px-4 md:pb-4 pt-2 shrink-0 z-20">
        <div class="max-w-3xl mx-auto">
            <div class="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl transition-all duration-300
                  rounded-none border-t border-zinc-200/50 dark:border-zinc-800/50 md:rounded-[28px] md:border 
                  md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.1)] 
                  focus-within:border-zinc-300 dark:focus-within:border-zinc-700">

                <div v-if="files.length > 0" class="px-4 pt-4">
                    <div class="flex flex-wrap gap-3 pb-2 mb-1 border-b border-zinc-200/30 dark:border-zinc-700/30">
                        <div v-for="file in files" :key="file.id"
                            class="relative group w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm">
                            <img v-if="file.mimeType.startsWith('image/') && file.previewUrl" :src="file.previewUrl"
                                @click="handleImagePreview(file.previewUrl)"
                                class="w-full h-full object-cover shadow-inner" />
                            <div v-else class="w-full h-full flex items-center justify-center">
                                <FileText class="w-8 h-8 text-zinc-400" />
                            </div>

                            <div v-if="file.status === 'uploading'"
                                class="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                                <Loader2 class="w-5 h-5 text-white animate-spin" />
                            </div>

                            <div v-if="file.status === 'failed'"
                                class="absolute inset-0 bg-red-500/20 flex items-center justify-center backdrop-blur-[1px]">
                                <AlertCircle class="w-5 h-5 text-red-500" />
                            </div>

                            <button @click.stop="removeFile(file.id, file.previewUrl)" class="absolute top-1 right-1 p-1 z-10
                                    opacity-100 sm:group-hover:opacity-100 sm:opacity-0
                                    bg-black/50 backdrop-blur-md text-white rounded-full 
                                    hover:bg-red-500 active:scale-90
                                    transition-all duration-200" title="Remove file">
                                <X class="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>

                <ImagePreviewer v-model="isPreviewOpen" :src="previewUrl" />

                <div class="px-4 py-3">
                    <textarea ref="textareaRef" v-model="textContent" :placeholder="dynamicPlaceholder" rows="1" class="w-full bg-transparent border-none resize-none 
                               text-zinc-800 dark:text-zinc-200 text-[16px] leading-relaxed
                               placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                               focus:outline-none focus:ring-0 focus-visible:ring-0
                               scrollbar-none" @keydown.enter="handleEnter"></textarea>
                </div>

                <div class="px-3 pb-3 flex items-center justify-between">
                    <div class="flex items-center gap-1">
                        <button type="button" @click="triggerFileInput"
                            :disabled="connectStatus !== 'CONNECTED' || files.length >= maxFiles"
                            class="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors disabled:opacity-20"
                            title="Add attachment">
                            <Paperclip class="w-5 h-5" />
                        </button>
                        <input type="file" ref="fileInputRef" class="hidden" multiple :accept="allowedAttachmentTypes"
                            @change="handleFileChange" />

                        <Popover v-model:open="isEmojiOpen">
                            <PopoverTrigger as-child>
                                <button
                                    class="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                    <Smile class="w-5 h-5" />
                                </button>
                            </PopoverTrigger>

                            <PopoverContent side="top" align="start"
                                class="w-80 p-3 bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800"
                                @pointer-down-outside="(e) => {
                                    if (e.target === textareaRef) e.preventDefault();
                                }">
                                <div class="grid grid-cols-10 gap-1.5">
                                    <button v-for="emoji in emojis" :key="emoji" type="button"
                                        class="flex items-center justify-center text-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-lg transition-transform active:scale-95"
                                        @pointerdown.prevent.stop @click="insertEmoji(emoji)">
                                        {{ emoji }}
                                    </button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div class="flex items-center">
                        <button @click="sendMessage" :disabled="!canSend"
                            class="p-2.5 rounded-full transition-all duration-200
                                 disabled:text-zinc-300 dark:disabled:text-zinc-700
                                 enabled:bg-zinc-900 enabled:text-white dark:enabled:bg-zinc-100 dark:enabled:text-zinc-900">
                            <SendHorizontal class="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import {
    Paperclip, Smile, SendHorizontal,
    Loader2, AlertCircle, FileText, X
} from 'lucide-vue-next';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { toast } from 'vue-sonner';
import ImagePreviewer from '@/components/ImagePreviewer.vue';
import type { UploadAttachment } from '@/types/file';
import type { ConnectionStatus } from '@/types/chat';


const props = defineProps<{
    connectStatus: ConnectionStatus,
    files: UploadAttachment[],
    maxFiles: number,
}>()

const emit = defineEmits(['send', 'upload-start', 'file-removed'])


const textContent = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const isEmojiOpen = ref(false);
const isPreviewOpen = ref(false);
const previewUrl = ref('');

const allowedAttachmentTypes = 'image/jpeg,image/png,image/webp,image/gif';
const emojis = [
    '😂', '🤣', '😊', '😍', '🥰', '😘', '🤩', '🥳', '😎', '😋',
    '🤔', '🧐', '🤨', '🙄', '😏', '😅', '😭', '🥺', '🫠', '🙃',
    '🤡', '👻', '💀', '🔥', '✨', '💯', '❤️', '💔', '👍', '👎',
    '👏', '🙏', '🙌', '🎉', '🎁', '🎂', '☕', '🍺', '☀️', '🌚'
];


const dynamicPlaceholder = computed(() => {
    return props.connectStatus !== 'CONNECTED'
        ? 'Disconnected...'
        : 'Type a message (Shift + Enter for newline)';
});

const canSend = computed(() => {
    const isConnected = props.connectStatus === 'CONNECTED';
    const hasContent = textContent.value.trim().length > 0 || props.files.length > 0;
    const isUploading = props.files.some(f => f.status === 'uploading');
    return isConnected && hasContent && !isUploading;
});


const adjustHeight = () => {
    const el = textareaRef.value;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 156)}px`;
};

watch(textContent, (newVal) => {
    if (newVal.length > 1000) {
        textContent.value = newVal.slice(0, 1000);
    }
    nextTick(adjustHeight);
});

onMounted(adjustHeight);


const triggerFileInput = () => fileInputRef.value?.click();

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files?.length) return;

    const newFilesArray = Array.from(target.files);

    if (props.files.length + newFilesArray.length > props.maxFiles) {
        toast.warning(`You can upload up to ${props.maxFiles} files.`);
        target.value = '';
        return;
    }

    const filesToEmit: UploadAttachment[] = [];
    const allowedTypes = new Set(allowedAttachmentTypes.split(',').map(t => t.trim()));

    newFilesArray.forEach(file => {
        if (!allowedTypes.has(file.type)) return;

        let previewUrl = '';
        if (file.type.startsWith('image/')) {
            previewUrl = URL.createObjectURL(file);
        }

        filesToEmit.push({
            id: crypto.randomUUID(),
            originFile: file,
            previewUrl,
            status: 'pending',
            fileKey: '',
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
        });
    });

    if (filesToEmit.length > 0) {
        emit('upload-start', filesToEmit);
    }
    target.value = '';
};

const removeFile = (fileId: string, previewUrl: string) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    emit('file-removed', fileId);
};

const handleImagePreview = (url: string) => {
    previewUrl.value = url;
    isPreviewOpen.value = true;
};

const insertEmoji = (emoji: string) => {
    const el = textareaRef.value;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const originalText = textContent.value;

    textContent.value = originalText.substring(0, start) + emoji + originalText.substring(end);

    nextTick(() => {
        el.focus();
        const newPos = start + emoji.length;
        el.setSelectionRange(newPos, newPos);
        adjustHeight();
    });
};

const handleEnter = (e: KeyboardEvent) => {
    if (e.shiftKey) return;
    e.preventDefault();
    sendMessage();
};

const sendMessage = () => {
    const trimmed = textContent.value.trim();
    if (!canSend.value) return;

    emit('send', trimmed);

    textContent.value = '';
    isEmojiOpen.value = false;

    nextTick(() => {
        if (textareaRef.value) {
            textareaRef.value.focus();
            adjustHeight();
        }
    });
};

defineExpose({
    clearInput: () => {
        textContent.value = '';
        nextTick(adjustHeight);
    }
});
</script>

<style scoped>
textarea {
    overflow-y: auto;
}

textarea::-webkit-scrollbar {
    width: 4px;
}

textarea::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
}

textarea::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.2);
}

:deep(.dark) textarea::-webkit-scrollbar-thumb,
.dark textarea::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.15);
}

:deep(.dark) textarea::-webkit-scrollbar-thumb:hover,
.dark textarea::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.25);
}
</style>