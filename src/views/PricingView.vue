<template>
    <div
        class="flex-1 flex flex-col items-center w-full max-w-5xl mx-auto py-6 lg:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

        <div class="text-center mb-16 space-y-4">
            <h2 class="text-[10px] font-black tracking-[0.4em] uppercase text-foreground/30 mb-4">Pricing Plans</h2>
            <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tighter leading-tight text-foreground">
                Private Conversations. <br />
                <span class="text-primary">On Your Terms.</span>
            </h1>
            <p class="text-base sm:text-lg text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
                Choose the plan that matches your workflow. <br class="hidden sm:block" />
                Zero tracking. No logs. Total control.
            </p>

            <div class="flex items-center justify-center pt-8">
                <div class="bg-muted/50 p-1 rounded-2xl flex items-center gap-1 border border-foreground/5">
                    <button @click="billingCycle = 'monthly'" :class="[
                        'px-6 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all',
                        billingCycle === 'monthly' ? 'bg-background text-foreground shadow-sm' : 'text-foreground/40 hover:text-foreground/70'
                    ]">
                        Monthly
                    </button>
                    <button @click="billingCycle = 'yearly'" :class="[
                        'px-6 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2',
                        billingCycle === 'yearly' ? 'bg-background text-foreground shadow-sm' : 'text-foreground/40 hover:text-foreground/70'
                    ]">
                        Yearly
                        <span class="bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded-md">-16%</span>
                    </button>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4 items-stretch">
            <div class="flex flex-col p-8 rounded-4xl border border-slate-100 bg-white shadow-sm transition-all
                dark:border-zinc-700 dark:bg-zinc-950">
                <div class="mb-8">
                    <h3 class="text-lg font-bold tracking-tight mb-2 text-slate-800 dark:text-zinc-300">Guest</h3>
                    <div class="flex items-baseline gap-1 text-slate-700 dark:text-zinc-400">
                        <span class="text-4xl font-black tracking-tighter">$0</span>
                        <span class="text-[11px] font-black uppercase tracking-widest">/ forever</span>
                    </div>
                </div>

                <ul class="space-y-4 mb-10 flex-1">
                    <li v-for="f in guestFeatures" :key="f"
                        class="flex items-start gap-3 text-sm text-slate-600 font-medium dark:text-zinc-500">
                        <Check class="size-4 mt-0.5 text-slate-300 dark:text-zinc-700" />
                        <span>{{ f }}</span>
                    </li>
                </ul>

                <Button variant="outline" disabled class="w-full h-14 rounded-2xl border-slate-200 text-slate-900 font-black uppercase text-[10px] tracking-[0.2em]
                   dark:border-zinc-800 dark:text-zinc-300">
                    {{ userStore.isLoggedIn ? 'Free Forever' : 'Current Plan' }}
                </Button>
            </div>

            <div class="flex flex-col p-8 rounded-4xl border border-slate-300 bg-white transition-all shadow-sm
                dark:border-zinc-500 dark:bg-zinc-950">
                <div class="mb-8 text-left">
                    <h3 class="text-lg font-bold tracking-tight mb-2 text-slate-900 dark:text-zinc-200">Member</h3>
                    <div class="flex items-baseline gap-1 text-slate-800 dark:text-zinc-300">
                        <span class="text-4xl font-black tracking-tighter">$0</span>
                        <span
                            class="text-slate-500 text-[11px] font-black uppercase tracking-widest dark:text-zinc-400">/
                            forever</span>
                    </div>
                </div>

                <ul class="space-y-4 mb-10 flex-1 text-left">
                    <li v-for="f in standardFeatures" :key="f"
                        class="flex items-start gap-3 text-sm text-slate-700 font-bold dark:text-zinc-300">
                        <Check class="size-4 mt-0.5 text-slate-400 dark:text-zinc-500" />
                        <span>{{ f }}</span>
                    </li>
                </ul>

                <Button variant="outline" :disabled="userStore.isLoggedIn" :class="[
                    'w-full h-14 rounded-2xl border-slate-900 text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] transition-all dark:border-zinc-100 dark:text-zinc-100',
                    !userStore.isLoggedIn ? 'hover:bg-slate-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900' : 'opacity-50 cursor-not-allowed'
                ]" @click="!userStore.isLoggedIn && $router.push('/auth')">
                    <template v-if="!userStore.isLoggedIn">
                        Join to Upgrade
                    </template>
                    <template v-else-if="userStore.isMember">
                        Current Plan
                    </template>
                    <template v-else-if="userStore.isPro">
                        Free Forever
                    </template>
                </Button>
            </div>

            <div class="relative flex flex-col p-8 rounded-4xl border-2 border-primary bg-background shadow-2xl shadow-primary/10 z-10 overflow-hidden 
                dark:bg-zinc-950 dark:shadow-primary/5">
                <div class="absolute top-0 right-0">
                    <div
                        class="bg-primary text-primary-foreground px-4 py-1.5 rounded-bl-2xl font-black text-[9px] uppercase tracking-[0.15em]">
                        Recommended
                    </div>
                </div>

                <div class="mb-8 text-left">
                    <h3 class="text-lg font-bold tracking-tight mb-2 dark:text-slate-50">Pro</h3>
                    <div class="flex items-baseline gap-2">
                        <div class="flex items-baseline gap-1">
                            <span class="text-4xl font-black tracking-tighter tabular-nums dark:text-slate-100">
                                ${{ billingCycle === 'monthly' ? '4.99' : '49.99' }}
                            </span>
                            <span
                                class="text-muted-foreground text-[11px] font-black uppercase tracking-widest dark:text-zinc-400">
                                / {{ billingCycle === 'monthly' ? 'mo' : 'yr' }}
                            </span>
                        </div>

                        <Transition enter-active-class="transition-all duration-500 ease-out"
                            enter-from-class="opacity-0 -translate-x-4" enter-to-class="opacity-100 translate-x-0"
                            leave-active-class="transition-all duration-300 ease-in"
                            leave-from-class="opacity-100 translate-x-0" leave-to-class="opacity-0 translate-x-2">
                            <div v-if="billingCycle === 'yearly'"
                                class="bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 px-2 py-1 rounded-full shrink-0 leading-none">
                                <span
                                    class="text-[8px] font-black uppercase tracking-widest whitespace-nowrap leading-none">
                                    2 Months Free
                                </span>
                            </div>
                        </Transition>
                    </div>
                </div>

                <ul class="space-y-4 mb-10 flex-1 text-left">
                    <li v-for="feature in proFeatures" :key="feature"
                        class="flex items-start gap-3 text-sm font-bold text-foreground/90 dark:text-zinc-200">
                        <Sparkles class="size-4 mt-0.5 text-primary/80" />
                        <span>{{ feature }}</span>
                    </li>
                </ul>

                <Button @click="!userStore.isPro && handleUpgrade()" :disabled="isBusy || userStore.isPro" :class="[
                    'w-full h-14 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all duration-300',
                    userStore.isPro
                        ? 'bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-100 cursor-not-allowed shadow-none border border-slate-900 dark:border-slate-100'
                        : 'text-primary-foreground bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'
                ]">
                    <Loader2 v-if="isBusy" class="size-4 animate-spin mr-2" />
                    <span v-else>
                        {{ userStore.isPro ? 'Current Plan' : 'Get Pro Now' }}
                    </span>
                </Button>
            </div>
        </div>

        <div class="mt-20 text-center space-y-4">
            <p class="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">Secure Payment via Paddle
            </p>
            <div class="flex items-center justify-center gap-6 grayscale opacity-30">
                <CreditCard class="size-5" />
                <span class="font-mono text-[10px] font-bold tracking-tighter italic">VISA</span>
                <span class="font-mono text-[10px] font-bold tracking-tighter italic">MASTERCARD</span>
                <span class="font-mono text-[10px] font-bold tracking-tighter italic">PAYPAL</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Loader2, CreditCard } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

const billingCycle = ref<'monthly' | 'yearly'>('monthly');
const isBusy = ref(false);

const guestFeatures = [
    '5 Users / Chat',
    '2MB File Limit',
    '10 Uploads / Day',
    '1 Created Chat',
    'Random ChatCodes'
];

const standardFeatures = [
    '15 Users / Chat',
    '10MB File Limit',
    '40 Uploads / Day',
    '3 Created Chats',
    'Random ChatCodes'
];

const proFeatures = [
    '100 Users / Chat',
    '100MB File Limit',
    '200 Uploads / Day',
    '20 Created Chats',
    '10 Fixed ChatCode Slots',
    'Advanced Chat Management'
];

const handleUpgrade = async () => {
    toast.info('TODO...');
};
</script>

<style scoped>
.transition-fluid {
    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}
</style>