const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n📄 Starting deployment of E-Waste Tracker contracts...");
  
  // Get the signers
  const [deployer] = await hre.ethers.getSigners();
  console.log(`🔑 Deploying contracts with account: ${deployer.address}`);
  
  // Deploy EWasteTracker
  console.log("\n🔄 Deploying EWasteTracker contract...");
  const EWasteTracker = await hre.ethers.getContractFactory("EWasteTracker");
  const ewasteTracker = await EWasteTracker.deploy();
  await ewasteTracker.waitForDeployment();
  
  const ewasteTrackerAddress = await ewasteTracker.getAddress();
  console.log(`✅ EWasteTracker deployed to: ${ewasteTrackerAddress}`);
  
  // Deploy EWasteCertificate with EWasteTracker address
  console.log("\n🔄 Deploying EWasteCertificate contract...");
  const EWasteCertificate = await hre.ethers.getContractFactory("EWasteCertificate");
  const ewasteCertificate = await EWasteCertificate.deploy(ewasteTrackerAddress);
  await ewasteCertificate.waitForDeployment();
  
  const ewasteCertificateAddress = await ewasteCertificate.getAddress();
  console.log(`✅ EWasteCertificate deployed to: ${ewasteCertificateAddress}`);
  
  // Save contract addresses to file
  const contractAddresses = {
    EWasteTracker: ewasteTrackerAddress,
    EWasteCertificate: ewasteCertificateAddress
  };
  
  const frontendDir = path.join(__dirname, "..", "frontend", "src");
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }
  
  const addressesPath = path.join(frontendDir, "contractAddresses.json");
  
  fs.writeFileSync(
    addressesPath,
    JSON.stringify(contractAddresses, null, 2)
  );
  
  console.log(`\n📝 Contract addresses saved to: ${addressesPath}`);
  console.log("\n✨ Deployment completed successfully!");
  
  return {
    EWasteTracker: ewasteTrackerAddress,
    EWasteCertificate: ewasteCertificateAddress
  };
}

// Execute main function and handle potential errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed!", error);
    process.exit(1);
  });