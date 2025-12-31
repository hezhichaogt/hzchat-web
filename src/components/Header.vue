<template>
  <header class="w-full px-4 py-2 flex justify-center animate-in fade-in slide-in-from-top-2 duration-800">

    <div :class="cn(
      'flex h-14 items-center justify-between',
      maxWidth,
      'w-full'
    )">
      <Logo />

      <div class="flex items-center justify-end">
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
