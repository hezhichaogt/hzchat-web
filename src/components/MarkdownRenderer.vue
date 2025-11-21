<template>
    <div class="markdown-body" v-html="renderedMarkdown"></div>
</template>

<script setup lang="ts">
//
// MarkdownRenderer.vue
//
// Markdown content rendering component, responsible for converting Markdown text 
// to HTML and applying theme styles.
//

import { computed } from 'vue';
import { useThemeVars } from 'naive-ui';
import MarkdownIt, { type Options } from 'markdown-it';

const props = defineProps<{
    content: string;
}>();

const md: MarkdownIt = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
} as Options);

const renderedMarkdown = computed(() => {
    if (!props.content) return '';
    return md.render(props.content);
});

const themeVars = useThemeVars();

const textColor = computed(() => themeVars.value.textColorBase);
const bgColor = computed(() => themeVars.value.bodyColor);
const separatorColor = computed(() => themeVars.value.dividerColor);
const primaryColor = computed(() => themeVars.value.primaryColor);
const fontSize = computed(() => themeVars.value.fontSize);
</script>

<style scoped>
.markdown-body {
    color: v-bind(textColor);
    background-color: v-bind(bgColor);
    font-size: v-bind(fontSize);
    --link-color: v-bind(primaryColor);
    --separator-color: v-bind(separatorColor);
    --table-header-bg: v-bind(separatorColor);
    line-height: 1.6;
    word-wrap: break-word;
    max-width: 800px;
    margin: 0 auto;
    padding: 24px 0;
}

.markdown-body :deep(p),
.markdown-body :deep(ul),
.markdown-body :deep(ol),
.markdown-body :deep(blockquote),
.markdown-body :deep(table) {
    margin-top: 0;
    margin-bottom: 1.2em;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
    padding-bottom: 0em;
    margin-top: 1.2em;
    margin-bottom: 0.8em;
    font-weight: 700;
}

.markdown-body :deep(h1) {
    font-size: 2em;
    margin-top: 0.5em;
}

.markdown-body :deep(h2) {
    font-size: 1.5em;
    margin-top: 1.5em;
}

.markdown-body :deep(h3) {
    font-size: 1.25em;
}

.markdown-body :deep(h4) {
    font-size: 1.1em;
}

.markdown-body :deep(a) {
    color: var(--link-color);
    text-decoration: none;
    transition: color 0.3s;
}

.markdown-body :deep(a:hover) {
    text-decoration: underline;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
    padding-left: 2em;
}

.markdown-body :deep(blockquote) {
    padding: 0 1em;
    line-height: 1.6;
    color: var(--n-text-color-secondary);
    border-left: 0.25em solid var(--separator-color);
}

.markdown-body :deep(table) {
    display: block;
    width: max-content;
    max-width: 100%;
    overflow: auto;
    border-collapse: collapse;
}

.markdown-body :deep(th) {
    font-weight: 600;
    background-color: var(--table-header-bg);
    border: 1px solid var(--separator-color);
    padding: 6px 13px;
}

.markdown-body :deep(td) {
    border: 1px solid var(--separator-color);
    padding: 6px 13px;
}
</style>
