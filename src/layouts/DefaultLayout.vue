<template>
  <div class="min-h-screen flex flex-col">

    <Header />

    <main class="flex-1 w-full flex flex-col p-4 md:p-8 items-center">
      <div class="mx-auto w-full max-w-300 flex-1 flex flex-col">
        <router-view />
      </div>
    </main>

    <Footer />

  </div>
</template>

<script setup lang="ts">
//
// The standard default layout component for the application. It includes 
// the top navigation bar (Header), the bottom footer (Footer), and a 
// central content area (RouterView) for rendering the current route.
//

import { RouterView } from 'vue-router';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
</script>
