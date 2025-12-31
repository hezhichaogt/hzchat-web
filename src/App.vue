<template>
  <div class="min-h-dvh transition-colors duration-300">
    <router-view />
    <Toaster position="top-center" richColors />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { Toaster } from 'vue-sonner';
import { useUserStore } from '@/stores/user';
import { getUserProfile } from '@/services/user';

const userStore = useUserStore();

onMounted(async () => {
  if (!userStore.identityToken) return;

  try {
    const { user } = await getUserProfile();
    userStore.handleLoginSuccess(userStore.identityToken, user);
  } catch (error: any) {
    console.warn('Profile sync failed, staying in current state.');
  }
});
</script>
