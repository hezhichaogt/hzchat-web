<template>
    <div class="w-full max-w-2xl mx-auto py-4">
        <div class="max-w-2xl mx-auto px-0.5">
            <div class="mb-16">
                <h1
                    class="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter uppercase mb-4 text-zinc-900 dark:text-zinc-100">
                    FAQ
                </h1>
                <p
                    class="text-zinc-500 dark:text-zinc-400 font-medium tracking-tight pl-1 border-l-2 border-zinc-200 dark:border-zinc-800 ml-1">
                    Questions about Zero-Log, Privacy, and Usage.
                </p>
            </div>

            <div class="space-y-16">
                <section v-for="(group, gIndex) in faqData" :key="gIndex" class="space-y-6">
                    <div class="flex items-center gap-4 mb-8">
                        <h2
                            class="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                            {{ group.title }}
                        </h2>
                        <div class="h-px w-full bg-zinc-200/50 dark:bg-zinc-800/50"></div>
                    </div>

                    <Accordion type="single" collapsible class="w-full space-y-2">
                        <AccordionItem v-for="item in group.items" :key="item.name" :value="item.name"
                            class="border-none px-4 rounded-2xl transition-all duration-300 data-[state=open]:bg-zinc-50 dark:data-[state=open]:bg-zinc-900/40">
                            <AccordionTrigger
                                class="text-left font-bold py-5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors hover:no-underline tracking-tight text-base sm:text-lg group">
                                {{ item.question }}
                            </AccordionTrigger>
                            <AccordionContent class="pb-6">
                                <div class="prose prose-zinc dark:prose-invert max-w-none text-zinc-500 dark:text-zinc-400 leading-relaxed
                                       prose-p:text-sm prose-p:mb-4 prose-ul:my-4 prose-li:my-1 prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100"
                                    v-html="item.answer">
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </section>
            </div>

            <div class="mt-24 pt-8 border-t border-zinc-200/60 dark:border-zinc-800/60">
                <Button variant="link" @click="$router.replace('/')"
                    class="h-auto p-0 font-bold tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all hover:cursor-pointer group">
                    <ArrowLeft class="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
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
