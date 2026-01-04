<template>
    <div class="flex items-center gap-4">
        <DropdownMenu v-if="userStore.isLoggedIn">
            <DropdownMenuTrigger as-child>
                <button
                    class="flex items-center gap-2 outline-none hover:opacity-80 transition-opacity hover:cursor-pointer">
                    <Avatar class="h-10 w-10 border">
                        <AvatarImage :src="userStore.profile.avatar || ''" :alt="userStore.profile.nickname" />
                        <AvatarFallback class="bg-primary/10 text-xs text-primary">
                            {{ userStore.profile.nickname?.slice(0, 2).toUpperCase() || '??' }}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end"
                class="w-24 mt-2 z-100 bg-white dark:bg-zinc-950 opacity-100 shadow-xl border border-border">
                <DropdownMenuLabel class="font-normal p-2">
                    <div class="flex flex-col gap-1">
                        <p class="text-xs text-muted-foreground leading-none">
                            {{ getGreeting() }},
                        </p>
                        <p class="text-sm font-semibold leading-none truncate w-full"
                            :title="userStore.profile.nickname">
                            {{ userStore.profile.nickname }}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="router.push('/settings')">
                    <Settings class="mr-0.5 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="handleLogout" class="text-destructive focus:text-destructive">
                    <LogOut class="mr-0.5 h-4 w-4" />
                    <span>Sign out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <Button v-else variant="ghost" size="lg"
            class="h-9 px-4 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            @click="router.push('/auth')">
            <UserCircle class="mr-1 size-5" />
            <span class="font-medium">Sign in</span>
        </Button>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
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
const userStore = useUserStore();

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
