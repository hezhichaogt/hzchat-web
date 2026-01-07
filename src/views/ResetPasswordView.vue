<template>
    <div class="fixed inset-0 flex h-dvh w-full flex-col items-center overflow-hidden bg-zinc-50/50">
        <main class="flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-6 px-4">

            <div class="group cursor-default animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <Logo size="lg" :show-text="true"
                    class="transform transition-transform duration-500 group-hover:scale-105" />
            </div>

            <div class="relative min-h-110 w-full">
                <Transition appear mode="out-in" enter-active-class="animate-in fade-in zoom-in-95 duration-300"
                    leave-active-class="animate-out fade-out zoom-out-95 duration-200">
                    <Card v-if="isSuccess" key="success"
                        class="overflow-hidden rounded-2xl border-zinc-200/60 shadow-2xl shadow-zinc-200/30">
                        <CardContent class="flex flex-col items-center justify-center gap-4 py-10">
                            <div
                                class="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 shadow-sm">
                                <CheckCircle2 class="h-10 w-10 text-emerald-600" />
                            </div>

                            <div class="space-y-2 text-center">
                                <h3 class="text-lg font-semibold tracking-tight text-zinc-900">Password Reset Successful
                                </h3>
                                <p class="px-8 text-[12px] leading-relaxed text-zinc-500">
                                    Your password is all set. Redirecting you to login in {{ countdown }} seconds…
                                </p>
                            </div>

                            <Button class="mt-4 h-10 w-full rounded-full bg-zinc-950 transition-all hover:bg-zinc-800"
                                @click="router.replace('/auth')">
                                Log In Now
                            </Button>
                        </CardContent>
                    </Card>

                    <Card v-else key="form"
                        class="overflow-hidden rounded-2xl border-zinc-200/60 shadow-2xl shadow-zinc-200/30">
                        <CardHeader class="space-y-1">
                            <CardTitle class="text-2xl font-bold tracking-tight">Set a New Password</CardTitle>
                            <CardDescription class="text-xs text-zinc-500">
                                Choose a strong password you haven't used before.
                            </CardDescription>
                        </CardHeader>

                        <form @submit.prevent="onConfirmSubmit">
                            <CardContent class="flex flex-col gap-4">
                                <FormField v-slot="{ componentField }" name="password" :form="resetForm">
                                    <FormItem>
                                        <FormLabel class="text-xs font-bold uppercase tracking-widest text-zinc-500/90">
                                            New Password
                                        </FormLabel>
                                        <FormControl>
                                            <div class="relative">
                                                <Input :type="showPassword ? 'text' : 'password'" placeholder="••••••••"
                                                    v-bind="componentField"
                                                    class="h-10 border-zinc-200 bg-white/50 pr-10 outline-none transition-all focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:ring-offset-2" />
                                                <button type="button"
                                                    class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-900"
                                                    @click="showPassword = !showPassword">
                                                    <Eye v-if="!showPassword" class="h-4 w-4" />
                                                    <EyeOff v-else class="h-4 w-4" />
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage class="text-[10px] font-medium text-red-500/80" />
                                    </FormItem>
                                </FormField>

                                <div class="flex min-h-16.25 justify-center py-2">
                                    <div ref="turnstileElement" id="reset-confirm-turnstile" class="w-full"></div>
                                </div>
                            </CardContent>

                            <CardFooter class="pt-2">
                                <Button type="submit"
                                    class="h-10 w-full rounded-full bg-zinc-950 text-white shadow-lg shadow-zinc-950/20 transition-all hover:bg-zinc-800 hover:cursor-pointer active:scale-[0.98]"
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