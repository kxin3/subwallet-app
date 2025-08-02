# SubWallet App Dockerfile
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package.json files
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm install --only=production

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Copy frontend source code
COPY frontend/ ./

# Build frontend
RUN npm run build

# Copy backend source code
WORKDIR /app
COPY backend/ ./backend/

# Debug: Check if build directory exists and list contents
RUN ls -la /app/frontend/
RUN ls -la /app/frontend/build/ || echo "Build directory doesn't exist"

# Create public directory and copy frontend build
RUN mkdir -p /app/backend/public
RUN if [ -d "/app/frontend/build" ]; then \
      echo "Copying build files..." && \
      cp -r /app/frontend/build/* /app/backend/public/ && \
      echo "Build files copied successfully" && \
      ls -la /app/backend/public/; \
    else \
      echo "ERROR: Build directory not found!"; \
    fi

# Set final working directory
WORKDIR /app/backend

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]