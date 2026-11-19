# Build stage - Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Build stage - Backend (compile TS to JS)
FROM node:20-alpine AS backend-build
WORKDIR /app
COPY package.json package-lock.json* tsconfig.json* ./
RUN npm install --legacy-peer-deps
COPY server.ts ./
COPY metadata.json ./
RUN npx esbuild server.ts --bundle --platform=node --format=esm --outfile=server.mjs --packages=external

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy compiled backend and built frontend
COPY --from=backend-build /app/server.mjs ./server.mjs
COPY admin_database.json ./
COPY metadata.json ./
COPY index.html ./
COPY --from=frontend-build /app/dist ./dist

# Create data directory for persistent JSON storage
RUN mkdir -p /app/data && chown -R node:node /app/data

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health || exit 1

USER node
CMD ["node", "server.mjs"]