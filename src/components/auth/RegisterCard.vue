<template>
    <Card class="border-zinc-200/60 shadow-2xl shadow-zinc-200/30 rounded-2xl">
        <CardHeader class="space-y-1">
            <CardTitle class="text-2xl font-bold tracking-tight text-zinc-900">
                Create an account
            </CardTitle>
            <CardDescription class="text-zinc-500 text-xs">
                Create an account to unlock more features
            </CardDescription>
        </CardHeader>

        <form @submit.prevent="onRegisterSubmit">
            <CardContent class="flex flex-col gap-4">
                <FormField v-slot="{ componentField }" name="username" :form="registerForm">
                    <FormItem>
                        <FormLabel class="text-xs font-bold uppercase tracking-widest text-zinc-500/90">
                            Username
                        </FormLabel>
                        <FormControl>
                            <Input type="text" placeholder="Choose a unique username" v-bind="componentField"
                                autocomplete="username"
                                class="h-10 border-zinc-200 bg-white/50 focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 outline-none transition-all placeholder:text-zinc-300" />
                        </FormControl>
                        <FormMessage class="text-[10px] font-medium" />
                    </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="password" :form="registerForm">
                    <FormItem>
                        <FormLabel class="text-xs font-bold uppercase tracking-widest text-zinc-500/90">
                            Password
                        </FormLabel>
                        <FormControl>
                            <div class="relative flex items-center">
                                <Input :type="isPasswordVisible ? 'text' : 'password'" placeholder="••••••••"
                                    v-bind="componentField" autocomplete="new-password"
                                    class="h-10 w-full pr-10 border-zinc-200 bg-white/50 focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 outline-none transition-all placeholder:text-zinc-300 placeholder:opacity-100" />
                                <button type="button" @click="isPasswordVisible = !isPasswordVisible"
                                    class="absolute right-3 text-zinc-400 hover:text-zinc-900 transition-colors focus:outline-none">
                                    <Eye v-if="!isPasswordVisible" class="h-4 w-4" />
                                    <EyeOff v-else class="h-4 w-4" />
                                </button>
                            </div>
                        </FormControl>
                        <FormMessage class="text-[10px] font-medium" />
                    </FormItem>
                </FormField>
            </CardContent>

            <CardFooter class="pt-6">
                <Button type="submit"
                    class="w-full h-10 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl shadow-lg shadow-zinc-950/20 transition-all active:scale-[0.98] hover:cursor-pointer"
                    :disabled="isLoading">
                    <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
                    <UserPlus v-else class="mr-2 h-4 w-4" />
                    Get Started
                </Button>
            </CardFooter>
        </form>
    </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';

import { UserPlus, Loader2, Eye, EyeOff } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'vue-sonner';
import {
    Card, CardContent, CardDescription,
    CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import {
    FormControl, FormField, FormItem,
    FormLabel, FormMessage
} from '@/components/ui/form';

import { useUserStore } from '@/stores/user';
import { register } from '@/services/auth';


const registerSchema = toTypedSchema(
    z.object({
        username: z.string()
            .min(4, 'Username is too short (min 4 characters)')
            .max(20, 'Username is too long (max 20 characters)')
            .regex(/^[a-z0-9_]+$/, 'Use lowercase letters, numbers, or underscores only'),

        password: z.string()
            .min(6, 'Password is too short (min 6 characters)')
            .max(50, 'Password is too long (max 50 characters)'),
    })
);

const registerForm = useForm({
    validationSchema: registerSchema,
    initialValues: {
        username: '',
        password: ''
    }
});

const router = useRouter();
const userStore = useUserStore();

const isLoading = ref(false);
const isPasswordVisible = ref(false);

const onRegisterSubmit = registerForm.handleSubmit(async (values) => {
    isLoading.value = true;

    try {
        const { token, user } = await register(values);
        userStore.handleLoginSuccess(token, user);
        toast.success(`Welcome, ${user.nickname}!`);
        router.replace('/');
    } catch (error: any) {
        const errorMsg = error.message || 'Please check your information.';
        toast.error(`Sign-up failed. ${errorMsg}`);
    } finally {
        isLoading.value = false;
    }
});
</script>
