/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEMO_PROJECT_KEY?: string
  readonly VITE_DEMO_ENDPOINT?: string
  // Base URL of the backend API. Defaults to prod.
  readonly VITE_API_BASE_URL?: string
  // Dashboard origin that "get started" links to. Defaults to prod.
  readonly VITE_DASHBOARD_URL?: string
}
