#!/bin/bash
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "🚀 Simulating PM2 restart..."
echo "Would run: pm2 restart frontend && pm2 restart backend"
