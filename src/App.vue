<template>
  <div
    class="min-h-dvh flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 transition-colors duration-500">
    <router-view />
    <Toaster position="top-center" richColors :theme="themeStore.theme === 'dark' ? 'dark' : 'light'" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { Toaster } from 'vue-sonner';
import { useUserStore } from '@/stores/user';
import { useThemeStore } from '@/stores/theme';
import { getUserProfile } from '@/services/user';

const userStore = useUserStore();
const themeStore = useThemeStore();

onMounted(async () => {
  themeStore.applyTheme(true);
  themeStore.initSystemListener();

  if (!userStore.identityToken) return;

  try {
    const { user } = await getUserProfile();
    userStore.handleLoginSuccess(userStore.identityToken, user);
  } catch (error: any) {
    console.warn('Profile sync failed, staying in current state.');
  }
});
</script>
