# Ryoshi Web App

The web app renders a 3D Japanese learning experience using Next.js, React, and Three.js. It calls local API routes for AI translation and text-to-speech.

## Features

- 3D classroom scene with animated teacher
- English-to-Japanese translation with grammar breakdowns
- Furigana and English display toggles
- Lip-synced TTS playback

## Requirements

- Node.js (compatible with Next.js 16)
- npm

## Install

```bash
npm install
```

## Run (Dev)

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Start (Prod)

```bash
npm run start
```

## API Routes

- `GET /api/ai` calls the AI service defined by `AI_SERVER_URL`.
- `GET /api/tts` fetches Google TTS audio and returns viseme timing metadata.

## Configuration

| Variable | Description | Required | Default |
| --- | --- | --- | --- |
| `AI_SERVER_URL` | AI completion endpoint used by `/api/ai`. | Yes (for AI) | None |
| `AI_SERVER_KEY` | Bearer token for the AI service. | Yes (for AI) | None |
| `API_ACCESS_KEY` | API key for protecting API routes. | Conditional | None |
| `API_AUTH_REQUIRED` | If `true`, routes require `API_ACCESS_KEY`. | No | `false` |
| `APP_ORIGIN` | Comma-separated allowlist for request origins. | No | Empty (allow all) |
| `AI_RATE_LIMIT_MAX` | Max AI requests per IP per window. | No | `20` |
| `AI_RATE_LIMIT_WINDOW_MS` | AI rate limit window in ms. | No | `60000` |
| `AI_MAX_CHARS` | Max characters per AI question. | No | `200` |
| `TTS_RATE_LIMIT_MAX` | Max TTS requests per IP per window. | No | `30` |
| `TTS_RATE_LIMIT_WINDOW_MS` | TTS rate limit window in ms. | No | `60000` |
| `TTS_MAX_CHARS` | Max characters per TTS request. | No | `300` |
| `TTS_FETCH_TIMEOUT_MS` | Upstream TTS fetch timeout in ms. | No | `8000` |
| `NEXT_PUBLIC_API_KEY` | Client-side API key forwarded as `x-api-key`. | No | None |

## AI Output Notice

> **Warning**  
> AI-generated translations can be inaccurate or hallucinated. Verify outputs before using them in real-world or high-stakes contexts.
