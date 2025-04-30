const hre = require("hardhat");

async function main() {
  console.log("Adding test users...");
  
  const [deployer] = await hre.ethers.getSigners();
  const ewasteTracker = await hre.ethers.getContractAt("EWasteTracker", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
  
  const testUsers = [
    {
      name: "John Doe",
      role: 1, // User role
      address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    },
    {
      name: "Jane Smith",
      role: 1, // User role
      address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    },
    {
      name: "Bob Wilson",
      role: 2, // GreenPoint role
      address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
    }
  ];

  // Add users
  for (const user of testUsers) {
    try {
      // Check if user exists by accessing the users mapping
      const userInfo = await ewasteTracker.users(user.address);
      if (userInfo.isActive) {
        console.log(`User ${user.name} already exists, skipping...`);
        continue;
      }

      console.log(`Adding user: ${user.name}`);
      // Note: addUser expects (address, name, role) according to the contract
      const tx = await ewasteTracker.addUser(user.address, user.name, user.role);
      await tx.wait();
      console.log(`Successfully added user: ${user.name}`);
    } catch (error) {
      console.error(`Error adding user ${user.name}:`, error.message);
    }
  }

  // Add test devices
  console.log("\nAdding test devices...");
  const testDevices = [
    {
      serialNumber: "SN001",
      deviceType: "Laptop",
      hazardLevel: 1, // Medium
      operationalStatus: 0 // Functional
    },
    {
      serialNumber: "SN002",
      deviceType: "Smartphone",
      hazardLevel: 0, // Low
      operationalStatus: 1 // Damaged
    },
    {
      serialNumber: "SN003",
      deviceType: "Monitor",
      hazardLevel: 2, // High
      operationalStatus: 2 // Hazardous
    }
  ];

  // Connect as the first user (John Doe) to register devices
  const user1Contract = ewasteTracker.connect(await hre.ethers.getSigner(testUsers[0].address));

  // Verify the user has the correct role before registering devices
  const userRole = await ewasteTracker.users(testUsers[0].address);
  console.log(`User role in contract: ${userRole.role}`);

  for (const device of testDevices) {
    try {
      console.log(`Registering device: ${device.serialNumber}`);
      const tx = await user1Contract.registerDevice(
        device.serialNumber,
        device.deviceType,
        device.hazardLevel,
        device.operationalStatus
      );
      await tx.wait();
      console.log(`Successfully registered device: ${device.serialNumber}`);
    } catch (error) {
      console.error(`Error registering device ${device.serialNumber}:`, error.message);
    }
  }

  console.log("\nTest data addition completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 