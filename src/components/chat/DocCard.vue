<template>
    <div :title="fileName" :class="[
        'w-full h-full flex flex-col items-center justify-center p-2 transition-all rounded-lg hover:cursor-default',
        theme.bg
    ]">
        <component :is="theme.icon" :class="['w-1/3 h-1/3 min-w-6 min-h-6 mb-2', theme.color]" />

        <div class="w-full px-1">
            <p :class="[
                'text-[10px] leading-tight text-center truncate font-bold uppercase tracking-tighter',
                theme.color
            ]">
                {{ fileName }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FileText, FileSpreadsheet, Presentation, FileArchive, FileCode, File } from 'lucide-vue-next';

interface Props {
    fileName: string;
    mimeType: string;
}

const props = defineProps<Props>();

const getFileTheme = (fileName: string, mimeType: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (mimeType === 'application/pdf' || ext === 'pdf') {
        return { icon: FileText, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
    }
    if (mimeType.includes('word') || ['doc', 'docx'].includes(ext)) {
        return { icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    }
    if (mimeType.includes('sheet') || mimeType.includes('excel') || ['xls', 'xlsx', 'csv'].includes(ext)) {
        return { icon: FileSpreadsheet, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
    }
    if (mimeType.includes('presentation') || ['ppt', 'pptx'].includes(ext)) {
        return { icon: Presentation, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' };
    }
    if (mimeType.includes('zip') || mimeType.includes('compressed') || ['zip', '7z', 'rar', 'tar', 'gz'].includes(ext)) {
        return { icon: FileArchive, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' };
    }
    if (mimeType.startsWith('text/') || ['txt', 'md'].includes(ext)) {
        return { icon: FileCode, color: 'text-slate-500 dark:text-slate-700', bg: 'bg-slate-200 dark:bg-slate-700/20' };
    }

    return {
        icon: File,
        color: 'text-slate-500 dark:text-slate-700',
        bg: 'bg-slate-200 dark:bg-slate-700/20'
    };
};

const theme = computed(() => getFileTheme(props.fileName, props.mimeType));
</script>
