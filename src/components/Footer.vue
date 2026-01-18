<template>
    <footer class="w-full px-4 py-2 flex justify-center animate-in fade-in slide-in-from-bottom-4">
        <div :class="cn(
            'flex w-full text-[11px] transition-all duration-300',
            'text-foreground/40 font-medium',
            'flex-col items-center gap-2 sm:flex-row-reverse sm:justify-between sm:gap-0',
            route.meta.layoutWidth ? route.meta.layoutWidth : 'max-w-2xl',
        )">
            <nav class="flex flex-wrap items-center justify-center gap-x-1 tracking-tight">
                <a href="https://github.com/hezhichaogt/hzchat-web" target="_blank"
                    class="hover:text-primary transition-fluid px-1.5 py-1">GitHub</a>

                <span class="opacity-30">·</span>
                <router-link to="/privacy" class="hover:text-primary transition-fluid px-1.5 py-1">Privacy</router-link>

                <span class="opacity-30">·</span>
                <router-link to="/agreement" class="hover:text-primary transition-fluid px-1.5 py-1">Terms</router-link>

                <span class="opacity-30">·</span>
                <router-link to="/faq" class="hover:text-primary transition-fluid px-1.5 py-1">FAQ</router-link>

                <span class="opacity-30">·</span>
                <router-link to="/pricing" class="hover:text-primary transition-fluid px-1.5 py-1">Pricing</router-link>

                <span class="opacity-30">·</span>
                <router-link to="/about" class="hover:text-primary transition-fluid px-1.5 py-1">About</router-link>
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
import { useRoute, RouterLink } from 'vue-router'
import { cn } from '@/lib/utils'

const route = useRoute()
</script>