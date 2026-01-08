<template>
  <div class="w-full max-w-2xl px-1 py-10 flex flex-col gap-12 mx-auto animate-in fade-in zoom-in-95">

    <div class="flex flex-col gap-6 px-2">
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.1] text-foreground">
        Zero-Record <br />
        <span class="inline-block text-primary">Messaging.</span>
        <span class="text-foreground/30 block mt-4 font-medium tracking-[0.2em] uppercase text-base sm:text-lg">
          Traceless. Start Now.
        </span>
      </h1>

      <p class="text-base sm:text-lg md:text-xl text-foreground/50 leading-relaxed font-medium">
        No registration.
        <span class="text-foreground/90">Zero storage</span>.
        <br class="hidden sm:block" />
        Open-source verification for <span class="text-foreground/90">uncompromising</span> privacy.
      </p>
    </div>

    <section v-if="!userStore.isLoggedIn" class="px-2">
      <div
        class="flex items-center justify-between h-12 px-4 rounded-xl border border-foreground/3 bg-foreground/1 dark:bg-white/3 group">
        <div class="flex items-center gap-2">
          <Fingerprint class="size-3.5 text-foreground/40" />
          <span class="text-[10px] font-black tracking-widest uppercase text-foreground/40">ID</span>
          <div class="w-px h-3 bg-foreground/20 mr-2"></div>
          <span class="text-sm font-mono font-medium tracking-tight text-foreground/70">
            {{ userStore.profile.id }}
          </span>
        </div>

        <button @click="handleResetIdentity"
          class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-300 active:scale-95 group/btn"
          title="Generate New ID">
          <Dice5
            class="size-3.5 text-foreground/50 group-hover/btn:text-primary/80 group-hover/btn:rotate-15 transition-all duration-300" />
          <span
            class="text-[10px] font-black uppercase tracking-[0.15em] text-foreground/50 group-hover/btn:text-foreground/90 transition-colors">
            New ID
          </span>
        </button>
      </div>
    </section>

    <div class="flex flex-col gap-6">
      <div class="flex flex-col sm:flex-row gap-4 px-2">
        <Button size="lg"
          class="w-full sm:flex-1 h-14 text-base font-extrabold transition-all active:scale-[0.97] shadow-md hover:shadow-primary/20 dark:shadow-primary/5 hover:cursor-pointer"
          @click="createPrivateChat" :disabled="isBusy">
          <div class="flex items-center justify-center w-full gap-2">
            <Loader2 v-if="isBusy" class="mr-3 h-5 w-5 animate-spin" />
            <MessageSquare v-else class="mr-3 h-5 w-5" />
            <span>Create Private Chat</span>
          </div>
        </Button>

        <Button variant="outline" size="lg"
          class="w-full sm:flex-1 h-14 text-base font-bold border-2 transition-all active:scale-[0.97] dark:border-white/10 dark:hover:bg-white/5 hover:cursor-pointer"
          @click="createGroupChat" :disabled="isBusy">
          <div class="flex items-center justify-center w-full gap-2">
            <Loader2 v-if="isBusy" class="mr-3 h-5 w-5 animate-spin" />
            <Users v-else class="mr-3 h-5 w-5 opacity-70" />
            <span>Create Group Chat</span>
          </div>
        </Button>
      </div>

      <div class="relative py-4 flex items-center justify-center">
        <div class="absolute inset-x-0 h-px bg-linear-to-r from-transparent via-foreground/10 to-transparent">
        </div>
        <span class="relative bg-background px-6 text-[10px] uppercase font-black tracking-[0.4em] text-foreground/30">
          OR
        </span>
      </div>

      <div class="px-2">
        <InputGroup
          class="h-14 border border-foreground/10 dark:border-white/10 dark:bg-white/3 rounded-xl overflow-hidden transition-all duration-300 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/5 shadow-sm">
          <InputGroupInput v-model="chatCodeInput" placeholder="ENTER CHAT CODE" maxlength="6"
            class="px-6 md:px-4 font-mono tracking-[0.3em] focus-visible:ring-0 border-0 placeholder:font-sans placeholder:tracking-normal placeholder:text-xs placeholder:font-bold placeholder:opacity-40 text-xl!"
            :disabled="isBusy" />

          <InputGroupAddon align="inline-end" class="pr-3">
            <InputGroupButton @click="handleJoinChat" :disabled="isBusy || chatCodeInput.length < 6" variant="secondary"
              size="sm" class="hover:cursor-pointer transition-fluid font-bold px-5 rounded-lg">
              <Loader2 v-if="isBusy" class="size-5 animate-spin" />
              <template v-else>
                <div class="flex justify-center items-center gap-1">
                  <span class="text-sm tracking-wide">JOIN</span>
                  <ChevronRight class="size-4 opacity-70" />
                </div>
              </template>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useHead } from '@unhead/vue';
import { toast } from 'vue-sonner';

import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton
} from '@/components/ui/input-group';

import {
  Loader2,
  Users,
  MessageSquare,
  ChevronRight,
  Fingerprint,
  Dice5
} from 'lucide-vue-next';

import { useUserStore } from '@/stores/user';
import { createChat, joinChat } from '@/services/chat';
import type { ChatType } from '@/types/chat';

useHead({
  meta: [
    {
      name: 'description',
      content: 'Traceless, instant messaging without the footprint. Create temporary rooms for private chats in seconds. No signup, no storage, no burden. HZ Chat: Say it, then it\'s gone.',
    }
  ],
});

const router = useRouter();
const userStore = useUserStore();

const isBusy = ref(false);
const chatCodeInput = ref('');

const handleResetIdentity = () => {
  try {
    userStore.refreshIdentity()
  } catch (error) {
    toast.error('Could not generate a new ID')
  }
}

const handleCreateChat = async (type: ChatType) => {
  if (isBusy.value) return;
  isBusy.value = true;

  try {
    const { chatCode } = await createChat(type);
    router.push(`/chat/${chatCode}`);
  } catch (error: any) {
    console.error(error.message)
    toast.error('Could not create the chat. Please try again.')
  } finally {
    isBusy.value = false;
  }
};

const createPrivateChat = () => handleCreateChat('private');
const createGroupChat = () => handleCreateChat('group');

const handleJoinChat = async () => {
  const trimmedCode = chatCodeInput.value.trim();
  const REQUIRED_LENGTH = 6;

  if (!trimmedCode) {
    toast.warning('Please enter a chat code.');
    return;
  }

  if (trimmedCode.length !== REQUIRED_LENGTH) {
    toast.error(`Please enter a valid ${REQUIRED_LENGTH}-character chat code.`);
    return;
  }

  if (isBusy.value) return;
  isBusy.value = true;

  try {
    const { token } = await joinChat(trimmedCode);
    if (!token) throw new Error('No access token received.');

    router.push({
      path: `/chat/${trimmedCode}`,
      state: { token }
    });
  } catch (error: any) {
    console.error(error.message)
    toast.error('Failed to join chat. Please check the code and try again.');
  } finally {
    isBusy.value = false;
  }
};
</script>
