import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import i18n from '@/i18n'
import { getErrorMessage, isCancelledRequest } from '@/lib/api-errors'
import { getTenantSubdomain } from '@/lib/utils'
import router from '@/router'
import { useToastStore } from '@/stores/toast'
import { useUserStore } from '@/stores/user'
import '@/types/axios'
import { RouteName } from '@/types/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'X-Tenant': getTenantSubdomain() },
  timeout: 30_000, // Fail visibly on a dead connection instead of spinning forever
  showErrorMessageToast: true,
  attachAccessToken: true,
})

export const onRequestFulfilled = async (config: InternalAxiosRequestConfig) => {
  // The API answers (error messages, validation) in the language the user picked
  config.headers['Accept-Language'] = i18n.global.locale.value

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

/**
 * Every failed request shows a friendly error toast (opt out per request with
 * `showErrorMessageToast: false`, e.g. when the page shows the error itself).
 * The error is always re-thrown so callers / TanStack Query can react to it.
 */
export const onResponseRejected = async (error: AxiosError) => {
  if (isCancelledRequest(error)) return Promise.reject(error)

  // Expired or revoked token: clear the session and go to login
  if (error.response?.status === 401 && error.config?.attachAccessToken) {
    await useUserStore().logout(false)
  }

  if (error.config?.showErrorMessageToast !== false) {
    useToastStore().error(getErrorMessage(error))
  }

  return Promise.reject(error)
}

api.interceptors.request.use(onRequestFulfilled, (error) => Promise.reject(error))
api.interceptors.response.use((response) => response, onResponseRejected)

export default api
