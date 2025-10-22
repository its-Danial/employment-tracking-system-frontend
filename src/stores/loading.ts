import { defineStore } from 'pinia'
import { readonly, ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const loading = ref(false)

  function showLoading() {
    loading.value = true
  }

  function hideLoading() {
    loading.value = false
  }
  return { loading: readonly(loading), showLoading, hideLoading }
})
