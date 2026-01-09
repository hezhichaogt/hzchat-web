<template>
    <div class="w-full max-w-2xl mx-auto py-4">
        <h1
            class="text-4xl sm:text-5xl lg:text-6xl font-black mb-10 tracking-tighter uppercase text-zinc-900 dark:text-zinc-100">
            Terms
        </h1>

        <div class="relative">
            <MarkdownRenderer :content="userAgreementMd" />
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
import userAgreementMd from '@/markdown/agreement.md?raw';
import { useHead } from '@unhead/vue';

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
