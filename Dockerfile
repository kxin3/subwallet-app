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

# Create public directory and copy frontend build
RUN mkdir -p /app/backend/public
RUN cp -r /app/frontend/build/* /app/backend/public/ || echo "No build files to copy"

# Set final working directory
WORKDIR /app/backend

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]