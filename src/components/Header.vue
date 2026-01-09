<template>
  <header :class="cn(
    'w-full p-4 flex justify-center bg-background/80 backdrop-blur-md',
    'animate-in fade-in slide-in-from-top-4'
  )">

    <div :class="cn(
      'flex h-14 items-center justify-between',
      maxWidth,
      'w-full'
    )">
      <Logo />

      <div class="flex items-center justify-end gap-2.5">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
import Logo from './Logo.vue';

interface Props {
  maxWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 'max-w-2xl'
})
</script>
