<template>
    <div class="container max-w-2xl flex flex-col gap-4">

        <div class="flex items-center justify-between">
            <div class="flex flex-col gap-1">
                <h1 class="text-3xl font-bold tracking-tight">Settings</h1>
                <p class="text-muted-foreground text-sm">Manage your account settings.</p>
            </div>
            <Button variant="ghost" @click="router.back()" class="hover:cursor-pointer">
                <ChevronLeft class="mr-1 h-4 w-4" />
                Back
            </Button>
        </div>

        <section class="flex flex-col gap-4">
            <div>
                <h2 class="text-lg font-semibold tracking-tight">Profile</h2>
                <Separator />
            </div>

            <div class="rounded-xl border bg-card p-6 shadow-xs flex flex-col gap-8">
                <div class="flex items-center gap-4">
                    <Avatar class="h-16 w-16 border-2 border-muted">
                        <AvatarImage :src="previewAvatar || userStore.profile.avatar || ''" />
                        <AvatarFallback class="text-2xl">
                            {{ userStore.profile.nickname?.slice(0, 2).toUpperCase() }}
                        </AvatarFallback>
                    </Avatar>
                    <div class="flex flex-col gap-1">
                        <Button variant="outline" size="sm" class="relative overflow-hidden">
                            Change Avatar
                            <input type="file" class="absolute inset-0 opacity-0 cursor-pointer"
                                @change="handleAvatarChange" />
                        </Button>
                        <p class="text-[10px] text-muted-foreground pl-0.5">JPG, PNG or WebP under 10MB.</p>
                    </div>
                </div>

                <div class="flex flex-col gap-1.5">
                    <Label for="nickname">Nickname</Label>
                    <Input id="nickname" v-model="form.nickname" placeholder="Your nickname" />
                    <p class="text-[12px] text-muted-foreground">This is how others will see you in chat rooms.</p>
                </div>

                <Transition enter-active-class="transition duration-250 ease-out"
                    enter-from-class="transform -translate-y-2 opacity-0"
                    enter-to-class="transform translate-y-0 opacity-100"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="transform translate-y-0 opacity-100"
                    leave-to-class="transform translate-y-2 opacity-0">
                    <div v-if="isDirty" class="p-2 border-t flex justify-end items-center gap-4">
                        <p class="text-xs text-muted-foreground">
                            You have unsaved changes
                        </p>
                        <Button size="sm" @click="handleSave" :disabled="isLoading || isCompressing" class="shadow-xs">
                            <Loader2 v-if="isLoading || isCompressing" class="mr-1 h-4 w-4 animate-spin" />
                            <span>{{ saveButtonText }}</span>
                        </Button>
                    </div>
                </Transition>
            </div>
        </section>

        <section class="flex flex-col gap-4">
            <div>
                <h2 class="text-lg font-semibold tracking-tight">Security</h2>
                <Separator />
            </div>
            <div class="rounded-xl border bg-card p-4 shadow-xs flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="p-2 bg-secondary rounded-full">
                        <Lock class="size-5" />
                    </div>
                    <div>
                        <p class="text-sm font-medium">Password</p>
                    </div>
                </div>
                <ChangePasswordDialog />
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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ChevronLeft, Lock } from 'lucide-vue-next';
import ChangePasswordDialog from '@/components/settings/ChangePasswordDialog.vue';


const router = useRouter();
const userStore = useUserStore();

const isLoading = ref(false);
const isCompressing = ref(false);

const form = reactive({
    nickname: userStore.profile.nickname || '',
});

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