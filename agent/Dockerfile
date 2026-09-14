# --- build stage ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json ./
COPY proto ./proto
COPY src ./src
COPY scripts ./scripts
COPY sea-config.json ./
RUN npm run build:sea

# --- runtime stage ---
FROM alpine:3.20 AS runtime
RUN apk add --no-cache libstdc++
WORKDIR /app
COPY --from=build /app/dist/xflow-agent /usr/local/bin/xflow-agent

ENTRYPOINT ["xflow-agent"]

