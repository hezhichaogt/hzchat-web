<template>
    <div class="loading-container">
        <n-space vertical align="center" class="loading-content">
            <n-icon :component="FlashSharp" :color="primaryColor" size="40" class="loading-icon" />
            <n-text depth="3" class="loading-text">{{ displayText }}</n-text>
        </n-space>
    </div>
</template>

<script setup lang="ts">
//
// LoadingPage.vue
//
// Loading page component. Displayed to the user while the application is initializing 
// or actively attempting to establish a WebSocket connection. 
//

import { computed } from 'vue';
import { NSpace, NIcon, NText, useThemeVars } from 'naive-ui';
import { FlashSharp } from '@vicons/ionicons5';

const props = defineProps<{
    status: 'INIT' | 'CONNECTING';
}>();

const themeVars = useThemeVars();
const primaryColor = computed(() => themeVars.value.primaryColor);

const displayText = computed(() => {
    return props.status === 'INIT' ? 'Initializing...' : 'Connecting...';
});
</script>

<style scoped>
.loading-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.loading-content {
    align-items: center;
}

@keyframes flash {
    0% {
        opacity: 0.8;
    }

    50% {
        opacity: 0.65;
    }

    100% {
        opacity: 0.8;
    }
}

.loading-icon {
    animation: flash 1s ease-in-out infinite;
}

.loading-text {
    font-size: 0.875rem;
    margin-top: 1rem;
}
</style>
