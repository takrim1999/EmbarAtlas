# Build stage
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Install native compilation dependencies for better-sqlite3
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
ENV VITE_BASE_PATH=/nasa/
RUN npm run build

# Production runner stage
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled frontend from builder
COPY --from=builder /app/dist ./dist

# Copy backend files and assets
COPY server/ ./server/
COPY public/ ./public/
COPY ember-atlas-preview.jpg ./
COPY README.md LICENSE ./

# Pre-seed the database if needed during build or runtime
RUN node server/seed.js || true

# Set user permissions
RUN chown -R node:node /app
USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/nasa/api/health || exit 1

CMD ["node", "server/index.js"]
