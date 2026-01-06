<template>
    <Dialog v-model:open="isOpen">
        <DialogTrigger as-child>
            <slot>
                <Button variant="ghost" size="sm"
                    class="h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    Change
                    <ChevronRight
                        class="ml-0.5 size-3.5 opacity-50 group-hover/btn:translate-x-0.5 transition-transform" />
                </Button>
            </slot>
        </DialogTrigger>

        <DialogContent>
            <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                    Enter your current password and choose a new one.
                </DialogDescription>
            </DialogHeader>

            <form @submit="handleUpdate" class="grid gap-4 py-4">
                <FormField v-slot="{ componentField }" name="oldPassword">
                    <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                            <Input type="password" v-bind="componentField" autocomplete="current-password" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="newPassword">
                    <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                            <Input type="password" v-bind="componentField" autocomplete="new-password" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </FormField>

                <DialogFooter class="mt-4">
                    <Button type="button" variant="ghost" @click="isOpen = false" :disabled="isLoading"
                        class="hover:cursor-pointer">
                        Cancel
                    </Button>
                    <Button type="submit" :disabled="isLoading || !form.meta.value.valid" class="hover:cursor-pointer">
                        <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
                        Save changes
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
