#!/bin/bash
set -e

echo "🔄 Cleaning up Docker containers and volumes..."

# Stop and remove containers
echo "Stopping containers..."
docker-compose down

# Remove any orphaned containers
echo "Removing any orphaned containers..."
docker-compose down --remove-orphans

# Optional: Remove volumes (uncomment if needed)
# echo "Removing volumes..."
# docker-compose down -v

echo "✅ Docker cleanup completed!"
echo "You can now run './start-docker.sh' to restart the application." 