<template>
  <div class="container">

    <Header />

    <div class="main-content">
      <router-view />
    </div>

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

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}
</style>
