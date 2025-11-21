<template>
  <div class="container">

    <Header />

    <div class="content-wrapper">
      <div class="content-inner">
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

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.content-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  min-height: 0;
}

.content-inner {
  flex: 1;
  display: flex;
  max-width: 1066px;
  width: 100%;
  padding: 8px;
}

@media (min-width: 1066px) {
  .content-inner {
    padding: 8px 0;
  }
}
</style>
