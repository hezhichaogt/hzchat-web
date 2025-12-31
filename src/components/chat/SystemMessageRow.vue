<template>
    <div class="flex justify-center w-full my-3 px-4">
        <div :class="[
            'px-3 py-1 text-[11px] font-medium tracking-wide transition-all duration-300 rounded-lg',
            themeConfig.bg,
            themeConfig.text,
            themeConfig.border
        ]">
            {{ message.content }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SystemMessage } from '@/types/chat';

const props = defineProps<{
    message: SystemMessage;
}>();

const themeConfig = computed(() => {
    const style = props.message.style || 'default';

    const themes = {
        default: {
            bg: 'bg-transparent',
            text: 'text-zinc-400 dark:text-zinc-500',
            border: 'border-transparent'
        },
        error: {
            bg: 'bg-red-50/30 dark:bg-red-950/10',
            text: 'text-red-400 dark:text-red-500/80',
            border: 'border-transparent'
        },
        success: {
            bg: 'bg-emerald-50/30 dark:bg-emerald-950/10',
            text: 'text-emerald-500/80 dark:text-emerald-500/60',
            border: 'border-transparent'
        },
        info: {
            bg: 'bg-blue-50/30 dark:bg-blue-950/10',
            text: 'text-blue-400 dark:text-blue-500/80',
            border: 'border-transparent'
        }
    };

    return themes[style as keyof typeof themes] || themes.default;
});
</script>
