import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider as WagmiProviderBase } from 'wagmi';
import { ReactNode } from 'react';
import { wagmiConfig } from '../config/wagmi';

const queryClient = new QueryClient();

interface WagmiProviderProps {
  children: ReactNode;
}

// Wrap app with wagmi and react-query providers
export const WagmiProvider = ({ children }: WagmiProviderProps) => {
  return (
    <WagmiProviderBase config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProviderBase>
  );
};
