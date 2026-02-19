# syntax=docker/dockerfile:1

# ===================================
# Stage 1: Build
# ===================================
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./

# npm 캐시 마운트로 의존성 설치 속도 향상
RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# QEMU 에뮬레이션 환경에서 SWC 워커 스레드 SIGILL 방지
ENV NEXT_PRIVATE_WORKER_THREADS=0

# Next.js 빌드 캐시 마운트로 빌드 속도 향상
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# ===================================
# Stage 2: Runtime
# ===================================
FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

RUN apk add --no-cache wget

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3010
ENV PORT=3010

CMD ["node", "server.js"]
