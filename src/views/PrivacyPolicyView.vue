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
