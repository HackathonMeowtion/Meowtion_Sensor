/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY?: string;
    readonly VITE_AUTH0_DOMAIN?: string;
    readonly VITE_AUTH0_CLIENT_ID?: string;
    readonly VITE_AUTH0_AUDIENCE?: string;
    readonly VITE_AUTH0_PERSONA_CLAIM?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
