<template>
  <div class="min-h-screen flex flex-col">

    <Header>
      <template #actions>
        <ThemeToggle />
        <UserAction />
      </template>
    </Header>

    <main class="flex-1 flex flex-col items-center p-4 md:p-8 animate-in fade-in zoom-in-95">
      <router-view />
    </main>

    <Footer />

  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';

import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import UserAction from '@/components/UserAction.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';
</script>
