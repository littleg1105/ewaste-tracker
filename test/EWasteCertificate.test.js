const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EWasteCertificate", function () {
  let EWasteTracker;
  let EWasteCertificate;
  let ewasteTracker;
  let ewasteCertificate;
  let owner;
  let user;
  let greenPoint;
  let transporter;
  let recyclingUnit;
  let inspector;
  
  // Enums
  const Role = {
    Admin: 0,
    User: 1,
    GreenPoint: 2,
    Transporter: 3,
    RecyclingUnit: 4,
    EnvironmentInspector: 5
  };
  
  const DeviceStatus = {
    Registered: 0,
    Collected: 1,
    InTransit: 2,
    Delivered: 3,
    Recycled: 4,
    Destroyed: 5
  };
  
  const HazardLevel = {
    Low: 0,
    Medium: 1,
    High: 2
  };
  
  const OperationalStatus = {
    Functional: 0,
    Damaged: 1,
    Hazardous: 2
  };
  
  beforeEach(async function () {
    // Get signers
    [owner, user, greenPoint, transporter, recyclingUnit, inspector] = await ethers.getSigners();
    
    // Deploy EWasteTracker
    const EWasteTrackerFactory = await ethers.getContractFactory("EWasteTracker");
    ewasteTracker = await EWasteTrackerFactory.deploy();
    await ewasteTracker.waitForDeployment();
    
    // Deploy EWasteCertificate
    const EWasteCertificateFactory = await ethers.getContractFactory("EWasteCertificate");
    ewasteCertificate = await EWasteCertificateFactory.deploy(await ewasteTracker.getAddress());
    await ewasteCertificate.waitForDeployment();
    
    // Add users with different roles
    await ewasteTracker.addUser(user.address, "User", Role.User);
    await ewasteTracker.addUser(greenPoint.address, "GreenPoint", Role.GreenPoint);
    await ewasteTracker.addUser(transporter.address, "Transporter", Role.Transporter);
    await ewasteTracker.addUser(recyclingUnit.address, "RecyclingUnit", Role.RecyclingUnit);
    await ewasteTracker.addUser(inspector.address, "Inspector", Role.EnvironmentInspector);
  });
  
  describe("Certificate Issuance", function () {
    let deviceId;

    beforeEach(async function () {
      // Register and process a device
      const tx = await ewasteTracker.connect(user).registerDevice(
        "LP12345678",
        "Laptop",
        HazardLevel.Medium,
        OperationalStatus.Functional
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'DeviceRegistered');
      deviceId = event.args.deviceId;
      
      await ewasteTracker.connect(greenPoint).collectDevice(deviceId, "Collected");
      await ewasteTracker.connect(transporter).startTransport(deviceId, "In transit");
      await ewasteTracker.connect(transporter).deliverDevice(deviceId, recyclingUnit.address);
      await ewasteTracker.connect(recyclingUnit).processDevice(deviceId, true, "Recycled");
    });

    it("Should issue a certificate correctly", async function () {
      const tx = await ewasteCertificate.connect(recyclingUnit).issueCertificate(
        deviceId,
        "Standard recycling process"
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'CertificateIssued');
      const certificateId = event.args.certificateId;
      
      expect(certificateId).to.not.be.undefined;
      expect(await ewasteCertificate.certificateCount()).to.equal(1);
      
      const certificate = await ewasteCertificate.getCertificate(certificateId);
      expect(certificate.deviceId).to.equal(deviceId);
      expect(certificate.recyclingUnit).to.equal(recyclingUnit.address);
      expect(certificate.isValid).to.be.true;
    });

    it("Should not allow non-recycling units to issue certificates", async function () {
      await expect(
        ewasteCertificate.connect(user).issueCertificate(
          deviceId,
          "Invalid certificate"
        )
      ).to.be.revertedWith("Only recycling units can issue certificates");
    });

    it("Should not allow issuing certificates for unprocessed devices", async function () {
      // Register a new device but don't process it
      const tx = await ewasteTracker.connect(user).registerDevice(
        "LP87654321",
        "Laptop",
        HazardLevel.Medium,
        OperationalStatus.Functional
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'DeviceRegistered');
      const newDeviceId = event.args.deviceId;
      
      await expect(
        ewasteCertificate.connect(recyclingUnit).issueCertificate(
          newDeviceId,
          "Invalid certificate"
        )
      ).to.be.revertedWith("The device has not been processed yet");
    });
  });
  
  describe("Certificate Verification", function () {
    let deviceId;
    let certificateId;

    beforeEach(async function () {
      // Register and process a device
      const tx = await ewasteTracker.connect(user).registerDevice(
        "LP12345678",
        "Laptop",
        HazardLevel.Medium,
        OperationalStatus.Functional
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'DeviceRegistered');
      deviceId = event.args.deviceId;
      
      await ewasteTracker.connect(greenPoint).collectDevice(deviceId, "Collected");
      await ewasteTracker.connect(transporter).startTransport(deviceId, "In transit");
      await ewasteTracker.connect(transporter).deliverDevice(deviceId, recyclingUnit.address);
      await ewasteTracker.connect(recyclingUnit).processDevice(deviceId, true, "Recycled");
      
      // Issue a certificate
      const certTx = await ewasteCertificate.connect(recyclingUnit).issueCertificate(
        deviceId,
        "Standard recycling process"
      );
      const certReceipt = await certTx.wait();
      const certEvent = certReceipt.logs.find(log => log.fragment && log.fragment.name === 'CertificateIssued');
      certificateId = certEvent.args.certificateId;
    });

    it("Should verify a valid certificate", async function () {
      const isValid = await ewasteCertificate.verifyCertificate(certificateId);
      expect(isValid).to.be.true;
    });

    it("Should not verify a revoked certificate", async function () {
      await ewasteCertificate.connect(recyclingUnit).revokeCertificate(certificateId);
      const isValid = await ewasteCertificate.verifyCertificate(certificateId);
      expect(isValid).to.be.false;
    });

    it("Should not allow non-issuers to revoke certificates", async function () {
      await expect(
        ewasteCertificate.connect(user).revokeCertificate(certificateId)
      ).to.be.revertedWith("Only the issuer can revoke the certificate");
    });

    it("Should not allow revoking an already revoked certificate", async function () {
      await ewasteCertificate.connect(recyclingUnit).revokeCertificate(certificateId);
      await expect(
        ewasteCertificate.connect(recyclingUnit).revokeCertificate(certificateId)
      ).to.be.revertedWith("The certificate has already been revoked");
    });
  });
}); 