<template>
    <div class="container max-w-3xl py-6 lg:py-8">
        <h1 :class="[
            'text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4 pl-4',
            activeSection ? 'hidden lg:block' : 'block'
        ]">
            Account
        </h1>

        <div class="flex flex-col lg:flex-row gap-10 lg:gap-16">
            <aside :class="[
                'w-full lg:w-52 shrink-0 lg:pr-8 lg:border-r lg:border-zinc-100 dark:lg:border-zinc-800',
                activeSection ? 'hidden lg:block' : 'block'
            ]">

                <nav class="flex flex-col gap-1">
                    <button v-for="item in navItems" :key="item.id" @click="navigateTo(item.id)" :class="[
                        'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all group',
                        'border-b border-zinc-100 dark:border-zinc-800/50 lg:border-none',
                        activeSection === item.id
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                            : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
                    ]">
                        <component :is="item.icon" class="size-4.5" />
                        <span class="truncate text-zinc-600 dark:text-zinc-300">{{ item.label }}</span>
                        <span v-if="item.pro"
                            class="ml-auto text-[9px] font-black bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 px-1.5 py-0.5 rounded-md tracking-tighter italic">
                            PRO
                        </span>
                    </button>

                    <Separator class="my-6 hidden lg:block bg-zinc-100 dark:bg-zinc-800" />

                    <button @click="router.push('/')"
                        class="flex items-center mt-4 lg:mt-0 gap-3 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        <ChevronLeft class="size-4" />
                        Back to Home
                    </button>
                </nav>
            </aside>

            <main v-if="activeSection" class="flex-1 min-w-0">
                <div class="lg:hidden flex items-center gap-2 mb-8 -ml-2">
                    <Button variant="ghost" size="icon" @click="navigateTo(null)"
                        class="h-10 w-10 rounded-full text-zinc-500">
                        <ChevronLeft class="size-7" />
                    </Button>
                    <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{{ currentNavItem?.label }}</h2>
                </div>

                <div>
                    <section v-if="activeSection === 'profile'"
                        class="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div class="flex flex-col gap-1">
                            <div class="flex items-center justify-between border-b border-muted/40 px-0.5 pb-2">
                                <div class="flex items-center gap-3">
                                    <div class="p-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl">
                                        <User2 class="size-4 text-zinc-600 dark:text-zinc-400" />
                                    </div>
                                    <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Avatar</span>
                                </div>
                                <div class="relative group cursor-pointer" @click="avatarInput?.click()">
                                    <Avatar
                                        class="size-14 border-2 border-white dark:border-zinc-900 shadow-sm transition-all duration-300 group-hover:ring-4 group-hover:ring-zinc-100 dark:group-hover:ring-zinc-800/50">
                                        <AvatarImage :src="previewAvatar || userStore.profile.avatar || ''" />
                                        <AvatarFallback
                                            class="text-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                            {{ userStore.profile.nickname?.slice(0, 2).toUpperCase() }}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div
                                        class="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200">
                                        <Upload class="size-5 text-white" />
                                    </div>
                                    <div v-if="isCompressing || isLoading"
                                        class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 rounded-full backdrop-blur-sm">
                                        <Loader2 class="size-5 text-zinc-900 dark:text-zinc-100 animate-spin" />
                                    </div>
                                    <input type="file" ref="avatarInput" class="hidden" accept="image/*"
                                        @change="handleAvatarChange" />
                                </div>
                            </div>

                            <div class="flex items-center justify-between py-4 border-b border-muted/40 group">
                                <div class="flex items-center gap-3">
                                    <div class="p-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl">
                                        <Type class="size-4 text-zinc-600 dark:text-zinc-400" />
                                    </div>
                                    <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nickname</span>
                                </div>
                                <Input v-model="form.nickname"
                                    class="border-none bg-transparent text-right text-sm font-medium focus-visible:ring-0 max-w-40 h-9 text-zinc-900 dark:text-zinc-100" />
                            </div>
                        </div>

                        <Transition enter-active-class="transition duration-300 ease-out"
                            enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0">
                            <div v-if="isDirty" class="flex justify-end items-center gap-4 py-4">
                                <p class="text-[11px] text-zinc-400 italic">Unsaved changes</p>
                                <Button size="sm" @click="handleSave" :disabled="isLoading || isCompressing"
                                    class="rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 px-6 font-bold text-xs h-9 transition-all active:scale-95 shadow-md">
                                    <Loader2 v-if="isLoading" class="mr-2 h-3.5 w-3.5 animate-spin" />
                                    {{ saveButtonText }}
                                </Button>
                            </div>
                        </Transition>
                    </section>

                    <section v-if="activeSection === 'security'"
                        class="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div class="flex items-center justify-between py-3 border-b border-muted/40 group">
                            <div class="flex items-center gap-3">
                                <div class="p-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl">
                                    <Lock class="size-4 text-zinc-600 dark:text-zinc-400" />
                                </div>
                                <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</span>
                            </div>
                            <ChangePasswordDialog />
                        </div>
                        <div class="flex items-center justify-between py-3 border-b border-muted/40 group">
                            <div class="flex items-center gap-3">
                                <div class="p-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl">
                                    <Mail class="size-4 text-zinc-600 dark:text-zinc-400" />
                                </div>
                                <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</span>
                            </div>
                            <EmailManageDialog :email="userStore.profile.email" />
                        </div>
                    </section>

                    <section v-if="activeSection === 'chats'"
                        class="flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-right-4 duration-500">

                        <template v-if="userStore.isPro">
                            <Chats />
                        </template>

                        <template v-else>
                            <ProUpgradeCard />
                        </template>

                    </section>

                    <section v-if="activeSection === 'billing'"
                        class="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <Billing />
                    </section>
                </div>
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { useUserStore } from '@/stores/user';
import { presignAvatar, updateUserProfile } from '@/services/user';
import { putFile } from '@/utils/fileUpload';

import imageCompression from 'browser-image-compression';
import { toast } from 'vue-sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ChevronLeft, Lock, User2, Upload, Type, Mail, ShieldCheck, MessagesSquare, CreditCard } from 'lucide-vue-next';

import ChangePasswordDialog from '@/components/account/ChangePasswordDialog.vue';
import EmailManageDialog from '@/components/account/EmailManageDialog.vue';
import Chats from '@/components/account/Chats.vue';
import ProUpgradeCard from '@/components/account/ProUpgradeCard.vue';
import Billing from '@/components/account/Billing.vue';

const router = useRouter();
const userStore = useUserStore();
const route = useRoute();

const navItems = [
    { id: 'profile', label: 'Profile', icon: User2 },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'chats', label: 'Chats', icon: MessagesSquare, pro: true },
    { id: 'billing', label: 'Plans & Billing', icon: CreditCard },
];

const getSectionFromRoute = (): string | null => {
    const section = route.params.section as string | undefined;
    const validSections = navItems.map(item => item.id);

    if (section && validSections.includes(section)) {
        return section;
    }

    return window.innerWidth < 1024 ? null : 'profile';
};

const activeSection = ref<string | null>(getSectionFromRoute());

const navigateTo = (id: string | null) => {
    activeSection.value = id;
    if (id) {
        router.push(`/account/${id}`);
    } else {
        router.push('/account');
    }
};

const currentNavItem = computed(() => navItems.find(item => item.id === activeSection.value));

watch(
    () => route.path,
    () => {
        const section = getSectionFromRoute();
        if (activeSection.value !== section) {
            activeSection.value = section;
        }
    }
);

const handleResize = () => {
    if (window.innerWidth >= 1024 && !activeSection.value) {
        navigateTo('profile');
    }
};

const isLoading = ref(false);
const isCompressing = ref(false);

const form = reactive({
    nickname: userStore.profile.nickname || '',
});

const avatarInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const previewAvatar = ref<string | null>(null);

const handleAvatarChange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    isCompressing.value = true;

    try {
        const options = {
            maxSizeMB: 0.1,
            maxWidthOrHeight: 256,
            initialQuality: 0.8,
            fileType: 'image/webp' as const,
            useWebWorker: true,
        };

        const compressedBlob = await imageCompression(file, options);

        if (previewAvatar.value) URL.revokeObjectURL(previewAvatar.value);

        selectedFile.value = new File(
            [compressedBlob],
            `${Date.now()}.webp`,
            { type: 'image/webp' }
        );
        previewAvatar.value = URL.createObjectURL(selectedFile.value);
    } catch (error) {
        console.error("Compression failed:", error);
        toast.error("Couldn't process this image. Please try another one.");
    } finally {
        isCompressing.value = false;
    }
};

const isDirty = computed(() => {
    const hasNicknameChanged = form.nickname !== (userStore.profile.nickname || '');
    const hasAvatarChanged = selectedFile.value !== null || isCompressing.value;
    return hasNicknameChanged || hasAvatarChanged;
});

const saveButtonText = computed(() => {
    if (isCompressing.value) return 'Processing image...';
    if (isLoading.value) return 'Saving...';
    return 'Save changes';
});

const handleSave = async () => {
    if (!isDirty.value) return;

    isLoading.value = true;
    let finalAvatarKey = userStore.profile.avatar || '';

    try {
        if (selectedFile.value) {
            const { presignedUrl, fileKey } = await presignAvatar({
                mimeType: selectedFile.value.type,
                fileSize: selectedFile.value.size
            });

            await putFile(presignedUrl, selectedFile.value);
            finalAvatarKey = fileKey;
        }

        const response = await updateUserProfile({
            nickname: form.nickname,
            avatarUrl: finalAvatarKey
        });

        userStore.updateProfile(response.user, response.token);
        toast.success('Profile updated.');

        if (previewAvatar.value) {
            URL.revokeObjectURL(previewAvatar.value);
            previewAvatar.value = null;
        }
        selectedFile.value = null;

    } catch (error: any) {
        const errorMsg = error.message || 'Could not update profile. Please try again.';
        toast.error(errorMsg);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    if (previewAvatar.value) URL.revokeObjectURL(previewAvatar.value);
});
</script>