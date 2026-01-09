<template>
    <div class="container max-w-2xl flex flex-col gap-4 px-1 py-2">

        <div class="flex items-center justify-between pb-8">

            <div class="flex flex-col gap-1">
                <h1 class="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Settings</h1>
                <p class="text-sm text-zinc-500 dark:text-zinc-400">Manage your account settings.</p>
            </div>

            <Button variant="link" @click="router.back()"
                class="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-0 group hover:no-underline">
                <ChevronLeft class="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span class="text-sm font-medium">Back</span>
            </Button>

        </div>

        <section class="flex flex-col gap-4">

            <div class="flex flex-col gap-2">
                <h2 class="text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Profile</h2>
                <Separator class="bg-zinc-200/60 dark:bg-zinc-800/60" />
            </div>

            <div class="flex flex-col gap-1">
                <div class="flex items-center justify-between border-b border-muted/40 px-0.5">
                    <div class="flex items-center gap-3 select-none">
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
                            class="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-[2px]">
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

                    <div class="flex items-center gap-3 select-none">
                        <div class="p-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl">
                            <Type class="size-4 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nickname</span>
                    </div>

                    <div class="flex items-center justify-end flex-1 pl-4">
                        <Input id="nickname" v-model="form.nickname" class="border-none bg-transparent rounded-lg px-3 shadow-none 
                            focus-visible:ring-0 focus:bg-zinc-100 dark:focus:bg-zinc-800/50 text-right text-sm font-medium
                            hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all duration-200 
                            max-w-32 h-9 text-zinc-900 dark:text-zinc-100" />
                    </div>
                </div>

                <Transition enter-active-class="transition duration-350 ease-out"
                    enter-from-class="transform -translate-y-2 opacity-0"
                    enter-to-class="transform translate-y-0 opacity-100"
                    leave-active-class="transition duration-250 ease-in"
                    leave-from-class="transform translate-y-0 opacity-100"
                    leave-to-class="transform -translate-y-2 opacity-0">

                    <div v-if="isDirty" class="flex justify-end items-center gap-4 py-6">
                        <p class="text-xs text-zinc-400 dark:text-zinc-500 italic font-medium">
                            You have unsaved changes
                        </p>

                        <Button size="sm" @click="handleSave" :disabled="isLoading || isCompressing"
                            class="h-9 px-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 hover:opacity-90 shadow-lg shadow-zinc-200 dark:shadow-none transition-all active:scale-95">
                            <Loader2 v-if="isLoading || isCompressing" class="mr-2 h-3.5 w-3.5 animate-spin" />
                            <span class="text-xs font-bold">{{ saveButtonText }}</span>
                        </Button>
                    </div>
                </Transition>
            </div>
        </section>

        <section class="flex flex-col gap-6 mt-4">
            <div class="flex flex-col gap-2">
                <h2 class="text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Security
                </h2>
                <Separator class="bg-zinc-200/60 dark:bg-zinc-800/60" />
            </div>

            <div class="flex items-center justify-between py-2 border-b border-muted/40 group">
                <div class="flex items-center gap-3 select-none">
                    <div class="p-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl">
                        <Lock class="size-4 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</span>
                </div>
                <ChangePasswordDialog />
            </div>

            <div class="flex items-center justify-between py-2 border-b border-muted/40 group">
                <div class="flex items-center gap-3 select-none">
                    <div class="p-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl">
                        <Mail class="size-4 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</span>
                </div>
                <EmailManageDialog :email="userStore.profile.email" />
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

import { useUserStore } from '@/stores/user';
import { presignAvatar, updateUserProfile } from '@/services/user';
import { putFile } from '@/utils/fileUpload';

import imageCompression from 'browser-image-compression';
import { toast } from 'vue-sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ChevronLeft, Lock, User2, Upload, Type, Mail } from 'lucide-vue-next';

import ChangePasswordDialog from '@/components/settings/ChangePasswordDialog.vue';
import EmailManageDialog from '@/components/settings/EmailManageDialog.vue';

const router = useRouter();
const userStore = useUserStore();

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

onUnmounted(() => {
    if (previewAvatar.value) {
        URL.revokeObjectURL(previewAvatar.value);
    }
});
</script>