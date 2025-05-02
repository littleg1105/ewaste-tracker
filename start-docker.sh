#!/bin/bash
set -e

echo "🔄 Starting E-Waste Tracker in Docker..."

# Install the wget package if needed (for healthchecks)
if ! command -v wget &> /dev/null; then
    echo "⚠️ 'wget' command not found. Installing wget..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install wget
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update && sudo apt-get install -y wget
    fi
fi

# Ensure frontend directory exists
if [ ! -d "./frontend" ]; then
    echo "❌ Frontend directory not found! Make sure you're in the root project directory."
    exit 1
fi

# Ensure frontend/src directory exists
mkdir -p ./frontend/src

# Build and start the containers
echo "🔄 Building and starting Docker containers..."
echo "   (This will compile contracts, run tests, and deploy everything)"
docker-compose down
docker-compose build
docker-compose up -d

echo "🔄 Waiting for services to be ready..."
sleep 5

# Wait for hardhat node to be ready
echo "Waiting for Hardhat node to be ready..."
MAX_RETRIES=30
count=0
while ! wget -q --spider http://localhost:8545 2>/dev/null; do
    if [ $count -eq $MAX_RETRIES ]; then
        echo "❌ Hardhat node not ready after $MAX_RETRIES attempts. Check logs with: docker-compose logs hardhat"
        exit 1
    fi
    echo "⌛ Waiting for Hardhat node... (attempt $count/$MAX_RETRIES)"
    sleep 2
    ((count++))
done
echo "✅ Hardhat node is running at http://localhost:8545"

# Check if frontend is running
echo "Waiting for Frontend to be ready..."
count=0
while ! wget -q --spider http://localhost:80 2>/dev/null; do
    if [ $count -eq $MAX_RETRIES ]; then
        echo "❌ Frontend not ready after $MAX_RETRIES attempts. Check logs with: docker-compose logs frontend"
        exit 1
    fi
    echo "⌛ Waiting for Frontend... (attempt $count/$MAX_RETRIES)"
    sleep 2
    ((count++))
done
echo "✅ Frontend is running at http://localhost:80"

echo ""
echo "🎉 E-Waste Tracker is now running!"
echo "📋 Access points:"
echo "- Frontend: http://localhost:80"
echo "- Blockchain: http://localhost:8545"
echo ""
echo "📝 To view logs, run: docker-compose logs -f"
echo "📝 To stop the app, run: docker-compose down" 