const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EWasteTracker", function () {
  let EWasteTracker;
  let ewasteTracker;
  let owner;
  let user;
  let greenPoint;
  let transporter;
  let recyclingUnit;
  let inspector;
  let nonUser;
  
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
    [owner, user, greenPoint, transporter, recyclingUnit, inspector, nonUser] = await ethers.getSigners();
    
    // Deploy contract
    const EWasteTrackerFactory = await ethers.getContractFactory("EWasteTracker");
    ewasteTracker = await EWasteTrackerFactory.deploy();
    await ewasteTracker.waitForDeployment();
    
    // Add users with different roles
    await ewasteTracker.addUser(user.address, "User", Role.User);
    await ewasteTracker.addUser(greenPoint.address, "GreenPoint", Role.GreenPoint);
    await ewasteTracker.addUser(transporter.address, "Transporter", Role.Transporter);
    await ewasteTracker.addUser(recyclingUnit.address, "RecyclingUnit", Role.RecyclingUnit);
    await ewasteTracker.addUser(inspector.address, "Inspector", Role.EnvironmentInspector);
  });
  
  describe("User Management", function () {
    it("Should set the right owner", async function () {
      expect(await ewasteTracker.owner()).to.equal(owner.address);
    });

    it("Should return all user addresses", async function () {
      const addresses = await ewasteTracker.getAllUserAddresses();
      // Expecting owner, user, greenPoint, transporter, recyclingUnit, inspector (6 total)
      expect(addresses.length).to.equal(6);
      expect(addresses).to.include(owner.address);
      expect(addresses).to.include(user.address);
      expect(addresses).to.include(greenPoint.address);
      expect(addresses).to.include(transporter.address);
      expect(addresses).to.include(recyclingUnit.address);
      expect(addresses).to.include(inspector.address);
    });

    it("Should not allow non-admin to add users", async function () {
      await expect(
        ewasteTracker.connect(user).addUser(user.address, "New User", Role.User)
      ).to.be.revertedWith("Unauthorized access");
    });

    it("Should not allow adding an existing user", async function () {
      await expect(
        ewasteTracker.addUser(user.address, "New User", Role.User)
      ).to.be.revertedWith("User already exists");
    });

    it("Should allow deactivating a user", async function () {
      await ewasteTracker.deactivateUser(user.address);
      const userData = await ewasteTracker.users(user.address);
      expect(userData.isActive).to.be.false;
    });

    it("Should not allow deactivating an already inactive user", async function () {
      await ewasteTracker.deactivateUser(user.address);
      await expect(
        ewasteTracker.deactivateUser(user.address)
      ).to.be.revertedWith("User is not active");
    });
  });
  
  describe("Device Registration", function () {
    it("Should register a device correctly", async function () {
      const tx = await ewasteTracker.connect(user).registerDevice(
        "LP12345678",
        "Laptop",
        HazardLevel.Medium,
        OperationalStatus.Functional
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'DeviceRegistered');
      const deviceId = event.args.deviceId;
      
      expect(await ewasteTracker.deviceCount()).to.equal(1);
      
      const device = await ewasteTracker.getDeviceById(deviceId);
      expect(device.serialNumber).to.equal("LP12345678");
      expect(device.deviceType).to.equal("Laptop");
      expect(device.hazardLevel).to.equal(HazardLevel.Medium);
      expect(device.operationalStatus).to.equal(OperationalStatus.Functional);
      expect(device.status).to.equal(DeviceStatus.Registered);
      expect(device.deviceOwner).to.equal(user.address);
      expect(device.currentHolder).to.equal(user.address);
    });

    it("Should not allow non-users to register devices", async function () {
      await expect(
        ewasteTracker.connect(nonUser).registerDevice(
          "LP12345678",
          "Laptop",
          HazardLevel.Medium,
          OperationalStatus.Functional
        )
      ).to.be.revertedWith("Unauthorized access");
    });
  });
  
  describe("Device Collection", function () {
    let deviceId;

    beforeEach(async function () {
      const tx = await ewasteTracker.connect(user).registerDevice(
        "LP12345678",
        "Laptop",
        HazardLevel.Medium,
        OperationalStatus.Functional
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'DeviceRegistered');
      deviceId = event.args.deviceId;
    });

    it("Should collect a device correctly", async function () {
      await ewasteTracker.connect(greenPoint).collectDevice(deviceId, "Device collected at Green Point");
      
      const deviceStatus = await ewasteTracker.getDeviceStatus(deviceId);
      const currentHolder = await ewasteTracker.getDeviceCurrentHolder(deviceId);
      
      expect(deviceStatus).to.equal(DeviceStatus.Collected);
      expect(currentHolder).to.equal(greenPoint.address);
    });

    it("Should not allow collecting a device that's not in Registered status", async function () {
      await ewasteTracker.connect(greenPoint).collectDevice(deviceId, "First collection");
      await expect(
        ewasteTracker.connect(greenPoint).collectDevice(deviceId, "Second collection")
      ).to.be.revertedWith("Device is not available for collection");
    });

    it("Should not allow non-green points to collect devices", async function () {
      await expect(
        ewasteTracker.connect(user).collectDevice(deviceId, "Invalid collection")
      ).to.be.revertedWith("Unauthorized access");
    });
  });
  
  describe("Device Transport", function () {
    let deviceId;

    beforeEach(async function () {
      const tx = await ewasteTracker.connect(user).registerDevice(
        "LP12345678",
        "Laptop",
        HazardLevel.Medium,
        OperationalStatus.Functional
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'DeviceRegistered');
      deviceId = event.args.deviceId;
      await ewasteTracker.connect(greenPoint).collectDevice(deviceId, "Device collected");
    });

    it("Should start transport correctly", async function () {
      await ewasteTracker.connect(transporter).startTransport(deviceId, "Green Point to Recycling Facility");
      
      const deviceStatus = await ewasteTracker.getDeviceStatus(deviceId);
      const currentHolder = await ewasteTracker.getDeviceCurrentHolder(deviceId);
      
      expect(deviceStatus).to.equal(DeviceStatus.InTransit);
      expect(currentHolder).to.equal(transporter.address);
    });

    it("Should not allow starting transport for a device that's not collected", async function () {
      await ewasteTracker.connect(transporter).startTransport(deviceId, "First transport");
      await expect(
        ewasteTracker.connect(transporter).startTransport(deviceId, "Second transport")
      ).to.be.revertedWith("Device is not available for transport");
    });

    it("Should not allow non-transporters to start transport", async function () {
      await expect(
        ewasteTracker.connect(user).startTransport(deviceId, "Invalid transport")
      ).to.be.revertedWith("Unauthorized access");
    });
  });
  
  describe("Device Delivery and Processing", function () {
    let deviceId;

    beforeEach(async function () {
      const tx = await ewasteTracker.connect(user).registerDevice(
        "LP12345678",
        "Laptop",
        HazardLevel.Medium,
        OperationalStatus.Functional
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'DeviceRegistered');
      deviceId = event.args.deviceId;
      await ewasteTracker.connect(greenPoint).collectDevice(deviceId, "Device collected");
      await ewasteTracker.connect(transporter).startTransport(deviceId, "Transport started");
    });

    it("Should deliver device correctly", async function () {
      await ewasteTracker.connect(transporter).deliverDevice(deviceId, recyclingUnit.address);
      
      const deviceStatus = await ewasteTracker.getDeviceStatus(deviceId);
      const currentHolder = await ewasteTracker.getDeviceCurrentHolder(deviceId);
      
      expect(deviceStatus).to.equal(DeviceStatus.Delivered);
      expect(currentHolder).to.equal(recyclingUnit.address);
    });

    it("Should not allow delivering to a non-recycling unit", async function () {
      await expect(
        ewasteTracker.connect(transporter).deliverDevice(deviceId, user.address)
      ).to.be.revertedWith("Invalid recycling unit address");
    });

    it("Should process device correctly", async function () {
      await ewasteTracker.connect(transporter).deliverDevice(deviceId, recyclingUnit.address);
      await ewasteTracker.connect(recyclingUnit).processDevice(deviceId, true, "Device recycled");
      
      const deviceStatus = await ewasteTracker.getDeviceStatus(deviceId);
      expect(deviceStatus).to.equal(DeviceStatus.Recycled);
    });

    it("Should not allow processing a device that's not delivered", async function () {
      await expect(
        ewasteTracker.connect(recyclingUnit).processDevice(deviceId, true, "Invalid processing")
      ).to.be.revertedWith("Only the current holder can perform this action");
    });
  });
  
  describe("Device History and Queries", function () {
    let deviceId;

    beforeEach(async function () {
      const tx = await ewasteTracker.connect(user).registerDevice(
        "LP12345678",
        "Laptop",
        HazardLevel.Medium,
        OperationalStatus.Functional
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'DeviceRegistered');
      deviceId = event.args.deviceId;
    });

    it("Should track complete device history", async function () {
      await ewasteTracker.connect(greenPoint).collectDevice(deviceId, "Collected");
      await ewasteTracker.connect(transporter).startTransport(deviceId, "In transit");
      await ewasteTracker.connect(transporter).deliverDevice(deviceId, recyclingUnit.address);
      await ewasteTracker.connect(recyclingUnit).processDevice(deviceId, true, "Recycled");
      
      const history = await ewasteTracker.getDeviceHistory(deviceId);
      expect(history.length).to.equal(5);
      expect(history[0].status).to.equal(DeviceStatus.Registered);
      expect(history[1].status).to.equal(DeviceStatus.Collected);
      expect(history[2].status).to.equal(DeviceStatus.InTransit);
      expect(history[3].status).to.equal(DeviceStatus.Delivered);
      expect(history[4].status).to.equal(DeviceStatus.Recycled);
    });

    it("Should return correct user devices", async function () {
      // Register multiple devices for the same user
      const tx1 = await ewasteTracker.connect(user).registerDevice("LP1", "Laptop1", HazardLevel.Low, OperationalStatus.Functional);
      const tx2 = await ewasteTracker.connect(user).registerDevice("LP2", "Laptop2", HazardLevel.Medium, OperationalStatus.Functional);
      
      // Wait for transactions to be mined
      await tx1.wait();
      await tx2.wait();
      
      const userDevices = await ewasteTracker.getUserDevices(user.address);
      expect(userDevices.length).to.equal(3); // Including the device from beforeEach
    });

    it("Should return correct devices by status", async function () {
      const tx1 = await ewasteTracker.connect(user).registerDevice("LP1", "Laptop1", HazardLevel.Low, OperationalStatus.Functional);
      const tx2 = await ewasteTracker.connect(user).registerDevice("LP2", "Laptop2", HazardLevel.Medium, OperationalStatus.Functional);
      
      // Wait for transactions to be mined
      await tx1.wait();
      await tx2.wait();
      
      const registeredDevices = await ewasteTracker.getDevicesByStatus(DeviceStatus.Registered);
      expect(registeredDevices.length).to.equal(3); // Including the device from beforeEach
    });
  });
});