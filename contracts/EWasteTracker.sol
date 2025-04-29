// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title EWasteTracker
 * @dev Smart contract for tracking electronic waste
 */
contract EWasteTracker {
    // Role definitions
    enum Role {
        Admin,
        User,
        GreenPoint,
        Transporter,
        RecyclingUnit,
        EnvironmentInspector
    }

    // Device status definitions
    enum DeviceStatus {
        Registered, // Registered
        Collected,  // Collected by Green Point
        InTransit,  // In transit
        Delivered,  // Delivered to recycling unit
        Recycled,   // Recycled
        Destroyed   // Destroyed
    }

    // Hazard level definitions
    enum HazardLevel {
        Low,
        Medium,
        High
    }

    // Operational status definitions
    enum OperationalStatus {
        Functional,
        Damaged,
        Hazardous
    }

    // User data structure
    struct User {
        address userAddress;   // Ethereum address
        string name;           // Name
        Role role;             // Role
        bool isActive;         // Status (active/inactive)
        uint256 registrationDate;  // Registration date
    }

    // Device data structure
    struct Device {
        uint256 id;                        // Unique identifier
        string serialNumber;               // Serial number
        string deviceType;                 // Device type
        HazardLevel hazardLevel;           // Hazard level
        OperationalStatus operationalStatus; // Operational status
        DeviceStatus status;               // Current status
        address deviceOwner;               // Original owner
        address currentHolder;             // Current holder
        uint256 registrationDate;          // Registration date
        uint256 lastUpdateDate;            // Last update date
    }

    // History data structure
    struct History {
        uint256 timestamp;     // Timestamp
        DeviceStatus status;   // Status
        address actor;         // Action performer
        string notes;          // Notes
    }

    // Contract owner (administrator)
    address public owner;

    // Mapping addresses to users
    mapping(address => User) public users;

    // Mapping IDs to devices
    mapping(uint256 => Device) public devices;

    // Mapping device ID to history
    mapping(uint256 => History[]) public deviceHistory;

    // Device counter
    uint256 public deviceCount;

    // Events
    event UserAdded(address indexed userAddress, string name, Role role);
    event UserDeactivated(address indexed userAddress);
    event UserRoleUpdated(address indexed userAddress, Role newRole);
    event DeviceRegistered(uint256 indexed deviceId, string serialNumber, address owner);
    event DeviceCollected(uint256 indexed deviceId, address collector);
    event DeviceInTransit(uint256 indexed deviceId, address transporter);
    event DeviceDelivered(uint256 indexed deviceId, address transporter, address recyclingUnit);
    event DeviceProcessed(uint256 indexed deviceId, DeviceStatus status, address processor);

    // Check if caller is the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    // Check if caller has specific role
    modifier onlyRole(Role _role) {
        require(users[msg.sender].role == _role, "Unauthorized access");
        require(users[msg.sender].isActive, "User is not active");
        _;
    }

    // Check if caller is the device owner
    modifier onlyDeviceOwner(uint256 _deviceId) {
        require(devices[_deviceId].deviceOwner == msg.sender, "Only the device owner can perform this action");
        _;
    }

    // Check if caller is the current holder of the device
    modifier onlyCurrentHolder(uint256 _deviceId) {
        require(devices[_deviceId].currentHolder == msg.sender, "Only the current holder can perform this action");
        _;
    }

    // Constructor - Initialize the administrator
    constructor() {
        owner = msg.sender;
        users[msg.sender] = User(msg.sender, "Admin", Role.Admin, true, block.timestamp);
    }

    /**
     * @dev Add new user
     * @param _userAddress Ethereum address of the new user
     * @param _name User name
     * @param _role User role
     */
    function addUser(address _userAddress, string memory _name, Role _role) 
        public 
        onlyRole(Role.Admin) 
    {
        require(!users[_userAddress].isActive, "User already exists");
        users[_userAddress] = User(_userAddress, _name, _role, true, block.timestamp);
        
        emit UserAdded(_userAddress, _name, _role);
    }

    /**
     * @dev Deactivate user
     * @param _userAddress Ethereum address of the user to deactivate
     */
    function deactivateUser(address _userAddress) 
        public 
        onlyRole(Role.Admin) 
    {
        require(users[_userAddress].isActive, "User is not active");
        users[_userAddress].isActive = false;
        
        emit UserDeactivated(_userAddress);
    }

    /**
     * @dev Update user role
     * @param _userAddress Ethereum address of the user
     * @param _newRole New role
     */
    function updateUserRole(address _userAddress, Role _newRole) 
        public 
        onlyRole(Role.Admin) 
    {
        require(users[_userAddress].isActive, "User is not active");
        users[_userAddress].role = _newRole;
        
        emit UserRoleUpdated(_userAddress, _newRole);
    }

    /**
     * @dev Register new device
     * @param _serialNumber Device serial number
     * @param _deviceType Device type
     * @param _hazardLevel Hazard level
     * @param _operationalStatus Operational status
     * @return deviceId ID of the new device
     */
    function registerDevice(
        string memory _serialNumber,
        string memory _deviceType,
        HazardLevel _hazardLevel,
        OperationalStatus _operationalStatus
    ) 
        public 
        onlyRole(Role.User) 
        returns (uint256 deviceId) 
    {
        deviceCount++;
        uint256 newDeviceId = deviceCount;
        
        devices[newDeviceId] = Device(
            newDeviceId,
            _serialNumber,
            _deviceType,
            _hazardLevel,
            _operationalStatus,
            DeviceStatus.Registered,
            msg.sender,
            msg.sender,
            block.timestamp,
            block.timestamp
        );
        
        // Add initial history entry
        deviceHistory[newDeviceId].push(History(
            block.timestamp,
            DeviceStatus.Registered,
            msg.sender,
            "Device registered"
        ));
        
        emit DeviceRegistered(newDeviceId, _serialNumber, msg.sender);
        
        return newDeviceId;
    }

    /**
     * @dev Confirm collection by Green Point
     * @param _deviceId Device ID
     * @param _notes Collection notes
     */
    function collectDevice(uint256 _deviceId, string memory _notes) 
        public 
        onlyRole(Role.GreenPoint) 
    {
        require(devices[_deviceId].status == DeviceStatus.Registered, "Device is not available for collection");
        
        devices[_deviceId].status = DeviceStatus.Collected;
        devices[_deviceId].currentHolder = msg.sender;
        devices[_deviceId].lastUpdateDate = block.timestamp;
        
        // Record history
        deviceHistory[_deviceId].push(History(
            block.timestamp,
            DeviceStatus.Collected,
            msg.sender,
            _notes
        ));
        
        emit DeviceCollected(_deviceId, msg.sender);
    }

    /**
     * @dev Start device transport
     * @param _deviceId Device ID
     * @param _route Transport route
     */
    function startTransport(uint256 _deviceId, string memory _route) 
        public 
        onlyRole(Role.Transporter) 
    {
        require(devices[_deviceId].status == DeviceStatus.Collected, "Device is not available for transport");
        
        devices[_deviceId].status = DeviceStatus.InTransit;
        devices[_deviceId].currentHolder = msg.sender;
        devices[_deviceId].lastUpdateDate = block.timestamp;
        
        // Record history
        deviceHistory[_deviceId].push(History(
            block.timestamp,
            DeviceStatus.InTransit,
            msg.sender,
            string(abi.encodePacked("Transport started. Route: ", _route))
        ));
        
        emit DeviceInTransit(_deviceId, msg.sender);
    }

    /**
     * @dev Deliver device to recycling unit
     * @param _deviceId Device ID
     * @param _recyclingUnit Recycling unit address
     */
    function deliverDevice(uint256 _deviceId, address _recyclingUnit) 
        public 
        onlyRole(Role.Transporter) 
    {
        require(devices[_deviceId].status == DeviceStatus.InTransit, "Device is not in transit");
        require(users[_recyclingUnit].role == Role.RecyclingUnit, "Invalid recycling unit address");
        
        devices[_deviceId].status = DeviceStatus.Delivered;
        devices[_deviceId].currentHolder = _recyclingUnit;
        devices[_deviceId].lastUpdateDate = block.timestamp;
        
        // Record history
        deviceHistory[_deviceId].push(History(
            block.timestamp,
            DeviceStatus.Delivered,
            msg.sender,
            "Device delivered to recycling unit"
        ));
        
        emit DeviceDelivered(_deviceId, msg.sender, _recyclingUnit);
    }

    /**
     * @dev Process device (recycle or destroy)
     * @param _deviceId Device ID
     * @param _isRecycled true for recycling, false for destruction
     * @param _processDetails Process details
     */
    function processDevice(uint256 _deviceId, bool _isRecycled, string memory _processDetails) 
        public 
        onlyRole(Role.RecyclingUnit) 
        onlyCurrentHolder(_deviceId)
    {
        require(devices[_deviceId].status == DeviceStatus.Delivered, "Device has not been delivered to the recycling unit");
        
        DeviceStatus newStatus = _isRecycled ? DeviceStatus.Recycled : DeviceStatus.Destroyed;
        devices[_deviceId].status = newStatus;
        devices[_deviceId].lastUpdateDate = block.timestamp;
        
        // Record history
        deviceHistory[_deviceId].push(History(
            block.timestamp,
            newStatus,
            msg.sender,
            _processDetails
        ));
        
        emit DeviceProcessed(_deviceId, newStatus, msg.sender);
    }

    /**
     * @dev Search device by ID
     * @param _deviceId Device ID
     * @return id Device ID
     * @return serialNumber Serial number
     * @return deviceType Device type
     * @return hazardLevel Hazard level
     * @return operationalStatus Operational status
     * @return status Current status
     * @return deviceOwner Original owner
     * @return currentHolder Current holder
     * @return registrationDate Registration date
     * @return lastUpdateDate Last update date
     */
    function getDeviceById(uint256 _deviceId) 
        public 
        view 
        returns (
            uint256 id,
            string memory serialNumber,
            string memory deviceType,
            HazardLevel hazardLevel,
            OperationalStatus operationalStatus,
            DeviceStatus status,
            address deviceOwner,
            address currentHolder,
            uint256 registrationDate,
            uint256 lastUpdateDate
        ) 
    {
        Device memory device = devices[_deviceId];
        return (
            device.id,
            device.serialNumber,
            device.deviceType,
            device.hazardLevel,
            device.operationalStatus,
            device.status,
            device.deviceOwner,
            device.currentHolder,
            device.registrationDate,
            device.lastUpdateDate
        );
    }

    /**
     * @dev Get device status - Helper function to avoid stack too deep errors
     * @param _deviceId Device ID
     * @return status Current device status
     */
    function getDeviceStatus(uint256 _deviceId) 
        public 
        view 
        returns (DeviceStatus status) 
    {
        return devices[_deviceId].status;
    }

    /**
     * @dev Get device current holder - Helper function to avoid stack too deep errors
     * @param _deviceId Device ID
     * @return currentHolder Address of current holder
     */
    function getDeviceCurrentHolder(uint256 _deviceId) 
        public 
        view 
        returns (address currentHolder) 
    {
        return devices[_deviceId].currentHolder;
    }

    /**
     * @dev Get device history
     * @param _deviceId Device ID
     * @return history Array with history
     */
    function getDeviceHistory(uint256 _deviceId) 
        public 
        view 
        returns (History[] memory history) 
    {
        return deviceHistory[_deviceId];
    }

    /**
     * @dev Get user's devices
     * @param _userAddress User address
     * @return deviceIds Array with device IDs
     */
    function getUserDevices(address _userAddress) 
        public 
        view 
        returns (uint256[] memory deviceIds) 
    {
        uint256 count = 0;
        
        // Count user's devices
        for (uint256 i = 1; i <= deviceCount; i++) {
            if (devices[i].deviceOwner == _userAddress) {
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        count = 0;
        
        // Fill results array
        for (uint256 i = 1; i <= deviceCount; i++) {
            if (devices[i].deviceOwner == _userAddress) {
                result[count] = i;
                count++;
            }
        }
        
        return result;
    }

    /**
     * @dev Get devices with specific status
     * @param _status Status
     * @return deviceIds Array with device IDs
     */
    function getDevicesByStatus(DeviceStatus _status) 
        public 
        view 
        returns (uint256[] memory deviceIds) 
    {
        uint256 count = 0;
        
        // Count devices with the specific status
        for (uint256 i = 1; i <= deviceCount; i++) {
            if (devices[i].status == _status) {
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        count = 0;
        
        // Fill results array
        for (uint256 i = 1; i <= deviceCount; i++) {
            if (devices[i].status == _status) {
                result[count] = i;
                count++;
            }
        }
        
        return result;
    }
}