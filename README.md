# E-Waste Tracker

A blockchain-based application for tracking electronic waste from collection to recycling or destruction, ensuring transparency and accountability in the e-waste management process.

![E-Waste Tracker Logo](./frontend/public/logo192.png)

## 📑 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [License](#license)

## 🔍 Overview

The E-Waste Tracker is a decentralized application built on Ethereum blockchain technology that provides a secure, transparent, and immutable record of electronic waste management. It enables tracking of devices from the point of collection through transportation, delivery, and final processing (recycling or destruction).

This platform connects:
- **Users** who want to dispose of electronic devices
- **Green Points** (collection centers)
- **Transporters** who move e-waste
- **Recycling Units** that process the e-waste
- **Environmental Inspectors** who monitor the process

By digitizing and securing the e-waste management chain on a blockchain, our application helps reduce illegal dumping, improves accountability, and provides verification of proper e-waste handling.

## ✨ Features

- **Device Registration**: Users can register their electronic devices for disposal
- **Lifecycle Tracking**: Full tracking of each device through its end-of-life journey
- **Role-Based Access Control**: Different permissions for different stakeholders
- **Digital Certificates**: Blockchain-secured certificates for recycled or destroyed devices
- **Verification System**: Ability to verify the authenticity of recycling certificates
- **Transparent History**: Complete, immutable history for each device
- **Interactive Dashboard**: Visual representation of the e-waste management process

## 🏗️ System Architecture

The application consists of:

- **Smart Contracts**: Ethereum-based contracts written in Solidity
  - `EWasteTracker.sol`: Core contract managing devices, users, and tracking
  - `EWasteCertificate.sol`: Contract for issuing and verifying recycling certificates

- **Frontend Application**: React-based web interface with MetaMask integration
  - Modern, responsive UI
  - Role-specific dashboards
  - Device search and management
  - Certificate verification

- **Development Environment**:
  - Hardhat for local blockchain development
  - Docker containers for easy deployment
  - Automated testing and deployment scripts

## 🚀 Getting Started

### Windows Setup (Easiest Method)

For detailed step-by-step instructions for Windows users with no prior development environment:

- [Windows Setup Guide](./docs/WINDOWS_SETUP_GUIDE.md)

### Quick Start with Docker (All Platforms)

1. Install [Docker](https://www.docker.com/products/docker-desktop/) and [Docker Compose](https://docs.docker.com/compose/install/)
2. Clone this repository:
   ```
   git clone https://github.com/GITHUB_USERNAME/ewaste-tracker.git
   cd ewaste-tracker
   ```
3. Start the application:
   
   **On macOS/Linux:**
   ```
   npm run docker:start
   ```
   
   **On Windows:**
   ```
   npm run docker:start:win
   ```
   
   This will:
   - Build all containers
   - Compile smart contracts
   - Run the test suite
   - Deploy contracts
   - Start the frontend
   
4. Open your browser and navigate to:
   ```
   http://localhost:80
   ```

### Connect Your Wallet

1. Install [MetaMask](https://metamask.io/download/)
2. Connect to the local network:
   - RPC URL: `http://localhost:8545`
   - Chain ID: `1337`
3. Import the admin account (optional):
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

### Running Tests

You can run the smart contract test suite with Docker without deploying the full application:

```
npm run docker:test
```

This will run all the tests in a Docker container and show you the results.

## 📚 Documentation

- [User Manual](./docs/USER_MANUAL.md) - Guide for using the application
- [Technical Documentation](./docs/TECHNICAL_DOCUMENTATION.md) - Technical details and architecture
- [API Documentation](./docs/API.md) - Smart contract functions and interactions
- [Deployment Guide](./docs/DEPLOYMENT.md) - Detailed deployment instructions
- [Windows Setup Guide](./docs/WINDOWS_SETUP_GUIDE.md) - Step-by-step guide for Windows users

> Note: Documentation has been streamlined for clarity and ease of use.

## 📊 Project Structure

```
ewaste-tracker/
├── contracts/             # Solidity smart contracts
├── scripts/               # Deployment and utility scripts
├── test/                  # Contract tests
├── frontend/              # React frontend application
├── docs/                  # Documentation
├── docker-compose.yml     # Docker configuration
└── hardhat.config.js      # Hardhat configuration
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
