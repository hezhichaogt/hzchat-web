<template>
    <div class="min-h-screen bg-background transition-colors duration-500 py-2">
        <div class="max-w-2xl mx-auto px-4 sm:px-6">
            <div class="mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
                <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter uppercase leading-[0.9] mb-6">
                    HZ Chat<span class="text-primary">:</span><br />
                    <span class="text-primary">Instant.</span> Temporary<span class="text-primary">.</span>
                    Zero-Log<span class="text-primary">.</span>
                </h1>
                <p
                    class="text-lg sm:text-xl text-muted-foreground font-medium tracking-tight leading-relaxed max-w-2xl">
                    Zero Burden for Conversation, Built for Privacy. HZ Chat is dedicated to providing a completely
                    private,
                    zero-stress communication tool, ensuring every one of your exchanges is instantaneous and leaves no
                    permanent trace.
                </p>
            </div>

            <Separator class="my-10 opacity-50" />

            <section class="mb-14 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 fill-mode-both">
                <h2 class="text-sm font-bold tracking-[0.2em] uppercase text-primary whitespace-nowrap mb-4">
                    Privacy Focused
                </h2>

                <div class="grid gap-px bg-border/40 border border-border/40 rounded-xl overflow-hidden shadow-sm">
                    <div v-for="(item, index) in privacyFeatures" :key="index"
                        class="bg-background p-6 sm:p-8 hover:bg-muted/30 transition-colors group">
                        <div class="flex items-start gap-4">
                            <component :is="item.icon" class="mt-1 size-5 text-primary shrink-0" />
                            <div class="space-y-2 hover:cursor-default">
                                <h3 class="font-bold tracking-tight text-lg">{{ item.title }}</h3>
                                <p class="text-muted-foreground leading-relaxed text-sm sm:text-base">
                                    {{ item.description }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section
                class="mb-14 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 fill-mode-both flex flex-col gap-6">
                <h2 class="text-sm font-bold tracking-[0.2em] uppercase text-primary whitespace-nowrap">
                    Pure Communication
                </h2>

                <div class="grid gap-8 sm:grid-cols-2">
                    <div v-for="(item, index) in communicationFeatures" :key="index"
                        class="relative pl-6 border-l-2 border-primary/20 hover:border-primary transition-colors">
                        <h3 class="font-bold tracking-tight text-lg mb-2">{{ item.title }}</h3>
                        <p class="text-muted-foreground text-sm leading-relaxed">
                            {{ item.description }}
                        </p>
                    </div>
                </div>
            </section>

            <div
                class="pt-10 border-t border-border/20 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500 fill-mode-both">
                <h2 class="text-2xl font-bold tracking-tighter mb-4 text-primary">Connect With Us</h2>
                <p class="text-muted-foreground mb-6 font-medium pr-8">
                    If you have any questions regarding our service, privacy policy, or open-source code, please contact
                    us via:
                </p>

                <Button as-child class="font-bold tracking-tight shadow-lg shadow-primary/20">
                    <a href="mailto:privacy@hzclog.com">
                        <Mail class="mr-2 size-4" />
                        Email privacy@hzclog.com
                    </a>
                </Button>

                <div class="mt-8 space-y-4">
                    <p class="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">Policy & Terms
                    </p>
                    <nav class="flex flex-col gap-2">
                        <RouterLink to="/privacy"
                            class="text-primary hover:underline font-bold tracking-tight flex items-center gap-2">
                            <ArrowRight class="size-3" /> Privacy Policy
                        </RouterLink>
                        <RouterLink to="/agreement"
                            class="text-primary hover:underline font-bold tracking-tight flex items-center gap-2">
                            <ArrowRight class="size-3" /> User Agreement
                        </RouterLink>
                    </nav>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { Separator } from '@/components/ui/separator'
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