import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { allowGuestsOnly } from '@/router/guards/auth'
import { RouteName } from '@/types/router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      name: RouteName.AuthLayout,
      component: AuthLayout,
      redirect: { name: RouteName.Login },
      beforeEnter: allowGuestsOnly,
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

export default router
