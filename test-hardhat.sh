#!/bin/bash
set -e

echo "🧪 Testing Hardhat installation in Docker..."

# Build the container if needed
docker-compose build hardhat

# Run a simple command to test Hardhat installation
echo "Checking Hardhat version..."
docker-compose run --rm hardhat npx hardhat --version

# If we got here, Hardhat is working
echo "✅ Hardhat is working correctly in Docker!"

# Offer to run tests
read -p "Do you want to run the full test suite? (y/n) " REPLY
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🧪 Running smart contract tests..."
  docker-compose run --rm hardhat npx hardhat test
fi 