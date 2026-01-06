<template>
    <Dialog v-model:open="isOpen">
        <DialogTrigger as-child>
            <slot>
                <Button variant="ghost" size="sm"
                    class="ml-1 h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all hover:cursor-pointer group/btn">
                    {{ triggerContent }}
                    <ChevronRight
                        class="ml-0.5 size-3.5 opacity-50 transition-transform group-hover/btn:translate-x-0.5" />
                </Button>
            </slot>
        </DialogTrigger>

        <DialogContent class="sm:max-w-106">
            <DialogHeader>
                <DialogTitle>{{ dialogTitle }}</DialogTitle>
                <DialogDescription>{{ dialogDescription }}</DialogDescription>
            </DialogHeader>

            <div v-if="step === 'MANAGEMENT'" class="py-6 flex flex-col items-center justify-center gap-4">
                <div class="flex w-full items-center gap-3 px-4 py-3 bg-muted/30 border border-border/50 rounded-lg">
                    <div class="p-2 bg-background rounded-md shadow-sm border border-border/20">
                        <Mail class="size-4 text-muted-foreground" />
                    </div>
                    <div class="flex flex-col">
                        <span class="text-xs text-muted-foreground leading-none mb-1">Current Email</span>
                        <span class="text-sm font-semibold tracking-tight">{{ props.email }}</span>
                    </div>
                </div>

                <div class="mt-2 flex w-full gap-2">
                    <Button variant="outline" class="flex-1 rounded-full" @click="enterForm('BIND')">
                        Update Email
                    </Button>
                    <Button variant="destructive" class="flex-1 rounded-full" @click="enterForm('UNBIND')">
                        Remove Email
                    </Button>
                </div>
            </div>

            <form v-show="step === 'FORM'" @submit="handleFormSubmit" class="grid gap-6 py-4">
                <FormField v-slot="{ componentField }" name="password">
                    <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="Enter your current password" v-bind="componentField"
                                autocomplete="current-password" />
                        </FormControl>
                    </FormItem>
                </FormField>

                <FormField v-if="mode === 'BIND'" v-slot="{ componentField }" name="email">
                    <FormItem>
                        <FormLabel>New Email Address</FormLabel>
                        <FormControl>
                            <Input placeholder="name@example.com" v-bind="componentField" autocomplete="email" />
                        </FormControl>
                    </FormItem>
                </FormField>

                <div v-if="mode === 'BIND'" class="flex min-h-16.25 justify-center py-2">
                    <div ref="turnstileElement" id="turnstile-container" class="w-full"></div>
                </div>

                <DialogFooter class="mt-4">
                    <Button type="button" variant="ghost" class="rounded-full" @click="backToPrev">
                        Back
                    </Button>
                    <Button type="submit" :disabled="isLoading || !isFormValid" class="rounded-full">
                        <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
                        {{ mode === 'BIND' ? 'Send Verification Code' : 'Confirm Remove' }}
                    </Button>
                </DialogFooter>
            </form>

            <div v-show="step === 'OTP'" class="flex flex-col items-center gap-6 py-4">
                <p class="text-center text-xs text-muted-foreground">
                    Sent to {{ form.values.email }}
                </p>

                <FormField v-slot="{ value, handleChange }" name="code">
                    <FormItem class="flex flex-col items-center">
                        <FormControl>
                            <InputOTP :model-value="value" :maxlength="6" @update:model-value="handleChange"
                                @complete="handleVerify">
                                <InputOTPGroup>
                                    <InputOTPSlot :index="0" />
                                    <InputOTPSlot :index="1" />
                                    <InputOTPSlot :index="2" />
                                    <InputOTPSlot :index="3" />
                                    <InputOTPSlot :index="4" />
                                    <InputOTPSlot :index="5" />
                                </InputOTPGroup>
                            </InputOTP>
                        </FormControl>
                    </FormItem>
                </FormField>

                <Button variant="link" class="text-xs hover:cursor-pointer" :disabled="isLoading"
                    @click="handleResendCode">
                    Didn't receive a code? Go back and resend
                </Button>
            </div>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { useForm } from 'vee-validate';
import { toast } from 'vue-sonner';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot
} from '@/components/ui/input-otp';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel
} from '@/components/ui/form';

import { Loader2, ChevronRight, Mail } from 'lucide-vue-next';

import { useUserStore } from '@/stores/user';
import {
    sendEmailCode,
    bindEmail,
    unbindEmail
} from '@/services/user';
import { maskEmail } from '@/utils/maskEmail';


const props = defineProps<{ email?: string | null }>();

type Step = 'MANAGEMENT' | 'FORM' | 'OTP';
type Mode = 'BIND' | 'UNBIND';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const userStore = useUserStore();
const isOpen = ref(false);
const isLoading = ref(false);
const step = ref<Step>(props.email ? 'MANAGEMENT' : 'FORM');
const mode = ref<Mode>('BIND');

const turnstileToken = ref('');
const turnstileWidgetId = ref<string | null>(null);
const turnstileElement = ref<HTMLElement | null>(null);
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

const renderTurnstile = async () => {
    if (!isOpen.value || mode.value !== 'BIND') return;

    await nextTick();
    const container = turnstileElement.value || document.getElementById('turnstile-container');

    if (container && window.turnstile) {
        if (turnstileWidgetId.value) {
            window.turnstile.remove(turnstileWidgetId.value);
            turnstileWidgetId.value = null;
        }

        try {
            turnstileWidgetId.value = window.turnstile.render(container, {
                sitekey: turnstileSiteKey,
                theme: 'auto',
                size: 'flexible',
                callback: (token: string) => {
                    turnstileToken.value = token;
                }
            });
        } catch (e) {
            console.error('Turnstile render execution failed:', e);
        }
    } else {
        setTimeout(renderTurnstile, 100);
    }
};

const form = useForm({
    initialValues: {
        password: '',
        email: '',
        code: '',
    },
});

const isFormValid = computed(() => {
    const { password, email } = form.values;

    if (mode.value === 'UNBIND') {
        return !!password && password.length >= 6;
    }

    return !!password && password.length >= 6 && !!email && !!turnstileToken.value;
});

const triggerContent = computed(() => (
    props.email && props.email.trim() !== '' ? props.email : 'Add email'
));

const dialogTitle = computed(() => {
    if (step.value === 'MANAGEMENT') return 'Email';
    if (step.value === 'OTP') return 'Verify Email';
    return mode.value === 'BIND' ? 'Add Email' : 'Remove Email';
});

const dialogDescription = computed(() => {
    if (step.value === 'MANAGEMENT') return 'Manage your email for account security.';
    if (step.value === 'OTP') return 'Enter the 6-digit code sent to your email.';
    if (mode.value === 'UNBIND') return 'Confirm your password to remove this email.';
    return 'Enter your password and the email address you want to add.';
});

const enterForm = (m: Mode) => {
    mode.value = m;
    step.value = 'FORM';
    if (m === 'BIND') {
        nextTick(() => renderTurnstile());
    }
};

const backToPrev = () => {
    if (step.value === 'OTP') {
        step.value = 'FORM';
    } else if (props.email) {
        step.value = 'MANAGEMENT';
    } else {
        isOpen.value = false;
    }
};

watch(isOpen, (val) => {
    if (!val) {
        step.value = props.email ? 'MANAGEMENT' : 'FORM';
        form.resetForm();
        turnstileToken.value = '';
        if (turnstileWidgetId.value) {
            window.turnstile.reset(turnstileWidgetId.value);
        }
    }
});

watch([isOpen, step, mode], ([newOpen, newStep, newMode]) => {
    if (newOpen && newStep === 'FORM' && newMode === 'BIND') {
        setTimeout(() => renderTurnstile(), 100);
    }
}, { immediate: false });

const handleFormSubmit = form.handleSubmit(async (values) => {
    if (!values.password || values.password.length < 6) {
        toast.error('Please enter your password.');
        return;
    }

    isLoading.value = true;

    try {
        if (mode.value === 'UNBIND') {
            await unbindEmail({ password: values.password });
            userStore.updateProfile({ ...userStore.profile, email: '' })
            toast.success('Your email has been removed.');
            isOpen.value = false;
        } else if (step.value === 'FORM') {
            if (!values.email || !EMAIL_REGEX.test(values.email)) {
                toast.error('Please enter a valid email address.');
                return;
            }

            if (!turnstileToken.value) {
                toast.error('Please complete the security check.');
                return;
            }

            await sendEmailCode({
                email: values.email,
                password: values.password,
                turnstileToken: turnstileToken.value
            });

            toast.success("We've sent a verification code to your email.");
            step.value = 'OTP';
        }
    } catch (error: any) {
        toast.error(error.message || 'Something went wrong. Please try again.');
        if (turnstileWidgetId.value) window.turnstile.reset(turnstileWidgetId.value);
        turnstileToken.value = '';
    } finally {
        isLoading.value = false;
    }
});

const handleResendCode = () => {
    step.value = 'FORM';
    turnstileToken.value = '';
    toast.info('Please complete the form again to get a new code.');
};

const handleVerify = async () => {
    const code = form.values.code;
    if (!code || code.length !== 6) {
        toast.error('Please enter the 6-digit code.');
        return;
    }

    isLoading.value = true;
    try {
        const targetEmail = form.values.email!;
        await bindEmail({
            email: targetEmail,
            code: code,
        });
        userStore.updateProfile({ ...userStore.profile, email: maskEmail(targetEmail) })
        toast.success('Email verified successfully.');
        isOpen.value = false;
    } catch (error: any) {
        toast.error(error.message || 'The verification code is incorrect or has expired.');
        form.setFieldValue('code', '');
    } finally {
        isLoading.value = false;
    }
};
</script>
