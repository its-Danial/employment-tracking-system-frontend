import { type Ref, computed, ref, watch } from 'vue'
import type { PaginationQuery } from '@/shared/api'
import { refDebounced } from '@vueuse/core'

/**
 * Filters, search and page for a server-side list. Search waits until typing stops, and any
 * change other than the page itself goes back to page 1.
 */
export function usePagedList<Query extends PaginationQuery>(defaults: Partial<Query> = {}) {
  const filters = ref({ page: 1, perPage: 12, ...defaults }) as Ref<Query>

  const debouncedSearch = refDebounced(
    computed(() => filters.value.search),
    300
  )
  const queryParams = computed<Query>(() => ({
    ...filters.value,
    search: debouncedSearch.value || undefined,
  }))

  watch(
    () => {
      const { page: _page, search: _search, ...rest } = queryParams.value
      return JSON.stringify(rest) + (debouncedSearch.value ?? '')
    },
    () => (filters.value.page = 1)
  )

  return { filters, queryParams }
}
