<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" title="Theme" :class="cn(
                'h-9 w-9 rounded-full focus-visible:ring-0 select-none overflow-hidden group transition-fluid',
                'hover:bg-accent dark:hover:bg-white/10'
            )">
                <Transition name="icon-fade" mode="out-in">
                    <component :is="currentIcon" :key="themeStore.theme"
                        class="h-[1.15rem] w-[1.15rem] text-foreground/90" />
                </Transition>
                <span class="sr-only">Toggle theme</span>
            </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" :side-offset="8" :class="cn(
            'w-40 bg-popover/90 bg-background shadow-xl transition-fluid'
        )">
            <DropdownMenuItem v-for="option in options" :key="option.value" @click="setTheme(option.value)" :class="cn(
                'flex items-center justify-between cursor-pointer px-3 py-2.5 my-0.5 rounded-md transition-colors',
                'focus:bg-accent dark:focus:bg-white/10'
            )">
                <div class="flex items-center gap-3">
                    <component :is="option.icon" class="h-4 w-4 opacity-70" />
                    <span class="text-sm font-medium">{{ option.label }}</span>
                </div>
                <Check v-if="themeStore.theme === option.value" class="h-4 w-4 text-primary" />
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Sun, Moon, Monitor, Check } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { useThemeStore, type Theme } from '@/stores/theme'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const themeStore = useThemeStore()

const currentIcon = computed(() => {
    if (themeStore.theme === 'light') return Sun
    if (themeStore.theme === 'dark') return Moon
    return Monitor
})

const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' }
] as const

const setTheme = (v: Theme) => {
    themeStore.setTheme(v)
}
</script>
