# E-Waste Tracker

A blockchain-based system for tracking electronic waste from disposal to recycling/destruction.

## Features

- Device registration and tracking
- Role-based access control
- Complete device lifecycle management
- Digital certificates for recycling/destruction
- Real-time device status updates
- Detailed device history
- Certificate verification

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- MetaMask or other Web3 wallet
- Hardhat (for local development)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ewaste-tracker.git
cd ewaste-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Create a `.env` file in the root directory:
```
PRIVATE_KEY=your_private_key
INFURA_API_KEY=your_infura_api_key
```

### Obtaining Required Keys

#### Private Key
1. **For Development (Local Network)**:
   - When you run `npx hardhat node`, it will provide you with 20 test accounts and their private keys
   - You can use any of these private keys for local development
   - Example output:
     ```
     Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
     Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
     ```

2. **For Production (Mainnet/Testnet)**:
   - **IMPORTANT**: Never use your main wallet's private key for development
   - Create a new MetaMask wallet specifically for development
   - Export the private key from MetaMask:
     1. Open MetaMask
     2. Click the three dots menu
     3. Select "Account Details"
     4. Click "Export Private Key"
     5. Enter your password
     6. Copy the private key

#### Infura API Key
1. Go to [Infura](https://infura.io/)
2. Create an account or sign in
3. Create a new project:
   - Click "Create New Project"
   - Select "Web3 API"
   - Give your project a name
   - Click "Create"
4. Get your API key:
   - In your project dashboard, click "Settings"
   - Under "API Keys", you'll find your project ID
   - This is your Infura API key

## Development

1. Start a local Hardhat node:
```bash
npx hardhat node
```

2. Deploy contracts to the local network:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. Start the frontend development server:
```bash
cd frontend
npm start
```

## Usage

1. Connect your Web3 wallet (MetaMask recommended)
2. Select the appropriate network (localhost for development)
3. Use the navigation menu to access different features based on your role

### User Roles

- **Admin**: Can add/remove users and manage the system
- **User**: Can register devices for disposal
- **Green Point**: Can collect devices
- **Transporter**: Can transport devices
- **Recycling Unit**: Can process devices and issue certificates
- **Environment Inspector**: Has full access to all data

### Device Lifecycle

1. **Registration**: User registers a device with details
2. **Collection**: Green Point collects the device
3. **Transport**: Transporter moves the device
4. **Processing**: Recycling Unit processes the device
5. **Certification**: Recycling Unit issues a certificate

## Testing

Run the test suite:
```bash
npx hardhat test
```

## API Documentation

### Smart Contracts

#### EWasteTracker

- `registerDevice(serialNumber, deviceType, hazardLevel, operationalStatus)`
- `collectDevice(deviceId, notes)`
- `startTransport(deviceId, notes)`
- `deliverDevice(deviceId, recyclingUnit)`
- `processDevice(deviceId, isRecycled, notes)`
- `getDeviceById(deviceId)`
- `getDeviceHistory(deviceId)`
- `getUserDevices(userAddress)`
- `getDevicesByStatus(status)`

#### EWasteCertificate

- `issueCertificate(deviceId, notes)`
- `revokeCertificate(certificateId)`
- `verifyCertificate(certificateId)`
- `getCertificate(certificateId)`

## Architecture

The system consists of:

1. **Smart Contracts**:
   - EWasteTracker: Main contract for device tracking
   - EWasteCertificate: Contract for recycling certificates

2. **Frontend**:
   - React-based UI
   - Web3 integration
   - Role-based access control
   - Real-time updates

3. **Backend**:
   - Hardhat development environment
   - Local blockchain for testing
   - Contract deployment scripts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Project Status

This project now features a complete implementation of the E-Waste Tracking System with role-specific dashboards and functionality:

- **User Management**: Admin panel for adding and managing users
- **Device Registration**: Interface for users to register devices
- **Green Point Collection**: Dashboard for Green Points to collect devices
- **Transport Management**: Dashboard for Transporters to manage device transport
- **Recycling Processing**: Dashboard for Recycling Units to process devices and issue certificates
- **Environmental Monitoring**: Dashboard for Environment Inspectors to monitor the entire system

## Documentation

Comprehensive documentation is available:

- [User Manual](USER_MANUAL.md): Instructions for end-users of the system
- [Technical Documentation](TECHNICAL_DOCUMENTATION.md): Technical details and architecture overview
- [API Documentation](API.md): API reference for developers
