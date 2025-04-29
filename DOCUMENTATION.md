# E-Waste Tracker Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Development Setup](#development-setup)
5. [Deployment](#deployment)
6. [Usage Guide](#usage-guide)
7. [API Reference](#api-reference)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

## System Overview

The E-Waste Tracker is a blockchain-based system designed to track electronic waste from disposal to recycling/destruction. It provides a transparent and immutable record of the entire lifecycle of electronic devices, ensuring proper handling and disposal.

### Key Features
- Device registration and tracking
- Role-based access control
- Complete device lifecycle management
- Digital certificates for recycling/destruction
- Real-time device status updates
- Detailed device history
- Certificate verification

## Architecture

### Smart Contracts
1. **EWasteTracker.sol**
   - Main contract for device tracking
   - Manages user roles and permissions
   - Handles device lifecycle events
   - Stores device history

2. **EWasteCertificate.sol**
   - Manages recycling certificates
   - Handles certificate issuance and revocation
   - Provides verification functionality

### Frontend
- React-based single-page application
- Web3 integration for blockchain interaction
- Role-based UI components
- Real-time updates using event listeners

### Development Environment
- Hardhat for smart contract development
- Docker for containerization
- Nginx for frontend serving
- Node.js for development tools

## Installation

### Prerequisites
- Docker and Docker Compose
- Node.js (v16 or later)
- npm or yarn
- MetaMask or other Web3 wallet
- Git

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ewaste-tracker.git
cd ewaste-tracker
```

2. Create environment files:
```bash
# Create .env file in root directory
cp .env.example .env

# Create .env file in frontend directory
cp frontend/.env.example frontend/.env
```

3. Start the development environment using Docker:
```bash
docker-compose up --build
```

This will start:
- Hardhat node on port 8545
- Frontend application on port 80

### Manual Setup (without Docker)

1. Install dependencies:
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

2. Start the development environment:
```bash
# Start Hardhat node
npx hardhat node

# In a new terminal, deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Start frontend development server
cd frontend
npm start
```

## Development Setup

### Smart Contract Development

1. Contract Structure:
```
contracts/
├── EWasteTracker.sol
├── EWasteCertificate.sol
└── interfaces/
    └── IEWasteTracker.sol
```

2. Testing:
```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/EWasteTracker.test.js
```

3. Deployment:
```bash
# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Deploy to testnet
npx hardhat run scripts/deploy.js --network goerli
```

### Frontend Development

1. Project Structure:
```
frontend/
├── src/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   └── utils/
├── public/
└── package.json
```

2. Development Server:
```bash
cd frontend
npm start
```

3. Building for Production:
```bash
cd frontend
npm run build
```

## Deployment

### Smart Contract Deployment

1. Configure network in `hardhat.config.js`:
```javascript
module.exports = {
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY]
    }
  }
};
```

2. Deploy contracts:
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

### Frontend Deployment

1. Build the application:
```bash
cd frontend
npm run build
```

2. Deploy to hosting service (e.g., Netlify, Vercel):
```bash
# Example for Netlify
netlify deploy --prod
```

## Usage Guide

### User Roles

1. **Admin**
   - Add/remove users
   - Manage system settings
   - View all devices and certificates

2. **User**
   - Register devices
   - View own devices
   - Track device status

3. **Green Point**
   - Collect devices
   - Update collection status
   - View collected devices

4. **Transporter**
   - Transport devices
   - Update transport status
   - View transported devices

5. **Recycling Unit**
   - Process devices
   - Issue certificates
   - View processed devices

6. **Environment Inspector**
   - View all data
   - Verify certificates
   - Monitor compliance

### Device Lifecycle

1. **Registration**
   - User registers device with details
   - System generates unique ID
   - Initial status set to "Registered"

2. **Collection**
   - Green Point collects device
   - Updates collection status
   - Records collection details

3. **Transport**
   - Transporter picks up device
   - Updates transport status
   - Records transport details

4. **Processing**
   - Recycling Unit receives device
   - Processes device
   - Updates processing status

5. **Certification**
   - Recycling Unit issues certificate
   - Certificate linked to device
   - Status updated to "Recycled" or "Destroyed"

## API Reference

See [API.md](API.md) for detailed API documentation.

## Testing

### Smart Contract Testing

1. Unit Tests:
```bash
npx hardhat test
```

2. Coverage Report:
```bash
npx hardhat coverage
```

### Frontend Testing

1. Unit Tests:
```bash
cd frontend
npm test
```

2. E2E Tests:
```bash
cd frontend
npm run test:e2e
```

## Troubleshooting

### Common Issues

1. **Contract Deployment Failures**
   - Check network configuration
   - Verify account balance
   - Check gas limits

2. **Frontend Connection Issues**
   - Verify MetaMask connection
   - Check network configuration
   - Clear browser cache

3. **Docker Issues**
   - Check port availability
   - Verify Docker daemon status
   - Check container logs

### Support

For additional support:
- Open an issue on GitHub
- Contact the development team
- Check the FAQ section

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 