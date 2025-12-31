<template>
    <footer class="w-full p-4 flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-800">
        <div :class="cn(
            'flex w-full text-xs text-zinc-500 transition-all duration-300',
            'flex-col items-center gap-4 sm:flex-row-reverse sm:justify-between sm:gap-0',
            maxWidth
        )">
            <nav class="flex flex-wrap items-center justify-center gap-x-1">
                <a href="https://github.com/hezhichaogt/hzchat-web" target="_blank"
                    class="hover:text-zinc-900 transition-colors px-1">GitHub</a>
                <span class="text-zinc-300">·</span>
                <a href="/privacy" class="hover:text-zinc-900 transition-colors px-1">Privacy Policy</a>
                <span class="text-zinc-300">·</span>
                <a href="/agreement" class="hover:text-zinc-900 transition-colors px-1">User Agreement</a>
                <span class="text-zinc-300">·</span>
                <a href="/faq" class="hover:text-zinc-900 transition-colors px-1">FAQ</a>
                <span class="text-zinc-300">·</span>
                <a href="/about" class="hover:text-zinc-900 transition-colors px-1">About Us</a>
            </nav>

            <div class="flex items-center">
                <span>© {{ new Date().getFullYear() }} HZ Chat. All rights reserved.</span>
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
