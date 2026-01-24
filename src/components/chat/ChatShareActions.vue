<template>
    <div class="flex items-center">
        <DropdownMenu>
            <DropdownMenuTrigger as-child>
                <slot name="trigger">
                    <Button variant="ghost" size="sm" title="Share"
                        class="gap-1.5 rounded text-muted-foreground hover:text-foreground">
                        <Share2 class="size-4" />
                        <span v-if="showText" class="font-bold text-xs uppercase tracking-wider">Share</span>
                    </Button>
                </slot>
            </DropdownMenuTrigger>

            <DropdownMenuContent :align="align" :side-offset="8"
                class="w-56 p-1.5 shadow-xl border border-border bg-background z-50">
                <DropdownMenuLabel
                    class="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2.5 py-2">
                    Share Options
                </DropdownMenuLabel>

                <DropdownMenuItem @click="copyToClipboard(code, 'Code copied')"
                    class="gap-2.5 px-2.5 py-3 cursor-pointer rounded-lg transition-colors focus:bg-muted">
                    <Copy class="h-4 w-4 text-muted-foreground" />
                    <span class="text-sm font-medium">Copy Chat Code</span>
                </DropdownMenuItem>

                <DropdownMenuItem @click="copyToClipboard(fullUrl, 'Full link copied')"
                    class="gap-2.5 px-2.5 py-3 cursor-pointer rounded-lg transition-colors focus:bg-muted">
                    <Link2 class="h-4 w-4 text-muted-foreground" />
                    <span class="text-sm font-medium">Copy Full Link</span>
                </DropdownMenuItem>

                <DropdownMenuItem @click="showQrModal = true"
                    class="gap-2.5 px-2.5 py-3 cursor-pointer rounded-lg transition-colors focus:bg-muted">
                    <QrCode class="h-4 w-4 text-muted-foreground" />
                    <span class="text-sm font-medium">Show QR Code</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <Dialog v-model:open="showQrModal">
            <DialogContent class="sm:max-w-90 p-0 overflow-hidden border-border bg-background shadow-2xl">
                <DialogHeader class="p-6 pb-0">
                    <DialogTitle class="text-center flex flex-col items-center gap-2">
                        <div class="p-2 bg-muted rounded-full text-foreground">
                            <QrCode class="w-5 h-5" />
                        </div>
                        <span>Scan to Join Chat</span>
                    </DialogTitle>
                    <DialogDescription class="text-center text-xs">
                        Scan this code to join the chat: <span class="font-mono font-bold text-foreground">{{ code
                            }}</span>
                    </DialogDescription>
                </DialogHeader>

                <div class="flex flex-col items-center justify-center p-8 gap-8">
                    <div :id="`qr-container-${code}`" class="p-4 bg-white rounded-2xl border border-border/10">
                        <QrcodeCanvas :value="fullUrl" :size="200" level="H" background="#ffffff"
                            foreground="#18181b" />
                    </div>
                    <Button @click="downloadQr" class="w-full gap-2 rounded-xl h-12 font-bold">
                        <Download class="h-4 w-4" />
                        Save QR Code
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { QrcodeCanvas } from 'qrcode.vue';
import { toast } from 'vue-sonner';
import { Share2, Link2, QrCode, Copy, Download } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu';

const props = withDefaults(defineProps<{
    code: string;
    align?: 'start' | 'center' | 'end';
    showText?: boolean;
}>(), {
    align: 'end',
    showText: false,
});

const showQrModal = ref(false);
const BASE_URL = import.meta.env.VITE_BASE_URL || window.location.origin;
const fullUrl = computed(() => `${BASE_URL}/${props.code}`);

const copyToClipboard = async (text: string, msg: string) => {
    try {
        await navigator.clipboard.writeText(text);
        toast.success(msg);
    } catch (err) {
        toast.error('Failed to copy');
    }
};

const downloadQr = () => {
    const container = document.getElementById(`qr-container-${props.code}`);
    const canvas = container?.querySelector('canvas');
    if (canvas) {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `chat-${props.code}-qr.png`;
        link.click();
        toast.success('QR Code saved');
    }
};
</script>