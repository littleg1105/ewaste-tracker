# E-Waste Tracker Frontend

This is the frontend for the E-Waste Tracker application, a blockchain-based platform for monitoring electronic waste from registration to final processing.

## Docker Deployment (Recommended)

The easiest way to run the entire application is using Docker:

```bash
# From the root directory of the project
docker-compose up -d
```

This will:
- Build and start all necessary containers
- Deploy the smart contracts automatically
- Start the frontend on http://localhost:80
- Connect to the local blockchain on http://localhost:8545

## Local Development

If you need to work on the frontend specifically:

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Running instance of the Ethereum blockchain (hardhat node)
- Deployed smart contracts

### Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

> **Important**: For the frontend to work correctly, you need:
> - A running Hardhat node (`npx hardhat node` from project root)
> - Deployed contracts (`npx hardhat run scripts/deploy.js --network localhost`)
> - Test data (optional: `npx hardhat run scripts/addTestData.js --network localhost`)

## Building for Production

```bash
npm run build
```

This builds the app for production to the `build` folder, optimized for performance with minified bundles.

## Connecting to the Blockchain

The frontend automatically connects to the blockchain using the contract addresses in `src/contractAddresses.json`. This file is generated when contracts are deployed.

### MetaMask Configuration

To interact with the application:
1. Install [MetaMask](https://metamask.io/download/)
2. Connect to the local network:
   - Network Name: `E-Waste Local`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`
3. Import the admin account (private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`)

## Available Scripts

- `npm start` - Run development server on port 3000
- `npm test` - Run tests
- `npm run build` - Build for production

## Troubleshooting

### Connection Issues
If you see "Connecting..." or cannot interact with contracts:
- Ensure the Hardhat node is running
- Check that contracts are deployed
- Verify your MetaMask is connected to the right network
- Clear browser cache if needed

### Permission Errors
If you see "You don't have permission":
- Make sure you're using the admin account
- Verify you're connected to the correct network

