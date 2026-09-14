# --- node binary provider for target platform (linux/amd64 or linux/arm64) ---
FROM --platform=$TARGETPLATFORM node:22-alpine AS node-target

# --- build stage: runs natively on host builder ($BUILDPLATFORM) with zero QEMU emulation ---
FROM --platform=$BUILDPLATFORM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json ./
COPY proto ./proto
COPY src ./src
COPY sea-config.json ./

# 1. Bundle TypeScript source to a single JavaScript file
RUN npx esbuild src/index.ts --bundle --platform=node --target=node22 --outfile=dist/bundle.js

# 2. Generate SEA preparation blob
RUN node --experimental-sea-config sea-config.json

# 3. Copy the target architecture's Alpine node binary
COPY --from=node-target /usr/local/bin/node dist/xflow-agent

# 4. Inject SEA blob into target node binary using postject on the fast host runner
RUN npx postject dist/xflow-agent NODE_SEA_BLOB dist/sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 && \
    chmod 755 dist/xflow-agent

# --- runtime stage: minimal alpine with standalone binary ---
FROM alpine:3.20 AS runtime
RUN apk add --no-cache libstdc++
WORKDIR /app
COPY --from=build /app/dist/xflow-agent /usr/local/bin/xflow-agent

ENTRYPOINT ["xflow-agent"]
