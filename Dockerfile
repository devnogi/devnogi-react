# ===================================
# Stage 1: Build
# ===================================
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./

# devDependencies 포함
RUN npm ci

COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_ 환경 변수는 빌드 시점에 인라인됨
ARG NEXT_PUBLIC_GATEWAY_PROD_URL
ENV NEXT_PUBLIC_GATEWAY_PROD_URL=$NEXT_PUBLIC_GATEWAY_PROD_URL

RUN npm run build

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
