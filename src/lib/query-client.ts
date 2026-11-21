import { isAxiosError } from 'axios'
import { QueryClient } from '@tanstack/vue-query'

const MAX_RETRIES = import.meta.env.MODE === 'test' ? 0 : 1

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Serve cached data for 30s before refetching, avoids duplicate requests when navigating
      staleTime: 30_000,
      // 4xx responses (validation, permission, not found) won't change on retry
      retry: (failureCount, error) => {
        const status = isAxiosError(error) ? error.response?.status : undefined
        if (status && status < 500) return false
        return failureCount < MAX_RETRIES
      },
    },
    mutations: { retry: false },
  },
})

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import('@tanstack/query-core').QueryClient
  }
}

if (import.meta.env.DEV) {
  if (!window.__TANSTACK_QUERY_CLIENT__) window.__TANSTACK_QUERY_CLIENT__ = queryClient
}

export default queryClient
