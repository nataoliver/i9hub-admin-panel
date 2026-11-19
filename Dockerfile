# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Install production dependencies (tsx is now included here)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy backend source files
COPY server.ts ./
COPY admin_database.json ./
COPY metadata.json ./
COPY index.html ./

# Copy built frontend from Stage 1
COPY --from=frontend-build /app/dist ./dist

# Create data directory for persistent JSON storage
RUN mkdir -p /app/data && chown -R node:node /app/data

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health || exit 1

USER node

# Run TypeScript server directly using tsx
CMD ["npx", "tsx", "server.ts"]