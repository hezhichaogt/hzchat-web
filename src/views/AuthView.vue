<template>
    <div class="fixed inset-0 w-full h-dvh overflow-hidden flex flex-col items-center bg-background">

        <main class="flex-1 w-full max-w-sm flex flex-col items-center justify-center gap-6 px-4">

            <div class="animate-in fade-in slide-in-from-bottom-4 group cursor-default">
                <Logo size="lg" :show-text="true" />
            </div>

            <div class="w-full relative min-h-110">
                <Transition appear enter-active-class="animate-in fade-in zoom-in-95 duration-200 ease-out"
                    leave-active-class="animate-out fade-out zoom-out-95 duration-150 ease-in" mode="out-in">
                    <div v-if="view === 'auth'" key="auth" class="w-full">
                        <Tabs default-value="login" class="w-full">
                            <TabsList
                                class="grid w-full grid-cols-2 my-2 bg-muted/50 p-1 border border-border/40 rounded-xl">
                                <TabsTrigger value="login"
                                    class="text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
                                    Login
                                </TabsTrigger>
                                <TabsTrigger value="register"
                                    class="text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
                                    Register
                                </TabsTrigger>
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
