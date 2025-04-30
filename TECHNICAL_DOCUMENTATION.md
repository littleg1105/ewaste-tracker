# E-Waste Tracking System - Technical Documentation

This document provides technical details about the E-Waste Tracking System architecture, implementation, and development guidelines.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Smart Contracts](#smart-contracts)
3. [Frontend Application](#frontend-application)
4. [Development Setup](#development-setup)
5. [Deployment Guide](#deployment-guide)
6. [API Reference](#api-reference)
7. [Security Considerations](#security-considerations)
8. [Future Enhancements](#future-enhancements)

## System Architecture

The E-Waste Tracking System follows a decentralized architecture with the following components:

### High-Level Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│                 │      │                  │      │                 │
│  React Frontend │<────>│  Ethereum Node   │<────>│ Smart Contracts │
│                 │      │                  │      │                 │
└─────────────────┘      └──────────────────┘      └─────────────────┘
```

1. **Smart Contracts**: Deployed on the Ethereum blockchain, providing the business logic and data storage for the application.
2. **Frontend Application**: A React-based web application that interacts with the smart contracts through Web3.js.
3. **Blockchain Network**: The Ethereum network where the smart contracts are deployed (can be local, testnet, or mainnet).

## Smart Contracts

The system uses two main smart contracts:

### EWasteTracker Contract

The core contract that manages device tracking, user roles, and the complete lifecycle of electronic waste.

#### Key Features

- User management (add, deactivate, update roles)
- Device registration and lifecycle tracking
- Role-based access control
- Comprehensive event logging
- Device history tracking

#### Data Structures

- **User**: Stores user information, roles, and status
- **Device**: Stores device details, status, and ownership
- **History**: Tracks the timeline of status changes for devices

#### Functions

- `addUser(address _userAddress, string memory _name, Role _role)`: Add a new user
- `deactivateUser(address _userAddress)`: Deactivate an existing user
- `updateUserRole(address _userAddress, Role _newRole)`: Update a user's role
- `registerDevice(...)`: Register a new device for tracking
- `collectDevice(uint256 _deviceId, string memory _notes)`: Mark a device as collected
- `startTransport(uint256 _deviceId, string memory _route)`: Record transport initiation
- `deliverDevice(uint256 _deviceId, address _recyclingUnit)`: Record device delivery
- `processDevice(uint256 _deviceId, bool _isRecycled, string memory _processDetails)`: Process a device (recycle or destroy)
- `getDeviceById(uint256 _deviceId)`: Retrieve device details
- `getDeviceHistory(uint256 _deviceId)`: Get the complete history of a device
- `getUserDevices(address _userAddress)`: Get all devices owned by a user
- `getDevicesByStatus(DeviceStatus _status)`: Get all devices with a specific status

### EWasteCertificate Contract

A contract for issuing and verifying digital certificates for processed devices.

#### Key Features

- Certificate issuance
- Certificate verification
- Certificate management (revocation)

#### Data Structures

- **Certificate**: Stores certificate details, issuance information, and validity status

#### Functions

- `issueCertificate(uint256 _deviceId, string memory _processMethod)`: Issue a new certificate
- `revokeCertificate(uint256 _certificateId)`: Revoke an issued certificate
- `verifyCertificate(uint256 _certificateId)`: Verify certificate authenticity
- `getCertificate(uint256 _certificateId)`: Retrieve certificate details
- `getCertificatesByDevice(uint256 _deviceId)`: Get all certificates for a device

## Frontend Application

### Technology Stack

- **React**: Frontend framework
- **Ethers.js**: Ethereum library for contract interaction
- **Web3Modal**: Library for wallet connection
- **React Router**: For application routing
- **Tailwind CSS**: For styling components

### Key Components

#### Context Providers

1. **AuthContext**: Manages wallet connection and user authentication
   - Handles wallet connection/disconnection
   - Tracks the connected account
   - Manages user roles and permissions

2. **ContractContext**: Manages contract instances and interactions
   - Initializes contract connections
   - Provides contract methods to components
   - Handles contract state updates

#### Pages

1. **Home**: Landing page with overview information
2. **AdminPanel**: User management interface for administrators
3. **GreenPointDashboard**: Interface for Green Points to collect devices
4. **TransporterDashboard**: Interface for Transporters to manage device transport
5. **RecyclingUnitDashboard**: Interface for Recycling Units to process devices
6. **InspectorDashboard**: Interface for Environment Inspectors to monitor the system

#### Reusable Components

- **Navigation**: Navigation bar with role-based menu items
- **ConnectWallet**: Wallet connection component
- **DeviceRegistration**: Form for registering new devices
- **DeviceSearch**: Component for searching and displaying devices
- **CertificateDisplay**: Component for displaying and verifying certificates

## Development Setup

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- MetaMask or other Ethereum wallet
- Hardhat for local blockchain development

### Installation Steps

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ewaste-tracker.git
   cd ewaste-tracker
   ```

2. Install dependencies:
   ```
   npm install
   cd frontend
   npm install
   cd ..
   ```

3. Start a local Hardhat node:
   ```
   npx hardhat node
   ```

4. Deploy the contracts:
   ```
   npx hardhat run scripts/deploy.js --network localhost
   ```

5. Update contract addresses in `frontend/src/contractAddresses.json`:
   ```json
   {
     "EWasteTracker": "deployed_tracker_address",
     "EWasteCertificate": "deployed_certificate_address"
   }
   ```

6. Start the frontend application:
   ```
   cd frontend
   npm start
   ```

## Deployment Guide

### Smart Contract Deployment

1. Configure the desired network in `hardhat.config.js`:
   ```javascript
   module.exports = {
     networks: {
       testnet: {
         url: "https://testnet-rpc-url",
         accounts: [process.env.PRIVATE_KEY]
       },
       mainnet: {
         url: "https://mainnet-rpc-url",
         accounts: [process.env.PRIVATE_KEY]
       }
     },
     // ...
   };
   ```

2. Set environment variables:
   - Create a `.env` file with your private key and API endpoints
   - Example: `PRIVATE_KEY=your_private_key`

3. Deploy to the desired network:
   ```
   npx hardhat run scripts/deploy.js --network testnet
   ```

4. Save the deployed contract addresses

### Frontend Deployment

1. Update `frontend/src/contractAddresses.json` with production contract addresses

2. Build the production version:
   ```
   cd frontend
   npm run build
   ```

3. Deploy the static files from the `build` directory to your web server or hosting service

### Docker Deployment

The project includes Docker configuration for containerized deployment:

1. Build the Docker image:
   ```
   docker-compose build
   ```

2. Run the containers:
   ```
   docker-compose up -d
   ```

## API Reference

### Smart Contract Events

#### EWasteTracker Events

- `UserAdded(address indexed userAddress, string name, Role role)`
- `UserDeactivated(address indexed userAddress)`
- `UserRoleUpdated(address indexed userAddress, Role newRole)`
- `DeviceRegistered(uint256 indexed deviceId, string serialNumber, address owner)`
- `DeviceCollected(uint256 indexed deviceId, address collector)`
- `DeviceInTransit(uint256 indexed deviceId, address transporter)`
- `DeviceDelivered(uint256 indexed deviceId, address transporter, address recyclingUnit)`
- `DeviceProcessed(uint256 indexed deviceId, DeviceStatus status, address processor)`

#### EWasteCertificate Events

- `CertificateIssued(uint256 indexed certificateId, uint256 indexed deviceId, address recyclingUnit)`
- `CertificateRevoked(uint256 indexed certificateId)`

### Frontend API Integration

The frontend integrates with the smart contracts through Ethers.js. Key integration points include:

- User authentication via Web3Modal
- Contract initialization in the ContractContext
- Role-based access control in page components
- Transaction management with loading states and error handling

## Security Considerations

### Smart Contract Security

- **Access Control**: Role-based permissions ensure only authorized users can perform specific actions
- **Input Validation**: All functions validate inputs to prevent unexpected behavior
- **State Management**: Clear state transitions and validations between device lifecycle stages
- **Event Logging**: Comprehensive event emission for auditability

### Frontend Security

- **Wallet Connection**: Secure wallet connection via Web3Modal
- **Error Handling**: Proper error handling for failed transactions
- **Network Validation**: Verification of correct network connection
- **Data Validation**: Client-side validation before sending transactions

## Future Enhancements

Potential improvements for future versions:

1. **Multi-Signature Approval**: Require multiple approvals for critical operations
2. **Batch Operations**: Support for processing multiple devices in a single transaction
3. **Mobile Application**: Dedicated mobile app for field operations
4. **QR Code Integration**: Scan devices with QR codes for easier tracking
5. **Analytics Dashboard**: Advanced analytics for system-wide monitoring
6. **Real-time Notifications**: Event-based notifications for status changes
7. **Geolocation Tracking**: Integration with GPS for route verification
8. **Interoperability**: Integration with other waste management systems
9. **Carbon Credits**: Integration with carbon credit systems for environmental impact tracking
10. **Regulatory Compliance Reports**: Automated reporting for regulatory bodies 