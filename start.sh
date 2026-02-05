#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Navigate to backend directory
cd backend

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Navigate to project root
cd ..

# Install Node dependencies and build frontend
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo "🔨 Building frontend..."
npm run build

# Move built files to backend static directory
echo "📁 Setting up static files..."
cd ..
mkdir -p backend/static
cp -r frontend/dist/* backend/static/

# Navigate back to backend and start the server
cd backend
echo "✅ Starting FastAPI server..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
