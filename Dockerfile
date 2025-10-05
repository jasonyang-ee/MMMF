# Use Debian-based Node.js image
FROM node:20-bookworm-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy application files
COPY . .

# Build frontend
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Create data directory for file-based database
RUN mkdir -p /app/data

# Expose port
EXPOSE 3600

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3600

# Start the application
CMD ["node", "server/index.js"]
