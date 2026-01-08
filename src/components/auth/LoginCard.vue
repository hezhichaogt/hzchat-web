<template>
    <Card class="border-border bg-card/90 backdrop-blur-xl shadow-none rounded-2xl">
        <CardHeader class="space-y-1">
            <CardTitle class="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription class="text-muted-foreground text-xs">
                Sign in to continue on HZ Chat
            </CardDescription>
        </CardHeader>
        <form @submit.prevent="onLoginSubmit">
            <CardContent class="flex flex-col gap-4">
                <FormField v-slot="{ componentField }" name="username" :form="loginForm">
                    <FormItem>
                        <FormLabel class="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                            Username
                        </FormLabel>
                        <FormControl>
                            <Input type="text" placeholder="Enter your username" v-bind="componentField"
                                autocomplete="username"
                                class="h-10 border-border bg-background/40 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all placeholder:text-muted-foreground/30" />
                        </FormControl>
                        <FormMessage class="text-[10px] font-medium text-destructive" />
                    </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="password" :form="loginForm">
                    <FormItem>
                        <div class="flex items-center justify-between">
                            <FormLabel class="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                                Password
                            </FormLabel>
                            <button type="button" @click="$emit('forgot-password')"
                                class="text-xs text-muted-foreground/60 hover:text-foreground transition-colors hover:cursor-pointer">
                                Forgot password?
                            </button>
                        </div>
                        <FormControl>
                            <Input type="password" placeholder="••••••••" v-bind="componentField"
                                autocomplete="current-password"
                                class="h-10 border-border bg-background/40 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all placeholder:text-muted-foreground/30" />
                        </FormControl>
                        <FormMessage class="text-[10px] font-medium text-destructive" />
                    </FormItem>
                </FormField>
            </CardContent>

            <CardFooter class="pt-6">
                <Button type="submit"
                    class="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98]"
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


defineEmits<{
    (e: 'forgot-password'): void
}>();


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
