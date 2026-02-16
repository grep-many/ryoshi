FROM alpine:3.19

# Install dependencies for compatibility with glibc-linked binaries
RUN apk add --no-cache libstdc++ gcompat

WORKDIR /app

# Copy the specific folders needed to keep the image slim
COPY . .
COPY run.sh .

# Ensure binaries and script are executable
RUN chmod +x /app/run.sh /app/bin/*

# LD_LIBRARY_PATH tells the linker where to find libllama.so, libggml.so, etc.
ENV LD_LIBRARY_PATH=/app/bin
ENV PORT=8080

EXPOSE 8080

CMD ["/app/run.sh"]