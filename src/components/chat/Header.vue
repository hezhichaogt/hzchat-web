<template>
    <header class="w-full h-14 shrink-0 px-4 flex items-center justify-between
         bg-background/80 backdrop-blur-xl
         border-b border-border/40">

        <div class="flex items-center">
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

            <button @click="copyToClipboard(code || '', 'Code copied')"
                class="px-1 py-1 rounded md:px-2 hover:bg-muted/80 transition-colors active:scale-95 group">
                <span class="text-sm font-mono font-bold tracking-tight text-foreground flex items-center gap-1.5">
                    {{ code || 'LOADING' }}
                    <Copy class="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
            </button>
        </div>

        <div class="flex items-center gap-1 sm:gap-2">
            <Popover>
                <PopoverTrigger as-child>
                    <Button variant="ghost" size="sm"
                        class="h-9 px-3 gap-1.5 hover:bg-muted/80 rounded transition-all active:scale-95 group">
                        <Users class="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span class="text-xs font-bold tabular-nums text-foreground/80">
                            {{ users.length }}<span class="text-muted-foreground/30 mx-0.5">/</span>{{ maxUsers }}
                        </span>
                    </Button>
                </PopoverTrigger>

                <PopoverContent align="center" :side-offset="8"
                    class="w-72 md:w-md p-0 shadow-2xl border border-border bg-background overflow-hidden rounded-2xl flex flex-col z-50">
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

            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="sm"
                        class="h-9 px-3 gap-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
                        <Share2 class="h-4 w-4" />
                        <span class="hidden sm:inline font-bold text-xs uppercase tracking-wider">Share</span>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" :side-offset="8"
                    class="w-56 p-1.5 shadow-2xl border border-border bg-background rounded-xl z-50">
                    <DropdownMenuLabel
                        class="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2.5 py-2">
                        Share Options
                    </DropdownMenuLabel>

                    <DropdownMenuItem @click="copyToClipboard(fullUrl, 'Full link copied')"
                        class="gap-2.5 px-2.5 py-3 cursor-pointer rounded-lg transition-colors focus:bg-muted focus:text-foreground">
                        <Link2 class="h-4 w-4 text-muted-foreground" />
                        <span class="text-sm font-medium">Copy Full Link</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem @click="showQrModal = true"
                        class="gap-2.5 px-2.5 py-3 cursor-pointer rounded-lg transition-colors focus:bg-muted focus:text-foreground">
                        <QrCode class="h-4 w-4 text-muted-foreground" />
                        <span class="text-sm font-medium">Generate QR Code</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <div class="w-px h-4 bg-border/50 mx-1"></div>

            <AlertDialog @update:open="resetTerminateStatus">
                <AlertDialogTrigger as-child>
                    <Button variant="ghost" size="sm" class="h-9 px-3 text-destructive rounded transition-all active:scale-95 gap-1.5 group
                   hover:bg-destructive hover:text-white dark:hover:bg-red-600 dark:hover:text-white">
                        <LogOut class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        <span class="hidden sm:inline font-bold text-xs uppercase tracking-widest">Leave</span>
                    </Button>
                </AlertDialogTrigger>

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
                                <span class="font-mono font-bold text-foreground">{{ props.code }}</span>.
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
                        <AlertDialogCancel
                            class="border-none hover:bg-muted order-2 sm:order-1 font-medium rounded-2xl">
                            Stay here
                        </AlertDialogCancel>

                        <AlertDialogAction @click="$emit(LeaveChatButtonConfig.emit)"
                            :class="['rounded-2xl px-8 font-bold transition-all duration-300 order-1 sm:order-2', LeaveChatButtonConfig.class]">
                            {{ LeaveChatButtonConfig.text }}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>

        <Dialog v-model:open="showQrModal">
            <DialogContent class="sm:max-w-90 p-0 overflow-hidden border-border bg-background shadow-2xl">
                <DialogHeader class="p-6 pb-0">
                    <DialogTitle class="text-center flex flex-col items-center gap-2 text-foreground">
                        <div class="p-2 bg-muted rounded-full text-foreground">
                            <QrCode class="w-5 h-5" />
                        </div>
                        <span>Scan to Join Chat</span>
                    </DialogTitle>
                    <DialogDescription class="text-center text-xs text-muted-foreground">
                        Scan this code to join the chat with code <span class="font-mono font-bold text-foreground">{{
                            props.code }}</span>
                    </DialogDescription>
                </DialogHeader>

                <div class="flex flex-col items-center justify-center p-8 gap-8">
                    <div id="qr-container" class="p-4 bg-white rounded-2xl border border-border/10">
                        <QrcodeCanvas :value="fullUrl" :size="200" level="H" background="#ffffff"
                            foreground="#18181b" />
                    </div>

                    <Button @click="downloadQr"
                        class="w-full gap-2 rounded-xl h-12 bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-md">
                        <Download class="h-4 w-4" />
                        Save QR Code
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { QrcodeCanvas } from 'qrcode.vue';
import { toast } from 'vue-sonner';

import {
    Copy, Download, Link2, LogOut,
    QrCode, Share2, Users
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

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import type { ConnectionStatus } from '@/types/chat';
import type { UserBase } from '@/types/user';

const props = defineProps<{
    code: string | null;
    connectStatus: ConnectionStatus;
    users: UserBase[];
    maxUsers: number;
    isCreator: boolean;
}>();

const emit = defineEmits(['leave', 'terminate']);

type LeaveAction = 'leave' | 'terminate';

const showQrModal = ref(false);
const isTerminating = ref(false);
const BASE_URL = import.meta.env.VITE_BASE_URL || window.location.origin;

const fullUrl = computed(() => `${BASE_URL}/chat/${props.code}`);

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

const downloadQr = () => {
    const container = document.getElementById('qr-container');
    const canvas = container?.querySelector('canvas');

    if (canvas) {
        const imageURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');

        link.href = imageURL;
        link.download = `hz-chat-${props.code}-qr.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('QR Code saved');
    } else {
        toast.error('Couldn\'t save QR Code. Please try again.');
    }
};
</script>
