<template>
    <div
        class="fixed inset-0 flex h-dvh w-full flex-col items-center overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors">
        <main class="flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-8 px-4">

            <div class="group cursor-default animate-in fade-in slide-in-from-bottom-4 duration-800">
                <Logo size="lg" :show-text="true"
                    class="transform transition-transform duration-500 group-hover:scale-105" />
            </div>

            <div class="relative min-h-110 w-full">
                <Transition appear mode="out-in" enter-active-class="animate-in fade-in zoom-in-95 duration-500"
                    leave-active-class="animate-out fade-out zoom-out-95 duration-500">
                    <Card v-if="isSuccess" key="success"
                        class="overflow-hidden rounded-4xl border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-2xl shadow-zinc-200/50 dark:shadow-none">
                        <CardContent class="flex flex-col items-center justify-center gap-6 py-12">
                            <div
                                class="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 shadow-inner">
                                <CheckCircle2 class="h-10 w-10 text-emerald-600 dark:text-emerald-500" />
                            </div>

                            <div class="space-y-2 text-center">
                                <h3 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                                    Password Reset Successful
                                </h3>
                                <p class="px-8 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                                    Your password is all set. Redirecting you to login in <span
                                        class="font-mono font-bold text-zinc-900 dark:text-zinc-100">{{ countdown
                                        }}</span> seconds…
                                </p>
                            </div>

                            <Button
                                class="mt-4 h-11 w-full rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 transition-all hover:opacity-90 active:scale-[0.98] font-semibold shadow-lg shadow-zinc-900/20"
                                @click="router.replace('/auth')">
                                Log In Now
                            </Button>
                        </CardContent>
                    </Card>

                    <Card v-else key="form"
                        class="overflow-hidden rounded-4xl border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-2xl shadow-zinc-200/50 dark:shadow-none">

                        <CardHeader class="space-y-1.5 pb-6">
                            <CardTitle class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Set a
                                New Password</CardTitle>
                            <CardDescription class="text-sm text-zinc-500 dark:text-zinc-400">
                                Choose a strong password you haven't used before.
                            </CardDescription>
                        </CardHeader>

                        <form @submit.prevent="onConfirmSubmit">
                            <CardContent class="flex flex-col gap-5">
                                <FormField v-slot="{ componentField }" name="password" :form="resetForm">
                                    <FormItem class="space-y-2">
                                        <FormLabel
                                            class="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-1">
                                            New Password
                                        </FormLabel>
                                        <FormControl>
                                            <div class="relative">
                                                <Input :type="showPassword ? 'text' : 'password'" placeholder="••••••••"
                                                    v-bind="componentField"
                                                    class="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 pr-11 outline-none transition-all focus-visible:ring-zinc-200 dark:focus-visible:ring-zinc-800 focus-visible:ring-offset-0" />
                                                <button type="button"
                                                    class="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                                                    @click="showPassword = !showPassword">
                                                    <Eye v-if="!showPassword" class="h-4.5 w-4.5" />
                                                    <EyeOff v-else class="h-4.5 w-4.5" />
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage class="text-xs font-medium text-red-500/90 ml-1" />
                                    </FormItem>
                                </FormField>

                                <div class="flex min-h-16.25 justify-center py-2">
                                    <div ref="turnstileElement" id="reset-confirm-turnstile" class="w-full"></div>
                                </div>
                            </CardContent>

                            <CardFooter class="pt-2 pb-8">
                                <Button type="submit"
                                    class="h-12 w-full rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 shadow-xl shadow-zinc-950/10 dark:shadow-none transition-all hover:opacity-90 active:scale-[0.98] font-bold"
                                    :disabled="isLoading || !isFormValid">
                                    <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
                                    <span v-else>Update Password</span>
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </Transition>
            </div>
        </main>

        <Footer />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { toast } from 'vue-sonner';

import {
    Eye,
    EyeOff,
    Loader2,
    CheckCircle2
} from 'lucide-vue-next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import Logo from '@/components/Logo.vue';
import Footer from '@/components/Footer.vue';

import { resetPasswordConfirm } from '@/services/auth';

const route = useRoute();
const router = useRouter();

const isLoading = ref(false);
const isSuccess = ref(false);
const showPassword = ref(false);
const countdown = ref(5);

const token = computed(() => (route.query.token as string) || '');

const resetSchema = toTypedSchema(
    z.object({
        password: z.string()
            .min(6, 'Password is too short (min 6 characters)')
            .max(50, 'Password is too long (max 50 characters)'),
    })
);

const resetForm = useForm({
    validationSchema: resetSchema,
    initialValues: { password: '' },
});

const isFormValid = computed(() =>
    resetForm.meta.value.valid &&
    !!turnstileToken.value &&
    !!token.value
);

const turnstileToken = ref('');
const turnstileElement = ref<HTMLElement | null>(null);
const turnstileWidgetId = ref<string | null>(null);

const renderTurnstile = async () => {
    if (isSuccess.value) return;

    await nextTick();
    const container = turnstileElement.value || document.getElementById('reset-confirm-turnstile');

    if (container && window.turnstile) {
        if (turnstileWidgetId.value) {
            try {
                window.turnstile.remove(turnstileWidgetId.value);
                turnstileWidgetId.value = null;
            } catch (e) {
                console.warn('Turnstile remove failed:', e);
            }
        }

        try {
            turnstileWidgetId.value = window.turnstile.render(container, {
                sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
                theme: 'auto',
                size: 'flexible',
                callback: (t: string) => {
                    turnstileToken.value = t;
                },
                'error-callback': () => {
                    setTimeout(renderTurnstile, 2000);
                }
            });
        } catch (e) {
            console.error('Turnstile render execution failed:', e);
            setTimeout(renderTurnstile, 250);
        }
    } else {
        setTimeout(renderTurnstile, 100);
    }
};

onMounted(() => {
    if (!token.value) {
        toast.error('This reset link is invalid or has expired.');
        router.replace('/auth');
        return;
    }
    renderTurnstile();
});

onUnmounted(() => {
    if (turnstileWidgetId.value && window.turnstile) {
        window.turnstile.remove(turnstileWidgetId.value);
    }
});

const startCountdown = () => {
    const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
            clearInterval(timer);
            router.replace('/auth');
        }
    }, 1000);
};

const onConfirmSubmit = resetForm.handleSubmit(async (values) => {
    isLoading.value = true;
    try {
        await resetPasswordConfirm({
            token: token.value,
            newPassword: values.password,
            turnstileToken: turnstileToken.value
        });

        isSuccess.value = true;
        toast.success('Password reset successfully. You can now sign in.');
        startCountdown();
    } catch (error: any) {
        toast.error(error.message || 'Something went wrong. Please try again.');
        if (window.turnstile && turnstileWidgetId.value) {
            window.turnstile.reset(turnstileWidgetId.value);
        }
        turnstileToken.value = '';
    } finally {
        isLoading.value = false;
    }
});
</script>