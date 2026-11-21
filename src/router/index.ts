import NProgress from 'nprogress'
import { createRouter, createWebHistory } from 'vue-router'
import i18n from '@/i18n'
import { authenticate, authorize, guestsOnly } from '@/router/guards/auth'
import { PERMISSIONS } from '@/shared/permissions'
import { RouteName } from '@/types/router'

NProgress.configure({ showSpinner: false })

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: RouteName.AppLayout,
      // Lazy loaded so the login page doesn't download the app shell and vice versa
      component: () => import('@/layouts/app-layout/AppLayout.vue'),
      redirect: { name: RouteName.Dashboard },
      beforeEnter: authenticate,
      children: [
        {
          path: 'dashboard',
          name: RouteName.Dashboard,
          component: () => import('@/pages/DashboardPage.vue'),
          meta: { titleKey: 'dashboard', permission: PERMISSIONS.dashboard.view },
        },
        {
          path: 'candidates',
          name: RouteName.Candidates,
          component: () => import('@/pages/candidates/CandidatesPage.vue'),
          meta: { titleKey: 'candidates', permission: PERMISSIONS.candidates.view },
        },
        {
          path: 'candidates/new',
          name: RouteName.NewCandidate,
          component: () => import('@/pages/candidates/CandidateFormPage.vue'),
          meta: { titleKey: 'newCandidate', permission: PERMISSIONS.candidates.create },
        },
        {
          path: 'candidates/:uuid/edit',
          name: RouteName.EditCandidate,
          component: () => import('@/pages/candidates/CandidateFormPage.vue'),
          meta: { titleKey: 'editCandidate', permission: PERMISSIONS.candidates.update },
        },
        {
          path: 'candidates/:uuid',
          name: RouteName.Candidate,
          component: () => import('@/pages/candidates/CandidatePage.vue'),
          meta: { titleKey: 'candidate', permission: PERMISSIONS.candidates.view },
        },
        {
          path: 'payments',
          name: RouteName.Payments,
          component: () => import('@/pages/PaymentsPage.vue'),
          meta: { titleKey: 'payments', permission: PERMISSIONS.payments.view },
        },
        {
          path: 'contracts',
          name: RouteName.Contracts,
          component: () => import('@/pages/ContractsPage.vue'),
          meta: { titleKey: 'contracts', permission: PERMISSIONS.contracts.view },
        },
        {
          path: 'employers',
          name: RouteName.Companies,
          component: () => import('@/pages/CompaniesPage.vue'),
          meta: { titleKey: 'companies', permission: PERMISSIONS.companies.view },
        },
        {
          path: 'agents',
          name: RouteName.Agents,
          component: () => import('@/pages/AgentsPage.vue'),
          meta: { titleKey: 'agents', permission: PERMISSIONS.agents.view },
        },
        {
          path: 'trades',
          name: RouteName.Trades,
          component: () => import('@/pages/TradesPage.vue'),
          meta: { titleKey: 'trades', permission: PERMISSIONS.trades.view },
        },
      ],
    },
    // Auth Layout
    {
      path: '/auth',
      name: RouteName.AuthLayout,
      component: () => import('@/layouts/AuthLayout.vue'),
      redirect: { name: RouteName.Login },
      beforeEnter: guestsOnly,
      children: [
        {
          path: 'login',
          name: RouteName.Login,
          component: () => import('@/pages/auth/LoginPage.vue'),
          meta: { titleKey: 'login' },
        },
        {
          path: 'register',
          name: RouteName.Register,
          component: () => import('@/pages/auth/RegisterPage.vue'),
          meta: { titleKey: 'register' },
        },
      ],
    },
    {
      path: '/404',
      name: RouteName.NotFound,
      component: () => import('@/pages/404Page.vue'),
      meta: { titleKey: 'notFound' },
    },
    {
      path: '/unauthorized',
      name: RouteName.Unauthorized,
      component: () => import('@/pages/UnauthorizedPage.vue'),
      meta: { titleKey: 'unauthorized' },
    },
    {
      path: '/error',
      name: RouteName.Error,
      component: () => import('@/pages/ErrorPage.vue'),
      meta: { titleKey: 'error' },
    },
    // Hidden page for the platform owner to create companies. Protected by the API key.
    {
      path: '/platform',
      name: RouteName.Platform,
      component: () => import('@/pages/platform/PlatformPage.vue'),
      meta: { titleKey: 'platform', platform: true },
    },
    // Any unknown address
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: RouteName.NotFound },
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) return { el: to.hash, top: 80, behavior: 'smooth' } // scroll-mt-20
    if (savedPosition) return savedPosition
    else return { top: 0, behavior: 'smooth' }
  },
})

export function updateDocumentTitle() {
  const { titleKey } = router.currentRoute.value.meta
  const { t } = i18n.global
  document.title = titleKey ? `${t(`pageTitles.${titleKey}`)} | ${t('common.appName')}` : 'ETS'
}

router.afterEach(() => updateDocumentTitle())

// Use NProgress only when running in a browser environment
router.beforeEach(() => {
  if (typeof document !== 'undefined') NProgress.start()
})

// beforeResolve runs after per-route `beforeEnter` guards (where permissions are refreshed)
router.beforeResolve(authorize)
router.afterEach(() => {
  if (typeof document !== 'undefined') NProgress.done()
})

export default router
