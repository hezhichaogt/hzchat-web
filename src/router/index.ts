//
// Vue Router configuration module.
//

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const DefaultLayout = () => import('@/layouts/DefaultLayout.vue')

const HomeView = () => import('@/views/HomeView.vue')
const ChatView = () => import('@/views/ChatView.vue')
const PrivacyView = () => import('@/views/PrivacyPolicyView.vue')
const AgreementView = () => import('@/views/UserAgreementView.vue')
const FAQView = () => import('@/views/FAQView.vue')
const AboutView = () => import('@/views/AboutView.vue')
const AuthView = () => import('@/views/AuthView.vue')
const SettingsView = () => import('@/views/SettingsView.vue')

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
      {
        path: '/settings',
        name: 'Settings',
        component: SettingsView,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/chat/:code?',
    name: 'Chat',
    component: ChatView,
  },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthView,
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

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isLoggedIn = userStore.isLoggedIn

  if (to.name === 'Auth' && isLoggedIn) {
    return next('/')
  }

  if (to.meta.requiresAuth && !isLoggedIn) {
    return next({
      name: 'Auth',
    })
  }

  next()
})

export default router
