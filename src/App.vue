<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <n-layout class="app">
          <router-view />
        </n-layout>
      </n-dialog-provider>
    </n-message-provider>
    <n-global-style />
  </n-config-provider>
</template>

<script setup lang="ts">
//
// The root component of the application. Responsible for setting up global 
// configuration, themes, and Naive UI's Provider containers, ensuring all 
// child components can access services like themes, messages, and dialogs.
//

import { computed } from 'vue';
import { RouterView } from 'vue-router';
import { useThemeStore } from '@/stores/theme'
import {
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  NLayout,
  darkTheme,
  NGlobalStyle,
  type GlobalThemeOverrides,
} from 'naive-ui';

const themeStore = useThemeStore();

const theme = computed(() => {
  return themeStore.getIsDark ? darkTheme : null;
});

const themeOverrides: GlobalThemeOverrides = {
  common: {
    fontWeightStrong: '600'
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
}
</style>
