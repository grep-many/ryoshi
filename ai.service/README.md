# Ryoshi AI Service

This service runs a local `llama-server` instance that powers the `/api/ai` translation route in the web app. It downloads a GGUF model at build time and exposes an HTTP endpoint secured by an API key.

## What It Does

- Runs `llama-server` with the `teacher.gguf` model.
- Exposes an HTTP endpoint on `PORT` (default `7860`).
- Enforces an API key via `API_KEY` (required).

## Requirements

- Docker
- Network access during build to download the model

## Build

```bash
docker build -t ryoshi-ai .
```

## Run

```bash
docker run --rm -e API_KEY=your_key -p 7860:7860 ryoshi-ai
```

## Configuration

| Variable | Description | Required | Default |
| --- | --- | --- | --- |
| `API_KEY` | API key required by `llama-server`. | Yes | None |
| `PORT` | HTTP port exposed by `llama-server`. | No | `7860` |

## Notes

- The model is downloaded during the Docker build and increases image size.
- If you change the model URL in `Dockerfile`, rebuild the image.
