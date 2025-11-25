<template>
    <div class="faq-container">

        <n-h1 prefix="bar" align-text style="margin: 16px;">
            <n-gradient-text type="primary">FAQ</n-gradient-text>
        </n-h1>

        <n-collapse default-expanded-names="faq" accordion arrow-placement="right" class="faq-data">
            <template v-for="(group, index) in faqData" :key="index">
                <n-h2 class="faq-group-title">{{ group.title }}</n-h2>

                <n-collapse-item v-for="item in group.items" :key="item.name" :title="item.question" :name="item.name"
                    class="faq-item">
                    <div class="faq-answer" v-html="item.answer"></div>
                </n-collapse-item>
            </template>
        </n-collapse>

    </div>
</template>

<script setup lang="ts">
//
// Frequently Asked Questions (FAQ) page view component.
//
import { computed } from 'vue';
import { NH1, NGradientText, NCollapse, NCollapseItem, NH2, useThemeVars } from 'naive-ui';
import faqData from '@/data/faq';
import { useHead } from '@unhead/vue';

//
// SEO
//
const BASE_URL = import.meta.env.VITE_BASE_URL || window.location.origin;
useHead({
    title: 'FAQ - Questions about Zero-Log, Privacy, and Usage',
    meta: [
        {
            name: 'description',
            content: 'Find answers to frequently asked questions about HZ Chat\'s Zero Logging policy, data privacy, security, and terms of service. Get details on PII, chat history, and platform usage.',
        },
        {
            property: 'og:title',
            content: 'FAQ - Questions about Zero-Log, Privacy, and Usage',
        },
        {
            property: 'og:description',
            content: 'Find answers to frequently asked questions about HZ Chat\'s Zero Logging policy, data privacy, security, and terms of service. Get details on PII, chat history, and platform usage.',
        },
        {
            property: 'og:url',
            content: `${BASE_URL}/faq`,
        },
    ],
});

const themeVars = useThemeVars();
const actionColor = computed(() => themeVars.value.actionColor);
</script>

<style scoped>
.faq-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
}

.faq-data {
    margin: 26px 0 16px;
    --n-border-radius: 0;
    --n-border: none !important;
    --n-divider-color: transparent !important;
}

.faq-group-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 0;
}

.faq-item {
    margin: 0;
    padding: 4px;
}

.faq-answer {
    padding: 8px 26px;
    background-color: v-bind(actionColor);
}
</style>
