<template>
    <RouterLink to="/" :class="cn(
        'flex items-center gap-2.5 transition-all outline-none group',
        'cursor-pointer select-none',
    )">
        <div :class="cn(
            'flex items-center justify-center overflow-hidden',
            'transition-all duration-500 ease-out',
            'group-hover:scale-105 group-active:scale-95',
            sizeClasses[size].container
        )">
            <img src="/logo.png" alt="HZ Chat Logo" :class="cn('w-full h-full object-contain shadow-sm')" />
        </div>

        <span v-if="showText" :class="cn(
            'font-black tracking-tighter uppercase',
            'text-zinc-950 dark:text-zinc-50',
            sizeClasses[size].text
        )">
            HZ Chat
        </span>
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