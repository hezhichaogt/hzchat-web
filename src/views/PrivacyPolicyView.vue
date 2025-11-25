<template>
    <div class="privacy-container">

        <n-h1 prefix="bar" align-text style="margin: 16px;">
            <n-gradient-text type="primary">Privacy Policy</n-gradient-text>
        </n-h1>

        <MarkdownRenderer :content="privacyPolicyMd" />

    </div>
</template>

<script setup lang="ts">
//
// Privacy Policy page view component.
//
import { NH1, NGradientText } from 'naive-ui';
import MarkdownRenderer from '@/components/MarkdownRenderer.vue';
import privacyPolicyMd from '@/markdown/privacy.md?raw';
import { useHead } from '@unhead/vue';

//
// SEO
//
const BASE_URL = import.meta.env.VITE_BASE_URL || window.location.origin;
useHead({
    title: 'Privacy Policy - Commitment to Zero-Log and Zero-PII Collection',

    meta: [
        {
            name: 'description',
            content: 'Read HZ Chat\'s Privacy Policy. We commit to Zero Logging, collecting no PII, and never storing chat history. Absolute data privacy and security.',
        },
        {
            property: 'og:title',
            content: 'Privacy Policy - Commitment to Zero-Log and Zero-PII Collection',
        },
        {
            property: 'og:description',
            content: 'Read HZ Chat\'s Privacy Policy. We commit to Zero Logging, collecting no PII, and never storing chat history. Absolute data privacy and security.',
        },
        {
            property: 'og:url',
            content: `${BASE_URL}/privacy`,
        },
    ],
});
</script>

<style scoped>
.privacy-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
}

:deep(.markdown-body) {
    padding-top: 0;
}
</style>
