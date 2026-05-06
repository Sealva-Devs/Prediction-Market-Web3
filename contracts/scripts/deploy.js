const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error(
      "No deployer account. Set PRIVATE_KEY in .env (0x + 64 hex chars, 66 total)."
    );
  }
  console.log("Deploying WagerContract from:", deployer.address);
  console.log("Network:", hre.network.name);

  const WagerContract = await hre.ethers.getContractFactory("WagerContract");
  const wagerContract = await WagerContract.deploy();

  await wagerContract.waitForDeployment();

  const address = await wagerContract.getAddress();
  console.log("WagerContract deployed to:", address);

  // Try to verify on PolygonScan if we have an API key
  if (process.env.POLYGONSCAN_API_KEY) {
    console.log("Waiting for blocks to confirm...");
    await wagerContract.deploymentTransaction().wait(5);

    console.log("Verifying on PolygonScan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("Verified!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  console.log("\n--- Deployment Summary ---");
  console.log("Network:", hre.network.name);
  console.log("Contract Address:", address);
  console.log("\nAdd this to your frontend config:");
  console.log(`WAGER_CONTRACT_ADDRESS="${address}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
