# Optimized Dockerfile for SubWallet App
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl

# Copy package files
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci --omit=dev --silent

# Install frontend dependencies and build
WORKDIR /app/frontend
RUN npm ci --silent
COPY frontend/ ./
RUN npm run build

# Copy backend files
WORKDIR /app
COPY backend/ ./backend/

# Copy built frontend to backend public folder
RUN cp -r /app/frontend/build/* /app/backend/public/ 2>/dev/null || mkdir -p /app/backend/public

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
WORKDIR /app/backend
CMD ["node", "server.js"]