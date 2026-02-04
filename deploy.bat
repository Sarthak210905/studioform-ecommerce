@echo off
REM Production Deployment Script for Windows
setlocal enabledelayedexpansion

echo Starting Production Deployment...

REM Check if .env exists
if not exist "backend\.env" (
    echo Error: backend\.env file not found!
    echo Please copy backend\.env.example to backend\.env and configure it.
    exit /b 1
)

if not exist "frontend\.env" (
    echo Error: frontend\.env file not found!
    echo Please copy frontend\.env.example to frontend\.env and configure it.
    exit /b 1
)

REM Stop existing containers
echo Stopping existing containers...
docker-compose down

REM Build and start containers
echo Building Docker containers...
docker-compose build --no-cache

echo Starting services...
docker-compose up -d

REM Wait for services
echo Waiting for services to start...
timeout /t 10 /nobreak > nul

REM Check container status
echo Container Status:
docker-compose ps

REM Show logs
echo Recent Logs:
docker-compose logs --tail=50

echo Deployment complete!
echo Frontend: http://localhost
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs (dev only)

endlocal
