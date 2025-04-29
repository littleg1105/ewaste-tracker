const hre = require("hardhat");

async function main() {
  // Ανάπτυξη του EWasteTracker
  const EWasteTracker = await hre.ethers.getContractFactory("EWasteTracker");
  const ewasteTracker = await EWasteTracker.deploy();
  await ewasteTracker.deployed();
  
  console.log("EWasteTracker deployed to:", ewasteTracker.address);
  
  // Ανάπτυξη του EWasteCertificate με τη διεύθυνση του EWasteTracker
  const EWasteCertificate = await hre.ethers.getContractFactory("EWasteCertificate");
  const ewasteCertificate = await EWasteCertificate.deploy(ewasteTracker.address);
  await ewasteCertificate.deployed();
  
  console.log("EWasteCertificate deployed to:", ewasteCertificate.address);
  
  // Αποθήκευση των διευθύνσεων των συμβολαίων για μελλοντική χρήση
  const fs = require("fs");
  const contractAddresses = {
    EWasteTracker: ewasteTracker.address,
    EWasteCertificate: ewasteCertificate.address
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