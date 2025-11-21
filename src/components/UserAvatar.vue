<template>
  <n-avatar v-if="user.avatar" :size="size" round :src="user.avatar">
    <template #fallback>
      <div class="user-avatar-text">
        {{ fallbackText }}
      </div>
    </template>
  </n-avatar>

  <n-avatar v-else :size="size" round>
    <div class="user-avatar-text">
      {{ fallbackText }}
    </div>
  </n-avatar>
</template>

<script setup lang="ts">
//
// UserAvatar.vue
//
// User avatar component. Renders the user's avatar image, or displays the first 
// letter of the nickname as fallback text if the avatar URL is missing.
//

import { computed } from 'vue'
import { NAvatar } from 'naive-ui';

const props = defineProps<{
  user: {
    avatar?: string | null
    nickname: string
  }
  size?: 'small' | 'medium' | 'large' | number
}>()

const fallbackText = computed(() => {
  const name = props.user?.nickname || '?'
  return name.substring(0, 1).toUpperCase()
})
</script>

<style scoped>
.user-avatar-text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--n-text-color-3);
  background-color: var(--n-button-color2);
  text-transform: uppercase;
}
</style>
