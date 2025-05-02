# E-Waste Tracker Deployment Guide

This document provides comprehensive instructions for deploying the E-Waste Tracker system. This guide is intended for developers and advanced users who want to understand the deployment process in detail.

> **Note:** For a simpler setup guide targeting Windows users with no technical background, please see [Windows Setup Guide](./WINDOWS_SETUP_GUIDE.md).

## Deployment Options

There are two main ways to deploy the E-Waste Tracker system:

1. **Docker Deployment** (Recommended): Easy, containerized setup that works on any platform
2. **Manual Deployment**: More control, but requires more technical knowledge

## Prerequisites

### For Docker Deployment

- Docker (20.10.0+)
- Docker Compose (2.0.0+)
- Git

### For Manual Deployment

- Node.js (16.0.0+)
- npm (8.0.0+) or yarn (1.22.0+)
- Git
- MetaMask or other Web3 wallet
- Hardhat (for local blockchain)

## Docker Deployment (Recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ewaste-tracker.git
cd ewaste-tracker
```

### 2. Start the Application

```bash
docker-compose up -d
```

This single command will:
- Build all necessary containers
- Start a local Ethereum node
- Deploy the smart contracts
- Add test data automatically
- Start the frontend application

### 3. Access the Application

- Frontend: http://localhost:80
- Blockchain node: http://localhost:8545

### 4. Stopping the Application

When you're done using the application:

```bash
docker-compose down
```

### Docker Deployment Troubleshooting

If you encounter issues with Docker deployment:

1. Check Docker logs:
   ```bash
   docker-compose logs
   ```

2. Rebuild containers from scratch:
   ```bash
   docker-compose down
   docker system prune -f  # This removes unused containers and images
   docker-compose up -d --build
   ```

3. Check if ports 80 and 8545 are available:
   ```bash
   # For Linux/Mac:
   lsof -i :80
   lsof -i :8545
   
   # For Windows:
   netstat -ano | findstr :80
   netstat -ano | findstr :8545
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

## Testing the Deployment

After deployment, you should verify that everything works correctly:

1. Open the application in your browser
2. Connect your wallet
3. Navigate to different sections based on your role
4. Try performing basic operations like registering a device

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

## Security Considerations

For production deployments, consider these security best practices:

1. **Never commit private keys or API keys** to your repository
2. Use environment variables for sensitive information
3. Create a dedicated wallet for contract deployment and administration
4. Conduct thorough testing on a testnet before mainnet deployment
5. Consider a security audit for your smart contracts

## Upgrading the Application

To upgrade the application to a new version:

1. Pull the latest changes:
   ```bash
   git pull origin main
   ```

2. For Docker deployment:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

3. For manual deployment:
   ```bash
   npm install
   cd frontend
   npm install
   cd ..
   npx hardhat run scripts/deploy.js --network localhost
   cd frontend
   npm start
   ```

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
  **Solution**: Make sure you're connected with the admin account. The first account in the Hardhat node is the admin. 