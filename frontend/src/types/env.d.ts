/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * The base URL for WebSocket connections
   */
  readonly VITE_WS_URL: string;

  /**
   * The base URL for API requests
   */
  readonly VITE_API_URL: string;

  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
