# E-Waste Tracker Deployment Guide

This document provides comprehensive instructions for deploying the E-Waste Tracker system. Choose the deployment method that best suits your needs.

## Deployment Options

There are two main ways to deploy the E-Waste Tracker system:

1. **Docker Deployment** (Recommended): Easy, containerized setup that works on any platform
2. **Manual Deployment**: More control, but requires more technical knowledge

## Prerequisites

### For Docker Deployment

- Docker (20.10.0+)
- Docker Compose (2.0.0+)
- Git
- Wget or cURL (for testing)

### For Manual Deployment

- Node.js (16.0.0+)
- npm (8.0.0+) or yarn (1.22.0+)
- Git
- MetaMask or other Web3 wallet
- Hardhat (for local blockchain)

## Docker Deployment (Recommended)

### Quick Start

The easiest way to start the entire application with Docker:

```bash
# Using npm scripts (recommended)
npm run docker:start

# Or with docker-compose directly
docker-compose up -d
```

This single command will:
- Build all necessary containers
- Start a local Ethereum node
- Compile the smart contracts
- Run the test suite to verify contract functionality 
- Deploy the smart contracts
- Add test data automatically
- Start the frontend application

### Available Commands

```bash
# Start the application (all-in-one)
npm run docker:start

# Clean up containers and start fresh
npm run docker:clean
npm run docker:start

# Or do it in one step
npm run docker:restart

# View logs for debugging
npm run docker:logs
```

### Access the Application

- **Frontend**: http://localhost:80
- **Blockchain node**: http://localhost:8545

### Docker Architecture

The Docker setup consists of:

1. **Hardhat Container**: 
   - Handles smart contract deployment
   - Runs the local Ethereum node
   - Compiles and tests smart contracts
   - Automatically adds test data

2. **Frontend Container**: 
   - Nginx-based web server
   - Serves the React application
   - Connects to contracts deployed by Hardhat container

### Manually Checking Deployment

After deployment, you can verify everything is working:

```bash
# Check if contract addresses are available
wget -q -O- http://localhost:80/contractAddresses.json

# Check hardhat node status
wget -q --spider http://localhost:8545
```

### Stopping the Application

When you're done using the application:

```bash
# Using npm scripts
npm run docker:down

# Or with docker-compose directly
docker-compose down
```

### Docker Deployment Troubleshooting

If you encounter issues with Docker deployment:

1. Check container logs:
   ```bash
   # Using npm scripts
   npm run docker:logs
   
   # Or with docker-compose directly
   docker-compose logs
   ```

2. Restart the containers:
   ```bash
   npm run docker:restart
   
   # Or with docker-compose directly
   docker-compose down
   docker-compose up -d
   ```

3. Verify all containers are running:
   ```bash
   docker-compose ps
   ```

4. Rebuild containers from scratch:
   ```bash
   docker-compose down
   docker system prune -f  # This removes unused containers and images
   docker-compose up -d --build
   ```

5. Check if ports 80 and 8545 are available:
   ```bash
   # For Linux/Mac:
   lsof -i :80
   lsof -i :8545
   
   # For Windows:
   netstat -ano | findstr :80
   netstat -ano | findstr :8545
   ```

6. Clear Docker volumes and rebuild:
   ```bash
   docker-compose down -v
   npm run docker:start
   ```

## Manual Deployment

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ewaste-tracker.git
cd ewaste-tracker
```

### 2. Install Dependencies

```bash
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Start a Local Ethereum Node

```bash
npx hardhat node
```

This will start a local Ethereum blockchain at http://localhost:8545 with pre-funded test accounts.

### 4. Deploy Smart Contracts

In a new terminal:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

This will:
- Deploy the EWasteTracker contract
- Deploy the EWasteCertificate contract
- Save contract addresses to frontend/src/contractAddresses.json

### 5. Add Test Data (Optional)

```bash
npx hardhat run scripts/addTestData.js --network localhost
```

This adds sample users, devices, and transactions to test the system.

### 6. Start the Frontend

```bash
cd frontend
npm start
```

The application will be available at http://localhost:3000.

### 7. Connect MetaMask

1. Install the [MetaMask](https://metamask.io/) extension
2. Create or import a wallet
3. Connect to the local network:
   - Network Name: Localhost
   - RPC URL: http://localhost:8545
   - Chain ID: 1337
   - Currency Symbol: ETH
4. Import a test account (optional):
   - When you started the Hardhat node, it printed several private keys
   - Use the first one for admin access

## Reset and Redeploy (For Troubleshooting)

If you're experiencing issues with the application, you can completely reset and redeploy everything:

```bash
npm run reset-and-redeploy
```

This comprehensive script:
1. Cleans the project
2. Recompiles all contracts
3. Deploys contracts to the local network
4. Resets the frontend configuration
5. Adds test data
6. Verifies the deployment
7. Checks for common issues

After running this script, make sure to:
1. Rebuild and restart the frontend
2. Clear your browser cache (Application tab > Storage > Clear Site Data)
3. Reload the page

## Production Deployment (Advanced)

For a production environment, you need to deploy to a real Ethereum network.

### 1. Update Hardhat Config

Edit hardhat.config.js to include your target network:

```javascript
module.exports = {
  solidity: "0.8.19",
  networks: {
    // Your production network config
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY]
    },
    // For mainnet when ready
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY]
    }
  }
};
```

### 2. Create an Environment File

Create a .env file with your credentials:

```
PRIVATE_KEY=your_private_key
INFURA_API_KEY=your_infura_api_key
```

Install dotenv:

```bash
npm install dotenv
```

### 3. Deploy to the Network

```bash
npx hardhat run scripts/deploy.js --network goerli
```

### 4. Update Frontend Configuration

The deploy script automatically updates frontend/src/contractAddresses.json.

### 5. Build and Deploy the Frontend

```bash
cd frontend
npm run build
```

Then deploy the build folder to your web hosting service.

## Deployment Scripts

The repository includes several scripts to help with deployment:

- `scripts/deploy.js`: Deploys the smart contracts
- `scripts/addTestData.js`: Adds test users, devices, and simulates the e-waste lifecycle
- `scripts/testDeployment.js`: Verifies that the deployment is working correctly
- `scripts/resetFrontend.js`: Resets frontend configuration after contract redeployment
- `scripts/resetAndRedeploy.js`: Comprehensive script for full application reset and redeployment

## Common Issues and Solutions

### Contract Deployment Issues

- **Error**: "Cannot find module '@nomicfoundation/hardhat-toolbox'"
  **Solution**: Run `npm install @nomicfoundation/hardhat-toolbox`

- **Error**: "HH8: There's one or more errors in your solidity code"
  **Solution**: Check your Solidity code for errors, especially version mismatches

### Frontend Connection Issues

- **Error**: "Contract addresses not found"
  **Solution**: Make sure you've run the deploy script and it completed successfully

- **Error**: "MetaMask - RPC Error: Error: [ethjs-query] while formatting outputs from RPC"
  **Solution**: Ensure your MetaMask is connected to the correct network (http://localhost:8545, Chain ID: 1337)

### Permission Issues

- **Error**: "You don't have permission to access this page"
  **Solution**: 
  - Make sure you're connected with the admin account. The first account in the Hardhat node is the admin.
  - Check that you're using the correct account with admin privileges
  - Verify that the account has the proper role in the contract

### Browser Connection Issues

If you have permission errors or can't load devices:
1. Clear your browser cache:
   - Open developer tools
   - Go to Application → Storage → Clear Site Data
   - Reload the page 