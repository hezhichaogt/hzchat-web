<template>
    <div class="min-h-screen bg-background transition-colors duration-500">
        <div class="max-w-2xl mx-auto px-2">
            <h1
                class="text-3xl sm:text-4xl lg:text-5xl font-black mb-2 tracking-tighter uppercase animate-in fade-in slide-in-from-top-4 duration-800">
                Privacy Policy
            </h1>

            <div class="relative p-0.5">
                <MarkdownRenderer :content="privacyPolicyMd" />
            </div>

            <div class="my-6">
                <Button variant="link" @click="$router.replace('/')"
                    class="px-0 font-bold tracking-tight text-muted-foreground hover:text-primary transition-colors hover:cursor-pointer -translate-x-2.5">
                    <ArrowLeft class="mr-1.5 h-4 w-4" />
                    BACK TO HOME
                </Button>
            </div>
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
