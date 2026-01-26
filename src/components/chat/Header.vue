<template>
    <header class="w-full h-14 shrink-0 px-4 flex items-center justify-between
         bg-background/80 backdrop-blur-xl
         border-b border-border/40">

        <div class="flex items-center min-w-0 flex-1">
            <TooltipProvider>
                <Tooltip :delay-duration="150">
                    <TooltipTrigger as-child>
                        <div class="p-2 cursor-help group">
                            <div :class="[
                                'w-2 h-2 rounded-full transition-transform group-hover:scale-110',
                                statusColorClass,
                                connectStatus === 'CONNECTED' && 'animate-pulse'
                            ]"></div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" class="shadow-xl z-50">
                        <p><span class="font-bold">{{ statusText }}</span>: {{ statusDetail }}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <button @click="copyToClipboard(chat?.code || '', 'Code copied')"
                class="flex items-center min-w-0 px-2 py-1 rounded hover:bg-muted/80 transition-colors active:scale-95 group"
                :title="chatName">
                <span class="text-sm font-bold tracking-tight text-foreground truncate select-none">
                    {{ chatName }}
                </span>
            </button>
        </div>

        <div class="flex items-center gap-1 sm:gap-2">
            <Popover>
                <PopoverTrigger as-child>
                    <Button variant="ghost" size="sm" title="Online Users"
                        class="h-9 px-3 gap-1.5 hover:bg-muted/80 rounded transition-all active:scale-95 group">
                        <Users class="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span class="text-xs font-bold tabular-nums text-foreground/80">
                            {{ users.length }}<span class="text-muted-foreground/30 mx-0.5">/</span>{{ maxUsers }}
                        </span>
                    </Button>
                </PopoverTrigger>

                <PopoverContent align="center" :side-offset="8"
                    class="w-72 md:w-md p-0 shadow-xl bg-background overflow-hidden flex flex-col z-50">
                    <div class="p-4 pb-2 shrink-0 bg-background">
                        <h4 class="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">
                            Online Users ({{ users.length }})
                        </h4>
                    </div>

                    <ScrollArea class="max-h-75 md:max-h-112 flex-1 overflow-y-auto bg-background">
                        <div class="grid grid-cols-4 md:grid-cols-6 gap-y-6 gap-x-2.5 px-4 pt-2 pb-6">
                            <div v-for="user in users" :key="user.id" :title="user.nickname"
                                class="flex flex-col items-center gap-2 group cursor-default">
                                <Avatar
                                    class="h-10 w-10 md:h-12 md:w-12 rounded-full ring-offset-background ring-2 ring-transparent group-hover:ring-border transition-all duration-200">
                                    <AvatarImage :src="user.avatar" />
                                    <AvatarFallback class="bg-muted text-muted-foreground text-xs">{{
                                        user.nickname?.slice(0, 2).toUpperCase() || '??' }}
                                    </AvatarFallback>
                                </Avatar>
                                <span
                                    class="text-[10px] font-medium text-muted-foreground text-center truncate w-full px-1">
                                    {{ user.nickname }}
                                </span>
                            </div>
                        </div>
                    </ScrollArea>
                </PopoverContent>
            </Popover>

            <ChatShareActions :code="props.chat?.code || ''" align="end" />

            <ThemeToggle />

            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" title="More" class="transition-all active:scale-95">
                        <MoreVertical class="size-4 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-36 shadow-xl z-50 bg-white dark:bg-zinc-950">
                    <DropdownMenuItem v-if="showChatSettings" @click="handleOpenSettings"
                        class="cursor-pointer py-3 mb-0.5">
                        <Settings2 class="mr-0.5 size-4" />
                        <span class="text-xs font-semibold">Chat Settings</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem @select="handleLeaveClick"
                        class="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10 py-3">
                        <LogOut class="mr-0.5 size-4" />
                        <span class="text-xs font-semibold">Leave Chat</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        <AlertDialog :open="isLeaveDialogOpen" @update:open="(val) => {
            isLeaveDialogOpen = val;
            resetTerminateStatus(val);
        }">
            <AlertDialogContent class="max-w-96 rounded-2xl border-border bg-background shadow-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle class="text-foreground text-xl">Leave this chat?</AlertDialogTitle>
                    <AlertDialogDescription class="text-muted-foreground/90 text-sm leading-relaxed">
                        <template v-if="isCreator">
                            You're the creator of this chat.
                            If you leave now, the chat will stay open and others can continue chatting.
                        </template>
                        <template v-else>
                            You'll leave the chat and disconnect from the room.
                            You can rejoin later using the chat code:
                            <span class="font-mono font-bold text-foreground">{{ props.chat?.code }}</span>.
                        </template>
                        <div v-if="isCreator" class="mt-4 pt-4 border-t border-border/40">
                            <label
                                class="flex items-center gap-3 p-3 rounded-xl border border-transparent bg-muted/30 hover:bg-muted/50 cursor-pointer transition-all group">
                                <div class="relative flex items-center justify-center">
                                    <input type="checkbox" :checked="isTerminating"
                                        @change="isTerminating = ($event.target as HTMLInputElement).checked"
                                        class="peer appearance-none w-5 h-5 rounded-md border-2 border-muted-foreground/30 checked:bg-red-600 checked:border-red-600 transition-all cursor-pointer" />
                                    <svg class="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" stroke-width="4" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <div class="flex flex-col">
                                    <span
                                        class="text-xs font-bold text-foreground group-hover:text-red-500 transition-colors select-none">
                                        End this chat for everyone
                                    </span>
                                    <span class="text-[10px] text-muted-foreground select-none">Everyone will be
                                        notified. The chat will close
                                        in 1 minute.</span>
                                </div>
                            </label>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter class="flex flex-col sm:flex-row gap-2 mt-4 w-full">
                    <AlertDialogCancel class="border-none hover:bg-muted order-2 sm:order-1 font-medium">
                        Stay here
                    </AlertDialogCancel>

                    <AlertDialogAction @click="$emit(LeaveChatButtonConfig.emit)"
                        :class="['px-8 font-bold transition-all duration-300 order-1 sm:order-2', LeaveChatButtonConfig.class]">
                        {{ LeaveChatButtonConfig.text }}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <ChatSettingsDialog ref="settingsDialogRef" :initial-data="currentChat" @success="handleChatSettingUpdate" />
    </header>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue';
import { useUserStore } from '@/stores/user';
import { toast } from 'vue-sonner';

import {
    LogOut, Users, Settings2, MoreVertical
} from 'lucide-vue-next';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import ChatShareActions from './ChatShareActions.vue';
import ChatSettingsDialog from '../account/ChatSettingsDialog.vue';
import ThemeToggle from '../ThemeToggle.vue';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent, DropdownMenuSeparator } from '../ui/dropdown-menu';

import type { ConnectionStatus, PersistentChat } from '@/types/chat';
import type { UserBase } from '@/types/user';

const props = defineProps<{
    chat: PersistentChat | null;
    connectStatus: ConnectionStatus;
    users: UserBase[];
    maxUsers: number;
    isCreator: boolean;
}>();

const emit = defineEmits(['leave', 'terminate', 'update-chat']);

const userStore = useUserStore();
const showChatSettings = computed(() => props.isCreator && userStore.isPro);

const chatName = computed(() => props.chat?.name || props.chat?.code || 'LOADING');
const currentChat = ref<PersistentChat | null>(null);

const settingsDialogRef = ref<InstanceType<typeof ChatSettingsDialog> | null>(null);

const handleOpenSettings = async () => {
    currentChat.value = { ...props.chat } as PersistentChat;
    await nextTick();
    settingsDialogRef.value?.open();
};

const handleChatSettingUpdate = (newChatInfo: PersistentChat) => {
    emit('update-chat', newChatInfo);
};

type LeaveAction = 'leave' | 'terminate';

const isLeaveDialogOpen = ref(false)
const isTerminating = ref(false);

const LeaveChatButtonConfig = computed<{ text: string, class: string, emit: LeaveAction }>(() => {
    if (isTerminating.value) {
        return {
            text: 'End Chat',
            class: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20',
            emit: 'terminate'
        };
    }
    return {
        text: 'Leave Chat',
        class: 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900',
        emit: 'leave'
    };
});

const handleLeaveClick = () => {
    isLeaveDialogOpen.value = true
}

const resetTerminateStatus = (open: boolean) => {
    if (!open) {
        setTimeout(() => {
            isTerminating.value = false;
        }, 200);
    }
};

const statusColorClass = computed(() => {
    switch (props.connectStatus) {
        case 'CONNECTED': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
        case 'RECONNECT_DELAY': return 'bg-amber-500';
        case 'FINAL_DISCONNECT': return 'bg-red-500';
        default: return 'bg-zinc-400';
    }
});

const statusText = computed(() => {
    switch (props.connectStatus) {
        case 'CONNECTED': return 'Connected';
        case 'RECONNECT_DELAY': return 'Reconnecting';
        case 'FINAL_DISCONNECT': return 'Disconnected';
        default: return 'Connecting';
    }
});

const statusDetail = computed(() => {
    switch (props.connectStatus) {
        case 'CONNECTED':
            return 'You can chat freely.';
        case 'RECONNECT_DELAY':
            return 'The connection was lost. Retrying…';
        case 'FINAL_DISCONNECT':
            return 'Could not reconnect. Please refresh to try again.';
        default:
            return 'Establishing connection…';
    }
});

const copyToClipboard = async (text: string, successMsg: string) => {
    try {
        await navigator.clipboard.writeText(text);
        toast.success(successMsg, { duration: 2000 });
    } catch (err) {
        toast.error('Couldn\'t copy. Please copy manually.');
    }
};
</script>
