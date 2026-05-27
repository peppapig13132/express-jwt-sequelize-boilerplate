# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS builder

WORKDIR /app

ENV DEBIAN_FRONTEND=noninteractive

RUN set -eux; \
  for i in 1 2 3; do apt-get update && break || (echo "apt-get update failed (attempt $i)" && sleep 5); done; \
  apt-get install -y --no-install-recommends ca-certificates python3 make g++; \
  rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production

ENV DEBIAN_FRONTEND=noninteractive

RUN set -eux; \
  for i in 1 2 3; do apt-get update && break || (echo "apt-get update failed (attempt $i)" && sleep 5); done; \
  apt-get install -y --no-install-recommends ca-certificates python3 make g++; \
  rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 8000

CMD ["node", "dist/index.js"]
