<template>
    <div class="mobile-users-container">
        <div class="mobile-users-header trigger" @click="showDrawer = true">
            <n-icon :component="People" :color="headerIconColor" size="20" />
            <n-text depth="3" class="mobile-users-header-text">( {{ users.length }} / {{ maxUsers }} )</n-text>
        </div>

        <n-drawer v-model:show="showDrawer" :width="250" placement="right">
            <n-drawer-content title="Online Users" closable>
                <n-scrollbar class="mobile-user-list-scrollable">
                    <n-list class="mobile-user-list" hoverable bordered>
                        <n-list-item v-for="user in users" :key="user.id" class="mobile-user-list-item">
                            <div class="mobile-user-info-wrapper">
                                <UserAvatar :user="user" size="small" />
                                <n-text depth="1" class="mobile-user-nickname">
                                    {{ user.nickname }}
                                </n-text>
                            </div>
                        </n-list-item>
                    </n-list>
                </n-scrollbar>
            </n-drawer-content>
        </n-drawer>
    </div>
</template>

<script setup lang="ts">
//
// MobileUsers.vue
//
// Mobile online user list component.
//

import { ref, computed } from 'vue';
import { useThemeVars, NDrawer, NDrawerContent, NScrollbar, NList, NListItem, NIcon, NText } from 'naive-ui';
import { People } from '@vicons/ionicons5';
import type { User } from '@/types/user';
import UserAvatar from '../UserAvatar.vue';

defineProps<{
    users: User[];
    maxUsers: number;
}>();

const showDrawer = ref(false);

const themeVars = useThemeVars();
const headerIconColor = computed(() => themeVars.value.textColor2);
</script>

<style scoped>
.mobile-users-container {
    width: auto;
}

.mobile-users-header {
    display: flex;
    align-items: center;
    margin: 0;
    gap: 4px;
}

.trigger {
    cursor: pointer;
    padding: 4px 6px;
    border-radius: 6px;
    transition: background-color 0.2s;
}

.trigger:hover {
    background-color: var(--n-close-color-hover);
}

.mobile-users-header-text {
    font-size: 14px;
}

.mobile-user-list-scrollable {
    height: 100%;
}

.mobile-user-list {
    padding: 0;
}

.mobile-user-list-item :deep() {
    padding: 8px 12px !important;
}

.mobile-user-info-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    line-height: 1.2;
}

.mobile-user-nickname {
    font-weight: 500;
    font-size: 14px;
}
</style>
