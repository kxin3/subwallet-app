# Optimized Dockerfile for SubWallet App
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl

# Install backend dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --production

# Install frontend dependencies and build
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install
COPY frontend/ ./
RUN npm run build

# Copy backend files
WORKDIR /app
COPY backend/ ./backend/

# Copy built frontend to backend public folder
RUN mkdir -p /app/backend/public && cp -r /app/frontend/build/* /app/backend/public/ 2>/dev/null || true

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
WORKDIR /app/backend
CMD ["node", "server.js"]