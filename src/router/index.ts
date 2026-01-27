import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { RESERVED_CODES } from '@/types/reserved'

const DefaultLayout = () => import('@/layouts/DefaultLayout.vue')
const HomeView = () => import('@/views/HomeView.vue')
const ChatView = () => import('@/views/ChatView.vue')
const AboutView = () => import('@/views/AboutView.vue')
const AuthView = () => import('@/views/AuthView.vue')
const AccountView = () => import('@/views/AccountView.vue')
const ResetPasswordView = () => import('@/views/ResetPasswordView.vue')
const PricingView = () => import('@/views/PricingView.vue')
const DocView = () => import('@/views/DocView.vue')

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
        path: '/docs/:slug?',
        name: 'Docs',
        component: DocView,
        meta: { layoutWidth: 'max-w-5xl' },
      },
      { path: '/privacy', redirect: '/docs/privacy' },
      { path: '/terms', redirect: '/docs/terms' },
      {
        path: '/about',
        name: 'AboutUs',
        component: AboutView,
      },
      {
        path: '/account/:section?',
        name: 'Account',
        component: AccountView,
        meta: { requiresAuth: true },
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
    path: '/:code([a-z0-9_-]{4,16})',
    name: 'Chat',
    component: ChatView,
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

  if (to.name === 'Chat') {
    const code = String(to.params.code).toLowerCase()
    if (RESERVED_CODES.includes(code as any)) {
      return next('/')
    }
  }

  if ((to.name === 'Auth' || to.name === 'ResetPassword') && isLoggedIn) {
    const redirectTo = (to.query.redirect as string) || '/'
    return next(redirectTo)
  }

  if (to.meta.requiresAuth && !isLoggedIn) {
    return next({
      name: 'Auth',
      query: { redirect: to.fullPath },
    })
  }

  next()
})

export default router
