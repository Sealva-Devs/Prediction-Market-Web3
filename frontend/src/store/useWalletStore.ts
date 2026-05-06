import { create } from 'zustand';
import { WalletState } from '../types';

interface WalletStore {
  wallet: WalletState;
  connectMock: () => void;
  disconnect: () => void;
}

const mockAddress = '0x1234...5678';

export const useWalletStore = create<WalletStore>((set) => ({
  wallet: {
    address: null,
    connected: false,
    balance: 12.34,
    chain: 'Polygon Amoy',
  },
  connectMock: () =>
    set({
      wallet: {
        address: mockAddress,
        connected: true,
        balance: 12.34,
        chain: 'Polygon Amoy',
      },
    }),
  disconnect: () =>
    set({
      wallet: {
        address: null,
        connected: false,
        balance: 0,
        chain: 'Polygon Amoy',
      },
    }),
}));
