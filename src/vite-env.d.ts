/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // aggiungi altre variabili d'ambiente qui se necessario
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
