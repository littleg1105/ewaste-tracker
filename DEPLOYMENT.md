# E-Waste Tracker Deployment Guide

This document provides instructions for deploying the E-Waste Tracker system, including smart contracts and frontend. Follow these steps to set up the complete application.

## Prerequisites

- Node.js (v16+)
- NPM or Yarn
- Docker and Docker Compose (for containerized deployment)

## Local Development Deployment

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ewaste-tracker
```

### 2. Install Dependencies

```bash
npm install
cd frontend
npm install
cd ..
```

### 3. Start a Local Ethereum Node

Run a local Hardhat node for development:

```bash
npm run node
```

This will start a local Ethereum network on `http://localhost:8545`.

### 4. Deploy Smart Contracts

In a new terminal, deploy the smart contracts to your local network:

```bash
npm run deploy
```

This script:
- Deploys the `EWasteTracker` contract
- Deploys the `EWasteCertificate` contract
- Saves contract addresses to `frontend/src/contractAddresses.json`

### 5. Reset Frontend (Important for Re-deployments)

If you're redeploying contracts or experiencing frontend connection issues:

```bash
npm run reset-frontend
```

This script:
- Updates contract addresses
- Creates a timestamp file to force cache refresh
- Updates imports in critical files

### 6. Add Test Data (Optional)

To add test users, devices, and simulate the e-waste lifecycle:

```bash
npm run add-test-data
```

### 7. Verify Deployment

To ensure everything is set up correctly:

```bash
npm run test-deployment
```

### 8. Start the Frontend

Navigate to the frontend directory and start the development server:

```bash
cd frontend
npm run build  # Important after contract changes
npm run start
```

The frontend application will be available at `http://localhost:3000`.

## Complete Reset and Redeploy (For Troubleshooting)

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

## Docker Deployment (Recommended)

The project includes Docker configuration for containerized deployment, which handles all steps automatically.

### Quick Start

The easiest way to start the application with Docker:

```bash
# Using the convenience script (recommended)
npm run docker:start

# Or manually
docker-compose down
docker-compose build
docker-compose up -d
```

This will:
1. Start a container with a Hardhat node
2. Automatically deploy all contracts
3. Start the frontend application
4. Make the frontend available at `http://localhost:3000`

### Docker Commands

Several Docker-specific commands are available in package.json:

```bash
# Start the application (build, deploy contracts, start frontend)
npm run docker:start

# Build the Docker containers
npm run docker:build

# Start the containers (assumes they're already built)
npm run docker:up

# Stop the containers
npm run docker:down

# View logs from all containers
npm run docker:logs

# Explicitly run contract deployment (rarely needed)
npm run docker:deploy
```

### Docker Architecture

The Docker setup consists of:

1. **Hardhat container**:
   - Runs a local Ethereum node
   - Automatically deploys contracts when started
   - Adds test data to the blockchain

2. **Frontend container**:
   - Web interface served via Nginx
   - Automatically connects to the Hardhat node
   - Caches contract addresses from deployment

3. **Deployer container** (on-demand):
   - Utility container for running deployment scripts
   - Only runs when explicitly requested

### Troubleshooting Docker Deployment

If you encounter issues with Docker deployment:

1. Check container logs:
   ```bash
   npm run docker:logs
   ```

2. Restart the containers:
   ```bash
   npm run docker:down
   npm run docker:start
   ```

3. Verify all containers are running:
   ```bash
   docker-compose ps
   ```

4. Clear Docker volumes and rebuild:
   ```bash
   docker-compose down -v
   npm run docker:start
   ```

## Deployment Scripts

The repository includes several scripts for the deployment process:

- `scripts/deploy.js`: Deploys the smart contracts
- `scripts/addTestData.js`: Adds test users, devices, and simulates the e-waste lifecycle
- `scripts/testDeployment.js`: Verifies that the deployment is working correctly
- `scripts/resetFrontend.js`: Resets frontend configuration after contract redeployment
- `scripts/resetAndRedeploy.js`: Comprehensive script for full application reset and redeployment

## Contract Addresses

After deployment, the contract addresses are saved to:
```
frontend/src/contractAddresses.json
```

The frontend automatically reads this file to connect to the deployed contracts.

## Troubleshooting

### Contract Deployment Issues

- Check that Hardhat node is running and accessible
- Verify proper network configuration in `hardhat.config.js`
- Check console for deployment errors

### Frontend Connection Issues

- Verify that contract addresses are correctly saved in `frontend/src/contractAddresses.json`
- Run `npm run reset-frontend` to update contract references
- Clear browser cache and local storage
- Ensure the frontend is configured to connect to the correct network
- Check browser console for connection errors

### Permission Issues

If you have permission errors (e.g., "You do not have permission to access this page"):
- Check that you're connected with the correct wallet address
- Verify that the account has the proper role in the contract
- The contract owner (deployer) should automatically have admin rights
- Run `npm run reset-and-redeploy` to fix permission detection issues

### Test Data Issues

If test data cannot be added:
- Verify that contracts were deployed successfully
- Check that you're using the correct account with admin privileges
- Review error messages for specific issues 