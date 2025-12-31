<template>
    <Teleport to="body">
        <Transition name="preview-fade">
            <div v-if="modelValue"
                class="fixed inset-0 z-999 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md cursor-zoom-out"
                @click="close">
                <div class="relative w-full h-full flex items-center justify-center p-4 md:p-12">
                    <img :src="src" class="max-w-full max-h-full object-contain select-none shadow-2xl rounded-sm 
                   ring-1 ring-white/10 cursor-default transition-transform duration-300" @click.stop alt="Preview" />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue';

const props = defineProps<{
    modelValue: boolean;
    src: string;
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
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.preview-fade-enter-from,
.preview-fade-leave-to {
    opacity: 0;
    backdrop-filter: blur(0);
}

.preview-fade-enter-from img {
    transform: scale(0.9);
}
</style>