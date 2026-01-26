<template>
    <div :title="file.fileName" :class="[
        'relative group/card transition-all',
        !inMessage ? [
            'w-full h-full min-h-full rounded-lg border border-zinc-200/80 dark:border-zinc-700/80 shadow-sm',
            isMedia ? 'bg-zinc-900' : theme.bg
        ] : 'flex flex-col'
    ]" :style="aspectRatioStyle">

        <div :class="['w-full h-full relative', !inMessage ? 'overflow-hidden rounded-lg' : '']">

            <div v-if="!isResourceLoaded && !isFaild && isMedia"
                class="absolute inset-0 z-20 overflow-hidden rounded-inherit pointer-events-none">

                <Skeleton class="w-full h-full rounded-none" />

                <div class="absolute inset-0 flex items-center justify-center opacity-10">
                    <FileImage v-if="isImage" class="w-10 h-10" />
                    <FileVideo v-if="isVideo" class="w-10 h-10" />
                    <Headphones v-if="isAudio" class="w-10 h-10" />
                </div>
            </div>

            <template v-if="isImage">
                <img :src="displayUrl" :class="[imageClass, 'absolute inset-0 w-full h-full z-10',
                    file.mimeType === 'image/svg+xml' ? 'bg-white' : '']" @load="handleResourceLoad"
                    @error="handleResourceError" @click="emit('preview')" />
            </template>

            <template v-else-if="isVideo">
                <div class="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer overflow-hidden z-10"
                    @click="emit('preview')">

                    <img v-if="videoCoverUrl" :src="videoCoverUrl"
                        class="absolute inset-0 w-full h-full object-cover transition-all duration-500" :class="[
                            isResourceLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
                            'group-hover/card:scale-105'
                        ]" @load="handleResourceLoad" @error="isResourceLoaded = true" />

                    <template v-if="isResourceLoaded">
                        <div
                            class="absolute inset-0 bg-linear-to-b from-transparent to-black/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                        <div
                            class="relative z-20 flex items-center justify-center size-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl transition-all duration-300 group-hover/card:scale-110">
                            <Play class="w-4 h-4 text-white fill-white ml-0.5" />
                        </div>
                    </template>
                </div>
            </template>

            <template v-else-if="isAudio">
                <div v-if="inMessage"
                    class="flex items-center gap-3 w-full h-full px-4 relative group/audio overflow-hidden cursor-pointer"
                    :class="[isResourceLoaded ? 'opacity-100' : 'opacity-0']"
                    @click="hasAudioError ? null : handleProgressClick($event)">

                    <div class="absolute inset-y-0 left-0 bg-current opacity-[0.12] pointer-events-none transition-[width] duration-150 ease-linear"
                        :style="{ width: `${progress}%` }"></div>

                    <button @click.stop="hasAudioError ? null : togglePlay()" type="button"
                        class="relative z-30 size-9 shrink-0 flex items-center justify-center rounded-full bg-zinc-500/10 hover:bg-zinc-500/20 active:scale-90 transition-all pointer-events-auto">
                        <Pause v-if="isPlaying" class="size-4 text-current fill-current" />
                        <Play v-else class="size-4 text-current fill-current ml-0.5" />
                    </button>

                    <div class="flex flex-col flex-1 min-w-0 z-20 pointer-events-none">
                        <span class="text-[13px] font-medium truncate leading-tight mb-0.5">
                            {{ file.fileName }}
                        </span>
                        <div class="flex items-center gap-2 text-[10px] opacity-40 tabular-nums">
                            <span>{{ formatTime(currentTime) }}</span>
                            <span class="opacity-30">/</span>
                            <span>{{ formatDuration(file.meta?.duration) }}</span>
                        </div>
                    </div>
                </div>

                <template v-else>
                    <div class="absolute inset-0 bg-zinc-50 dark:bg-zinc-900/50 transition-colors pointer-events-none"
                        :class="[hasAudioError ? 'bg-red-50/50 dark:bg-red-950/10' : '']" />

                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        <button @click.stop="hasAudioError ? null : togglePlay()"
                            class="size-9 flex items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 transition-all hover:scale-105 active:scale-95 pointer-events-auto">
                            <Pause v-if="isPlaying" class="size-4 text-zinc-800 dark:text-zinc-200 fill-current" />
                            <Play v-else class="size-4 text-zinc-800 dark:text-zinc-200 fill-current ml-0.5" />
                        </button>
                    </div>

                    <div class="absolute bottom-0 left-0 w-full h-3 cursor-pointer z-30 group/progress flex items-end"
                        @click.stop="hasAudioError ? null : handleProgressClick($event)">
                        <div
                            class="w-full h-1 bg-zinc-200 dark:bg-zinc-800 overflow-hidden group-hover/progress:h-1.5 transition-all">
                            <div v-if="!hasAudioError"
                                class="h-full bg-zinc-500 dark:bg-zinc-400 transition-[width] duration-150 ease-linear"
                                :style="{ width: `${progress}%` }"></div>
                        </div>
                    </div>

                    <AlertCircle v-if="hasAudioError" class="absolute top-2 right-2 size-4 text-red-500 opacity-50" />
                </template>

                <audio ref="audioRef" :src="displayUrl" @timeupdate="onTimeUpdate" @ended="onEnded"
                    @error="onAudioError" @loadedmetadata="handleResourceLoad" />

            </template>

            <template v-else>
                <div v-if="inMessage" class="flex items-center gap-3 w-full h-full px-3 py-2 group/file cursor-pointer">

                    <div
                        :class="['size-10 shrink-0 flex items-center justify-center rounded-lg transition-all group-hover/file:scale-105', theme.bg]">
                        <component :is="theme.icon" :class="['size-6', theme.color]" />
                    </div>

                    <div class="flex flex-col flex-1 min-w-0 pr-2">
                        <span class="text-[13px] font-medium truncate leading-tight mb-1 text-current">
                            {{ file.fileName }}
                        </span>
                        <span class="text-[10px] opacity-50 tabular-nums font-medium">
                            {{ formatSize(file.meta?.size) }}
                        </span>
                    </div>
                </div>

                <div v-else
                    :class="['w-full h-full flex flex-col items-center justify-between p-2 pb-1.5 transition-colors relative hover:cursor-default', theme.bg]"
                    :title="file.fileName">

                    <div class="flex-1 flex items-center justify-center pt-1">
                        <component :is="theme.icon"
                            :class="['size-7 transition-transform group-hover/card:scale-110', theme.color]" />
                    </div>

                    <p
                        :class="['w-full text-[10px] text-center font-medium truncate px-0.5 mt-1 opacity-90', theme.color]">
                        {{ file.fileName }}
                    </p>

                </div>
            </template>

            <div v-if="isUploading"
                class="absolute inset-0 bg-zinc-900/60 dark:bg-black/80 flex flex-col items-center justify-center backdrop-blur-[2px] z-30 transition-all"
                :class="[
                    isMedia ? 'bg-zinc-900/60' : 'bg-zinc-900/40 dark:bg-black/60'
                ]">
                <div class="relative size-12 flex items-center justify-center">
                    <svg class="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="3" fill="transparent"
                            class="text-white/20 dark:text-white/10" />

                        <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="3" fill="transparent"
                            stroke-dasharray="125.6"
                            :stroke-dashoffset="125.6 - (125.6 * ((file as any).progress || 0)) / 100"
                            stroke-linecap="round" class="text-green-500 transition-all duration-500 ease-out" />
                    </svg>
                    <span class="text-[10px] font-bold font-mono text-white tabular-nums">
                        {{ (file as any).progress || 0 }}%
                    </span>
                </div>
            </div>

            <div v-if="isFaild" class="absolute inset-0 z-30 flex items-center justify-center backdrop-blur-md transition-all duration-300 rounded-inherit
            bg-zinc-900/40 dark:bg-black/60">

                <div class="relative flex items-center justify-center animate-in zoom-in-75 duration-300">
                    <AlertCircle class="size-6 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
                </div>
            </div>
        </div>

        <div v-if="showDelete"
            class="absolute -top-4 -right-4 z-50 p-2 group/delete cursor-pointer transition-transform active:scale-90"
            @click.stop="emit('remove')">

            <div :class="[
                'size-5 flex items-center justify-center rounded-full transition-all shadow-sm',
                'bg-zinc-900/90 dark:bg-zinc-100 text-white dark:text-zinc-900 border border-white/20 dark:border-black/10',
                'group-hover/delete:bg-red-500 group-hover/delete:text-white group-hover/delete:scale-110',
                'ring-2 ring-white dark:ring-zinc-950'
            ]">
                <X class="size-3 stroke-[2.5]" />
            </div>
        </div>

        <button v-if="showDownload" title="Download" @click.stop="handleDownload" class="absolute bottom-px right-1 z-30 size-6 flex items-center justify-center 
            rounded-lg bg-white/70 dark:bg-zinc-800/70 backdrop-blur-md 
            border border-white/20 dark:border-zinc-700/50 shadow-sm
            text-zinc-600 dark:text-zinc-300 transition-all
            opacity-100 sm:opacity-0 sm:group-hover:opacity-100 active:scale-90
            hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-950 dark:hover:text-white">
            <Download class="size-4 stroke-[2.5]" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
    Download, Play, Pause, X, AlertCircle, FileImage, FileVideo, Headphones,
    FileText, FileSpreadsheet, Presentation, FileArchive, FileCode, File
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { Skeleton } from '../ui/skeleton';
import type { Attachment, UploadAttachment } from '@/types/file';

const props = withDefaults(defineProps<{
    file: Attachment | UploadAttachment;
    inMessage?: boolean;
}>(), {
    inMessage: false
});

const emit = defineEmits(['preview', 'download', 'remove']);

const loadError = ref(false);
const isResourceLoaded = ref(false);
const handleResourceLoad = () => {
    isResourceLoaded.value = true;
    loadError.value = false;
};
const handleResourceError = () => {
    isResourceLoaded.value = true;
    loadError.value = true;
};

const audioRef = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const hasAudioError = ref(false);

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
    'cursor-zoom-in transition-all duration-500 antialiased',
    props.file.mimeType === 'image/svg+xml'
        ? 'object-contain p-2 bg-white w-full h-full'
        : 'object-cover',
    isResourceLoaded.value ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
]);

const isImage = computed(() => props.file.mimeType.startsWith('image/'));
const isVideo = computed(() => props.file.mimeType.startsWith('video/'));
const isAudio = computed(() => props.file.mimeType.startsWith('audio/'));
const isMedia = computed(() => isImage.value || isVideo.value || isAudio.value);

const isUploading = computed(() => {
    return 'status' in props.file && ['pending', 'uploading'].includes(props.file.status);
});

const isFaild = computed(() => {
    const uploadFail = 'status' in props.file && props.file.status === 'upload_failed';
    return uploadFail || hasAudioError.value || loadError.value;
});

const showDelete = computed(() => {
    return !props.inMessage;
});

const showDownload = computed(() => {
    if (!props.inMessage) return false;
    return !!props.file.url;
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

const aspectRatioStyle = computed(() => {
    if (!props.inMessage) return {};

    if (isMedia.value && !isAudio.value) {
        const { width, height } = props.file.meta || {};
        if (width && height) {
            return {
                aspectRatio: `${width} / ${height}`,
                width: '100%',
                minWidth: '250px',
                maxWidth: '500px',
                maxHeight: '500px',
                overflow: 'hidden'
            };
        }

        return {
            width: '250px',
            height: '180px',
        };
    }

    if (isAudio.value) {
        return {
            width: '100%',
            maxWidth: '280px',
            height: '52px'
        };
    }

    return { width: '100%', minWidth: '250px' };
});

const handleDownload = () => {
    const downloadUrl = (props.file as any).url || '';
    if (!downloadUrl) return;

    const targetUrl = `${downloadUrl}${downloadUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
    window.location.assign(targetUrl);
};

const progress = computed(() => {
    const duration = props.file.meta?.duration || audioRef.value?.duration || 0;
    if (!duration) return 0;
    return (currentTime.value / duration) * 100;
});

const togglePlay = () => {
    if (hasAudioError.value) {
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
    hasAudioError.value = true;
    isResourceLoaded.value = true;
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

const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    return formatTime(seconds);
};

const formatSize = (bytes?: number) => {
    if (bytes === undefined || bytes === null || bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    if (i === 0) return `${bytes} ${sizes[i]}`;

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};
</script>