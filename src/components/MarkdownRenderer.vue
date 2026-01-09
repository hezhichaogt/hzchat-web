<template>
    <div class="prose prose-zinc dark:prose-invert max-w-none
           prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 prose-headings:font-bold prose-headings:tracking-tight
           prose-h1:text-3xl prose-h1:mb-8 prose-h1:mt-4
           prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-zinc-200/60 dark:prose-h2:border-zinc-800/50
           prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
           prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-7 prose-p:mb-6
           prose-li:my-2 animate-in fade-in slide-in-from-bottom-3 duration-500" v-html="renderedMarkdown">
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';

const props = defineProps<{ content: string }>();

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
});

const renderedMarkdown = computed(() => (props.content ? md.render(props.content) : ''));
</script>