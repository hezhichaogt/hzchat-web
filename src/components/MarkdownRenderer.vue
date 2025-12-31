<template>
    <div class="prose prose-zinc dark:prose-invert max-w-none
           prose-headings:tracking-tighter prose-headings:font-black prose-headings:text-foreground
           prose-h2:mt-12 prose-h2:mb-4
           prose-strong:text-foreground prose-strong:font-bold
           prose-li:marker:text-primary/50
           animate-in fade-in slide-in-from-bottom-4 duration-800 fill-mode-both" v-html="renderedMarkdown"></div>
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