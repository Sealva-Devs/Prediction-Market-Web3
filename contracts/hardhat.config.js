require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Helper to check if private key is valid
function isValidPrivateKey(key) {
  return key && 
         key.startsWith("0x") && 
         key.length === 66 && 
         key !== "your_private_key_here";
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    amoy: {
      url: process.env.POLYGON_AMOY_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: isValidPrivateKey(process.env.PRIVATE_KEY) ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002,
    },
    polygon: {
      url: process.env.POLYGON_MAINNET_RPC_URL || "https://polygon-rpc.com",
      accounts: isValidPrivateKey(process.env.PRIVATE_KEY) ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,
    },
  },
  etherscan: {
    // Etherscan API v2: single key from https://etherscan.io/apidashboard (works for all chains including Amoy)
    apiKey: process.env.ETHERSCAN_API_KEY || process.env.POLYGONSCAN_API_KEY || "",
    customChains: [
      {
        network: "amoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
