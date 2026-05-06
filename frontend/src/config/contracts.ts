import wagerContractAbi from '../abi/WagerContract.json';

/** Deployed WagerContract address (Polygon Amoy). Set VITE_WAGER_CONTRACT_ADDRESS in .env after deployment. */
const envAddress = String(import.meta.env.VITE_WAGER_CONTRACT_ADDRESS ?? '').trim();
export const WAGER_CONTRACT_ADDRESS = (envAddress && envAddress.startsWith('0x') && envAddress.length === 42 ? envAddress : '0x0000000000000000000000000000000000000000') as `0x${string}`;

export const WAGER_ABI = wagerContractAbi as readonly unknown[];

export const isContractConfigured = Boolean(
  envAddress && envAddress.length === 42 && envAddress.startsWith('0x')
);
