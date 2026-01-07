<template>
    <div v-if="!isSettingsPage" class="flex items-center">
        <DropdownMenu v-if="userStore.isLoggedIn">
            <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon" class="h-9 w-9 rounded-full focus-visible:ring-0 overflow-hidden">
                    <Avatar class="h-full w-full scale-90 transition-transform active:scale-75">
                        <AvatarImage :src="userStore.profile.avatar || ''" :alt="userStore.profile.nickname" />
                        <AvatarFallback class="bg-primary/5 text-[10px] font-bold text-primary/80">
                            {{ userStore.profile.nickname?.slice(0, 2).toUpperCase() || '??' }}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" :side-offset="8"
                class="w-40 backdrop-blur-xl bg-popover/90 border-border/50 shadow-xl">
                <DropdownMenuLabel class="px-3 pt-2 pb-1 font-normal">
                    <div class="flex flex-col gap-0.5">
                        <span class="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
                            {{ getGreeting() }}
                        </span>
                        <span class="text-sm font-bold truncate text-foreground">
                            {{ userStore.profile.nickname }}
                        </span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator class="bg-border/40" />
                <DropdownMenuItem @click="router.push('/settings')" class="px-3 py-2 cursor-pointer">
                    <Settings class="h-4 w-4 opacity-70" />
                    <span class="text-sm font-medium">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator class="bg-border/40" />
                <DropdownMenuItem @click="handleLogout"
                    class="px-3 py-2 cursor-pointer text-destructive focus:text-destructive">
                    <LogOut class="h-4 w-4" />
                    <span class="text-sm font-medium">Sign out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <Button v-else variant="ghost" size="icon"
            class="h-9 w-9 rounded-full focus-visible:ring-0 text-foreground/90 hover:bg-muted"
            @click="router.push('/auth')">
            <UserCircle class="h-[1.15rem] w-[1.15rem]" />
            <span class="sr-only">Sign in</span>
        </Button>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { LogOut, Settings, UserCircle } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const isSettingsPage = computed(() => route.path === '/settings');

const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 18) return 'Good afternoon';
    if (hour >= 18 && hour < 22) return 'Good evening';

    return 'Good night';
};

const handleLogout = () => {
    userStore.logout();
    router.push('/');
};
</script>
