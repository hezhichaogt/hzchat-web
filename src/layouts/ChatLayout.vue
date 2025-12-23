<template>
  <div class="flex flex-col h-screen overflow-hidden">

    <Header />

    <div class="flex-1 w-full flex justify-center min-h-0 bg-slate-50">
      <div class="mx-auto w-full max-w-266.5 flex p-2 md:px-0 ">
        <router-view />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
//
// Chat-specific layout component. 
//

import { RouterView } from 'vue-router';
import Header from '@/components/Header.vue'; 
</script>
