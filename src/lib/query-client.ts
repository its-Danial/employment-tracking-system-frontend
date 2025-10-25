import { QueryClient } from '@tanstack/vue-query'

export default new QueryClient({
  defaultOptions: {
    queries: {
      retry: import.meta.env.MODE === 'test' ? false : 1,
    },
  },
})
