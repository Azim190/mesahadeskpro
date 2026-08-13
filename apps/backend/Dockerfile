# Production-ready Dockerfile for NestJS Backend
FROM node:20-alpine AS builder

# Install native C/C++ build toolchain (gcc, g++, make, python3, sqlite-dev)
RUN apk add --no-cache python3 build-base sqlite-dev

# Set environment variables
ENV PYTHON=/usr/bin/python3
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1

WORKDIR /app

# Copy package files for dependency caching
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/shared-types/package*.json ./packages/shared-types/

# Install build dependencies
RUN npm install --legacy-peer-deps

# Copy application source
COPY packages/shared-types/ ./packages/shared-types/
COPY apps/backend/ ./apps/backend/

# Compile package targets
RUN npm run build -w packages/shared-types
RUN npm run build -w apps/backend

# Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared-types ./packages/shared-types
COPY --from=builder /app/apps/backend ./apps/backend

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "run", "start:prod", "-w", "apps/backend"]
