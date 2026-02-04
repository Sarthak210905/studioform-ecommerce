#!/bin/bash

# Production Deployment Script
set -e

echo "🚀 Starting Production Deployment..."

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env file not found!"
    echo "📝 Please copy backend/.env.example to backend/.env and configure it."
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    echo "❌ Error: frontend/.env file not found!"
    echo "📝 Please copy frontend/.env.example to frontend/.env and configure it."
    exit 1
fi

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Build and start containers
echo "🏗️ Building Docker containers..."
docker-compose down
docker-compose build --no-cache

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check container status
echo "📊 Container Status:"
docker-compose ps

# Check logs
echo "📝 Recent Logs:"
docker-compose logs --tail=50

echo "✅ Deployment complete!"
echo "🌐 Frontend: http://localhost"
echo "🔗 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs (dev only)"
