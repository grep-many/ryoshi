declare namespace NodeJS {
  interface ProcessEnv {
    AI_SERVER_KEY: string;
    AI_SERVER_URL: string;
    API_ACCESS_KEY?: string;
    API_AUTH_REQUIRED?: string;
    APP_ORIGIN?: string;
    AI_RATE_LIMIT_MAX?: string;
    AI_RATE_LIMIT_WINDOW_MS?: string;
    AI_MAX_CHARS?: string;
    TTS_RATE_LIMIT_MAX?: string;
    TTS_RATE_LIMIT_WINDOW_MS?: string;
    TTS_MAX_CHARS?: string;
    TTS_FETCH_TIMEOUT_MS?: string;
    NEXT_PUBLIC_API_KEY?: string;
  }
}
