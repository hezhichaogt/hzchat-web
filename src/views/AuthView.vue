<template>
    <div class="fixed inset-0 w-full h-dvh overflow-hidden flex flex-col items-center bg-zinc-50/50">

        <main class="flex-1 w-full max-w-sm flex flex-col items-center justify-center gap-6 px-4">

            <div class="animate-in fade-in slide-in-from-bottom-4 duration-1000 group cursor-default">
                <Logo size="lg" :show-text="true"
                    class="transform transition-transform duration-500 group-hover:scale-105" />
            </div>

            <div class="w-full relative min-h-110">
                <Transition appear enter-active-class="animate-in fade-in zoom-in-95 duration-300"
                    leave-active-class="animate-out fade-out zoom-out-95 duration-200" mode="out-in">
                    <div v-if="view === 'auth'" key="auth" class="w-full">
                        <Tabs default-value="login" class="w-full">
                            <TabsList class="grid w-full grid-cols-2 my-2 bg-zinc-100/80 p-1">
                                <TabsTrigger value="login" class="text-xs uppercase tracking-widest cursor-pointer">
                                    Login</TabsTrigger>
                                <TabsTrigger value="register" class="text-xs uppercase tracking-widest cursor-pointer">
                                    Register</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login">
                                <LoginCard @forgot-password="view = 'forgot'" />
                            </TabsContent>

                            <TabsContent value="register">
                                <RegisterCard />
                            </TabsContent>
                        </Tabs>
                    </div>

                    <ForgotPasswordCard v-else-if="view === 'forgot'" key="forgot" @back="view = 'auth'"
                        class="w-full" />
                </Transition>
            </div>
        </main>

        <Footer />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import Logo from '@/components/Logo.vue'
import Footer from '@/components/Footer.vue'
import LoginCard from '@/components/auth/LoginCard.vue'
import RegisterCard from '@/components/auth/RegisterCard.vue'
import ForgotPasswordCard from '@/components/auth/ForgotPasswordCard.vue'

const view = ref<'auth' | 'forgot'>('auth');
</script>
