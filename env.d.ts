/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_TENANT?: string
  /** Domain companies open the app on, shown on the platform page. Defaults to the current host */
  readonly VITE_APP_DOMAIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
