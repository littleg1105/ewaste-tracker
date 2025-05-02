#!/bin/bash
set -e

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
  npm run compile
  
  echo "🧪 Running tests..."
  npm test
  
  echo "🔄 Deploying contracts..."
  npm run deploy
  
  echo "🔄 Resetting frontend..."
  npm run reset-frontend
  
  echo "🔄 Adding test data..."
  npm run add-test-data
  
  echo "🔄 Testing deployment..."
  npm run test-deployment
  
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