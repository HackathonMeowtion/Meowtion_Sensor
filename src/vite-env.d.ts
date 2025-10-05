/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
