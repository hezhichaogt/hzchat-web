<template>
    <div class="error-container">
        <n-space vertical align="center" class="error-content">
            <n-icon :component="AlertCircleOutline" size="32" :color="errorColor" class="mb-4" />

            <n-h1 class="error-title">
                Connection Failed
            </n-h1>

            <n-text depth="3" class="error-description">
                We could not establish a connection to the chat. The room may be full, or the server may be unavailable.
            </n-text>

            <n-button type="primary" size="large" @click="goToHome" class="action-button">
                Go to Homepage
            </n-button>
        </n-space>
    </div>
</template>

<script setup lang="ts">
//
// FatalErrorPage.vue
//
// Fatal error page component. Displayed when the application fails to establish 
// a WebSocket connection (e.g., server unavailable or room is full), and guides 
// the user back to the homepage.
//

import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { NSpace, NIcon, NH1, NText, NButton, useThemeVars } from 'naive-ui';
import { AlertCircleOutline } from '@vicons/ionicons5';

const router = useRouter();

const themeVars = useThemeVars();
const errorColor = computed(() => themeVars.value.errorColor);

const goToHome = () => {
    router.replace({ name: 'Home' });
};
</script>

<style scoped>
.error-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.error-content {
    max-width: 400px;
    padding: 24px;
}

.error-title {
    font-size: 1.5rem;
    margin: 0;
}

.error-description {
    font-size: 14px;
}

.action-button {
    margin-top: 20px;
}
</style>
