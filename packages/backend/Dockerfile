# ==============================================================================
# Ads Backend - Unified Dockerfile with Infisical CLI Support
# Supports both local development and ECS deployment modes
# ==============================================================================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/backend ./packages/backend
COPY tsconfig.base.json ./

# Build
RUN pnpm --filter @optima-chat/ads-backend build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    bash \
    ca-certificates

# Install Infisical CLI via npm (for ECS deployment)
RUN npm install -g @infisical/cli

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist

# Copy entrypoint script (downloaded by shared workflow during build)
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Set environment
ENV NODE_ENV=production
ENV PORT=8000

# Expose port
EXPOSE 8000

# AWS environment: disable Docker HEALTHCHECK (ALB handles it)
HEALTHCHECK NONE

# Build metadata arguments
ARG GIT_COMMIT=""
ARG GIT_BRANCH=""
ARG BUILD_DATE=""
ARG APP_VERSION=""

ENV GIT_COMMIT=${GIT_COMMIT} \
    GIT_BRANCH=${GIT_BRANCH} \
    BUILD_DATE=${BUILD_DATE} \
    APP_VERSION=${APP_VERSION}

# Set entrypoint (handles Infisical secrets injection for ECS)
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Start the application
CMD ["node", "packages/backend/dist/main.js"]

# Build metadata labels
LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${GIT_COMMIT}"
