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
const AccountView = () => import('@/views/AccountView.vue')
const ResetPasswordView = () => import('@/views/ResetPasswordView.vue')
const PricingView = () => import('@/views/PricingView.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: HomeView,
        meta: { hideHeaderBorder: true },
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
        path: '/account/:section?',
        name: 'Account',
        component: AccountView,
        meta: { requiresAuth: true, layoutWidth: 'max-w-3xl' },
      },
      {
        path: '/pricing',
        name: 'Pricing',
        component: PricingView,
        meta: { hideHeaderBorder: true, layoutWidth: 'max-w-5xl' },
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
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPasswordView,
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  },
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isLoggedIn = userStore.isLoggedIn

  if ((to.name === 'Auth' || to.name === 'ResetPassword') && isLoggedIn) {
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
