<template>
    <div class="fixed inset-0 w-full h-dvh overflow-hidden flex flex-col items-center bg-zinc-50/50">

        <main class="flex-1 w-full max-w-sm flex flex-col items-center justify-center gap-6 px-4">

            <div class="animate-in fade-in slide-in-from-bottom-4 duration-1000 group cursor-default">
                <Logo size="lg" :show-text="true"
                    class="transform transition-transform duration-500 group-hover:scale-105" />
            </div>

            <Tabs default-value="login" class="w-full max-w-sm animate-in fade-in slide-in-from-top-4 duration-1000">
                <TabsList class="grid w-full grid-cols-2 my-2 bg-zinc-100/80 p-1">
                    <TabsTrigger value="login" class="text-xs uppercase tracking-widest cursor-pointer">Login
                    </TabsTrigger>
                    <TabsTrigger value="register" class="text-xs uppercase tracking-widest cursor-pointer">Register
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                    <LoginCard />
                </TabsContent>

                <TabsContent value="register">
                    <RegisterCard />
                </TabsContent>
            </Tabs>
        </main>

        <Footer />
    </div>
</template>

<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import Logo from '@/components/Logo.vue'
import Footer from '@/components/Footer.vue'
import LoginCard from '@/components/auth/LoginCard.vue'
import RegisterCard from '@/components/auth/RegisterCard.vue'
</script>
