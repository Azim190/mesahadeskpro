# Dockerfile for MasahaDesk All-in-One Deployment
FROM node:20-alpine AS builder

# Install native build tools required by better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy root and workspace package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY apps/desktop/package*.json ./apps/desktop/
COPY packages/shared-types/package*.json ./packages/shared-types/

# Install dependencies
RUN npm ci

# Copy full source
COPY . .

# Build packages, desktop web renderer, and backend
RUN npm run build -w packages/shared-types
RUN npm run build -w apps/desktop
RUN npm run build -w apps/backend

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules & build artifacts from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared-types ./packages/shared-types
COPY --from=builder /app/apps/backend ./apps/backend
COPY --from=builder /app/apps/desktop/out/renderer ./apps/desktop/out/renderer

EXPOSE 3000

CMD ["node", "apps/backend/dist/main.js"]
