#!/bin/bash
set -e

# Check if hardhat is available
echo "Checking Hardhat installation..."
if ! command -v npx &> /dev/null; then
    echo "Error: npx is not installed or not in PATH"
    exit 1
fi

npx hardhat --version || { echo "Error: Hardhat is not properly installed"; exit 1; }
echo "Hardhat is installed and available!"

# Function for waiting for the hardhat node to be ready
wait_for_hardhat() {
  echo "Waiting for Hardhat node to be ready..."
  
  MAX_RETRIES=30
  count=0
  while ! wget -q --spider http://localhost:8545 2>/dev/null; do
    if [ $count -eq $MAX_RETRIES ]; then
      echo "Error: Hardhat node not available after $MAX_RETRIES attempts"
      exit 1
    fi
    sleep 1
    echo "Waiting for Hardhat node... (attempt $((count+1))/$MAX_RETRIES)"
    count=$((count+1))
  done
  
  echo "Hardhat node is up and running!"
  sleep 3 # Give it a bit more time to initialize
}

# Function to set up the contracts
setup_contracts() {
  echo "🔄 Compiling contracts..."
  npx hardhat compile
  
  echo "🧪 Running tests..."
  npx hardhat test
  
  echo "🔄 Deploying contracts..."
  npx hardhat run scripts/deploy.js --network localhost
  
  echo "🔄 Resetting frontend..."
  node scripts/resetFrontend.js
  
  echo "🔄 Adding test data..."
  npx hardhat run scripts/addTestData.js --network localhost
  
  echo "🔄 Testing deployment..."
  npx hardhat run scripts/testDeployment.js --network localhost
  
  echo "✅ Contract setup completed!"
}

# If the command is to deploy contracts
if [ "$1" = "deploy-contracts" ]; then
  wait_for_hardhat
  setup_contracts
  exit 0
fi

# If the command is to run hardhat node and deploy contracts
if [ "$1" = "node-and-deploy" ]; then
  # Start hardhat node in background
  npx hardhat node &
  
  # Wait for hardhat node to be ready
  wait_for_hardhat
  
  # Setup contracts
  setup_contracts
  
  # Keep container running
  tail -f /dev/null
  exit 0
fi

# Execute the command passed to docker run
exec "$@" 