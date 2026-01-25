<template>
    <div class="space-y-8">
        <div
            class="relative overflow-hidden rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-6 lg:p-8">

            <div class="flex items-start justify-between mb-8">
                <div class="space-y-1">
                    <p class="text-xs font-bold uppercase tracking-wider text-zinc-400">Current Plan</p>
                    <h3 class="text-2xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        {{ userStore.isPro ? 'Pro Plan' : 'Free Plan' }}
                    </h3>
                </div>
                <div class="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-zinc-400">
                    <CreditCard class="size-6" />
                </div>
            </div>

            <div v-if="userStore.isPro" class="space-y-8 animate-in fade-in duration-500">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-800">
                    <div class="space-y-1">
                        <p class="text-sm text-zinc-500">Next billing date</p>
                        <p class="font-semibold text-zinc-900 dark:text-zinc-100">February 21, 2026</p>
                    </div>
                    <div class="space-y-1">
                        <p class="text-sm text-zinc-500">Price</p>
                        <p class="font-semibold text-zinc-900 dark:text-zinc-100">$4.99 per month</p>
                    </div>
                </div>

                <div class="flex justify-end items-center gap-4">
                    <Button @click="handlePaddleManage"
                        class="rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold px-8 h-12 shadow-lg hover:opacity-90 transition-all">
                        Manage Subscription
                    </Button>
                </div>
            </div>

            <div v-else class="space-y-6 animate-in fade-in duration-500">
                <p class="text-sm text-zinc-500 max-w-sm leading-relaxed">
                    Upgrade to Pro for higher limits and reusable chat codes.
                </p>

                <div class="flex flex-col gap-2.5 max-w-xs">
                    <Button
                        class="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm px-6 transition-all active:scale-[0.98] border-none shadow-lg shadow-amber-500/20">
                        Upgrade to Pro — $4.99/mo
                    </Button>
                    <Button @click="router.push('/pricing')" variant="ghost"
                        class="w-full h-11 rounded-2xl text-zinc-500 font-bold px-6 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-xs">
                        Compare plans
                    </Button>
                </div>
            </div>

            <div class="absolute -right-8 -top-8 size-48 bg-amber-500/10 blur-[60px] -z-10" />
        </div>

        <div class="space-y-4">
            <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 pl-1">Billing History</h4>

            <div v-if="orders.length > 0"
                class="rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50">
                <table class="w-full text-sm text-left">
                    <thead class="bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-500 text-[11px] uppercase tracking-wider">
                        <tr>
                            <th class="px-6 py-3 font-bold">Date</th>
                            <th class="px-6 py-3 font-bold text-center">Amount</th>
                            <th class="px-6 py-3 font-bold text-right">Invoice</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
                        <tr v-for="order in orders" :key="order.id"
                            class="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                            <td class="px-6 py-4 text-zinc-600 dark:text-zinc-400 text-xs font-medium">{{ order.date }}
                            </td>
                            <td class="px-6 py-4 text-center font-bold text-zinc-900 dark:text-zinc-100 text-xs">{{
                                order.amount }}</td>
                            <td class="px-6 py-4 text-right">
                                <button
                                    class="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                                    <Download class="size-4" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-else class="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-12 text-center">
                <p class="text-xs text-zinc-400 italic">No billing history yet</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { CreditCard, Download } from 'lucide-vue-next';

const userStore = useUserStore();
const router = useRouter();

interface Order {
    id: number | string;
    date: string;
    amount: string;
    invoiceUrl?: string;
}

const orders = ref<Order[]>([]);

const handlePaddleManage = () => {
    console.log('Opening Paddle portal...');
};
</script>