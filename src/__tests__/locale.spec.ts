import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { getErrorMessage } from '@/lib/api-errors'
import { useLocaleStore } from '@/stores/locale'

describe('locale', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })
  afterEach(() => useLocaleStore().setLocale('en'))

  it('switches the page to right-to-left Urdu', async () => {
    const store = useLocaleStore()
    store.setLocale('ur')
    await nextTick()

    expect(document.documentElement.dir).toBe('rtl')
    expect(document.documentElement.lang).toBe('ur')
    expect(store.isRtl).toBe(true)
    expect(getErrorMessage(new TypeError('bug'))).toContain('براہ کرم')
  })

  it('falls back to English for an unknown saved language', async () => {
    localStorage.setItem('locale', 'fr')
    const store = useLocaleStore()
    await nextTick()

    expect(store.locale).toBe('en')
    expect(document.documentElement.dir).toBe('ltr')
  })
})
