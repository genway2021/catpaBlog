/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface AppConfig {
  apiUrl?: string;
}

interface Window {
  __APP_CONFIG__?: AppConfig;
}
