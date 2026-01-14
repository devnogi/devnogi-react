# ===================================
# DevNogi React - Multi-stage Dockerfile
# ===================================
# Stage 1: Build the Next.js application
# Stage 2: Production runtime with minimal image
# ===================================

# -----------------------------------
# Stage 1: Dependencies & Build
# -----------------------------------
FROM node:20-alpine AS builder

# Install dependencies required for building native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Copy source code
COPY . .

# Set build-time environment variables
ARG NODE_ENV=production
ARG NEXT_TELEMETRY_DISABLED=1

ENV NODE_ENV=${NODE_ENV}
ENV NEXT_TELEMETRY_DISABLED=${NEXT_TELEMETRY_DISABLED}

# Build the application
RUN npm run build

# -----------------------------------
# Stage 2: Production Runtime
# -----------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Install wget for Docker healthcheck
RUN apk add --no-cache wget

# Copy built assets from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3010

ENV PORT=3010

# Start the application
CMD ["node", "server.js"]
