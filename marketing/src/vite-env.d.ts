/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEMO_PROJECT_KEY?: string
  readonly VITE_DEMO_ENDPOINT?: string
  // Base URL of the backend API (waitlist capture). Defaults to prod.
  readonly VITE_API_BASE_URL?: string
}
