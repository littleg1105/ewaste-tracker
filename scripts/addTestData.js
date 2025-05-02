const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function getDeployedContractAddresses() {
  try {
    const frontendDir = path.join(__dirname, "..", "frontend", "src");
    const addressesPath = path.join(frontendDir, "contractAddresses.json");
    
    if (fs.existsSync(addressesPath)) {
      const data = fs.readFileSync(addressesPath);
      return JSON.parse(data);
    } else {
      throw new Error(`Contract addresses file not found at ${addressesPath}`);
    }
  } catch (error) {
    console.error(`❌ Error reading contract addresses: ${error.message}`);
    process.exit(1);
  }
}

async function main() {
  console.log("\n📊 Adding test data to the E-Waste Tracker system...");
  
  // Get the deployed contract addresses
  const addresses = await getDeployedContractAddresses();
  console.log(`\n🔍 Using EWasteTracker at: ${addresses.EWasteTracker}`);
  console.log(`🔍 Using EWasteCertificate at: ${addresses.EWasteCertificate}`);
  
  // Get the signers for different roles
  const [admin, user1, user2, greenPoint1, transporter1, recycler1, inspector1] = await hre.ethers.getSigners();
  
  // Connect to deployed contracts
  const ewasteTracker = await hre.ethers.getContractAt("EWasteTracker", addresses.EWasteTracker);
  const ewasteCertificate = await hre.ethers.getContractAt("EWasteCertificate", addresses.EWasteCertificate);
  
  console.log(`\n👤 Connected as admin: ${admin.address}`);
  
  // Define test users (skip admin as it's already set in constructor)
  const testUsers = [
    {
      name: "John Smith", 
      role: 1, // User
      address: user1.address
    },
    {
      name: "Jane Doe",
      role: 1, // User
      address: user2.address
    },
    {
      name: "Green Solutions Ltd",
      role: 2, // GreenPoint
      address: greenPoint1.address
    },
    {
      name: "Eco Transport Inc",
      role: 3, // Transporter
      address: transporter1.address
    },
    {
      name: "Recycle-All Solutions",
      role: 4, // RecyclingUnit
      address: recycler1.address
    },
    {
      name: "Inspector Johnson",
      role: 5, // EnvironmentInspector
      address: inspector1.address
    }
  ];
  
  // Add test users
  console.log("\n👥 Adding test users...");
  for (const user of testUsers) {
    try {
      // Check if user exists
      const userInfo = await ewasteTracker.users(user.address);
      if (userInfo.isActive) {
        console.log(`👤 User ${user.name} already exists, skipping...`);
        continue;
      }
      
      console.log(`👤 Adding user: ${user.name} (${user.address})`);
      const tx = await ewasteTracker.addUser(user.address, user.name, user.role);
      await tx.wait();
      console.log(`✅ Successfully added user: ${user.name}`);
    } catch (error) {
      console.error(`❌ Error adding user ${user.name}: ${error.message}`);
    }
  }
  
  // Define test devices
  const testDevices = [
    {
      serialNumber: "SN-LT-001-2023",
      deviceType: "Laptop",
      hazardLevel: 1, // Medium
      operationalStatus: 0, // Functional
      ownerIndex: 0 // user1
    },
    {
      serialNumber: "SN-SP-002-2023",
      deviceType: "Smartphone",
      hazardLevel: 0, // Low
      operationalStatus: 1, // Damaged
      ownerIndex: 0 // user1
    },
    {
      serialNumber: "SN-TB-003-2023",
      deviceType: "Tablet",
      hazardLevel: 0, // Low
      operationalStatus: 0, // Functional
      ownerIndex: 1 // user2
    },
    {
      serialNumber: "SN-TV-004-2023",
      deviceType: "Television",
      hazardLevel: 2, // High
      operationalStatus: 2, // Hazardous
      ownerIndex: 1 // user2
    }
  ];
  
  // Register test devices
  console.log("\n📱 Registering test devices...");
  
  const deviceIds = [];
  
  for (let i = 0; i < testDevices.length; i++) {
    const device = testDevices[i];
    const ownerSigner = await hre.ethers.getSigner(testUsers[device.ownerIndex].address);
    const userContract = ewasteTracker.connect(ownerSigner);
    
    try {
      console.log(`📱 Registering device: ${device.serialNumber} (${device.deviceType})`);
      const tx = await userContract.registerDevice(
        device.serialNumber,
        device.deviceType,
        device.hazardLevel,
        device.operationalStatus
      );
      
      const receipt = await tx.wait();
      
      // Find the DeviceRegistered event to extract the device ID
      const deviceId = i + 1; // Default to sequential IDs
      deviceIds.push(deviceId);
      
      console.log(`✅ Successfully registered device: ${device.serialNumber} (ID: ${deviceId})`);
    } catch (error) {
      console.error(`❌ Error registering device ${device.serialNumber}: ${error.message}`);
    }
  }
  
  // Process the first two devices through the full lifecycle
  if (deviceIds.length >= 2) {
    try {
      // Connect as Green Point
      const greenPointContract = ewasteTracker.connect(greenPoint1);
      
      // Collect devices
      console.log("\n🔄 Processing devices through collection phase...");
      for (let i = 0; i < 2; i++) {
        console.log(`📦 Collecting device: ID ${deviceIds[i]}`);
        const tx = await greenPointContract.collectDevice(deviceIds[i], "Device collected in good condition");
        await tx.wait();
        console.log(`✅ Device ${deviceIds[i]} collected`);
      }
      
      // Connect as Transporter
      const transporterContract = ewasteTracker.connect(transporter1);
      
      // Start transportation
      console.log("\n🔄 Processing devices through transportation phase...");
      for (let i = 0; i < 2; i++) {
        console.log(`🚚 Transporting device: ID ${deviceIds[i]}`);
        const tx = await transporterContract.startTransport(deviceIds[i], "Route: Green Point to Recycling Center");
        await tx.wait();
        console.log(`✅ Device ${deviceIds[i]} in transit`);
      }
      
      // Deliver to recycling unit
      for (let i = 0; i < 2; i++) {
        console.log(`🏭 Delivering device: ID ${deviceIds[i]}`);
        const tx = await transporterContract.deliverDevice(deviceIds[i], recycler1.address);
        await tx.wait();
        console.log(`✅ Device ${deviceIds[i]} delivered to recycling unit`);
      }
      
      // Connect as Recycling Unit
      const recyclerContract = ewasteTracker.connect(recycler1);
      
      // Process devices (recycle first, destroy second)
      console.log("\n🔄 Processing devices at recycling facility...");
      
      console.log(`♻️ Recycling device: ID ${deviceIds[0]}`);
      let tx = await recyclerContract.processDevice(
        deviceIds[0], 
        true, 
        "Device components separated and recycled according to ISO standards"
      );
      await tx.wait();
      console.log(`✅ Device ${deviceIds[0]} recycled`);
      
      console.log(`🗑️ Destroying device: ID ${deviceIds[1]}`);
      tx = await recyclerContract.processDevice(
        deviceIds[1], 
        false, 
        "Device contained hazardous materials, safely destroyed following environmental protocols"
      );
      await tx.wait();
      console.log(`✅ Device ${deviceIds[1]} destroyed`);
      
      // Issue certificates
      console.log("\n📜 Issuing recycling certificates...");
      const certificateContract = ewasteCertificate.connect(recycler1);
      
      console.log(`📜 Issuing certificate for device: ID ${deviceIds[0]}`);
      tx = await certificateContract.issueCertificate(
        deviceIds[0],
        "Recycled with 85% material recovery rate"
      );
      await tx.wait();
      console.log(`✅ Certificate issued for device ${deviceIds[0]}`);
      
      console.log(`📜 Issuing certificate for device: ID ${deviceIds[1]}`);
      tx = await certificateContract.issueCertificate(
        deviceIds[1],
        "Destroyed following EPA guidelines for hazardous e-waste"
      );
      await tx.wait();
      console.log(`✅ Certificate issued for device ${deviceIds[1]}`);
      
    } catch (error) {
      console.error(`❌ Error processing device lifecycle: ${error.message}`);
    }
  }
  
  console.log("\n✨ Test data added successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error adding test data:", error);
    process.exit(1);
  }); 