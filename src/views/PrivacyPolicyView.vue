<template>
    <div class="w-full max-w-2xl mx-auto py-4">
        <h1
            class="text-4xl sm:text-5xl lg:text-6xl font-black mb-10 tracking-tighter uppercase text-zinc-900 dark:text-zinc-100">
            Privacy Policy
        </h1>

        <div class="relative">
            <MarkdownRenderer :content="privacyPolicyMd" />
        </div>

        <div class="mt-16 pt-8 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <Button variant="link" @click="$router.replace('/')"
                class="h-auto p-0 font-bold tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all hover:cursor-pointer group">
                <ArrowLeft class="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                BACK TO HOME
            </Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-vue-next';
import MarkdownRenderer from '@/components/MarkdownRenderer.vue';
import privacyPolicyMd from '@/markdown/privacy.md?raw';
import { useHead } from '@unhead/vue';

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
