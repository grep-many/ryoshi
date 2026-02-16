#!/bin/sh
set -e

PORT="${PORT:-7860}"

if [ -z "$API_KEY" ]; then
  echo "ERROR: API_KEY environment variable is not set"
  exit 1
fi

exec ./bin/llama-server \
  -m ./model/teacher.gguf \
  --host 0.0.0.0 \
  --port "$PORT" \
  --ctx-size 4096 \
  --parallel 1 \
  --n-predict 256 \
  --mlock \
  --repeat-penalty 1.1 \
  --api-key "$API_KEY"