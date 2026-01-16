<template>
    <Teleport to="body">
        <Transition name="preview-fade">
            <div v-if="modelValue && file"
                class="fixed inset-0 z-1000 flex items-center justify-center bg-black/80 dark:bg-zinc-950/90 backdrop-blur-xl cursor-zoom-out"
                @click="close">

                <div
                    class="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-1010 pointer-events-none">
                    <div
                        class="bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 pointer-events-auto">
                        <p class="text-white/90 text-sm font-medium tracking-wide flex items-center gap-2">
                            <FileText v-if="!isImage && !isVideo" class="w-4 h-4" />
                            {{ file.fileName }}
                        </p>
                    </div>
                    <button class="p-2 text-white/50 hover:text-white transition-colors pointer-events-auto"
                        @click="close">
                        <X class="w-8 h-8" />
                    </button>
                </div>

                <div class="relative w-full h-full flex items-center justify-center p-4 md:p-12 overflow-hidden">

                    <img v-if="isImage" :src="displayUrl"
                        class="max-w-[95%] max-h-[95%] object-contain select-none shadow-2xl transition-all duration-300"
                        :class="{
                            'bg-white p-10 md:p-20 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)]': file.mimeType === 'image/svg+xml'
                        }" @click.stop alt="Preview" />

                    <div v-else-if="isVideo" class="relative w-full max-w-5xl max-h-[85vh] aspect-video" @click.stop>
                        <video v-show="!hasVideoError" :src="displayUrl" controls autoplay
                            class="w-full h-full rounded-xl shadow-2xl object-contain bg-black/40"
                            @error="handleVideoError">
                            Your browser does not support the video tag.
                        </video>

                        <div v-if="hasVideoError"
                            class="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50 rounded-xl border border-white/10 backdrop-blur-sm p-8 text-center">

                            <div class="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-6">
                                <VideoOff class="w-10 h-10 text-zinc-500" />
                            </div>

                            <h3 class="text-xl font-bold text-white mb-2">Video preview unavailable</h3>
                            <p class="text-zinc-400 text-sm max-w-md mb-8">
                                This video can't be previewed in your browser.
                                Download it to watch with a media player on your device.
                            </p>

                            <button v-if="file.url" @click="handleDownload"
                                class="px-8 py-3 bg-white text-zinc-900 rounded-full font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2">
                                <Download class="w-4 h-4" />
                                Download Video
                            </button>
                        </div>
                    </div>

                    <div v-else
                        class="bg-white dark:bg-zinc-900 p-12 rounded-3xl shadow-2xl flex flex-col items-center gap-6"
                        @click.stop>
                        <div
                            class="w-24 h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <FileText class="w-12 h-12 text-zinc-400" />
                        </div>
                        <div class="text-center">
                            <h3 class="text-xl font-bold dark:text-white">{{ file.fileName }}</h3>
                            <p class="text-zinc-500 mt-2">{{ (file.fileSize / 1024).toFixed(2) }} KB</p>
                        </div>
                        <button @click="handleDownload"
                            class="px-8 py-3 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-full font-medium hover:scale-105 transition-transform">
                            Download File
                        </button>
                    </div>

                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { X, FileText, VideoOff, Download } from 'lucide-vue-next';
import type { Attachment, UploadAttachment } from '@/types/file';

const props = defineProps<{
    modelValue: boolean;
    file: Attachment | UploadAttachment | null;
}>();

const emit = defineEmits(['update:modelValue', 'download']);

const hasVideoError = ref(false);

watch(() => props.file, () => {
    hasVideoError.value = false;
});

const handleVideoError = (e: Event) => {
    console.error('Video load error:', e);
    hasVideoError.value = true;
};

const displayUrl = computed(() => {
    if (!props.file) return '';
    if ('previewUrl' in props.file && props.file.previewUrl) {
        return props.file.previewUrl;
    }
    return (props.file as any).url || '';
});

const isImage = computed(() => props.file?.mimeType.startsWith('image/'));
const isVideo = computed(() => props.file?.mimeType.startsWith('video/'));

const close = () => emit('update:modelValue', false);

watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
    } else {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
    }
});

const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
};

const handleDownload = () => {
    const downloadUrl = (props.file as any).url || '';
    if (!downloadUrl) return;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = props.file?.fileName || '';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
</script>

<style scoped>
.preview-fade-enter-active,
.preview-fade-leave-active {
    transition: opacity 0.3s ease, backdrop-filter 0.3s ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
    opacity: 0;
    backdrop-filter: blur(0px);
}

.preview-fade-enter-active img,
.preview-fade-enter-active video {
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.preview-fade-enter-from img,
.preview-fade-enter-from video {
    transform: scale(0.95);
}
</style>