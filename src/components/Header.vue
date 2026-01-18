<template>
  <header :class="cn(
    'w-full p-4 flex justify-center bg-background/80 backdrop-blur-md',
    'animate-in fade-in slide-in-from-top-4',
    !route.meta.hideHeaderBorder ? 'border-b border-border' : 'border-b-transparent'
  )">

    <div :class="cn(
      'flex h-14 items-center justify-between',
      route.meta.layoutWidth ? route.meta.layoutWidth : 'max-w-2xl',
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
import { useRoute } from 'vue-router'
import { cn } from '@/lib/utils'
import Logo from './Logo.vue';

const route = useRoute()
</script>
