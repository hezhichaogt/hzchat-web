<template>
    <Transition name="slide-down" mode="out-in">
        <div v-if="currentNotice" :key="currentNotice.id" :class="[
            'sticky top-0 z-20 w-full border-b backdrop-blur-md px-4 py-2 transition-all duration-300',
            themeConfigs[activeTheme].containerClass
        ]">
            <div class="max-w-5xl mx-auto flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 text-sm font-medium" :class="themeConfigs[activeTheme].textClass">
                    <component :is="themeConfigs[activeTheme].icon" class="w-4 h-4" />
                    <div class="flex-1">
                        <span>{{ displayContent }}</span>
                        <span v-if="currentNotice.type === 'ROOM_EXPIRING' && remainingSeconds > 0"
                            class="ml-1 font-mono font-bold">
                            [{{ remainingSeconds }}s]
                        </span>
                    </div>
                </div>

                <button @click="handleManualClose" class="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                    <X class="w-4 h-4 opacity-60" />
                </button>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { AlertCircle, Megaphone, AlertTriangle, X } from 'lucide-vue-next';
import type { RoomExpiringPayload, ServerMessage } from '@/types/chat';

const props = defineProps<{
    notifications: ServerMessage[];
}>();

const emit = defineEmits<{
    (e: 'close', id: string): void;
    (e: 'room-expired'): void;
}>();

const NOTIFICATION_CONFIG: Record<string, { theme: 'info' | 'warning' | 'danger', ttl: number }> = {
    'ROOM_EXPIRING': { theme: 'warning', ttl: 60 },
    'DEFAULT': { theme: 'info', ttl: 5 }
};

const internalNow = ref(Date.now());
let timer: number | undefined;

const currentNotice = computed(() => props.notifications[0] || null);

const activeTheme = computed(() => {
    const type = currentNotice.value?.type || 'DEFAULT';
    return NOTIFICATION_CONFIG[type]?.theme || 'info';
});

const EXPIRING_REASONS: Record<string, string> = {
    'deadline': 'This chat has reached its maximum lifetime and will close soon.',
    'inactivity': 'This chat has been inactive and will close soon.',
    'manual': 'The owner has chosen to close this chat. It will close shortly.'
};

const displayContent = computed(() => {
    if (!currentNotice.value) return '';

    const { type, payload } = currentNotice.value;

    if (type === 'ROOM_EXPIRING') {
        const reason = (payload as RoomExpiringPayload).reason || 'deadline';
        const reasonText = EXPIRING_REASONS[reason] || 'This room will close soon.';
        return reasonText;
    }

    return (payload as any).content || 'You have a new notification.';
});

const remainingSeconds = computed(() => {
    if (!currentNotice.value) return 0;

    const config = NOTIFICATION_CONFIG[currentNotice.value.type] || { theme: 'info', ttl: 5 };
    const expiresAt = currentNotice.value.timestamp + (config.ttl * 1000);
    return Math.max(0, Math.floor((expiresAt - internalNow.value) / 1000));
});

watch(internalNow, (currentTime) => {
    if (props.notifications.length === 0) return;

    props.notifications.forEach(msg => {
        const config = NOTIFICATION_CONFIG[msg.type] || { theme: 'info', ttl: 5 };
        const expiresAt = msg.timestamp + (config.ttl * 1000);

        if (currentTime >= expiresAt) {
            emit('close', msg.id);
        }
    });
});

const handleManualClose = () => {
    if (currentNotice.value) emit('close', currentNotice.value.id);
};

onMounted(() => {
    timer = window.setInterval(() => { internalNow.value = Date.now(); }, 1000);
});

onUnmounted(() => { if (timer) clearInterval(timer); });

const themeConfigs = {
    danger: { containerClass: 'bg-red-50 border-red-200 text-red-800', icon: AlertCircle, textClass: 'text-red-800 dark:text-red-200' },
    warning: { containerClass: 'bg-amber-50 border-amber-200 text-amber-800', icon: AlertTriangle, textClass: 'text-amber-800 dark:text-amber-200' },
    info: { containerClass: 'bg-blue-50 border-blue-200 text-blue-800', icon: Megaphone, textClass: 'text-blue-800 dark:text-blue-200' }
};
</script>