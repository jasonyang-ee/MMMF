# =============================================================================
# MMMF Docker Build Configuration
# =============================================================================
# Multi-stage build for optimal image size
# Stage 1: Build the frontend
# Stage 2: Production runtime with only necessary files
# =============================================================================

# Stage 1: Build stage
FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --ignore-scripts

# Copy source files needed for build
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.cjs ./
COPY index.html ./
COPY client ./client
COPY public ./public

# Build frontend
RUN npm run build

# Stage 2: Production stage
FROM node:24-alpine AS runtime

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --ignore-scripts \
	&& npm cache clean --force

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy server files
COPY server ./server

# Create data directory for file-based database
RUN mkdir -p /app/data

# Expose port
EXPOSE 5173

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5173
# Default language for server-side defaults (en|es)
ENV DEFAULT_LANGUAGE=en

HEALTHCHECK --interval=5m --timeout=10s --start-period=10s --retries=3 \
	CMD curl -f http://127.0.0.1:5173/ || exit 1

# Start the application
ENTRYPOINT ["node", "server/index.js"]
