<template>
    <div class="container max-w-2xl flex flex-col gap-4">

        <div class="flex items-center justify-between pb-6">

            <div class="flex flex-col gap-1.5">
                <h1 class="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                <p class="text-sm text-muted-foreground/80">Manage your account settings.</p>
            </div>

            <Button variant="link" @click="router.back()"
                class="text-muted-foreground hover:text-foreground transition-colors px-0 group hover:cursor-pointer">
                <ChevronLeft class="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span class="text-sm font-medium">Back</span>
            </Button>

        </div>

        <section class="flex flex-col gap-4">

            <div class="flex flex-col gap-1">
                <h2 class="text-xl font-bold tracking-tight">Profile</h2>
                <Separator />
            </div>

            <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between border-b border-muted/40 px-0.5">
                    <div class="flex items-center gap-2.5 select-none">
                        <div class="p-2 bg-secondary/50 rounded-lg group-hover:bg-secondary transition-colors">
                            <User2 class="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>

                        <span class="text-sm font-medium text-foreground/90 tracking-tight">
                            Avatar
                        </span>
                    </div>

                    <div class="relative group cursor-pointer" @click="avatarInput?.click()">
                        <Avatar
                            class="size-12 border border-muted/50 transition-all duration-300 group-hover:ring-2 group-hover:ring-primary/10">
                            <AvatarImage :src="previewAvatar || userStore.profile.avatar || ''" />
                            <AvatarFallback class="text-xl bg-secondary/30">
                                {{ userStore.profile.nickname?.slice(0, 2).toUpperCase() }}
                            </AvatarFallback>
                        </Avatar>

                        <div
                            class="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Upload class="size-5 text-white mb-0.5" />
                        </div>

                        <div v-if="isCompressing || isLoading"
                            class="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full">
                            <Loader2 class="size-5 text-primary animate-spin" />
                        </div>

                        <input type="file" ref="avatarInput" class="hidden" accept="image/*"
                            @change="handleAvatarChange" />
                    </div>
                </div>

                <div class="flex items-center justify-between py-4 border-b border-muted/40 px-1 group">

                    <div class="flex items-center gap-2.5 select-none">
                        <div class="p-2 bg-secondary/50 rounded-lg transition-colors">
                            <Type class="size-4 text-muted-foreground transition-colors" />
                        </div>
                        <div class="flex flex-col">
                            <span class="text-sm font-medium text-foreground/90 tracking-tight">Nickname</span>
                        </div>
                    </div>

                    <div class="flex items-center justify-end flex-1 pl-4 group/input">
                        <Input id="nickname" v-model="form.nickname" class="border-0 bg-transparent rounded-md px-2 shadow-none 
                            focus-visible:ring-0 focus:bg-secondary/50 text-right text-sm 
                            group-hover/input:bg-secondary/30 transition-all duration-200 
                            max-w-32 h-8" />
                    </div>
                </div>

                <Transition enter-active-class="transition duration-350 ease-out"
                    enter-from-class="transform -translate-y-2 opacity-0"
                    enter-to-class="transform translate-y-0 opacity-100"
                    leave-active-class="transition duration-250 ease-in"
                    leave-from-class="transform translate-y-0 opacity-100"
                    leave-to-class="transform -translate-y-2 opacity-0">
                    <div v-if="isDirty" class="flex justify-end items-center gap-4 py-4 px-1">
                        <p class="text-xs text-muted-foreground italic">
                            You have unsaved changes
                        </p>

                        <Button size="sm" @click="handleSave" :disabled="isLoading || isCompressing"
                            class="h-9 px-5 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-none transition-all active:scale-95">
                            <Loader2 v-if="isLoading || isCompressing" class="mr-2 h-3.5 w-3.5 animate-spin" />
                            <span class="text-xs font-semibold">{{ saveButtonText }}</span>
                        </Button>
                    </div>
                </Transition>
            </div>
        </section>

        <section class="flex flex-col gap-2 mt-2">
            <div class="flex flex-col gap-1">
                <h2 class="text-xl font-bold tracking-tight">Security</h2>
                <Separator class="opacity-50" />
            </div>

            <div class="flex items-center justify-between py-4 border-b border-muted/40 px-1 group">
                <div class="flex items-center gap-2.5 select-none">
                    <div class="p-2 bg-secondary/50 rounded-lg transition-colors">
                        <Lock class="size-4 text-muted-foreground transition-colors" />
                    </div>
                    <span class="text-sm font-medium text-foreground/90 tracking-tight">
                        Password
                    </span>
                </div>

                <div class="flex items-center">
                    <ChangePasswordDialog />
                </div>
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
import { Loader2, ChevronLeft, Lock, User2, Upload, Type } from 'lucide-vue-next';
import ChangePasswordDialog from '@/components/settings/ChangePasswordDialog.vue';


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