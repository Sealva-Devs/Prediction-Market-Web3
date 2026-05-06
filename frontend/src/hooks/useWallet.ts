import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from 'wagmi';
import { polygonAmoy, polygonMumbai, polygon } from 'wagmi/chains';
import { formatEther } from 'viem';

/** Chain ID where WagerContract is deployed (Polygon Amoy). Contract actions require this chain. */
export const WAGER_CHAIN_ID = polygonAmoy.id;

export const useWallet = () => {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending, error: connectError, reset } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address,
    query: {
      enabled: !!address,
    },
  });
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  /** Correct for contract actions: WagerContract is on Polygon Amoy (80002). */
  const isCorrectNetwork = chainId === polygonAmoy.id;
  const chainName =
    chainId === polygonAmoy.id
      ? polygonAmoy.name
      : chainId === polygonMumbai.id
        ? polygonMumbai.name
        : chainId === polygon.id
          ? polygon.name
          : chainId
            ? `Chain ${chainId}`
            : 'Not Connected';

  const formattedBalance = balance ? parseFloat(formatEther(balance.value)).toFixed(4) : '0.0000';

  // MetaMask connector IDs can vary, so we check a few different ones
  const connectMetaMask = async () => {
    if (isPending) {
      throw new Error('A connection request is already in progress. Please wait for it to complete.');
    }

    try {
      const metaMaskConnector = connectors.find(
        (c) =>
          c.id === 'metaMask' ||
          c.id === 'io.metamask' ||
          c.name === 'MetaMask' ||
          c.name?.toLowerCase().includes('metamask')
      );
      if (metaMaskConnector) {
        await connect({ connector: metaMaskConnector });
      } else {
        const errorMsg = `MetaMask connector not found. Available: ${connectors.map((c) => c.id).join(', ')}`;
        console.error(errorMsg, connectors.map((c) => ({ id: c.id, name: c.name })));
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('MetaMask connection error:', error);
      // Handle the "already pending" case
      if (error?.message?.includes('already pending') || error?.message?.includes('Requested resource not available')) {
        throw new Error('A connection request is already pending in MetaMask. Please wait for the current request to complete or refresh the page.');
      }
      throw error;
    }
  };

  const connectWalletConnect = async () => {
    try {
      const walletConnectConnector = connectors.find((c) => c.id === 'walletConnect');
      if (!walletConnectConnector) {
        throw new Error('WalletConnect connector not found. Please ensure VITE_WALLETCONNECT_PROJECT_ID is set in your .env file.');
      }
      
      // Add timeout so it doesn't hang forever
      const connectionPromise = connect({ connector: walletConnectConnector });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout. Please try again.')), 30000)
      );
      
      await Promise.race([connectionPromise, timeoutPromise]);
    } catch (error: any) {
      console.error('WalletConnect connection error:', error);
      if (error?.message?.includes('timeout')) {
        throw new Error('Connection timed out. Please ensure your mobile wallet app is open and try again.');
      } else if (error?.message?.includes('rejected') || error?.code === 4001) {
        throw new Error('Connection rejected. Please approve the connection in your wallet.');
      } else if (error?.message?.includes('not found')) {
        throw error;
      } else {
        throw new Error(error?.message || 'Failed to connect via WalletConnect. Please try again.');
      }
    }
  };

  /** Switch wallet to Polygon Amoy (required for this app). */
  const switchToAmoy = async () => {
    try {
      if (!switchChain) {
        throw new Error('Switch chain function not available');
      }
      if (chainId === polygonAmoy.id) {
        return; // already on Amoy
      }
      await switchChain({ chainId: WAGER_CHAIN_ID });
    } catch (error: any) {
      console.error('Network switch error:', error);
      if (error?.code === 4001 || error?.message?.includes('rejected')) {
        return;
      }
      throw error;
    }
  };

  return {
    address: address || null,
    isConnected,
    chainId,
    chainName,
    isCorrectNetwork,
    balance: formattedBalance,
    connectMetaMask,
    connectWalletConnect,
    disconnect,
    connectors,
    isConnecting: isPending,
    isSwitchingChain,
    connectError: connectError?.message,
    switchToAmoy,
    switchToCorrectNetwork: switchToAmoy,
    reset,
  };
};
