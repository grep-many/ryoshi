#!/bin/sh
set -e

# Default fallback if not provided
PORT="${PORT:-8080}"

if [ -z "$API_KEY" ]; then
  echo "ERROR: API_KEY environment variable is not set"
  exit 1
fi

exec ./bin/llama-server \
  -m ./model/teacher.gguf \
  --host 0.0.0.0 \
  --port "$PORT" \
  --ctx-size 2048 \
  --repeat-penalty 1.18 \
  --n-predict 256 \
  --parallel 1 \
  --mlock \
  --api-key "$API_KEY" \
  --chat-template none
