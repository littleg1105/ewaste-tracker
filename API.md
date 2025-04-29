# API Documentation

## Smart Contracts

### EWasteTracker Contract

#### User Management

```solidity
function addUser(address userAddress, string memory name, Role role) external
```
Adds a new user to the system.
- **Parameters**:
  - `userAddress`: The Ethereum address of the user
  - `name`: The name of the user
  - `role`: The role of the user (0: Admin, 1: User, 2: Green Point, 3: Transporter, 4: Recycling Unit, 5: Environment Inspector)
- **Access**: Admin only
- **Events**: `UserAdded`

```solidity
function deactivateUser(address userAddress) external
```
Deactivates a user.
- **Parameters**:
  - `userAddress`: The Ethereum address of the user to deactivate
- **Access**: Admin only
- **Events**: `UserDeactivated`

#### Device Management

```solidity
function registerDevice(string memory serialNumber, string memory deviceType, HazardLevel hazardLevel, OperationalStatus operationalStatus) external
```
Registers a new device.
- **Parameters**:
  - `serialNumber`: Unique identifier for the device
  - `deviceType`: Type of the device (e.g., laptop, phone)
  - `hazardLevel`: Level of hazard (0: Low, 1: Medium, 2: High)
  - `operationalStatus`: Current status (0: Functional, 1: Damaged, 2: Hazardous)
- **Access**: Registered users only
- **Events**: `DeviceRegistered`

```solidity
function collectDevice(uint256 deviceId, string memory notes) external
```
Collects a device at a green point.
- **Parameters**:
  - `deviceId`: ID of the device to collect
  - `notes`: Additional information about the collection
- **Access**: Green Point only
- **Events**: `DeviceCollected`

```solidity
function startTransport(uint256 deviceId, string memory notes) external
```
Starts the transport of a device.
- **Parameters**:
  - `deviceId`: ID of the device to transport
  - `notes`: Additional information about the transport
- **Access**: Transporter only
- **Events**: `TransportStarted`

```solidity
function deliverDevice(uint256 deviceId, address recyclingUnit) external
```
Delivers a device to a recycling unit.
- **Parameters**:
  - `deviceId`: ID of the device to deliver
  - `recyclingUnit`: Address of the recycling unit
- **Access**: Transporter only
- **Events**: `DeviceDelivered`

```solidity
function processDevice(uint256 deviceId, bool isRecycled, string memory notes) external
```
Processes a device at a recycling unit.
- **Parameters**:
  - `deviceId`: ID of the device to process
  - `isRecycled`: Whether the device was recycled
  - `notes`: Additional information about the processing
- **Access**: Recycling Unit only
- **Events**: `DeviceProcessed`

#### Queries

```solidity
function getDeviceById(uint256 deviceId) external view returns (Device memory)
```
Gets device details by ID.
- **Parameters**:
  - `deviceId`: ID of the device
- **Returns**: Device struct with all details

```solidity
function getDeviceHistory(uint256 deviceId) external view returns (History[] memory)
```
Gets the complete history of a device.
- **Parameters**:
  - `deviceId`: ID of the device
- **Returns**: Array of History structs

```solidity
function getUserDevices(address userAddress) external view returns (uint256[] memory)
```
Gets all devices owned by a user.
- **Parameters**:
  - `userAddress`: Address of the user
- **Returns**: Array of device IDs

```solidity
function getDevicesByStatus(DeviceStatus status) external view returns (uint256[] memory)
```
Gets all devices with a specific status.
- **Parameters**:
  - `status`: Status to filter by
- **Returns**: Array of device IDs

### EWasteCertificate Contract

#### Certificate Management

```solidity
function issueCertificate(uint256 deviceId, string memory notes) external
```
Issues a certificate for a processed device.
- **Parameters**:
  - `deviceId`: ID of the processed device
  - `notes`: Additional information about the certificate
- **Access**: Recycling Unit only
- **Events**: `CertificateIssued`

```solidity
function revokeCertificate(uint256 certificateId) external
```
Revokes a certificate.
- **Parameters**:
  - `certificateId`: ID of the certificate to revoke
- **Access**: Certificate issuer only
- **Events**: `CertificateRevoked`

#### Queries

```solidity
function verifyCertificate(uint256 certificateId) external view returns (bool)
```
Verifies if a certificate is valid.
- **Parameters**:
  - `certificateId`: ID of the certificate to verify
- **Returns**: Boolean indicating if the certificate is valid

```solidity
function getCertificate(uint256 certificateId) external view returns (Certificate memory)
```
Gets certificate details by ID.
- **Parameters**:
  - `certificateId`: ID of the certificate
- **Returns**: Certificate struct with all details

## Frontend API

### Authentication

```javascript
const { account, role, connectWallet, disconnectWallet } = useAuth();
```
Hook for managing wallet connection and user role.

### Contract Interaction

```javascript
const { ewasteTracker, ewasteCertificate } = useContract();
```
Hook for accessing contract instances.

### Device Management

```javascript
// Register a device
const tx = await ewasteTracker.connect(signer).registerDevice(
  serialNumber,
  deviceType,
  hazardLevel,
  operationalStatus
);

// Get device details
const device = await ewasteTracker.getDeviceById(deviceId);

// Get device history
const history = await ewasteTracker.getDeviceHistory(deviceId);
```

### Certificate Management

```javascript
// Issue a certificate
const tx = await ewasteCertificate.connect(signer).issueCertificate(
  deviceId,
  notes
);

// Verify a certificate
const isValid = await ewasteCertificate.verifyCertificate(certificateId);

// Get certificate details
const certificate = await ewasteCertificate.getCertificate(certificateId);
```

## Data Structures

### Device
```solidity
struct Device {
    uint256 id;
    string serialNumber;
    string deviceType;
    HazardLevel hazardLevel;
    OperationalStatus operationalStatus;
    DeviceStatus status;
    address deviceOwner;
    address currentHolder;
    uint256 registrationDate;
}
```

### History
```solidity
struct History {
    DeviceStatus status;
    address actor;
    string notes;
    uint256 timestamp;
}
```

### Certificate
```solidity
struct Certificate {
    uint256 id;
    uint256 deviceId;
    address recyclingUnit;
    string notes;
    uint256 issueDate;
    bool isValid;
}
```

### User
```solidity
struct User {
    string name;
    Role role;
    bool isActive;
    uint256 registrationDate;
}
``` 