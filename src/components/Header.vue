<template>
  <n-layout-header class="header-container">
    <div class="header-inner">
      <RouterLink to="/" class="header-brand">
        <n-icon :component="Flash" size="24" :color="primaryColor" />
        <n-gradient-text size="20">
          HZ Chat
        </n-gradient-text>
      </RouterLink>
      <div class="header-actions">
        <!-- <ThemeSwitcher /> -->
      </div>
    </div>
  </n-layout-header>
</template>

<script setup lang="ts">
//
// Header.vue
//
// The application's global header component. Its primary function is to display 
// the brand name (HZ Chat) and integrate the ThemeSwitcher component.
//

import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { NLayoutHeader, useThemeVars, NIcon, NGradientText } from 'naive-ui';
import { Flash } from '@vicons/ionicons5';
import ThemeSwitcher from './ThemeSwitcher.vue';

const themeVars = useThemeVars();
const primaryColor = computed(() => themeVars.value.primaryColor);
</script>

<style scoped>
.header-container {
  border-bottom: 1px solid var(--n-border-color);
  height: 56px;
}

.header-inner {
  width: 100%;
  max-width: 1066px;
  height: 56px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}

.header-brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 8px;
  font-weight: bold;
}

.header-actions {
  display: flex;
  align-items: center;
}

@media (min-width: 1066px) {
  .header-inner {
    padding: 0;
  }
}
</style>
