# --- build stage ---
FROM node:22-alpine AS build
WORKDIR /app
# better-sqlite3 compiles a native addon at install time — needs a toolchain.
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
# Drop devDependencies (typescript, @types/*) but keep the already-compiled
# native binary for better-sqlite3 — prune doesn't rebuild anything.
RUN npm prune --omit=dev

# --- runtime stage ---
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Same base image/arch as the build stage, so the compiled native addon
# is ABI-compatible — no toolchain needed here, just copy it over.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY public ./public

RUN mkdir -p /data

ENV DB_PATH=/data/xflow.db
EXPOSE 3000
ENTRYPOINT ["node", "dist/index.js"]
