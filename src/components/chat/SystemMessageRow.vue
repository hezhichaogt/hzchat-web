<template>
    <div class="flex justify-center w-full my-8 px-10">
        <div :class="[
            'text-[12px] transition-all duration-300 text-center leading-relaxed max-w-[80%]',
            themeConfig.text
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
            text: 'text-zinc-500/80 font-medium dark:text-zinc-400/50'
        },
        error: {
            text: 'text-red-600/70 font-semibold dark:text-red-400/50'
        },
        success: {
            text: 'text-emerald-700/70 font-semibold dark:text-emerald-500/50'
        },
        info: {
            text: 'text-blue-600/70 font-semibold dark:text-blue-400/50'
        }
    };

    return themes[style as keyof typeof themes] || themes.default;
});
</script>