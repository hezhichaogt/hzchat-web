<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon"
                class="h-9 w-9 rounded-full focus-visible:ring-0 select-none overflow-hidden group">
                <Transition name="icon-fade" mode="out-in">
                    <component :is="currentIcon" :key="themeStore.theme"
                        class="h-[1.15rem] w-[1.15rem] text-foreground/90 theme-icon" />
                </Transition>
                <span class="sr-only">Toggle theme</span>
            </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" :side-offset="8"
            class="w-40 backdrop-blur-xl bg-popover/90 border-border/50 shadow-xl">
            <DropdownMenuItem v-for="option in options" :key="option.value" @click="setTheme(option.value)"
                class="flex items-center justify-between cursor-pointer px-3 py-2.5 my-0.5 rounded-md transition-colors focus:bg-accent">
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

<style scoped>
.theme-icon {
    will-change: transform, opacity;
}

.icon-fade-enter-active,
.icon-fade-leave-active {
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-fade-enter-from {
    transform: translateY(8px);
    opacity: 0;
}

.icon-fade-leave-to {
    transform: translateY(-8px);
    opacity: 0;
}
</style>