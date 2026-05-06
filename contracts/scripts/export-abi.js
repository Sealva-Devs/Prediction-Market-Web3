const fs = require("fs");
const path = require("path");

// Run after: npx hardhat compile
// Writes contracts/abi/WagerContract.json and contracts/abi/WagerContract-constructor-args.txt

async function main() {
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "WagerContract.sol",
    "WagerContract.json"
  );
  if (!fs.existsSync(artifactPath)) {
    console.error("Run 'npx hardhat compile' first. Artifact not found:", artifactPath);
    process.exit(1);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = artifact.abi;

  const abiDir = path.join(__dirname, "..", "abi");
  if (!fs.existsSync(abiDir)) fs.mkdirSync(abiDir, { recursive: true });

  const abiFile = path.join(abiDir, "WagerContract.json");
  fs.writeFileSync(abiFile, JSON.stringify(abi, null, 2), "utf8");
  console.log("ABI written to", abiFile);

  // Constructor args (WagerContract has no constructor params) = ABI-encoded empty = "0x"
  const argsFile = path.join(abiDir, "WagerContract-constructor-args.txt");
  fs.writeFileSync(argsFile, "0x", "utf8");
  console.log("Constructor args (ABI-encoded) written to", argsFile);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
