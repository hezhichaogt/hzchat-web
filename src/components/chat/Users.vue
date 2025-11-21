<template>
    <div class="users-container">

        <div class="users-header">
            <n-icon :component="People" :color="headerIconColor" size="20" />
            <n-text depth="3" class="users-header-text">( {{ users.length }} / {{ maxUsers }} )</n-text>
        </div>

        <n-scrollbar class="user-list-scrollable">
            <n-list class="user-list" hoverable bordered>
                <n-list-item v-for="user in users" :key="user.id" class="user-list-item">
                    <div class="user-info-wrapper">
                        <UserAvatar :user="user" size="small" />
                        <n-text depth="1" class="user-nickname">
                            {{ user.nickname }}
                        </n-text>
                    </div>
                </n-list-item>
            </n-list>
        </n-scrollbar>

    </div>
</template>

<script setup lang="ts">
//
// Users.vue
//
// Desktop online user list component.
//

import { computed } from 'vue';
import { useThemeVars, NIcon, NText, NScrollbar, NList, NListItem } from 'naive-ui';
import type { User } from '@/types/user';
import { People } from '@vicons/ionicons5';
import UserAvatar from '../UserAvatar.vue';

defineProps<{
    users: User[];
    maxUsers: number;
}>();

const themeVars = useThemeVars();
const headerIconColor = computed(() => themeVars.value.textColor2);
</script>

<style scoped>
.users-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.users-header {
    display: flex;
    align-items: center;
    margin: 4px 2px;
    gap: 4px;
}

.users-header-text {
    font-size: 12px;
}

.user-list-scrollable {
    flex-grow: 1;
    min-height: 0;
}

.user-list {
    flex-grow: 1;
    overflow-y: auto;
}

.user-list-item :deep() {
    padding: 8px 12px !important;
}

.user-info-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    line-height: 1.2;
}

.user-nickname {
    font-weight: 500;
    font-size: 14px;
}
</style>
