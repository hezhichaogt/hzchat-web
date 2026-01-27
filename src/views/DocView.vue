<template>
    <div class="max-w-5xl mx-auto w-full py-4 lg:py-8 px-4">
        <h1 :class="[
            'text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 mb-10 text-left',
            activeSlug ? 'hidden lg:block' : 'block'
        ]">
            Docs
        </h1>

        <div class="flex flex-col w-full lg:flex-row gap-8 lg:gap-12">
            <aside :class="[
                'w-full lg:w-64 shrink-0 lg:pr-8 lg:border-r lg:border-zinc-100 dark:lg:border-zinc-800 lg:block',
                activeSlug ? 'hidden' : 'block'
            ]">
                <nav class="flex flex-col gap-8">
                    <div v-for="group in DOC_NAVIGATION" :key="group.id" class="space-y-4">
                        <button @click="toggleGroup(group.id)"
                            class="w-full flex items-center justify-between text-[11px] font-black tracking-[0.2em] uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                            <span class="flex items-center gap-2.5">
                                <component :is="group.icon" class="size-3.5" />
                                {{ group.label }}
                            </span>
                            <ChevronDown :class="['size-3 transition-transform duration-300',
                                expandedGroups.includes(group.id) ? 'rotate-0' : '-rotate-90']" />
                        </button>

                        <div v-show="expandedGroups.includes(group.id)"
                            class="flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-300">
                            <button v-for="doc in group.children" :key="doc.id" @click="navigateTo(doc.id)" :class="[
                                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative group',
                                activeSlug === doc.id
                                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                                    : 'text-zinc-500 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
                            ]">
                                <span class="truncate">{{ doc.label }}</span>
                                <div v-if="activeSlug !== doc.id"
                                    class="absolute bottom-0 left-4 right-4 h-px bg-zinc-100 dark:bg-zinc-800/50 lg:hidden">
                                </div>
                            </button>
                        </div>
                    </div>

                    <Separator class="my-4 hidden lg:block bg-zinc-100 dark:bg-zinc-800" />

                    <button @click="router.push('/')"
                        class="flex items-center gap-3 py-2 text-xs font-black tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group uppercase">
                        <ChevronLeft class="size-4 transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </button>
                </nav>
            </aside>

            <main v-if="activeSlug" class="flex-1 min-w-0">
                <div class="lg:hidden flex items-center gap-2 mb-8 -ml-4">
                    <Button variant="ghost" size="icon" @click="navigateTo(null)"
                        class="h-10 w-10 rounded-full text-zinc-500">
                        <ChevronLeft class="size-7" />
                    </Button>
                    <h2 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{{ currentDoc?.label
                        }}</h2>
                </div>

                <div :key="activeSlug" class="animate-in fade-in duration-500">
                    <div v-if="isLoading" class="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
                        <div class="h-12 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
                        <div class="space-y-4">
                            <div v-for="i in 8" :key="i"
                                :class="['h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse', i % 3 === 0 ? 'w-2/3' : 'w-full']">
                            </div>
                        </div>
                    </div>

                    <article v-else class="prose prose-zinc dark:prose-invert max-w-none
                        prose-headings:text-zinc-950 dark:prose-headings:text-zinc-50 prose-headings:font-black prose-headings:tracking-tighter
                        prose-h2:text-2xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:pb-4 prose-h2:border-b-2 prose-h2:border-zinc-900 dark:prose-h2:border-zinc-100 prose-h2:uppercase
                        prose-h3:text-lg prose-h3:mt-10 prose-h3:mb-4
                        prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-8 prose-p:mb-6
                        prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100 prose-strong:font-black
                        prose-li:text-zinc-600 dark:prose-li:text-zinc-400 prose-li:marker:text-zinc-900 dark:prose-li:marker:text-zinc-100
                        animate-in fade-in slide-in-from-bottom-3 duration-500" v-html="renderedMarkdown">
                    </article>
                </div>
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import MarkdownIt from 'markdown-it'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    ChevronLeft,
    ChevronDown,
    ShieldCheck,
    BookOpen
} from 'lucide-vue-next'


interface DocItem {
    id: string;
    label: string;
    path: string;
    seo?: {
        title: string;
        description: string;
    };
}

interface NavGroup {
    id: string;
    label: string;
    icon: any;
    children: DocItem[];
}


const DOC_NAVIGATION: NavGroup[] = [
    {
        id: 'legal',
        label: 'Legal & Privacy',
        icon: ShieldCheck,
        children: [
            {
                id: 'privacy',
                label: 'Privacy Policy',
                path: 'privacy-policy.md',
                seo: {
                    title: 'Privacy Policy - Commitment to Zero-Log and Zero-PII Collection',
                    description: 'Read HZ Chat\'s Privacy Policy. We commit to Zero Logging, collecting no PII, and never storing chat history.'
                }
            },
            {
                id: 'terms',
                label: 'Terms of Service',
                path: 'terms.md',
                seo: {
                    title: 'User Agreement - Terms of Use, Content Responsibility, and Service Rules',
                    description: 'Review HZ Chat\'s User Agreement regarding content ownership, prohibited conduct, and service liability.'
                }
            }
        ]
    },
    {
        id: 'guide',
        label: 'User Guide',
        icon: BookOpen,
        children: [
            { id: 'getting-started', label: 'Getting Started', path: 'guide/getting-started.md' }
        ]
    }
]

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
})

const BASE_URL = import.meta.env.VITE_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
const mdModules = import.meta.glob('@/markdown/**/*.md', { query: '?raw', import: 'default' })


const router = useRouter()
const route = useRoute()
const mdContent = ref('')
const isLoading = ref(false)
const expandedGroups = ref<string[]>(DOC_NAVIGATION.map(g => g.id))

const activeSlug = computed(() => route.params.slug as string || null)

const currentDoc = computed(() => {
    for (const group of DOC_NAVIGATION) {
        const doc = group.children.find(d => d.id === activeSlug.value)
        if (doc) return doc
    }
    return null
})

const seoData = computed(() => {
    const defaultSeo = {
        title: `${currentDoc.value?.label || 'Docs'} - HZ Chat`,
        description: 'Read the official documentation and legal policies of HZ Chat.'
    }
    return currentDoc.value?.seo || defaultSeo
})

const renderedMarkdown = computed(() => (mdContent.value ? md.render(mdContent.value) : ''))

useHead({
    title: () => seoData.value.title,
    meta: [
        { name: 'description', content: () => seoData.value.description },
        { property: 'og:title', content: () => seoData.value.title },
        { property: 'og:description', content: () => seoData.value.description },
        { property: 'og:url', content: () => `${BASE_URL}/docs/${activeSlug.value || ''}` },
        { name: 'robots', content: 'index, follow' }
    ],
    link: [
        { rel: 'canonical', href: () => `${BASE_URL}/docs/${activeSlug.value || ''}` }
    ]
})

const loadMarkdown = async () => {
    if (!currentDoc.value) return

    isLoading.value = true
    try {
        const filePath = `/src/markdown/${currentDoc.value.path}`
        const loader = mdModules[filePath]
        if (loader) {
            mdContent.value = await loader() as string
        } else {
            mdContent.value = '# 404\nDocument not found.'
        }
    } catch (e) {
        mdContent.value = '# Error\nFailed to load content.'
    } finally {
        setTimeout(() => { isLoading.value = false }, 300)
    }
}

const toggleGroup = (groupId: string) => {
    const index = expandedGroups.value.indexOf(groupId)
    if (index > -1) expandedGroups.value.splice(index, 1)
    else expandedGroups.value.push(groupId)
}

const navigateTo = (slug: string | null) => {
    if (slug) router.push(`/docs/${slug}`)
    else router.push('/docs')
}

watch(activeSlug, (newSlug) => {
    if (newSlug) loadMarkdown()
}, { immediate: true })

onMounted(() => {
    if (window.innerWidth >= 1024 && !activeSlug.value) {
        const firstDoc = DOC_NAVIGATION[0]?.children[0]
        if (firstDoc) navigateTo(firstDoc.id)
    }
})
</script>