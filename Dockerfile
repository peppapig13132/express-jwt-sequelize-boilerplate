# syntax=docker/dockerfile:1

FROM node:20-bookworm AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-bookworm AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 8000

CMD ["node", "dist/index.js"]
