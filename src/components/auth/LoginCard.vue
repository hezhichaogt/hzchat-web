<template>
    <Card class="border-zinc-200/60 shadow-2xl shadow-zinc-200/30 rounded-2xl">
        <CardHeader class="space-y-1">
            <CardTitle class="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription class="text-zinc-500 text-xs">
                Sign in to continue on HZ Chat
            </CardDescription>
        </CardHeader>
        <form @submit.prevent="onLoginSubmit">
            <CardContent class="flex flex-col gap-4">
                <FormField v-slot="{ componentField }" name="username" :form="loginForm">
                    <FormItem>
                        <FormLabel class="text-xs font-bold uppercase tracking-widest text-zinc-500/90">
                            Username
                        </FormLabel>
                        <FormControl>
                            <Input type="text" placeholder="Enter your username" v-bind="componentField"
                                autocomplete="username"
                                class="h-10 border-zinc-200 bg-white/50 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 transition-all placeholder:text-zinc-300" />
                        </FormControl>
                        <FormMessage class="text-[10px] font-medium text-red-500/80" />
                    </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="password" :form="loginForm">
                    <FormItem>
                        <div class="flex items-center justify-between">
                            <FormLabel class="text-xs font-bold uppercase tracking-widest text-zinc-500/90">
                                Password
                            </FormLabel>
                            <a href="#" class="text-xs text-zinc-400 hover:text-zinc-900 transition-colors">Forgot
                                password?</a>
                        </div>
                        <FormControl>
                            <Input type="password" placeholder="••••••••" v-bind="componentField"
                                autocomplete="current-password"
                                class="h-10 border-zinc-200 bg-white/50 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 transition-all placeholder:text-zinc-300 placeholder:opacity-100" />
                        </FormControl>
                        <FormMessage class="text-[10px] font-medium" />
                    </FormItem>
                </FormField>
            </CardContent>

            <CardFooter class="pt-6">
                <Button type="submit"
                    class="w-full h-10 bg-zinc-950 hover:bg-zinc-800 text-white hover:cursor-pointer rounded-xl shadow-lg shadow-zinc-950/20 transition-all active:scale-[0.98]"
                    :disabled="isLoading">
                    <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
                    <LogIn v-else class="mr-2 h-4 w-4" />
                    Sign In
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

import { LogIn, Loader2 } from 'lucide-vue-next';
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
import { login } from '@/services/auth';


const loginSchema = toTypedSchema(
    z.object({
        username: z.string()
            .min(4, 'Username is too short (min 4 characters)')
            .max(20, 'Username is too long (max 20 characters)'),
        password: z.string()
            .min(6, 'Password is too short (min 6 characters)')
            .max(50, 'Password is too long (max 50 characters)'),
    })
);

const loginForm = useForm({
    validationSchema: loginSchema,
    initialValues: {
        username: '',
        password: ''
    }
});

const isLoading = ref(false);
const router = useRouter();
const userStore = useUserStore();

const onLoginSubmit = loginForm.handleSubmit(async (values) => {
    isLoading.value = true;

    try {
        const { token, user } = await login(values);

        userStore.handleLoginSuccess(token, user);

        toast.success(`Welcome back!`);

        router.replace('/');

    } catch (error: any) {
        const message =
            error?.message || 'Invalid username or password';

        toast.error(message);
    } finally {
        isLoading.value = false;
    }
});
</script>
