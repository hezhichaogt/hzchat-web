<template>
    <div :title="file.fileName" :class="[
        'relative group/card w-full h-full min-h-full transition-all rounded-lg border border-zinc-200/80 dark:border-zinc-700/80 shadow-sm overflow-hidden',
        isMedia ? 'bg-zinc-900' : theme.bg
    ]">
        <div v-if="isDownloading" class="absolute inset-0 z-20 bg-zinc-200/60 dark:bg-zinc-500/60 animate-pulse">
        </div>

        <template v-if="isImage">
            <img :src="displayUrl" :class="[imageClass, 'absolute inset-0 w-full h-full z-10']"
                @load="handleResourceLoad" @click="emit('preview')" />
        </template>

        <template v-else-if="isVideo">
            <div class="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer bg-zinc-900 z-10"
                @click="emit('preview')">
                <Play class="w-1/3 h-1/3 text-white/80 fill-white/20 transition-transform group-hover/card:scale-110" />
            </div>
        </template>

        <template v-else>
            <div class="w-full h-full flex flex-col items-center justify-center p-2 min-h-[inherit]">
                <component :is="theme.icon"
                    :class="['w-8 h-8 mb-1 transition-transform group-hover/card:scale-110', theme.color]" />
                <p :class="['w-full px-1 text-[10px] text-center font-bold uppercase truncate', theme.color]">
                    {{ file.fileName }}
                </p>
            </div>
        </template>

        <div v-if="isUploading"
            class="absolute inset-0 bg-white/40 dark:bg-black/40 flex items-center justify-center backdrop-blur-[1px] z-30">
            <Loader2 class="w-6 h-6 text-zinc-300 animate-spin" />
        </div>

        <div v-if="isFaild"
            class="absolute inset-0 bg-red-500/10 flex items-center justify-center backdrop-blur-[3px] z-30">
            <AlertCircle class="w-6 h-6 text-red-500" />
        </div>

        <button v-if="showDelete" @click.stop="emit('remove')" title="Remove" :class="[
            'absolute top-0.5 right-0.5 p-0.5 z-50 transition-all active:scale-90 shadow-lg rounded-full',
            'bg-gray-700 text-white hover:bg-red-500'
        ]">
            <X class="w-3 h-3" />
        </button>

        <button v-if="showDownload" @click.stop="handleDownload"
            class="absolute bottom-1 right-1 w-6 h-6 flex items-center justify-center z-40
             bg-white/90 dark:bg-zinc-800/90 border border-zinc-200/50 dark:border-zinc-700/50
             rounded-full shadow-sm hover:scale-110 active:scale-90 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
            <Download class="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
    Download, Play, X, Loader2, AlertCircle,
    FileText, FileSpreadsheet, Presentation, FileArchive, FileCode, File
} from 'lucide-vue-next';
import type { Attachment, UploadAttachment } from '@/types/file';

const props = defineProps<{
    file: Attachment | UploadAttachment
}>();

const emit = defineEmits(['preview', 'download', 'remove']);

const isResourceLoaded = ref(false);
const handleResourceLoad = () => { isResourceLoaded.value = true; };

const displayUrl = computed(() => {
    if ('previewUrl' in props.file) {
        return props.file.previewUrl;
    }
    return (props.file as any).url || '';
});

const imageClass = computed(() => [
    'cursor-zoom-in transition-all duration-700 object-cover',
    props.file.mimeType === 'image/svg+xml' ? 'object-contain p-2 bg-white' : '',
    isResourceLoaded.value ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
]);

const isImage = computed(() => props.file.mimeType.startsWith('image/'));
const isVideo = computed(() => props.file.mimeType.startsWith('video/'));
const isMedia = computed(() => isImage.value || isVideo.value);

const isDownloading = computed(() => props.file.status === 'downloading')
const isUploading = computed(() => ['pending', 'uploading'].includes(props.file.status || ''))
const isFaild = computed(() => ['upload_failed', 'download_failed'].includes(props.file.status || ''))
const showDelete = computed(() => ['pending', 'uploading', 'uploaded', 'upload_failed'].includes(props.file.status || ''))
const showDownload = computed(() => {
    const status = props.file.status;
    const isBusy = ['pending', 'uploading', 'downloading'].includes(status || '');
    const isError = ['upload_failed', 'download_failed'].includes(status || '');
    const isLocalDraft = 'previewUrl' in props.file && !status;
    return !isBusy && !isError && !isLocalDraft;
});

const theme = computed(() => {
    const name = props.file.fileName;
    const mime = props.file.mimeType.toLowerCase();
    const ext = name.split('.').pop()?.toLowerCase() || '';

    if (mime === 'application/pdf' || ext === 'pdf') {
        return { icon: FileText, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
    }
    if (mime.includes('word') || ['doc', 'docx'].includes(ext)) {
        return { icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    }
    if (mime.includes('sheet') || mime.includes('excel') || ['xls', 'xlsx', 'csv'].includes(ext)) {
        return { icon: FileSpreadsheet, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
    }
    if (mime.includes('presentation') || ['ppt', 'pptx'].includes(ext)) {
        return { icon: Presentation, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' };
    }
    if (mime.includes('zip') || mime.includes('compressed') || ['zip', '7z', 'rar', 'tar', 'gz'].includes(ext)) {
        return { icon: FileArchive, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' };
    }
    if (mime.startsWith('text/') || ['txt', 'md'].includes(ext)) {
        return { icon: FileCode, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-zinc-800' };
    }

    return { icon: File, color: 'text-zinc-500 dark:text-zinc-400', bg: 'bg-zinc-100 dark:bg-zinc-800' };
});

const handleDownload = () => {
    const downloadUrl = (props.file as any).url || '';
    if (!downloadUrl) return;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = props.file.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
</script>