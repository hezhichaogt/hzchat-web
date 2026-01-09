<template>
    <div class="w-full max-w-2xl mx-auto px-0.5 py-4">
        <div class="mb-20">
            <h1
                class="text-5xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.85] mb-8 text-zinc-900 dark:text-zinc-100">
                HZ Chat<span class="text-zinc-400 dark:text-zinc-600">:</span><br />
                <span class="text-zinc-900 dark:text-zinc-100">Instant.</span>
                <span class="text-zinc-400 dark:text-zinc-600">Temporary.</span><br />
                Zero-Log<span class="text-zinc-400 dark:text-zinc-600">.</span>
            </h1>
            <p
                class="text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 font-medium tracking-tight leading-relaxed max-w-2xl border-l-2 border-zinc-200 dark:border-zinc-800 pl-6 ml-1">
                Zero Burden for Conversation, Built for Privacy. HZ Chat is dedicated to providing a completely
                private,
                zero-stress communication tool, ensuring every one of your exchanges is instantaneous and leaves no
                permanent trace.
            </p>
        </div>

        <section class="mb-20">
            <h2 class="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 mb-8 ml-1">
                Privacy Focused
            </h2>

            <div
                class="grid gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl shadow-zinc-200/50 dark:shadow-none">
                <div v-for="(item, index) in privacyFeatures" :key="index"
                    class="bg-white dark:bg-zinc-950 p-8 sm:p-10 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all group">
                    <div class="flex flex-col sm:flex-row items-start gap-6">
                        <div
                            class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 group-hover:scale-110 transition-transform">
                            <component :is="item.icon" class="size-6 text-zinc-900 dark:text-zinc-100 shrink-0" />
                        </div>
                        <div class="space-y-2">
                            <h3 class="font-bold tracking-tight text-xl text-zinc-900 dark:text-zinc-100">{{ item.title
                            }}</h3>
                            <p class="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm sm:text-base">
                                {{ item.description }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="mb-24 flex flex-col gap-10">
            <h2 class="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 ml-1">
                Pure Communication
            </h2>

            <div class="grid gap-12 sm:grid-cols-2 px-1">
                <div v-for="(item, index) in communicationFeatures" :key="index"
                    class="relative pl-8 border-l border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors">
                    <h3 class="font-bold tracking-tight text-lg mb-3 text-zinc-900 dark:text-zinc-100">{{ item.title }}
                    </h3>
                    <p class="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                        {{ item.description }}
                    </p>
                </div>
            </div>
        </section>

        <div class="pt-16 border-t border-zinc-200 dark:border-zinc-800">
            <h2 class="text-3xl font-black tracking-tighter mb-6 text-zinc-900 dark:text-zinc-100">Connect With Us</h2>
            <p class="text-zinc-500 dark:text-zinc-400 mb-10 font-medium leading-relaxed">
                If you have any questions regarding our service, privacy policy, or open-source code, please contact
                us via:
            </p>

            <Button as-child
                class="h-12 px-8 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 font-bold tracking-tight shadow-xl shadow-zinc-900/20 transition-all hover:opacity-90 active:scale-[0.98]">
                <a href="mailto:privacy@hzclog.com">
                    <Mail class="mr-2 size-4" />
                    Email privacy@hzclog.com
                </a>
            </Button>

            <div class="mt-16 space-y-6">
                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Policy & Terms</p>
                <nav class="flex flex-wrap gap-x-8 gap-y-4">
                    <RouterLink
                        v-for="link in [{ to: '/privacy', label: 'Privacy Policy' }, { to: '/agreement', label: 'Terms' }]"
                        :key="link.to" :to="link.to"
                        class="group text-zinc-900 dark:text-zinc-100 font-bold tracking-tight flex items-center gap-2 text-sm">
                        <ArrowRight class="size-3 transition-transform group-hover:translate-x-1" />
                        {{ link.label }}
                    </RouterLink>
                </nav>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { Button } from '@/components/ui/button'
import {
    ShieldCheck,
    Trash2,
    UserX,
    Code2,
    Mail,
    ArrowRight
} from 'lucide-vue-next'

const privacyFeatures = [
    {
        icon: ShieldCheck,
        title: 'Instant Delivery, Memory Dispersal',
        description: 'Your text messages are instant and temporary. Content is routed through server memory in real-time, discarded immediately after delivery, and is never written to persistent storage.'
    },
    {
        icon: Trash2,
        title: 'File Attachments: 24-Hour Auto-Purge',
        description: 'While text messages are purely memory-based, file attachments are stored temporarily on a secure service and are automatically and permanently deleted within 24 hours of upload.'
    },
    {
        icon: UserX,
        title: 'No Account Needed, Zero PII Collection',
        description: 'We collect zero PII (Personally Identifiable Information). You can use the basic service without an account. Information like nicknames is stored only in your local browser.'
    },
    {
        icon: Code2,
        title: 'Code Verification, Proven Trust',
        description: "To verify our Zero Logging commitment, HZ Chat's core code is open-source under the AGPL license. The community and third parties can verify the code at any time."
    }
]

const communicationFeatures = [
    {
        title: 'Temporary Sessions',
        description: 'HZ Chat retains no conversation history. The session is completely purged and destroyed 5 minutes after all participants have left.'
    },
    {
        title: 'Instant Connection',
        description: "Designed to be 'use and discard.' No friends lists or historical relationship chains, allowing you to ditch social pressure."
    },
    {
        title: 'No Ad Interference',
        description: 'We solemnly commit that HZ Chat will never integrate any form of advertising. We maintain a clean, focused interface.'
    }
]

const BASE_URL = import.meta.env.VITE_BASE_URL || window.location.origin;
useHead({
    title: 'About HZ Chat: Instant, Temporary, Zero-Log',
    meta: [
        {
            name: 'description',
            content: 'Learn about HZ Chat\'s commitment to zero-log, traceless communication. Zero PII collected, open-source verified. The ultimate private chat platform.',
        },
        {
            property: 'og:title',
            content: 'About HZ Chat: Instant, Temporary, Zero-Log',
        },
        {
            property: 'og:description',
            content: 'Learn about HZ Chat\'s commitment to zero-log, traceless communication. Zero PII collected, open-source verified. The ultimate private chat platform.',
        },
        {
            property: 'og:url',
            content: `${BASE_URL}/about`,
        },
    ],
});
</script>