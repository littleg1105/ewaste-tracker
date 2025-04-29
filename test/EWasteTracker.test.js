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
    
    // Deploy contract - updated deployment syntax
    const EWasteTrackerFactory = await ethers.getContractFactory("EWasteTracker");
    ewasteTracker = await EWasteTrackerFactory.deploy();
    
    // Add users with different roles
    await ewasteTracker.addUser(user.address, "User", Role.User);
    await ewasteTracker.addUser(greenPoint.address, "GreenPoint", Role.GreenPoint);
    await ewasteTracker.addUser(transporter.address, "Transporter", Role.Transporter);
    await ewasteTracker.addUser(recyclingUnit.address, "RecyclingUnit", Role.RecyclingUnit);
    await ewasteTracker.addUser(inspector.address, "Inspector", Role.EnvironmentInspector);
  });
  
  it("Should set the right owner", async function () {
    expect(await ewasteTracker.owner()).to.equal(owner.address);
  });
  
  it("Should register a device correctly", async function () {
    // Register a device
    const tx = await ewasteTracker.connect(user).registerDevice(
      "LP12345678",
      "Laptop",
      HazardLevel.Medium,
      OperationalStatus.Functional
    );
    
    const receipt = await tx.wait();
    
    // Find the DeviceRegistered event
    const event = receipt.events.find(event => event.event === 'DeviceRegistered');
    expect(event).to.not.be.undefined;
    
    // Get the deviceId from the event args
    const deviceId = event.args.deviceId;
    expect(deviceId).to.not.be.undefined;
    
    // Check device count
    expect(await ewasteTracker.deviceCount()).to.equal(1);
    
    // Get device details
    const device = await ewasteTracker.getDeviceById(deviceId);
    
    // Verify device details
    expect(device.serialNumber).to.equal("LP12345678");
    expect(device.deviceType).to.equal("Laptop");
    expect(device.hazardLevel).to.equal(HazardLevel.Medium);
    expect(device.operationalStatus).to.equal(OperationalStatus.Functional);
    expect(device.status).to.equal(DeviceStatus.Registered);
    expect(device.deviceOwner).to.equal(user.address);
    expect(device.currentHolder).to.equal(user.address);
  });
  
  it("Should collect a device correctly", async function () {
    // Register a device first
    const regTx = await ewasteTracker.connect(user).registerDevice(
      "LP12345678",
      "Laptop",
      HazardLevel.Medium,
      OperationalStatus.Functional
    );
    const regReceipt = await regTx.wait();
    
    // Find the DeviceRegistered event
    const event = regReceipt.events.find(event => event.event === 'DeviceRegistered');
    expect(event).to.not.be.undefined;
    
    // Get the deviceId from the event args
    const deviceId = event.args.deviceId;
    expect(deviceId).to.not.be.undefined;
    
    // Collect the device
    await ewasteTracker.connect(greenPoint).collectDevice(deviceId, "Device collected at Green Point");
    
    // Check device status and holder
    const deviceStatus = await ewasteTracker.getDeviceStatus(deviceId);
    const currentHolder = await ewasteTracker.getDeviceCurrentHolder(deviceId);
    
    expect(deviceStatus).to.equal(DeviceStatus.Collected);
    expect(currentHolder).to.equal(greenPoint.address);
  });
  
  it("Should track a complete lifecycle of a device", async function () {
    // 1. Register a device
    const regTx = await ewasteTracker.connect(user).registerDevice(
      "LP12345678",
      "Laptop",
      HazardLevel.Medium,
      OperationalStatus.Functional
    );
    const regReceipt = await regTx.wait();
    
    // Find the DeviceRegistered event
    const event = regReceipt.events.find(event => event.event === 'DeviceRegistered');
    expect(event).to.not.be.undefined;
    
    // Get the deviceId from the event args
    const deviceId = event.args.deviceId;
    expect(deviceId).to.not.be.undefined;
    
    // 2. Collect the device
    await ewasteTracker.connect(greenPoint).collectDevice(deviceId, "Device collected at Green Point");
    
    // 3. Start transport
    await ewasteTracker.connect(transporter).startTransport(deviceId, "Green Point to Recycling Facility");
    
    // 4. Deliver to recycling unit
    await ewasteTracker.connect(transporter).deliverDevice(deviceId, recyclingUnit.address);
    
    // 5. Process the device (recycle)
    await ewasteTracker.connect(recyclingUnit).processDevice(deviceId, true, "Device recycled according to standards");
    
    // Verify final state
    const device = await ewasteTracker.getDeviceById(deviceId);
    const history = await ewasteTracker.getDeviceHistory(deviceId);
    
    expect(device.status).to.equal(DeviceStatus.Recycled);
    expect(device.currentHolder).to.equal(recyclingUnit.address);
    expect(history.length).to.equal(5); // 5 status changes
  });
});