// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title EWasteCertificate
 * @dev Smart contract for issuing and verifying digital recycling/destruction certificates
 */

// Interface for the main contract
interface IEWasteTracker {
    enum Role { Admin, User, GreenPoint, Transporter, RecyclingUnit, EnvironmentInspector }
    enum DeviceStatus { Registered, Collected, InTransit, Delivered, Recycled, Destroyed }
    
    function devices(uint256 _deviceId) external view returns (
        uint256 id,
        string memory serialNumber,
        string memory deviceType,
        uint8 hazardLevel,
        uint8 operationalStatus,
        DeviceStatus status,
        address owner,
        address currentHolder,
        uint256 registrationDate,
        uint256 lastUpdateDate
    );
    
    function users(address _userAddress) external view returns (
        address userAddress,
        string memory name,
        Role role,
        bool isActive,
        uint256 registrationDate
    );
    
    // Helper functions to avoid stack too deep errors
    function getDeviceStatus(uint256 _deviceId) external view returns (DeviceStatus);
    function getDeviceCurrentHolder(uint256 _deviceId) external view returns (address);
}

contract EWasteCertificate {
    IEWasteTracker public eWasteTracker;
    
    struct Certificate {
        uint256 certificateId;      // Unique certificate ID
        uint256 deviceId;           // Device ID
        address recyclingUnit;      // Recycling unit address
        uint256 issueDate;          // Issuance date
        string processMethod;       // Processing method
        bytes32 certificateHash;    // Certificate hash for verification
        bool isValid;               // Validity status
    }
    
    mapping(uint256 => Certificate) public certificates;
    uint256 public certificateCount;
    
    event CertificateIssued(uint256 indexed certificateId, uint256 indexed deviceId, address recyclingUnit);
    event CertificateRevoked(uint256 indexed certificateId);
    
    /**
     * @dev Constructor
     * @param _eWasteTrackerAddress Address of the main contract
     */
    constructor(address _eWasteTrackerAddress) {
        eWasteTracker = IEWasteTracker(_eWasteTrackerAddress);
    }
    
    /**
     * @dev Issue certificate (only recycling units)
     * @param _deviceId Device ID
     * @param _processMethod Processing method
     * @return certificateId ID of the new certificate
     */
    function issueCertificate(
        uint256 _deviceId,
        string memory _processMethod
    ) 
        public 
        returns (uint256 certificateId) 
    {
        // Check if sender is a recycling unit
        (
            ,
            ,
            IEWasteTracker.Role role,
            bool isActive,
            
        ) = eWasteTracker.users(msg.sender);
        
        require(isActive, "User is not active");
        require(role == IEWasteTracker.Role.RecyclingUnit, "Only recycling units can issue certificates");
        
        // Check device status with separate calls to avoid stack too deep
        IEWasteTracker.DeviceStatus status = eWasteTracker.getDeviceStatus(_deviceId);
        address currentHolder = eWasteTracker.getDeviceCurrentHolder(_deviceId);
        
        require(
            status == IEWasteTracker.DeviceStatus.Recycled || 
            status == IEWasteTracker.DeviceStatus.Destroyed,
            "The device has not been processed yet"
        );
        require(currentHolder == msg.sender, "Only the current holder can issue a certificate");
        
        // Create certificate
        certificateCount++;
        certificateId = certificateCount;
        
        // Create hash for the certificate
        bytes32 certificateHash = keccak256(abi.encodePacked(
            certificateId,
            _deviceId,
            msg.sender,
            block.timestamp,
            _processMethod
        ));
        
        certificates[certificateId] = Certificate(
            certificateId,
            _deviceId,
            msg.sender,
            block.timestamp,
            _processMethod,
            certificateHash,
            true
        );
        
        emit CertificateIssued(certificateId, _deviceId, msg.sender);
        
        return certificateId;
    }
    
    /**
     * @dev Revoke certificate (if there was an error)
     * @param _certificateId Certificate ID
     */
    function revokeCertificate(uint256 _certificateId) 
        public 
    {
        Certificate storage certificate = certificates[_certificateId];
        require(certificate.recyclingUnit == msg.sender, "Only the issuer can revoke the certificate");
        require(certificate.isValid, "The certificate has already been revoked");
        
        certificate.isValid = false;
        
        emit CertificateRevoked(_certificateId);
    }
    
    /**
     * @dev Verify certificate
     * @param _certificateId Certificate ID
     * @return isValid Verification result
     */
    function verifyCertificate(uint256 _certificateId) 
        public 
        view 
        returns (bool isValid) 
    {
        Certificate memory certificate = certificates[_certificateId];
        if (!certificate.isValid) {
            return false;
        }
        
        bytes32 expectedHash = keccak256(abi.encodePacked(
            certificate.certificateId,
            certificate.deviceId,
            certificate.recyclingUnit,
            certificate.issueDate,
            certificate.processMethod
        ));
        
        return certificate.certificateHash == expectedHash;
    }
    
    /**
     * @dev Get certificate
     * @param _certificateId Certificate ID
     * @return certificateId Certificate ID
     * @return deviceId Device ID
     * @return recyclingUnit Recycling unit address
     * @return issueDate Issue date
     * @return processMethod Processing method
     * @return certificateHash Certificate hash
     * @return isValid Validity status
     */
    function getCertificate(uint256 _certificateId) 
        public 
        view 
        returns (
            uint256 certificateId,
            uint256 deviceId,
            address recyclingUnit,
            uint256 issueDate,
            string memory processMethod,
            bytes32 certificateHash,
            bool isValid
        ) 
    {
        Certificate memory certificate = certificates[_certificateId];
        return (
            certificate.certificateId,
            certificate.deviceId,
            certificate.recyclingUnit,
            certificate.issueDate,
            certificate.processMethod,
            certificate.certificateHash,
            certificate.isValid
        );
    }
    
    /**
     * @dev Get all certificates for a device
     * @param _deviceId Device ID
     * @return certificateIds Array of certificate IDs
     */
    function getCertificatesByDevice(uint256 _deviceId) 
        public 
        view 
        returns (uint256[] memory certificateIds) 
    {
        uint256 count = 0;
        
        // Count certificates for this device
        for (uint256 i = 1; i <= certificateCount; i++) {
            if (certificates[i].deviceId == _deviceId) {
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        count = 0;
        
        // Fill results array
        for (uint256 i = 1; i <= certificateCount; i++) {
            if (certificates[i].deviceId == _deviceId) {
                result[count] = i;
                count++;
            }
        }
        
        return result;
    }
}