/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** Optional seed account for local auth (dev only — never use real passwords in client env for production). */
    readonly VITE_LOCAL_AUTH_EMAIL?: string;
    readonly VITE_LOCAL_AUTH_PASSWORD?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
