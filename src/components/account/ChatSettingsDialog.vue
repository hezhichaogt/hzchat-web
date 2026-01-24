<template>
    <Dialog v-model:open="isOpen">
        <DialogContent
            class="sm:max-w-106.25 rounded-2xl border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 shadow-2xl">
            <DialogHeader>
                <DialogTitle class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {{ isEditMode ? 'Chat Settings' : 'New Chat' }}
                </DialogTitle>
                <DialogDescription class="text-zinc-500 dark:text-zinc-400">
                    {{ isEditMode ? 'Manage chat details and access.' : 'Create a persistent chat with a custom code.'
                    }}
                </DialogDescription>
            </DialogHeader>

            <form @submit="handleSubmit" class="grid gap-5 py-4">
                <FormField v-slot="{ componentField }" name="code">
                    <FormItem class="grid gap-1.5 space-y-0">
                        <FormLabel
                            class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
                            Chat Code
                        </FormLabel>
                        <FormControl>
                            <Input v-bind="componentField" :disabled="isEditMode" placeholder="e.g. team-sync"
                                class="h-11 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 disabled:opacity-50 transition-all" />
                        </FormControl>
                        <FormMessage class="text-xs font-medium text-red-500/90" />
                    </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="name">
                    <FormItem class="grid gap-1.5 space-y-0">
                        <FormLabel
                            class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
                            Chat Name
                        </FormLabel>
                        <FormControl>
                            <Input v-bind="componentField" placeholder="Shown in the chat header"
                                class="h-11 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 transition-all" />
                        </FormControl>
                        <FormMessage class="text-xs font-medium text-red-500/90" />
                    </FormItem>
                </FormField>

                <FormField v-slot="{ value, handleChange }" name="enablePassword">
                    <FormItem
                        class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/20 overflow-hidden transition-all">
                        <div class="flex flex-row items-center justify-between p-3">
                            <div class="space-y-0.5">
                                <FormLabel
                                    class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Password Protection
                                </FormLabel>
                                <p class="text-[10px] text-zinc-400">Require a password to join.</p>
                            </div>
                            <FormControl>
                                <button type="button" :class="[
                                    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                                    value ? 'bg-zinc-700 dark:bg-zinc-400' : 'bg-zinc-200 dark:bg-zinc-700'
                                ]" @click="() => {
                                    const nextVal = !value;
                                    handleChange(nextVal);
                                    if (!nextVal) {
                                        form.setFieldValue('password', '');
                                        form.setFieldError('password', undefined);
                                        isChangingPassword = false;
                                    }
                                }">
                                    <span :class="[
                                        'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform',
                                        value ? 'translate-x-4.5' : 'translate-x-0.5'
                                    ]" />
                                </button>
                            </FormControl>
                        </div>

                        <div v-if="value" class="px-3 pb-3 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div class="h-px bg-zinc-200/50 dark:bg-zinc-800/50 mb-3" />

                            <div v-if="isEditMode && initialData?.hasPassword && !isChangingPassword"
                                class="flex items-center justify-between bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-lg h-10 px-3">
                                <div class="flex items-center gap-2">
                                    <span class="text-xs text-zinc-400 font-medium tracking-widest">••••••••</span>
                                    <span
                                        class="text-[10px] text-amber-500 bg-zinc-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded">Active</span>
                                </div>
                                <Button type="button" variant="ghost" size="sm" class="px-2 text-[11px] rounded-lg"
                                    @click="isChangingPassword = true">
                                    Change
                                </Button>
                            </div>

                            <FormField v-else v-slot="{ componentField }" name="password">
                                <FormItem class="grid gap-1.5 space-y-0">
                                    <FormControl>
                                        <div class="relative flex items-center">
                                            <Input type="text" v-bind="componentField" placeholder="Set a new password"
                                                class="h-10 pr-16 rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all text-sm focus:ring-1" />

                                            <Button v-if="isChangingPassword" type="button" variant="ghost" size="sm"
                                                class="absolute right-1 h-7 px-2 text-[10px] text-zinc-400 hover:text-zinc-600"
                                                @click="() => { isChangingPassword = false; form.setFieldValue('password', ''); }">
                                                Cancel
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage class="text-[10px] font-medium text-red-500/90 mt-1" />
                                </FormItem>
                            </FormField>
                        </div>
                    </FormItem>
                </FormField>

                <FormField v-slot="{ value, handleChange }" name="requireAuth">
                    <FormItem
                        class="flex flex-row items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/30 dark:bg-zinc-900/20">
                        <div class="space-y-0.5">
                            <FormLabel
                                class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                Members Only
                            </FormLabel>
                            <p class="text-[10px] text-zinc-400">Only logged-in users can join.</p>
                        </div>
                        <FormControl>
                            <button type="button" role="switch" :aria-checked="value" :class="[
                                'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                                value ? 'bg-zinc-700 dark:bg-zinc-400' : 'bg-zinc-200 dark:bg-zinc-700'
                            ]" @click="handleChange(!value)">
                                <span :class="[
                                    'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200',
                                    value ? 'translate-x-4.5' : 'translate-x-0.5'
                                ]" />
                            </button>
                        </FormControl>
                    </FormItem>
                </FormField>

                <DialogFooter class="mt-2 flex gap-3">
                    <Button type="button" variant="ghost" @click="isOpen = false"
                        class="flex-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50">
                        Cancel
                    </Button>
                    <Button type="submit" variant="default" :disabled="isLoading" class="flex-1 transition-all">
                        <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
                        {{ isEditMode ? 'Save Changes' : 'Create Chat' }}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    FormControl, FormField, FormItem,
    FormLabel, FormMessage
} from '@/components/ui/form';

import type { PersistentChat } from '@/types/chat';
import { RESERVED_CODES } from '@/types/reserved';
import {
    createPersistentChat,
    type CreatePersistentChatInput,
    updatePersistentChat
} from '@/services/chat';

const props = defineProps<{
    initialData?: PersistentChat | null;
}>();

const emit = defineEmits(['success']);

const isOpen = ref(false);
const isLoading = ref(false);
const isChangingPassword = ref(false);

const isEditMode = computed(() => !!props.initialData);

const formSchema = toTypedSchema(
    z.object({
        code: z.string()
            .min(4, 'Must be at least 4 characters')
            .max(16, 'Must be 16 characters or fewer')
            .regex(/^[a-z0-9_-]+$/, 'Use lowercase letters, numbers, hyphens, or underscores')
            .refine(
                (val) => !RESERVED_CODES.includes(val.toLowerCase() as any),
                { message: 'This code is unavailable' }
            ),

        name: z.string()
            .trim()
            .min(2, 'Must be at least 2 characters')
            .max(32, 'Must be 32 characters or fewer'),

        enablePassword: z.boolean().default(false),
        password: z.string().optional().default(''),
        requireAuth: z.boolean().default(false),
    }).refine((data) => {
        if (!data.enablePassword) return true;

        const isNew = !isEditMode.value;
        const noPrevPass = !props.initialData?.hasPassword;
        const passLen = data.password?.length || 0;

        if (isNew || noPrevPass) {
            return passLen >= 4 && passLen <= 16;
        }

        return passLen === 0 || (passLen >= 4 && passLen <= 16);
    }, {
        message: "Password must be 4-16 characters",
        path: ["password"]
    })
);

const form = useForm({
    validationSchema: formSchema,
    initialValues: {
        code: '',
        name: '',
        password: '',
        enablePassword: false,
        requireAuth: false,
    }
});

watch(() => props.initialData, (newVal) => {
    isChangingPassword.value = false;
    if (newVal) {
        form.setValues({
            code: newVal.code,
            name: newVal.name,
            requireAuth: newVal.requireAuth,
            enablePassword: newVal.hasPassword,
            password: '',
        });
    } else {
        form.resetForm();
    }
}, { immediate: true });

const open = () => { isOpen.value = true; };
defineExpose({ open });

const handleSubmit = form.handleSubmit(async (values) => {
    isLoading.value = true

    try {
        const payload: CreatePersistentChatInput = {
            code: values.code,
            name: values.name,
            requireAuth: values.requireAuth,
            password: values.enablePassword ? values.password : ""
        }

        let result;

        if (isEditMode.value && props.initialData) {
            const updatePayload: any = {
                id: props.initialData.id,
                name: values.name,
                requireAuth: values.requireAuth,
            };

            if (!values.enablePassword) {
                updatePayload.password = "";
            } else if (values.password && values.password.length > 0) {
                updatePayload.password = values.password;
            }

            result = await updatePersistentChat(updatePayload);
            toast.success('Chat settings updated.')
        } else {
            result = await createPersistentChat(payload);
            toast.success('New chat created.')
        }

        emit('success', result);
        isOpen.value = false
    } catch (error: any) {
        console.error(error);
        toast.error(error?.message || 'Something went wrong. Please try again.')
    } finally {
        isLoading.value = false
    }
});
</script>