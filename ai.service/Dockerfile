FROM alpine:3.19

RUN apk add --no-cache libstdc++ gcompat

WORKDIR /app

COPY . .

RUN chmod +x /app/run.sh /app/bin/*

ENV LD_LIBRARY_PATH=/app/bin
ENV PORT=7860

EXPOSE 7860

CMD ["/app/run.sh"]
