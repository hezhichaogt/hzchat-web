<template>
    <div :title="file.fileName" :class="[
        'relative group/card w-full h-full min-h-full transition-all rounded-lg border border-zinc-200/80 dark:border-zinc-700/80 shadow-sm overflow-hidden',
        isMedia ? 'bg-zinc-900' : theme.bg
    ]">
        <div v-if="isDownloading" class="absolute inset-0 z-20 bg-zinc-200/60 dark:bg-zinc-500/60 animate-pulse"></div>

        <template v-if="isImage">
            <img :src="displayUrl" :class="[imageClass, 'absolute inset-0 w-full h-full z-10']"
                @load="handleResourceLoad" @click="emit('preview')" />
        </template>

        <template v-else-if="isVideo">
            <div class="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer bg-zinc-900 z-10"
                @click="emit('preview')">
                <img v-if="videoCoverUrl" :src="videoCoverUrl"
                    class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/card:scale-105 transition-all duration-700"
                    @load="handleResourceLoad" />
                <Play
                    class="relative w-1/3 h-1/3 text-white/80 fill-white/20 transition-transform group-hover/card:scale-110 z-20" />
            </div>
        </template>

        <template v-else-if="isAudio">
            <div class="absolute inset-0 w-full h-full cursor-pointer flex items-center justify-center overflow-hidden transition-colors"
                :class="[
                    hasError ? 'bg-red-50 dark:bg-red-950/20' : 'bg-zinc-100 dark:bg-zinc-800'
                ]" @click="hasError ? null : handleProgressClick($event)">
                <div v-if="!hasError"
                    class="absolute inset-y-0 left-0 bg-indigo-500/20 pointer-events-none transition-[width] duration-150 ease-linear"
                    :style="{ width: `${progress}%` }"></div>

                <button @click.stop="hasError ? null : togglePlay()"
                    class="relative z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-zinc-700/80 shadow-sm backdrop-blur-sm active:scale-90 transition-all">
                    <Pause v-if="isPlaying" class="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-current" />
                    <Play v-else class="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-current ml-1" />
                </button>

                <audio ref="audioRef" :src="displayUrl" @timeupdate="onTimeUpdate" @ended="onEnded"
                    @error="onAudioError"></audio>
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
            class="absolute inset-0 bg-zinc-900/60 dark:bg-black/80 flex flex-col items-center justify-center backdrop-blur-[2px] z-30 transition-all">
            <div class="relative w-14 h-14 flex items-center justify-center">
                <svg class="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="28" cy="28" r="24" stroke="currentColor" stroke-width="4" fill="transparent"
                        class="text-white/20 dark:text-zinc-800" />
                    <circle cx="28" cy="28" r="24" stroke="currentColor" stroke-width="4" fill="transparent"
                        stroke-dasharray="150.8"
                        :stroke-dashoffset="150.8 - (150.8 * ((file as any).progress || 0)) / 100"
                        stroke-linecap="round"
                        class="text-green-500 dark:text-green-700 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                </svg>
                <span class="text-xs font-bold font-mono text-white tabular-nums">
                    {{ (file as any).progress || 0 }}%
                </span>
            </div>
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
            class="absolute bottom-1 right-1 w-6 h-6 flex items-center justify-center z-40 bg-white/90 dark:bg-zinc-800/90 border border-zinc-200/50 dark:border-zinc-700/50 rounded-full shadow-sm hover:scale-110 active:scale-90 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
            <Download class="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
    Download, Play, Pause, X, AlertCircle,
    FileText, FileSpreadsheet, Presentation, FileArchive, FileCode, File
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import type { Attachment, UploadAttachment } from '@/types/file';

const props = defineProps<{
    file: Attachment | UploadAttachment
}>();

const emit = defineEmits(['preview', 'download', 'remove']);

const isResourceLoaded = ref(false);
const handleResourceLoad = () => {
    isResourceLoaded.value = true;
};

const audioRef = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const hasError = ref(false);

const displayUrl = computed(() => {
    if ('previewUrl' in props.file) {
        return props.file.previewUrl;
    }
    return (props.file as any).url || '';
});

const videoCoverUrl = computed(() => {
    if ('cover' in props.file) {
        return props.file.cover;
    }
    return (props.file as any).videoCoverUrl || '';
});

const imageClass = computed(() => [
    'cursor-zoom-in transition-all duration-700 object-cover',
    props.file.mimeType === 'image/svg+xml' ? 'object-contain p-2 bg-white' : '',
    isResourceLoaded.value ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
]);

const isImage = computed(() => props.file.mimeType.startsWith('image/'));
const isVideo = computed(() => props.file.mimeType.startsWith('video/'));
const isAudio = computed(() => props.file.mimeType.startsWith('audio/'));
const isMedia = computed(() => isImage.value || isVideo.value || isAudio.value);

const isDownloading = computed(() => props.file.status === 'downloading');
const isUploading = computed(() => ['pending', 'uploading'].includes(props.file.status || ''));
const isFaild = computed(() => ['upload_failed', 'download_failed'].includes(props.file.status || ''));
const showDelete = computed(() => ['pending', 'uploading', 'uploaded', 'upload_failed'].includes(props.file.status || ''));

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

const progress = computed(() => {
    const duration = props.file.meta?.duration || audioRef.value?.duration || 0;
    if (!duration) return 0;
    return (currentTime.value / duration) * 100;
});

const togglePlay = () => {
    if (hasError.value) {
        toast.error('Audio preview unavailable.');
        return;
    }
    if (!audioRef.value) return;

    if (isPlaying.value) {
        audioRef.value.pause();
    } else {
        audioRef.value.play();
    }
    isPlaying.value = !isPlaying.value;
};

const onTimeUpdate = () => {
    if (audioRef.value) {
        currentTime.value = audioRef.value.currentTime;
    }
};

const onEnded = () => {
    isPlaying.value = false;
    currentTime.value = 0;
};

const onAudioError = () => {
    isPlaying.value = false;
    hasError.value = true;
};

const handleProgressClick = (e: MouseEvent) => {
    if (!audioRef.value) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    const percentage = x / width;
    const duration = props.file.meta?.duration || audioRef.value.duration;

    if (duration) {
        audioRef.value.currentTime = duration * percentage;
        if (!isPlaying.value) togglePlay();
    }
};
</script>