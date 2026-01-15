<template>
    <Teleport to="body">
        <Transition name="preview-fade">
            <div v-if="modelValue"
                class="fixed inset-0 z-1000 flex items-center justify-center bg-black/80 dark:bg-zinc-950/90 backdrop-blur-xl cursor-zoom-out"
                @click="close">

                <button class="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors"
                    @click="close">
                    <X class="w-6 h-6" />
                </button>

                <div class="relative w-full h-full flex items-center justify-center p-4 md:p-12 overflow-hidden">
                    <img :src="src"
                        class="max-w-[95%] max-h-[95%] object-contain select-none shadow-2xl transition-all duration-300"
                        :class="{
                            'bg-white p-10 md:p-20 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)]': mimeType === 'image/svg+xml'
                        }" @click.stop alt="Preview" />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps<{
    modelValue: boolean;
    src: string;
    mimeType?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const close = () => {
    emit('update:modelValue', false);
};

watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
    } else {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
    }
});

const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
        close();
    }
};
</script>

<style scoped>
.preview-fade-enter-active,
.preview-fade-leave-active {
    transition: opacity 0.3s ease, backdrop-filter 0.3s ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
    opacity: 0;
    backdrop-filter: blur(0px);
}

.preview-fade-enter-active img {
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.preview-fade-leave-active img {
    transition: transform 0.2s ease-in;
}

.preview-fade-enter-from img {
    transform: scale(0.95);
}

.preview-fade-leave-to img {
    transform: scale(1.02);
}
</style>