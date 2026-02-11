FROM alpine:3.18 AS builder

RUN apk add --no-cache git

WORKDIR /app

RUN --mount=type=secret,id=token,env=TOKEN \
    git clone https://${TOKEN}@github.com/airplanes-live/tar1090-db .


FROM nginx:latest

ENV GLOBE_URL=globe.airplanes.live
ENV SITE_URL=airplanes.live

WORKDIR /usr/share/nginx/html

COPY html .
COPY cachebust.list .
COPY cachebust.sh /usr/local/bin/
COPY --from=builder /app/db db-2/
COPY nginx.conf /etc/nginx/templates/default.conf.template
RUN chown -R nginx:nginx /usr/share/nginx/html/ && chmod +x /usr/local/bin/cachebust.sh
