<template>
    <header class="w-full h-14 shrink-0 px-4 flex items-center justify-between z-20 
         sticky top-0
         bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl
         border-b border-zinc-200/30 dark:border-zinc-800/30">

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
                    <TooltipContent side="bottom" class="text-xs">
                        <p><span class="font-bold">{{ statusText }}</span>: {{ statusDetail }}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <button @click="copyToClipboard(code || '', 'Code copied')"
                class="px-1 py-1 rounded md:px-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-95 group">
                <span
                    class="text-sm font-mono font-bold tracking-tight text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    {{ code || 'LOADING' }}
                    <Copy class="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
            </button>
        </div>

        <div class="flex items-center gap-1 sm:gap-2">

            <Popover>
                <PopoverTrigger as-child>
                    <Button variant="ghost" size="sm"
                        class="h-9 px-3 gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-all active:scale-95 group">
                        <Users
                            class="h-4 w-4 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                        <span class="text-xs font-bold tabular-nums text-zinc-600 dark:text-zinc-400">
                            {{ users.length }}<span class="text-zinc-400/50 mx-0.5">/</span>{{ maxUsers }}
                        </span>
                    </Button>
                </PopoverTrigger>

                <PopoverContent align="center" :side-offset="8"
                    class="w-72 md:w-md p-0 shadow-2xl border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 backdrop-blur-xl overflow-hidden rounded-2xl flex flex-col">
                    <div class="p-4 pb-2 shrink-0">
                        <h4 class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                            Online Users ({{ users.length }})
                        </h4>
                    </div>

                    <ScrollArea class="max-h-75 md:max-h-112 flex-1 overflow-y-auto">
                        <div class="grid grid-cols-4 md:grid-cols-6 gap-y-6 gap-x-2.5 px-4 pt-2 pb-6">
                            <div v-for="user in users" :key="user.id" :title="user.nickname"
                                class="flex flex-col items-center gap-2 group cursor-default">
                                <Avatar
                                    class="h-10 w-10 md:h-12 md:w-12 rounded-full ring-offset-2 ring-transparent group-hover:ring-zinc-200 transition-all duration-200">
                                    <AvatarImage :src="user.avatar" />
                                    <AvatarFallback>{{ user.nickname?.slice(0, 2).toUpperCase() || '??' }}
                                    </AvatarFallback>
                                </Avatar>
                                <span class="text-[10px] font-medium text-zinc-500 text-center truncate w-full px-1">
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
                        class="h-9 px-3 gap-1.5 rounded text-zinc-600 hover:text-zinc-900 transition-colors">
                        <Share2 class="h-4 w-4" />
                        <span class="hidden sm:inline font-medium text-xs">Share</span>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" :side-offset="8"
                    class="w-56 p-1.5 shadow-xl border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 backdrop-blur-xl rounded-lg">
                    <DropdownMenuLabel
                        class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2.5 py-2">
                        Share Options
                    </DropdownMenuLabel>

                    <DropdownMenuItem @click="copyToClipboard(fullUrl, 'Full link copied')"
                        class="gap-2.5 px-2.5 py-3 cursor-pointer rounded-md transition-colors focus:bg-zinc-100 dark:focus:bg-zinc-900">
                        <Link2 class="h-4 w-4 text-zinc-400" />
                        <span class="text-sm font-medium">Copy Full Link</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem @click="showQrModal = true"
                        class="gap-2.5 px-2.5 py-3 cursor-pointer rounded-md transition-colors focus:bg-zinc-100 dark:focus:bg-zinc-900">
                        <QrCode class="h-4 w-4 text-zinc-400" />
                        <span class="text-sm font-medium">Generate QR Code</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <div class="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

            <AlertDialog>
                <AlertDialogTrigger as-child>
                    <Button variant="ghost" size="sm"
                        class="h-9 px-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-all active:scale-95 gap-1.5 group">
                        <LogOut class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        <span class="hidden sm:inline font-bold text-xs">Leave</span>
                    </Button>
                </AlertDialogTrigger>

                <AlertDialogContent class="max-w-80 rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Leave chat?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You'll be disconnected, but you can rejoin later using the chat code.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter class="gap-2 sm:gap-4">
                        <AlertDialogCancel class="rounded-full font-medium hover:cursor-pointer">Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction @click="$emit('leave')"
                            class="bg-red-500 hover:bg-red-600 text-white rounded-full font-bold shadow-lg shadow-red-200 dark:shadow-none hover:cursor-pointer">
                            Leave Chat
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>

        <Dialog v-model:open="showQrModal">
            <DialogContent class="sm:max-w-90 p-0 overflow-hidden border-none bg-white dark:bg-zinc-950 shadow-2xl">
                <DialogHeader class="p-6 pb-0">
                    <DialogTitle class="text-center flex flex-col items-center gap-2">
                        <div class="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full">
                            <QrCode class="w-5 h-5" />
                        </div>
                        <span>Scan to Join Chat</span>
                    </DialogTitle>
                    <DialogDescription class="text-center text-xs text-zinc-500">
                        Scan this code to join the chat with code <span
                            class="font-mono font-bold text-zinc-900 dark:text-zinc-100">{{ props.code }}</span>
                    </DialogDescription>
                </DialogHeader>

                <div class="flex flex-col items-center justify-center p-8 gap-8">
                    <div id="qr-container"
                        class="p-4 bg-white rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.05)] border border-zinc-100">
                        <QrcodeCanvas :value="fullUrl" :size="200" level="H" background="#ffffff"
                            foreground="#18181b" />
                    </div>

                    <Button @click="downloadQr"
                        class="w-full gap-2 rounded-full h-12 font-bold shadow-lg shadow-zinc-200 dark:shadow-none hover:cursor-pointer">
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
}>();

const emit = defineEmits(['leave']);


const showQrModal = ref(false);
const BASE_URL = import.meta.env.VITE_BASE_URL || window.location.origin;

const fullUrl = computed(() => `${BASE_URL}/chat/${props.code}`);

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
