<template>
    <div class="system-message-wrapper">
        <n-tag :bordered="false" size="small" round :type="tagType">
            {{ props.message.content }}
        </n-tag>
    </div>
</template>

<script setup lang="ts">
//
// SystemMessageRow.vue
//
// System message row component. Renders system notifications or status information 
// within the chat stream (e.g., user join/leave, connection errors).
//

import { computed, type PropType } from 'vue';
import { NTag } from 'naive-ui';
import type { SystemMessage } from '@/types/chat';

const props = defineProps({
    message: {
        type: Object as PropType<SystemMessage>,
        required: true,
    },
});

const tagType = computed(() => {
    switch (props.message.style) {
        case 'error':
            return 'error';
        default:
            return 'default';
    }
});
</script>

<style scoped>
.system-message-wrapper {
    display: flex;
    justify-content: center;
    margin: 4px 0;
}
</style>
