FROM alpine:3.19

RUN apk add --no-cache libstdc++ gcompat wget

WORKDIR /app

COPY . .

RUN tar -xzf llama-bin.tar.gz && rm llama-bin.tar.gz

# Create model directory
RUN mkdir -p model

# Download model from Hugging Face Model Hub
RUN wget -O model/teacher.gguf \
https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf

RUN chmod +x /app/run.sh /app/bin/*

ENV LD_LIBRARY_PATH=/app/bin
ENV PORT=7860

EXPOSE 7860

CMD ["/app/run.sh"]
