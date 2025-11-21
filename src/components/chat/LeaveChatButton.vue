<template>
    <n-button type="error" size="small" @click="triggerLeave" :quaternary="isQuaternary">
        <template #icon>
            <n-icon :component="LogOutOutline" />
        </template>
        Leave
    </n-button>
</template>

<script setup lang="ts">
//
// LeaveChatButton.vue
//
// Leave chat session button component. Encapsulates the button's UI and click logic 
// to trigger the parent component's 'onLeave' action.
//

import { NButton, NIcon } from 'naive-ui';
import { LogOutOutline } from '@vicons/ionicons5';

const props = defineProps<{
    onLeave: () => void;
    isQuaternary?: boolean;
}>();

const triggerLeave = () => {
    props.onLeave();
};
</script>
