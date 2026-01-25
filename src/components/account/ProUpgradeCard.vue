<template>
    <div
        class="relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-4xl p-5 sm:p-6 text-zinc-900 dark:text-zinc-100 shadow-sm">
        <div
            class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 size-64 bg-amber-500/10 blur-[80px] rounded-full">
        </div>

        <div class="relative z-10 flex flex-col items-center text-center mb-6 sm:mb-8">
            <div
                class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                <Zap class="size-3 fill-current" /> Pro Plan
            </div>
            <h3 class="text-xl sm:text-2xl font-black tracking-tighter mb-2">HZ Chat Pro</h3>
            <p class="text-zinc-500 dark:text-zinc-400 text-xs max-w-60 leading-relaxed">
                More control. Higher limits. No more re-sharing.
            </p>
        </div>

        <div class="relative z-10 grid grid-cols-2 gap-2.5 mb-6 sm:mb-8">
            <div v-for="item in features" :key="item.title"
                class="flex flex-col items-start gap-2.5 p-3.5 sm:p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/50 hover:border-amber-500/20 transition-colors group">
                <div
                    class="p-1.5 rounded-xl bg-white dark:bg-zinc-900 text-amber-500 shadow-sm border border-zinc-100 dark:border-zinc-800 group-hover:scale-110 transition-transform">
                    <component :is="item.icon" class="size-4" />
                </div>

                <div class="flex flex-col text-left min-w-0">
                    <span
                        class="text-[11px] sm:text-[12px] font-black tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
                        {{ item.title }}
                    </span>
                    <span
                        class="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 opacity-90 leading-normal">
                        {{ item.desc }}
                    </span>
                </div>
            </div>
        </div>

        <div class="relative z-10 flex flex-col gap-2">
            <Button
                class="w-full h-11 sm:h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm transition-all active:scale-[0.98] border-none shadow-lg shadow-amber-500/20">
                Upgrade to Pro — $4.99/mo
            </Button>

            <button @click="router.push('/pricing')"
                class="w-full py-2 text-[10px] font-bold text-zinc-400 hover:text-amber-500 transition-colors flex items-center justify-center gap-1">
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