<template>
  <div
    class="flex-1 flex flex-col justify-center w-full max-w-2xl mx-auto py-10 lg:pb-32 animate-in fade-in zoom-in-95">

    <div class="flex flex-col gap-6 px-2 mb-16 sm:mb-20">
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.05] text-foreground">
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

    <section v-if="!userStore.isLoggedIn" class="px-2 mb-8 sm:mb-12">
      <div
        class="flex items-center justify-between h-14 px-5 rounded-3xl border border-foreground/5 bg-foreground/2 dark:bg-white/2 backdrop-blur-sm group">
        <div class="flex items-center gap-2">
          <Fingerprint class="size-3.5 text-foreground/40" />
          <span class="text-[10px] font-black tracking-widest uppercase text-foreground/40">ID</span>
          <div class="w-px h-3 bg-foreground/20 mr-2"></div>
          <span class="text-sm font-mono font-medium tracking-tight text-foreground/70">
            {{ userStore.profile.id }}
          </span>
        </div>
      </div>
    </section>

    <div class="flex flex-col gap-8">
      <div class="px-2">
        <Button size="lg"
          class="w-full h-16 text-lg font-black transition-fluid rounded-3xl active:scale-[0.98] shadow-xl hover:shadow-primary/20 dark:shadow-primary/10 hover:cursor-pointer group/main"
          @click="handleCreateChat" :disabled="isBusy">
          <div class="flex items-center justify-center gap-3">
            <Loader2 v-if="isBusy" class="size-6 animate-spin" />
            <template v-else>
              <Plus class="size-6 transition-transform group-hover/main:rotate-90 duration-500" />
              <span class="tracking-tight">Start New Chat</span>
            </template>
          </div>
        </Button>
      </div>

      <div class="relative flex items-center justify-center">
        <div class="absolute inset-x-0 h-px bg-linear-to-r from-transparent via-border to-transparent"></div>
        <span
          class="relative bg-background px-6 text-[10px] uppercase font-black tracking-[0.5em] text-muted-foreground/40">
          Have a chat code?
        </span>
      </div>

      <div class="px-2">
        <InputGroup
          class="h-16 border-2 border-muted bg-muted/30 dark:bg-white/3 rounded-3xl overflow-hidden transition-fluid focus-within:border-primary/50 focus-within:ring-8 focus-within:ring-primary/5 shadow-inner">
          <InputGroupInput v-model="chatCodeInput" placeholder="CHAT CODE" maxlength="16" @keyup.enter="handleJoinChat"
            class="px-8 font-mono tracking-[0.4em] focus-visible:ring-0 border-0 bg-transparent text-2xl! placeholder:font-sans placeholder:tracking-normal placeholder:text-sm placeholder:font-bold placeholder:opacity-30"
            :disabled="isBusy" />

          <InputGroupAddon align="inline-end" class="pr-3">
            <InputGroupButton @click="handleJoinChat" variant="ghost" size="sm" :class="[
              'h-10 px-6 rounded-2xl font-black transition-all duration-300 flex items-center gap-2 shadow-none! bg-secondary group/join',
              chatCodeInput.trim().length >= 4
                ? 'text-secondary-foreground/50 opacity-100 hover:text-secondary-foreground'
                : 'text-secondary-foreground/20 opacity-50 pointer-events-none'
            ]">
              <Loader2 v-if="isBusy" class="size-5 animate-spin" />
              <template v-else>
                <span class="text-[12px] tracking-[0.2em] -mr-1.5">JOIN</span>
                <ChevronRight
                  class="size-4 opacity-50 transition-transform duration-300 group-hover/join:translate-x-1" />
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
  ChevronRight,
  Fingerprint,
  Plus
} from 'lucide-vue-next';

import { useUserStore } from '@/stores/user';
import { createChat, joinChat } from '@/services/chat';

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

const handleCreateChat = async () => {
  if (isBusy.value) return;
  isBusy.value = true;

  try {
    const { chatCode } = await createChat();
    router.push(`/chat/${chatCode}`);
  } catch (error: any) {
    console.error(error.message)
    toast.error(error.message || 'Could not create the chat. Please try again.')
  } finally {
    isBusy.value = false;
  }
};

const handleJoinChat = async () => {
  const trimmedCode = chatCodeInput.value.trim();

  if (!trimmedCode) {
    toast.warning('Please enter a chat code.');
    return;
  }

  if (trimmedCode.length < 4 || trimmedCode.length > 16) {
    toast.error('Chat code must be between 4 and 16 characters.');
    return;
  }

  const codeRegex = /^[a-zA-Z0-9_-]+$/;
  if (!codeRegex.test(trimmedCode)) {
    toast.error('Only letters, numbers, underscores (_), and hyphens (-) are allowed.');
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
    console.error(error.message);
    toast.error(error.message || 'Failed to join chat. Please check the code and try again.');
  } finally {
    isBusy.value = false;
  }
};
</script>
