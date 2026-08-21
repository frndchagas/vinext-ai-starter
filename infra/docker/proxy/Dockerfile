FROM golang:1.26.6-alpine3.23 AS build

WORKDIR /src

COPY infra/docker/proxy/build/go.mod infra/docker/proxy/build/go.sum ./

RUN go mod download

COPY infra/docker/proxy/build/main.go ./

RUN CGO_ENABLED=0 go build \
    -trimpath \
    -ldflags="-s -w -X github.com/caddyserver/caddy/v2.CustomVersion=v2.11.4" \
    -o /usr/bin/caddy \
    .

FROM alpine:3.23.5

COPY infra/docker/proxy/Caddyfile /etc/caddy/Caddyfile

RUN apk upgrade --no-cache \
    && apk add --no-cache ca-certificates \
    && addgroup --system --gid 1000 caddy \
    && adduser --system --disabled-password --uid 1000 --ingroup caddy caddy

COPY --from=build /usr/bin/caddy /usr/bin/caddy

ENV XDG_CONFIG_HOME=/tmp/config \
    XDG_DATA_HOME=/tmp/data

USER caddy

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --retries=6 \
    CMD ["wget", "--quiet", "--spider", "http://127.0.0.1:8080/up"]
