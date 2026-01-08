<template>
    <footer class="w-full px-4 py-2 flex justify-center animate-in fade-in slide-in-from-bottom-4">
        <div :class="cn(
            'flex w-full text-[11px] transition-all duration-300',
            'text-foreground/40 font-medium',
            'flex-col items-center gap-2 sm:flex-row-reverse sm:justify-between sm:gap-0',
            maxWidth
        )">
            <nav class="flex flex-wrap items-center justify-center gap-x-1 tracking-tight">
                <a href="https://github.com/hezhichaogt/hzchat-web" target="_blank"
                    class="hover:text-primary transition-fluid px-1.5 py-1">GitHub</a>
                <span class="opacity-30">·</span>
                <a href="/privacy" class="hover:text-primary transition-fluid px-1.5 py-1">Privacy</a>
                <span class="opacity-30">·</span>
                <a href="/agreement" class="hover:text-primary transition-fluid px-1.5 py-1">Terms</a>
                <span class="opacity-30">·</span>
                <a href="/faq" class="hover:text-primary transition-fluid px-1.5 py-1">FAQ</a>
                <span class="opacity-30">·</span>
                <a href="/about" class="hover:text-primary transition-fluid px-1.5 py-1">About</a>
            </nav>

            <div class="flex items-center tracking-wide">
                <span>
                    © {{ new Date().getFullYear() }}
                    <span class="text-foreground/60 mx-0.5">HZ CHAT</span>
                    All rights reserved.
                </span>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
    maxWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
    maxWidth: 'max-w-2xl'
})
</script>
