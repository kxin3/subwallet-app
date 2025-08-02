#!/bin/bash

# SubWallet Railway Deployment Script
echo "Deploying SubWallet to Railway..."

# Set production environment variables
export NODE_ENV=production
export PORT=5000

# Navigate to project directory
cd "/mnt/c/Users/hussa/Downloads/Subwallet/New App"

# Try to deploy with Railway
echo "Attempting Railway deployment..."
railway up --service subwallet-app --detach

# If that fails, try creating a new service
if [ $? -ne 0 ]; then
    echo "Creating new service..."
    railway add --service subwallet-app
    railway up --service subwallet-app --detach
fi

echo "Deployment completed!"