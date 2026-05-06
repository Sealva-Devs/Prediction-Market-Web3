import { createConfig, http } from 'wagmi';
import { polygonAmoy, polygonMumbai, polygon } from 'wagmi/chains';
import { metaMask, walletConnect } from '@wagmi/connectors';

// Get WalletConnect project ID from env, use placeholder if not set
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

// Optional: custom RPC for Polygon Amoy (e.g. for Vercel when default RPC has origin limits)
const amoyRpcUrl = import.meta.env.VITE_AMOY_RPC_URL;

// Supported networks: Polygon Amoy (contract), Polygon Mumbai, Polygon mainnet
export const chains = [polygonAmoy, polygonMumbai, polygon] as const;

// Connectors - always include MetaMask, add WalletConnect if we have a real project ID
const connectors: any[] = [
  metaMask({
    dappMetadata: {
      name: 'Pledgy',
      url: typeof window !== 'undefined' ? window.location.origin : '',
    },
  }),
];

// Only add WalletConnect if we have a real project ID (not the placeholder)
// Need to get one from https://cloud.walletconnect.com
const wcProjectId = projectId && projectId !== 'demo-project-id' && projectId.length > 10 
  ? projectId 
  : null;

if (wcProjectId) {
  try {
    connectors.push(
      walletConnect({
        projectId: wcProjectId,
        showQrModal: true,
        metadata: {
          name: 'Pledgy',
          description: 'Peer-to-peer wagering with multi-sig escrow',
          url: typeof window !== 'undefined' ? window.location.origin : '',
          icons: typeof window !== 'undefined' ? [`${window.location.origin}/favicon.ico`] : [],
        },
      })
    );
  } catch (error) {
    console.warn('WalletConnect connector initialization failed:', error);
    // Just skip WalletConnect if it fails
  }
} else {
  console.warn('WalletConnect project ID not configured. Set VITE_WALLETCONNECT_PROJECT_ID in .env to enable mobile wallet connections.');
}

export const wagmiConfig = createConfig({
  chains: [polygonAmoy, polygonMumbai, polygon],
  connectors,
  transports: {
    [polygonAmoy.id]: http(amoyRpcUrl || undefined),
    [polygonMumbai.id]: http(),
    [polygon.id]: http(),
  },
  ssr: false,
});
