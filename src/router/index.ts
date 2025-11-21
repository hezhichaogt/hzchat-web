//
// Vue Router configuration module.
//

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const DefaultLayout = () => import('@/layouts/DefaultLayout.vue')
const ChatLayout = () => import('@/layouts/ChatLayout.vue')

const HomeView = () => import('@/views/HomeView.vue')
const ChatView = () => import('@/views/ChatView.vue')
const PrivacyView = () => import('@/views/PrivacyPolicyView.vue')
const AgreementView = () => import('@/views/UserAgreementView.vue')
const FAQView = () => import('@/views/FAQView.vue')
const AboutView = () => import('@/views/AboutView.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: HomeView,
      },
      {
        path: '/privacy',
        name: 'PrivacyPolicy',
        component: PrivacyView,
      },
      {
        path: '/agreement',
        name: 'UserAgreement',
        component: AgreementView,
      },
      {
        path: '/faq',
        name: 'FAQ',
        component: FAQView,
      },
      {
        path: '/about',
        name: 'AboutUs',
        component: AboutView,
      },
    ],
  },
  {
    path: '/chat',
    component: ChatLayout,
    children: [
      {
        path: ':code?',
        name: 'Chat',
        component: ChatView,
      },
    ],
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
