/** Polygon Amoy block explorer base URL */
const AMOY_EXPLORER = 'https://amoy.polygonscan.com';

export function getExplorerTxUrl(txHash: string): string {
  const hash = txHash.startsWith('0x') ? txHash : `0x${txHash}`;
  return `${AMOY_EXPLORER}/tx/${hash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${AMOY_EXPLORER}/address/${address}`;
}
