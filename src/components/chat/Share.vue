<template>
    <div>
        <n-dropdown trigger="click" :options="shareOptions" placement="bottom-end" @select="handleShareSelect">
            <n-button size="small" :quaternary="!props.showText">
                <template #icon>
                    <n-icon :component="ShareOutline" size="20" />
                </template>

                {{ showText ? 'Share' : '' }}
            </n-button>
        </n-dropdown>

        <n-modal v-model:show="showQrCodeModal" preset="card" :style="modalStyle" title="Share Chat QR Code">
            <div class="qr-code-modal-content">
                <n-qr-code :value="`${BASE_URL}/chat/${props.code}`" :size="qrCodeSize" :padding="0.5"
                    icon-src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PHBhdGggZD0iTTE5NC44MiA0OTZhMTguMzYgMTguMzYgMCAwIDEtMTguMS0yMS41M3YtLjExTDIwNC44MyAzMjBIOTZhMTYgMTYgMCAwIDEtMTIuNDQtMjYuMDZMMzAyLjczIDIzYTE4LjQ1IDE4LjQ1IDAgMCAxIDMyLjggMTMuNzFjMCAuMy0uMDguNTktLjEzLjg5TDMwNy4xOSAxOTJINDE2YTE2IDE2IDAgMCAxIDEyLjQ0IDI2LjA2TDIwOS4yNCA0ODlhMTguNDUgMTguNDUgMCAwIDEtMTQuNDIgN3oiIGZpbGw9ImN1cnJlbnRDb2xvciI+PC9wYXRoPjwvc3ZnPg=="
                    :icon-size="qrCodeSize * 0.44" error-correction-level="Q" id="qrcode-canvas" />

                <n-button type="primary" @click="downloadQrCode">
                    <template #icon>
                        <n-icon :component="DownloadOutline" />
                    </template>
                    Download QR Code Image
                </n-button>
            </div>
        </n-modal>
    </div>
</template>

<script setup lang="ts">
//
// Share.vue
//
// Chat session sharing component, providing various ways to share the session 
// including copying the link/code, and generating/downloading a QR code.
//

import { h, ref, computed } from 'vue';
import { NDropdown, NButton, NIcon, NModal, NQrCode, type DropdownOption, useMessage } from 'naive-ui';
import { ClipboardOutline, QrCodeOutline, GlobeOutline, DownloadOutline, ShareOutline } from '@vicons/ionicons5';

const props = defineProps<{
    code: string | null;
    showText?: boolean;
}>();

const message = useMessage();

const showQrCodeModal = ref(false);

const BASE_URL = import.meta.env.VITE_BASE_URL || window.location.origin;

const qrCodeSize = computed(() => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 400) {
        return 120;
    }
    return 150;
});

const modalStyle = computed(() => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 400) {
        return { width: '90%', maxWidth: '300px' };
    }
    return { width: '350px' };
});

const shareOptions: DropdownOption[] = [
    {
        label: 'Copy Chat Code',
        key: 'code',
        icon: () => h(NIcon, null, { default: () => h(ClipboardOutline) })
    },
    {
        label: 'Copy Full Link',
        key: 'url',
        icon: () => h(NIcon, null, { default: () => h(GlobeOutline) })
    },
    {
        label: 'Generate QR Code',
        key: 'qrcode',
        icon: () => h(NIcon, null, { default: () => h(QrCodeOutline) })
    }
];

const copyToClipboard = async (text: string, successMsg: string) => {
    try {
        await navigator.clipboard.writeText(text);
        message.success(successMsg);
    } catch (err) {
        message.error('Failed to copy. Please copy manually.');
    }
};

const handleShareSelect = (key: string | number) => {
    if (!props.code) {
        message.warning('Chat code is not available yet.');
        return;
    }

    const chatCode = props.code;
    const fullUrl = `${BASE_URL}/chat/${chatCode}`;

    switch (key) {
        case 'code':
            copyToClipboard(chatCode, 'Chat Code copied to clipboard!');
            break;
        case 'url':
            copyToClipboard(fullUrl, 'Full link copied to clipboard!');
            break;
        case 'qrcode':
            showQrCodeModal.value = true;
            break;
    }
};

const downloadQrCode = () => {
    const canvas = document.querySelector('#qrcode-canvas canvas') as HTMLCanvasElement;

    if (canvas) {
        const imageURL = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.href = imageURL;
        link.download = `chat-${props.code}-qrcode.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success('QR Code image download initiated!');

    } else {
        message.error('Could not find the QR Code image. Please ensure the component has rendered.');
    }
};
</script>

<style scoped>
.qr-code-modal-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding-top: 16px;
    padding-bottom: 8px;
}
</style>
