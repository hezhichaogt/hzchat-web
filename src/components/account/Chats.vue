<template>
    <div class="w-full">
        <div class="flex justify-end">
            <Button @click="handleCreate" size="sm" class="gap-2">
                <Plus class="size-4" />
                New Chat
            </Button>
        </div>

        <div v-if="isLoading" class="flex flex-col items-center justify-center py-24 text-center">
            <div class="size-8 border-2 border-zinc-200 border-t-zinc-500 rounded-full animate-spin mb-4"></div>
            <p class="text-sm text-zinc-500 animate-pulse">Loading chats...</p>
        </div>

        <div v-else-if="chats.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
            <Inbox class="size-10 text-zinc-200 dark:text-zinc-800 mb-4" />
            <p class="text-sm text-zinc-500 dark:text-zinc-400">
                No chats yet. Start a new one anytime.
            </p>
        </div>

        <div v-else>
            <div v-for="chat in chats" :key="chat.id"
                class="group px-5 pt-4 pb-1 rounded-2xl mt-4 border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col justify-between transition-all shadow-sm">
                <div class="flex items-center justify-between gap-6 mb-4">
                    <h3 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1 break-all"
                        :title="chat.name">
                        {{ chat.name }}
                    </h3>
                    <div class="flex items-center gap-3 shrink-0">
                        <span v-if="chat.hasPassword" title="Password required" class="flex items-center">
                            <LockIcon class="size-4 text-amber-500 dark:text-amber-400 fill-amber-500/10" />
                        </span>

                        <span v-if="chat.requireAuth" title="Login required" class="flex items-center">
                            <UserCheckIcon class="size-4 text-blue-500 dark:text-blue-400 fill-blue-500/10" />
                        </span>
                    </div>
                </div>

                <div class="flex items-center justify-end gap-3 border-t border-zinc-50 dark:border-zinc-800/30 pt-1">
                    <Button variant="ghost" size="sm" @click="handleJoin(chat.code)"
                        class="font-bold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
                        <LogIn class="size-3.5 mr-0.5" />
                        Join
                    </Button>

                    <ChatShareActions :code="chat.code" :show-text="true" />

                    <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal class="size-4 text-muted-foreground hover:text-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" class="w-32 rounded-xl bg-white dark:bg-zinc-800">
                            <DropdownMenuItem @click="handleEdit(chat)"
                                class="cursor-pointer font-bold py-2.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
                                <Settings2Icon class="size-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem @click="handleDelete(chat)"
                                class="text-red-500 focus:text-red-500 py-2.5 cursor-pointer font-bold text-xs uppercase tracking-wider">
                                <Trash2Icon class="size-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>

        <ChatSettingsDialog ref="settingsDialogRef" :initial-data="selectedChat" @success="handleSuccess" />

        <AlertDialog v-model:open="showDeleteConfirm">
            <AlertDialogContent class="rounded-2xl border-zinc-100 dark:border-zinc-800">
                <AlertDialogHeader>
                    <AlertDialogTitle class="text-lg font-bold">Delete this chat?</AlertDialogTitle>
                    <AlertDialogDescription class="text-sm text-zinc-500">
                        This will permanently delete the chat. All settings will be removed, and anyone
                        currently in the room will be disconnected within one minute. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter class="mt-4 gap-2">
                    <AlertDialogCancel @click="chatToDelete = null"
                        class="rounded-xl border-none bg-zinc-100 dark:bg-zinc-800 font-bold text-xs uppercase tracking-wider hover:bg-zinc-200">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction @click="confirmDelete" :disabled="isDeleting"
                        class="rounded-xl bg-red-500 font-bold text-xs uppercase tracking-wider text-white hover:bg-red-600 disabled:opacity-50">
                        {{ isDeleting ? 'Deleting...' : 'Delete Chat' }}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import { Plus, Inbox, LockIcon, UserCheckIcon, Settings2Icon, Trash2Icon, LogIn, MoreHorizontal } from 'lucide-vue-next'
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent, DropdownMenuSeparator } from '../ui/dropdown-menu';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import type { PersistentChat } from '@/types/chat'
import ChatSettingsDialog from './ChatSettingsDialog.vue';
import { getPersistentChats, deletePersistentChat } from '@/services/chat';
import { toast } from 'vue-sonner';
import ChatShareActions from '../chat/ChatShareActions.vue';

const router = useRouter();

const settingsDialogRef = ref<InstanceType<typeof ChatSettingsDialog> | null>(null)
const chats = ref<PersistentChat[]>([])
const selectedChat = ref<PersistentChat | null>(null)
const isLoading = ref(true)

const showDeleteConfirm = ref(false)
const chatToDelete = ref<PersistentChat | null>(null)
const isDeleting = ref(false)

const handleCreate = () => {
    selectedChat.value = null
    settingsDialogRef.value?.open()
}

const handleEdit = (chat: PersistentChat) => {
    selectedChat.value = chat
    settingsDialogRef.value?.open()
}

const handleJoin = (code: string) => {
    router.push(`/${code}`);
};

const handleSuccess = (updatedChat: PersistentChat) => {
    const index = chats.value.findIndex(c => c.id === updatedChat.id);

    if (index !== -1) {
        chats.value[index] = updatedChat;
    } else {
        chats.value.unshift(updatedChat);
    }
};

const handleDelete = (chat: PersistentChat) => {
    chatToDelete.value = chat
    showDeleteConfirm.value = true
}

const confirmDelete = async () => {
    if (!chatToDelete.value) return;

    isDeleting.value = true;
    const targetId = chatToDelete.value.id;

    try {
        await deletePersistentChat(targetId);
        chats.value = chats.value.filter(c => c.id !== targetId);
        toast.success('Chat deleted');
        showDeleteConfirm.value = false;
        setTimeout(() => {
            chatToDelete.value = null;
        }, 300);
    } catch (error: any) {
        console.error('Failed to delete chat:', error);
        toast.error(
            error?.message || 'Unable to delete chat. Please try again.'
        );
    } finally {
        isDeleting.value = false;
    }
}

const fetchChats = async () => {
    isLoading.value = true

    try {
        const response = await getPersistentChats();
        chats.value = response.chats;
    } catch (error: any) {
        console.error('Failed to fetch chats:', error);
        toast.error(error.message || 'Failed to load chats. Please try again later.');
    } finally {
        isLoading.value = false
    }
}

onMounted(fetchChats)
</script>