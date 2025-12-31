<template>
    <div class="min-h-screen bg-background transition-colors duration-500">
        <div class="max-w-3xl mx-auto px-2">
            <div class="mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
                <h1 class="text-5xl sm:text-6xl font-black tracking-tighter uppercase mb-2">
                    FAQ
                </h1>
                <p class="text-muted-foreground font-medium tracking-tight pl-1">
                    Questions about Zero-Log, Privacy, and Usage.
                </p>
            </div>

            <div class="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 fill-mode-both">
                <section v-for="(group, gIndex) in faqData" :key="gIndex" class="space-y-4">
                    <div class="flex items-center gap-4 mb-6">
                        <h2 class="text-sm font-bold tracking-[0.2em] uppercase text-primary whitespace-nowrap">
                            {{ group.title }}
                        </h2>
                        <div class="h-px w-full bg-border/50"></div>
                    </div>

                    <Accordion type="single" collapsible class="w-full">
                        <AccordionItem v-for="item in group.items" :key="item.name" :value="item.name"
                            class="border-b border-border/40 last:border-0">
                            <AccordionTrigger
                                class="text-left font-bold py-4 hover:text-primary transition-colors hover:no-underline tracking-tight text-base sm:text-lg">
                                {{ item.question }}
                            </AccordionTrigger>
                            <AccordionContent class="pb-6">
                                <div class="prose prose-zinc dark:prose-invert max-w-none text-muted-foreground leading-relaxed
                         prose-p:mb-4 prose-ul:my-4 prose-li:my-1 prose-strong:text-foreground" v-html="item.answer">
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </section>
            </div>

            <div class="mt-16 pt-8 border-t border-border/20">
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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-vue-next'
import faqData from '@/data/faq'
import { useHead } from '@unhead/vue'

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
</script>
