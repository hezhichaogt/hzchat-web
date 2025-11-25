<template>
    <div class="agreement-container">

        <n-h1 prefix="bar" align-text style="margin: 16px;">
            <n-gradient-text type="primary">User Agreement</n-gradient-text>
        </n-h1>

        <MarkdownRenderer :content="AgreementMd" />

    </div>
</template>

<script setup lang="ts">
//
// User Agreement page view component.
//
import { NH1, NGradientText } from 'naive-ui';
import MarkdownRenderer from '@/components/MarkdownRenderer.vue';
import AgreementMd from '@/markdown/agreement.md?raw';
import { useHead } from '@unhead/vue';

//
// SEO
//
const BASE_URL = import.meta.env.VITE_BASE_URL || window.location.origin;
useHead({
    title: 'User Agreement - Terms of Use, Content Responsibility, and Service Rules',
    meta: [
        {
            name: 'description',
            content: 'Review HZ Chat\'s User Agreement and Terms of Use regarding content ownership, prohibited conduct, temporary license, and service liability. Governed by Singapore law.',
        },
        {
            property: 'og:title',
            content: 'User Agreement - Terms of Use, Content Responsibility, and Service Rules',
        },
        {
            property: 'og:description',
            content: 'Review HZ Chat\'s User Agreement and Terms of Use regarding content ownership, prohibited conduct, temporary license, and service liability. Governed by Singapore law.',
        },
        {
            property: 'og:url',
            content: `${BASE_URL}/agreement`,
        },
    ],
});
</script>

<style scoped>
.agreement-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
}

:deep(.markdown-body) {
    padding-top: 0;
}
</style>
