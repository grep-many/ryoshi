#!/bin/sh
./bin/llama-server \
  -m ./model/teacher.gguf \
  --host 0.0.0.0 \
  --port 8080 \
  --ctx-size 2048 \
  --repeat-penalty 1.18 \
  --n-predict 256 \
  --parallel 1 \
  --mlock \
  --api-key someting \
  --mlock \
  --chat-template none
