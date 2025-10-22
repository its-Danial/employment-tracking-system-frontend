import 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * Indicates whether a toast should be displayed contained the formatted error message, when a request fails.
     * @default true
     */
    showErrorMessageToast?: boolean
    /**
     * Add Authorization Bearer token header.
     * @default true
     */
    attachAccessToken?: boolean
  }
}
