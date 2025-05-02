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
  console.log("\n🧪 Testing E-Waste Tracker deployment...");
  
  try {
    // Get the deployed contract addresses
    const addresses = await getDeployedContractAddresses();
    console.log(`\n📄 Contract addresses found:`);
    console.log(`🔹 EWasteTracker: ${addresses.EWasteTracker}`);
    console.log(`🔹 EWasteCertificate: ${addresses.EWasteCertificate}`);
    
    // Connect to deployed contracts
    const ewasteTracker = await hre.ethers.getContractAt("EWasteTracker", addresses.EWasteTracker);
    const ewasteCertificate = await hre.ethers.getContractAt("EWasteCertificate", addresses.EWasteCertificate);
    
    // Get admin account
    const [admin] = await hre.ethers.getSigners();
    console.log(`\n👤 Connected as admin: ${admin.address}`);
    
    // Check if admin is properly set in the contract
    const ownerAddress = await ewasteTracker.owner();
    console.log(`👤 Contract owner: ${ownerAddress}`);
    
    if (ownerAddress.toLowerCase() === admin.address.toLowerCase()) {
      console.log(`✅ Admin check: PASSED`);
    } else {
      console.log(`❌ Admin check: FAILED - Contract owner does not match expected admin address`);
    }
    
    // Check if EWasteCertificate has the correct EWasteTracker address
    const trackerAddress = await ewasteCertificate.eWasteTracker();
    console.log(`\n🔗 EWasteCertificate's EWasteTracker reference: ${trackerAddress}`);
    
    if (trackerAddress.toLowerCase() === addresses.EWasteTracker.toLowerCase()) {
      console.log(`✅ Contract link check: PASSED`);
    } else {
      console.log(`❌ Contract link check: FAILED - EWasteCertificate has incorrect EWasteTracker address`);
    }
    
    // Check for registered users
    const userAddresses = await ewasteTracker.getAllUserAddresses();
    console.log(`\n👥 Registered users: ${userAddresses.length}`);
    
    // Check for registered devices
    const deviceCount = await ewasteTracker.deviceCount();
    console.log(`📱 Registered devices: ${deviceCount}`);
    
    // Check for issued certificates
    const certificateCount = await ewasteCertificate.certificateCount();
    console.log(`📜 Issued certificates: ${certificateCount}`);
    
    // Final verdict
    console.log("\n📋 Deployment Test Results:");
    
    const allPassed = 
      ownerAddress.toLowerCase() === admin.address.toLowerCase() &&
      trackerAddress.toLowerCase() === addresses.EWasteTracker.toLowerCase();
    
    if (allPassed) {
      console.log(`✅ All deployment tests PASSED`);
    } else {
      console.log(`❌ Some deployment tests FAILED`);
    }
    
    // Display test data status
    if (userAddresses.length > 1) {
      console.log(`✅ Test users detected: ${userAddresses.length} users`);
    } else {
      console.log(`ℹ️ No test users detected - you might want to run the addTestData.js script`);
    }
    
    if (deviceCount > 0) {
      console.log(`✅ Test devices detected: ${deviceCount} devices`);
    } else {
      console.log(`ℹ️ No test devices detected - you might want to run the addTestData.js script`);
    }
    
    if (certificateCount > 0) {
      console.log(`✅ Test certificates detected: ${certificateCount} certificates`);
    } else {
      console.log(`ℹ️ No certificates detected - you might want to run the addTestData.js script`);
    }
    
    console.log("\n✨ Deployment testing completed!");
    
  } catch (error) {
    console.error(`\n❌ Error testing deployment: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error testing deployment:", error);
    process.exit(1);
  }); 