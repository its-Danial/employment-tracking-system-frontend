import NProgress from 'nprogress'
import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { authenticate, guestsOnly } from '@/router/guards/auth'
import { RouteName } from '@/types/router'

NProgress.configure({ showSpinner: false })

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: RouteName.AppLayout,
      component: AppLayout,
      redirect: { name: RouteName.Dashboard },
      beforeEnter: authenticate,
      children: [
        {
          path: 'dashboard',
          name: RouteName.Dashboard,
          component: () => import('@/pages/DashboardPage.vue'),
          meta: { title: 'Dashboard' },
        },
      ],
    },
    // Auth Layout
    {
      path: '/auth',
      name: RouteName.AuthLayout,
      component: AuthLayout,
      redirect: { name: RouteName.Login },
      beforeEnter: guestsOnly,
      children: [
        {
          path: 'login',
          name: RouteName.Login,
          component: () => import('@/pages/auth/LoginPage.vue'),
          meta: { title: 'Login' },
        },
        {
          path: 'register',
          name: RouteName.Register,
          component: () => import('@/pages/auth/RegisterPage.vue'),
          meta: { title: 'Register' },
        },
      ],
    },
    {
      path: '/404',
      name: RouteName.NotFound,
      component: () => import('@/pages/404Page.vue'),
      meta: { title: '404' },
    },
    {
      path: '/unauthorized',
      name: RouteName.Unauthorized,
      component: () => import('@/pages/UnauthorizedPage.vue'),
      meta: { title: 'Unauthorized Access' },
    },
    {
      path: '/error',
      name: RouteName.Error,
      component: () => import('@/pages/ErrorPage.vue'),
      meta: { title: 'Error' },
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) return { el: to.hash, top: 80, behavior: 'smooth' } // scroll-mt-20
    if (savedPosition) return savedPosition
    else return { top: 0, behavior: 'smooth' }
  },
})

router.afterEach((to) => {
  if (to.meta.title) document.title = `${to.meta.title} | ETS`
  else document.title = 'ETS'
})

// Use NProgress only when running in a browser environment
router.beforeResolve(() => {
  if (typeof document !== 'undefined') NProgress.start()
})
router.afterEach(() => {
  if (typeof document !== 'undefined') NProgress.done()
})

export default router
