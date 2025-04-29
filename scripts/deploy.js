const hre = require("hardhat");

async function main() {
  // Deploy EWasteTracker
  const EWasteTracker = await hre.ethers.getContractFactory("EWasteTracker");
  const ewasteTracker = await EWasteTracker.deploy();
  await ewasteTracker.waitForDeployment();
  
  console.log("EWasteTracker deployed to:", await ewasteTracker.getAddress());
  
  // Deploy EWasteCertificate with EWasteTracker address
  const EWasteCertificate = await hre.ethers.getContractFactory("EWasteCertificate");
  const ewasteCertificate = await EWasteCertificate.deploy(await ewasteTracker.getAddress());
  await ewasteCertificate.waitForDeployment();
  
  console.log("EWasteCertificate deployed to:", await ewasteCertificate.getAddress());
  
  // Save contract addresses for future use
  const fs = require("fs");
  const contractAddresses = {
    EWasteTracker: await ewasteTracker.getAddress(),
    EWasteCertificate: await ewasteCertificate.getAddress()
  };
  
  fs.writeFileSync(
    "./frontend/src/contractAddresses.json",
    JSON.stringify(contractAddresses, null, 2)
  );
  
  console.log("Contract addresses saved to frontend/src/contractAddresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });