<template>
  <n-switch :value="themeStore.getIsDark" @update:value="themeStore.setIsDark" :rail-style="railStyle">
    <template #checked>
      Dark
    </template>
    <template #unchecked>
      Light
    </template>
  </n-switch>
</template>

<script setup lang="ts">
//
// ThemeSwitcher.vue
//
// Global theme switching component for the application, controlling dark/light mode.
//

import type { CSSProperties } from 'vue';
import { NSwitch } from 'naive-ui';
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();

function railStyle({
  focused,
  checked
}: {
  focused: boolean
  checked: boolean
}): CSSProperties {
  const style: CSSProperties = {};

  const darkColor = '#4F4F4F';
  const lightColor = '#C8C8C8';

  if (checked) {
    style.background = darkColor;
    if (focused) {
      style.boxShadow = `0 0 0 2px ${darkColor}40`;
    }
  } else {
    style.background = lightColor;
    if (focused) {
      style.boxShadow = `0 0 0 2px ${lightColor}40`;
    }
  }
  return style;
}
</script>
