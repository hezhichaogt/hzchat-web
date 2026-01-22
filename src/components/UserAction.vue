<template>
    <div v-if="!isSettingsPage" class="flex items-center">
        <DropdownMenu v-if="userStore.isLoggedIn">
            <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon" :class="cn(
                    'h-9 w-9 rounded-full focus-visible:ring-0 overflow-hidden transition-fluid',
                    'hover:bg-accent dark:hover:bg-white/10'
                )">
                    <Avatar class="h-full w-full scale-90 transition-transform active:scale-75">
                        <AvatarImage :src="userStore.profile.avatar || ''" :alt="userStore.profile.nickname" />
                        <AvatarFallback class="bg-primary/5 text-[10px] font-bold text-primary/80">
                            {{ userStore.profile.nickname?.slice(0, 2).toUpperCase() || '??' }}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" :side-offset="8" :class="cn(
                'w-48 backdrop-blur-xl bg-popover/90 shadow-xl transition-fluid',
                'border border-border/60 dark:border-white/10 dark:shadow-[0_0_25px_rgba(0,0,0,0.6)]'
            )">
                <DropdownMenuLabel class="px-3 pt-3 pb-2 font-normal">
                    <div class="flex flex-col gap-0.5">
                        <span class="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-bold">
                            {{ getGreeting() }}
                        </span>
                        <span class="text-sm font-black truncate text-foreground">
                            {{ userStore.profile.nickname }}
                        </span>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator class="bg-border/40 dark:bg-white/5" />

                <DropdownMenuItem @click="router.push('/account')" :class="cn(
                    'flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors',
                    'focus:bg-accent dark:focus:bg-white/10'
                )">
                    <Settings class="h-4 w-4 opacity-70" />
                    <span class="text-sm font-medium">Account</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator class="bg-border/40 dark:bg-white/5" />

                <DropdownMenuItem @click="handleLogout" :class="cn(
                    'flex items-center gap-2.5 px-3 py-2.5 cursor-pointer text-destructive transition-colors',
                    'focus:bg-destructive/10 focus:text-destructive dark:focus:bg-destructive/20'
                )">
                    <LogOut class="h-4 w-4" />
                    <span class="text-sm font-medium">Sign out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <Button v-else variant="ghost" size="icon" :class="cn(
            'h-9 w-9 rounded-full focus-visible:ring-0 text-foreground/90 transition-fluid',
            'hover:bg-accent dark:hover:bg-white/10'
        )" @click="router.push('/auth')">
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
import { cn } from '@/lib/utils'
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
