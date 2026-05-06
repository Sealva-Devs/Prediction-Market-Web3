import { create } from 'zustand';
import { mockWagers } from '../data/mockWagers';
import { Participant, Transaction, Wager, WagerStatus } from '../types';

interface WagerStore {
  wagers: Wager[];
  transactions: Transaction[];
  createWager: (wager: Omit<Wager, 'id' | 'createdAt' | 'totalPledged' | 'participants' | 'status'>) => Wager;
  pledge: (wagerId: string, address: string, amount: number) => void;
  resolve: (wagerId: string, winner: string) => void;
  getWager: (id: string) => Wager | undefined;
}

// Using mock data for now - will swap to contract calls after deployment
export const useWagerStore = create<WagerStore>((set, get) => ({
  wagers: mockWagers,
  transactions: [],
  createWager: (wager) => {
    const newWager: Wager = {
      ...wager,
      id: `w-${Date.now()}`,
      createdAt: Date.now(),
      status: 'PENDING',
      totalPledged: 0,
      participants: [],
    };
    set((state) => ({ wagers: [newWager, ...state.wagers] }));
    return newWager;
  },
  pledge: (wagerId, address, amount) => {
    set((state) => {
      const wagers = state.wagers.map((w) => {
        if (w.id !== wagerId) return w;
        const participant: Participant = {
          id: `p-${Date.now()}`,
          address,
          pledgedAmount: amount,
          isWinner: false,
          pledgedAt: Date.now(),
        };
        const updatedTotal = Number((w.totalPledged + amount).toFixed(4));
        let status: WagerStatus = w.status;
        if (w.status === 'CREATED') {
          status = 'PENDING';
        } else if (w.status === 'PENDING' && w.participants.length >= 1) {
          status = 'ACTIVE';
        }
        return {
          ...w,
          participants: [...w.participants, participant],
          totalPledged: updatedTotal,
          status,
        };
      });
      const tx: Transaction = {
        hash: `0x${Math.random().toString(16).slice(2)}`,
        type: 'PLEDGE',
        wagerId,
        from: address,
        amount,
        status: 'CONFIRMED',
        timestamp: Date.now(),
      };
      return { wagers, transactions: [tx, ...state.transactions] };
    });
  },
  resolve: (wagerId, winner) => {
    set((state) => {
      const wagers = state.wagers.map((w) => {
        if (w.id !== wagerId) return w;
        return {
          ...w,
          status: 'RESOLVED' as WagerStatus,
          winner,
          resolvedAt: Date.now(),
          participants: w.participants.map((p) => ({ ...p, isWinner: p.address === winner })),
        };
      });
      const tx: Transaction = {
        hash: `0x${Math.random().toString(16).slice(2)}`,
        type: 'RESOLVE',
        wagerId,
        from: winner,
        amount: 0,
        status: 'CONFIRMED',
        timestamp: Date.now(),
      };
      return { wagers, transactions: [tx, ...state.transactions] };
    });
  },
  getWager: (id) => get().wagers.find((w) => w.id === id),
}));
