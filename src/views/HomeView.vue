<template>
  <div class="w-full max-w-2xl p-4 flex flex-col gap-8 mx-auto animate-in fade-in zoom-in-95 duration-800">

    <div class="flex flex-col gap-1.5 md:gap-2">
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.05] text-foreground">
        Zero-Record <br />
        <span class="inline-block text-primary">Messaging.</span>
        <span class="text-muted-foreground/50 block mt-1 sm:mt-2 font-medium">Traceless. Start Now.</span>
      </h1>

      <p class="text-base sm:text-lg md:text-xl text-muted-foreground/70 leading-relaxed font-medium px-2">
        No registration. <span class="text-foreground border-b-[1.5px] border-foreground/20 italic">Zero storage</span>.
        Open-source verification for <span class="text-foreground/90">uncompromising</span> privacy.
      </p>
    </div>

    <section v-if="!userStore.isLoggedIn" class="px-2">
      <div class="py-2 space-y-2 group">
        <div class="flex items-baseline gap-2">
          <span class="flex h-1.5 w-1.5 rounded-full bg-emerald-500/60 animate-pulse"></span>
          <Label for="guest-nickname" class="text-[12px] font-black tracking-[0.2em] uppercase opacity-50">
            Identity
          </Label>
          <span class="text-[12px] text-muted-foreground/30 italic font-medium">
            Stored locally.
          </span>
        </div>

        <div class="group/item">
          <Input id="guest-nickname" v-model="nicknameInput" :placeholder="userStore.getDisplayName" maxlength="16"
            class="h-10 px-0 bg-transparent border-0 border-b border-muted-foreground/20 group-hover/item:border-muted-foreground/40 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-all text-base font-medium"
            @blur="handleNicknameChange" />
        </div>
      </div>
    </section>

    <div class="flex flex-col gap-6">
      <div class="flex flex-col sm:flex-row gap-4 px-2">
        <Button size="lg"
          class="w-full sm:flex-1 h-14 text-base font-extrabold transition-all active:scale-[0.97] shadow-md hover:cursor-pointer"
          @click="createPrivateChat" :disabled="isBusy">
          <div class="flex items-center justify-center w-full gap-2">
            <Loader2 v-if="isBusy" class="mr-3 h-5 w-5 animate-spin" />
            <MessageSquare v-else class="mr-3 h-5 w-5" />
            <span>Create Private Chat</span>
          </div>
        </Button>

        <Button variant="outline" size="lg"
          class="w-full sm:flex-1 h-14 text-base font-bold border-2 transition-all active:scale-[0.97] hover:cursor-pointer"
          @click="createGroupChat" :disabled="isBusy">
          <div class="flex items-center justify-center w-full gap-2">
            <Loader2 v-if="isBusy" class="mr-3 h-5 w-5 animate-spin" />
            <Users v-else class="mr-3 h-5 w-5 opacity-70" />
            <span>Create Group Chat</span>
          </div>
        </Button>
      </div>

      <div class="relative py-4 flex items-center justify-center">
        <div class="absolute inset-x-0 h-px bg-linear-to-r from-transparent via-muted-foreground/30 to-transparent">
        </div>

        <span
          class="relative bg-background px-6 text-[10px] uppercase font-black tracking-[0.4em] text-muted-foreground/40">
          OR
        </span>
      </div>

      <div class="px-2">
        <InputGroup class="h-14">
          <InputGroupInput v-model="chatCodeInput" placeholder="ENTER CHAT CODE" maxlength="6"
            class="px-6 md:px-4 font-mono uppercase tracking-[0.3em] focus-visible:ring-0 placeholder:font-sans placeholder:tracking-normal placeholder:text-sm placeholder:opacity-40 text-xl!"
            :disabled="isBusy" />

          <InputGroupAddon align="inline-end" class="pr-4">
            <InputGroupButton @click="handleJoinChat" :disabled="isBusy || chatCodeInput.length < 6" variant="secondary"
              size="sm" class="hover:cursor-pointer">
              <Loader2 v-if="isBusy" class="size-5 animate-spin" />
              <template v-else>
                <div class="flex justify-center items-center">
                  <span class="text-base">JOIN</span>
                  <ChevronRight class="size-5" />
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
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useHead } from '@unhead/vue';
import { toast } from 'vue-sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  ChevronRight
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
const { profile } = storeToRefs(userStore);

const isBusy = ref(false);
const chatCodeInput = ref('');
const nicknameInput = ref(profile.value.nickname || '');

watch(() => profile.value.nickname, (newVal) => {
  nicknameInput.value = newVal || '';
});

const handleNicknameChange = () => {
  const trimmedInput = nicknameInput.value.trim();
  const currentNickname = profile.value.nickname;

  if (trimmedInput === currentNickname) return;

  const validRegex = /^[\p{L}\p{N}_?!-]{1,16}$/u;
  if (trimmedInput && !validRegex.test(trimmedInput)) {
    toast.error('Invalid nickname. Use 1-16 letters, numbers or underscores.');
    nicknameInput.value = currentNickname || '';
    return;
  }

  userStore.setGuestNickname(trimmedInput);

  if (trimmedInput) {
    toast.success('Identity updated.');
  } else {
    toast.info('Using anonymous ID.');
  }
};

const handleCreateChat = async (type: ChatType) => {
  if (isBusy.value) return;
  isBusy.value = true;

  try {
    const { chatCode } = await createChat(type);
    router.push(`/chat/${chatCode}`);
  } catch (error: any) {
    toast.error(`Creation failed: ${error.message || 'Server error'}`);
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
    toast.error(`Code must be exactly ${REQUIRED_LENGTH} characters.`);
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
    toast.error(`Join failed: ${error.message}`);
  } finally {
    isBusy.value = false;
  }
};
</script>
