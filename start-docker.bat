@echo off
echo 🔄 Starting E-Waste Tracker in Docker...

REM Ensure frontend/src directory exists
if not exist ".\frontend\src" (
    mkdir ".\frontend\src"
)

echo 🔄 Building and starting Docker containers...
echo    (This will compile contracts, run tests, and deploy everything)
docker-compose down

REM Build containers
echo 🔄 Building containers...
docker-compose build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Container build failed. See error above.
    exit /b 1
)

REM Start containers
echo 🔄 Starting containers...
docker-compose up -d

REM Show status
echo 🔄 Container status:
docker-compose ps

echo 🔄 Waiting for services to be ready...
timeout /t 5 /nobreak > nul

echo.
echo 🎉 E-Waste Tracker is now running!
echo 📋 Access points:
echo - Frontend: http://localhost:80
echo - Blockchain: http://localhost:8545
echo.
echo 📝 To view logs, run: docker-compose logs -f
echo 📝 To stop the app, run: docker-compose down 