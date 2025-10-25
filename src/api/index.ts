import axios, { AxiosError, CanceledError, type InternalAxiosRequestConfig } from 'axios'
import router from '@/router'
import { useToastStore } from '@/stores/toast'
import { useUserStore } from '@/stores/user'
import '@/types/axios'
import { RouteName } from '@/types/router'
import type { ApiErrorResponse, ApiFieldError } from './types'

export * from './types'

export const formatApiErrorMessages = (errors: ApiFieldError[]): string => {
  return errors.map((error) => error.message).join('.\n') + '.'
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  showErrorMessageToast: true,
  attachAccessToken: true,
})

export const onRequestFulfilled = async (config: InternalAxiosRequestConfig) => {
  // Add the access token to the request
  if (config.attachAccessToken) {
    const userStore = useUserStore()
    if (userStore.accessToken?.value)
      config.headers['Authorization'] = `Bearer ${userStore.accessToken.value}`
    else {
      await router.push({ name: RouteName.Login })
      return Promise.reject(new Error('Please log in to continue.'))
    }
  }
  return config
}

export const onResponseRejected = async (error: AxiosError<ApiErrorResponse>) => {
  let toastMessage: string | undefined

  if (!error.response) {
    if (error instanceof CanceledError) return Promise.reject(error) // Abort Controller request cancelled - no message
    toastMessage = error.message ?? 'Please check your connection and try again.'
    if (error.code === AxiosError.ERR_NETWORK) await router.push({ name: RouteName.Error })
  } else {
    // --- Status Code Handling ---
    switch (error.response.status) {
      case 401:
        await useUserStore().logout(false) // Do not hit the API, just clear the store and redirect
        break
      case 403:
        await router.push({ name: RouteName.Error })
        break
    }

    // --- Error Message Toast Handling ---
    if (error.config?.showErrorMessageToast) {
      const errorData = error.response.data
      // We only want to format the field errors into a single message if message from backend is not present.
      if (!errorData.message && Array.isArray(errorData.errors)) {
        // validation errors
        toastMessage = formatApiErrorMessages(errorData.errors)
      } else if (errorData.message) {
        // backend error message
        toastMessage = errorData.message
      } else {
        // unknown error
        toastMessage = 'An error occurred while processing the request.'
      }
    }
  }

  if (toastMessage) {
    const toastStore = useToastStore()
    toastStore.add({ severity: 'error', summary: 'Error', detail: toastMessage, life: 5000 })
  }

  return Promise.reject(error) // Always reject the promise to propagate the error to the caller
}

api.interceptors.request.use(onRequestFulfilled, (error) => Promise.reject(error))
api.interceptors.response.use((response) => response, onResponseRejected)

export default api
