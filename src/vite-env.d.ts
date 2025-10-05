/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY?: string;
    readonly VITE_AUTH0_DOMAIN?: string;
    readonly VITE_AUTH0_CLIENT_ID?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
