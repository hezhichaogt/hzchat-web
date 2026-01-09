<template>
    <Dialog v-model:open="isOpen">
        <DialogTrigger as-child>
            <slot>
                <Button variant="ghost" size="sm"
                    class="h-8 px-3 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all group/btn">
                    Change
                    <ChevronRight
                        class="ml-1 size-3.5 opacity-40 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all" />
                </Button>
            </slot>
        </DialogTrigger>

        <DialogContent
            class="sm:max-w-106.25 rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 shadow-2xl">
            <DialogHeader>
                <DialogTitle class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Change Password
                </DialogTitle>
                <DialogDescription class="text-zinc-500 dark:text-zinc-400">
                    Enter your current password and choose a new one.
                </DialogDescription>
            </DialogHeader>

            <form @submit="handleUpdate" class="grid gap-5 py-4">
                <FormField v-slot="{ componentField }" name="oldPassword">
                    <FormItem class="grid gap-1.5 space-y-0">
                        <FormLabel
                            class="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 ml-1">
                            Current Password
                        </FormLabel>
                        <FormControl>
                            <Input type="password" v-bind="componentField" autocomplete="current-password"
                                class="h-11 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 focus-visible:ring-zinc-200 dark:focus-visible:ring-zinc-800 transition-all" />
                        </FormControl>
                        <FormMessage class="text-xs font-medium text-red-500/90" />
                    </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="newPassword">
                    <FormItem class="grid gap-1.5 space-y-0">
                        <FormLabel
                            class="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 ml-1">
                            New Password
                        </FormLabel>
                        <FormControl>
                            <Input type="password" v-bind="componentField" autocomplete="new-password"
                                class="h-11 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 focus-visible:ring-zinc-200 dark:focus-visible:ring-zinc-800 transition-all" />
                        </FormControl>
                        <FormMessage class="text-xs font-medium text-red-500/90" />
                    </FormItem>
                </FormField>

                <DialogFooter class="mt-2 flex gap-4">
                    <Button type="button" variant="ghost" @click="isOpen = false" :disabled="isLoading"
                        class="flex-1 sm:flex-none rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                        Cancel
                    </Button>
                    <Button type="submit" :disabled="isLoading || !form.meta.value.valid"
                        class="flex-1 sm:flex-none rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 hover:opacity-90 active:scale-[0.98] transition-all shadow-md">
                        <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin text-inherit" />
                        Save Changes
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';

import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    FormControl, FormField, FormItem,
    FormLabel, FormMessage
} from '@/components/ui/form';
import { Loader2, ChevronRight } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

import { changePassword } from '@/services/auth';
import { useUserStore } from '@/stores/user';

const passwordSchema = toTypedSchema(
    z.object({
        oldPassword: z.string().min(6, 'Current password is too short (min 6 characters)'),
        newPassword: z.string()
            .min(6, 'New password is too short (min 6 characters)')
            .max(50, 'New password is too long (max 50 characters)')
    })
);

const form = useForm({
    validationSchema: passwordSchema,
    initialValues: {
        oldPassword: '',
        newPassword: '',
    }
});

const userStore = useUserStore();
const isOpen = ref(false);
const isLoading = ref(false);

watch(isOpen, (val) => {
    if (!val) {
        form.resetForm();
    }
});

const handleUpdate = form.handleSubmit(async (values) => {
    if (values.oldPassword === values.newPassword) {
        form.setFieldError('newPassword', 'New password cannot be the same as current password');
        return;
    }

    isLoading.value = true;

    try {
        const { token } = await changePassword({
            oldPassword: values.oldPassword,
            newPassword: values.newPassword
        });
        userStore.updateProfile(userStore.profile, token);
        toast.success('Password updated.');
        isOpen.value = false;

    } catch (error: any) {
        if (error.code === 3012) {
            form.setFieldError('oldPassword', 'The current password you entered is incorrect.');
        } else {
            toast.error(error.message || 'Could not update password. Please try again.');
        }

    } finally {
        isLoading.value = false;
    }
});
</script>
