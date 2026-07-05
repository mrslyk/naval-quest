/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SLYK_DASHBOARD_URL?: string;
  readonly VITE_SLYK_API_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
