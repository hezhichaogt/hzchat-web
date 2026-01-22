<template>
    <div
        class="relative overflow-hidden bg-zinc-900 dark:bg-zinc-50 rounded-[2.5rem] p-6 sm:p-8 text-white dark:text-zinc-900 shadow-2xl">
        <div
            class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 size-64 bg-amber-500/10 blur-[80px] rounded-full">
        </div>

        <div class="relative z-10 flex flex-col items-center text-center mb-8 sm:mb-10">
            <div
                class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                <Zap class="size-3 fill-current" /> Pro Plan
            </div>
            <h3 class="text-2xl sm:text-3xl font-black tracking-tighter mb-2">HZ Chat Pro</h3>
            <p class="text-zinc-400 dark:text-zinc-500 text-sm max-w-65 leading-relaxed">
                More control. Higher limits. No more re-sharing.
            </p>
        </div>

        <div class="relative z-10 flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10">
            <div v-for="item in features" :key="item.title"
                class="flex items-center sm:flex-col sm:items-start gap-4 sm:gap-3 p-4 sm:px-5 sm:py-3 rounded-2xl sm:rounded-3xl bg-white/5 dark:bg-zinc-950/5 border border-white/10 dark:border-zinc-200">

                <div class="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                    <component :is="item.icon" class="size-4 sm:size-5" />
                </div>

                <div class="flex flex-col text-left overflow-hidden">
                    <span class="text-[13px] sm:text-[14px] font-extrabold tracking-tight whitespace-nowrap">{{
                        item.title }}</span>
                    <span
                        class="text-[10px] sm:text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 whitespace-nowrap opacity-80">{{
                            item.desc }}</span>
                </div>
            </div>
        </div>

        <div class="relative z-10 flex flex-col gap-3">
            <Button
                class="w-full h-12 sm:h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm sm:text-base transition-all active:scale-[0.98] border-none shadow-lg shadow-amber-500/20">
                Upgrade to Pro — $4.99/mo
            </Button>

            <button @click="router.push('/pricing')"
                class="w-full py-2 text-[11px] font-bold text-zinc-500 hover:text-amber-500 transition-colors flex items-center justify-center gap-1">
                Compare plans
                <ChevronRight class="size-3" />
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Zap, Users, FileUp, MessagesSquare, Hash, ChevronRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const router = useRouter();

const features = [
    { title: 'Up to 100 members', desc: 'Per chat', icon: Users },
    { title: '100MB file uploads', desc: 'Images, audio & PDFs', icon: FileUp },
    { title: 'Up to 20 chats', desc: 'Active at the same time', icon: MessagesSquare },
    { title: 'Custom chat codes', desc: 'Reusable, no re-sharing needed', icon: Hash }
]
</script>