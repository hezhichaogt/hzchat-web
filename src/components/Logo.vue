<template>
    <RouterLink to="/" :class="cn(
        'flex items-center gap-2.5 outline-none group',
    )">
        <div :class="cn(
            'flex items-center justify-center overflow-hidden transition-fluid',
            'group-hover:scale-[1.03] group-active:scale-95',
            'drop-shadow-sm group-hover:drop-shadow-md',
            sizeClasses[size].container
        )">
            <img src="/logo.png" alt="HZ Chat Logo" :class="cn(
                'w-full h-full object-contain',
                'dark:brightness-90 dark:contrast-110'
            )" />
        </div>

        <div v-if="showText" class="relative flex items-center">
            <span :class="cn(
                'font-black tracking-tighter uppercase inline-block transition-fluid',
                'text-foreground/80 dark:text-foreground',
                'group-hover:translate-x-0.5 group-hover:scale-[1.01] group-hover:text-foreground',
                sizeClasses[size].text
            )">
                HZ Chat
            </span>

            <span :class="cn(
                'ml-1 px-1.5 py-0.5 rounded-md transition-fluid select-none backdrop-blur-[2px]',
                'text-[10px] font-medium tracking-[0.25em] uppercase',
                'text-foreground/40 group-hover:text-primary/90, group-hover:translate-x-0.5',
                'self-end mb-px'
            )">
                Beta
            </span>
        </div>
    </RouterLink>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
    size?: 'sm' | 'md' | 'lg'
    showText?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    showText: true,
})

const sizeClasses = {
    sm: { container: 'h-8 w-8', text: 'text-lg' },
    md: { container: 'h-10 w-10', text: 'text-xl' },
    lg: { container: 'h-12 w-12', text: 'text-2xl' }
}
</script>