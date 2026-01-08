<template>
    <Card class="border-border bg-card/90 backdrop-blur-xl shadow-none rounded-2xl overflow-hidden">
        <CardHeader class="space-y-1">
            <div class="mb-2">
                <button type="button" @click="$emit('back')"
                    class="group -ml-1 inline-flex items-center gap-1 px-1 py-1 text-muted-foreground/40 hover:text-foreground transition-colors hover:cursor-pointer">
                    <ChevronLeft class="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    <span class="text-[11px] font-bold uppercase tracking-widest">Back</span>
                </button>
            </div>

            <div v-if="!isSent">
                <CardTitle class="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
                <CardDescription class="text-muted-foreground text-xs">
                    Enter your email address and we'll send you a recovery link.
                </CardDescription>
            </div>
        </CardHeader>

        <div class="animate-in fade-in zoom-in-95 duration-500">
            <form v-if="!isSent" @submit.prevent="onSubmit">
                <CardContent class="flex flex-col gap-4">
                    <FormField v-slot="{ componentField }" name="email" :form="resetForm">
                        <FormItem>
                            <FormLabel class="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                                Email Address
                            </FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="name@example.com" v-bind="componentField"
                                    autocomplete="email"
                                    class="h-10 border-border bg-background/40 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all outline-none" />
                            </FormControl>
                            <FormMessage class="text-[10px] font-medium text-destructive" />
                        </FormItem>
                    </FormField>

                    <div class="flex min-h-16.25 justify-center py-2">
                        <div ref="turnstileElement" id="reset-turnstile-container" class="w-full"></div>
                    </div>
                </CardContent>

                <CardFooter class="pt-6">
                    <Button type="submit"
                        class="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all active:scale-[0.98] hover:cursor-pointer"
                        :disabled="isLoading || !isFormValid">
                        <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
                        <span class="font-bold">{{ isLoading ? 'Sending...' : 'Reset Password' }}</span>
                    </Button>
                </CardFooter>
            </form>

            <div v-else>
                <CardContent class="flex flex-col items-center justify-center pb-8 gap-4">
                    <div
                        class="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center border border-border shadow-none">
                        <MailCheck class="h-10 w-10 text-foreground" />
                    </div>

                    <div class="space-y-2 text-center">
                        <h3 class="text-lg font-bold text-foreground tracking-tight">Check Your Email</h3>
                        <p class="text-[12px] text-muted-foreground px-8 leading-relaxed">
                            We've sent a password reset link to your email. Please check your inbox and follow the
                            instructions to reset your password.
                        </p>
                    </div>
                </CardContent>
                <CardFooter class="pt-2">
                    <Button variant="outline"
                        class="w-full h-10 rounded-xl border-border bg-transparent hover:bg-muted/50 transition-all cursor-pointer"
                        @click="$emit('back')">
                        Back to Login
                    </Button>
                </CardFooter>
            </div>
        </div>
    </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { ChevronLeft, Loader2, MailCheck } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { sendResetEmail } from '@/services/auth';

defineEmits(['back']);

const isLoading = ref(false);
const isSent = ref(false);
const turnstileToken = ref('');
const turnstileElement = ref<HTMLElement | null>(null);
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

const resetSchema = toTypedSchema(z.object({
    email: z.string().email('Please enter a valid email address'),
}));

const resetForm = useForm({
    validationSchema: resetSchema,
    initialValues: { email: '' },
});

const isFormValid = computed(() => resetForm.meta.value.valid && !!turnstileToken.value);

const renderTurnstile = async () => {
    await nextTick();
    if (window.turnstile && turnstileElement.value) {
        window.turnstile.render(turnstileElement.value, {
            sitekey: turnstileSiteKey,
            theme: 'auto',
            callback: (token: string) => { turnstileToken.value = token; },
        });
    }
};

onMounted(() => renderTurnstile());

const onSubmit = resetForm.handleSubmit(async (values) => {
    isLoading.value = true;
    try {
        await sendResetEmail({
            email: values.email,
            turnstileToken: turnstileToken.value
        });

        isSent.value = true;
        toast.success('Password reset link sent.');
    } catch (error: any) {
        toast.error(error.message || 'Failed to send password reset email.');
        if (window.turnstile) window.turnstile.reset();
        turnstileToken.value = '';
    } finally {
        isLoading.value = false;
    }
});
</script>