// Mock data - replace with real contract calls later
import { Wager } from '../types';

export const mockWagers: Wager[] = [
  {
    id: 'w1',
    title: 'Will BTC close above $50k this month?',
    marketId: 'POLY-BTC-50K',
    description: 'Polymarket oracle settles on monthly close. Escrow releases to YES backers if price > $50k.',
    isPublic: true,
    status: 'ACTIVE',
    minPledge: 0.1,
    totalPledged: 2.4,
    deadline: Date.now() + 1000 * 60 * 60 * 24 * 3,
    createdAt: Date.now() - 1000 * 60 * 60 * 18,
    creator: '0x1234...5678',
    participants: [
      { id: 'p1', address: '0x1234...5678', pledgedAmount: 0.8, isWinner: false, pledgedAt: Date.now() - 1000 * 60 * 60 * 16 },
      { id: 'p2', address: '0xabcd...ef01', pledgedAmount: 1.6, isWinner: false, pledgedAt: Date.now() - 1000 * 60 * 60 * 5 },
    ],
  },
  {
    id: 'w2',
    title: 'Will ETH ETF be approved by Q2?',
    marketId: 'POLY-ETH-ETF',
    description: 'Yes/No on ETH ETF approval. Governance pulls resolution from Polymarket market.',
    isPublic: true,
    status: 'PENDING',
    minPledge: 0.2,
    totalPledged: 0.6,
    deadline: Date.now() + 1000 * 60 * 60 * 24 * 7,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    creator: '0x9999...1111',
    participants: [
      { id: 'p3', address: '0x9999...1111', pledgedAmount: 0.4, isWinner: false, pledgedAt: Date.now() - 1000 * 60 * 60 * 46 },
      { id: 'p4', address: '0xaaaa...bbbb', pledgedAmount: 0.2, isWinner: false, pledgedAt: Date.now() - 1000 * 60 * 60 * 30 },
    ],
  },
  {
    id: 'w3',
    title: 'Solana TPS > 10k sustained for 24h?',
    description: 'Performance wager. Outcome validated via governance feed; escrow releases to YES if sustained TPS holds.',
    isPublic: true,
    status: 'RESOLVED',
    minPledge: 0.15,
    totalPledged: 1.2,
    deadline: Date.now() - 1000 * 60 * 60 * 24 * 2,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    creator: '0x7777...8888',
    participants: [
      { id: 'p5', address: '0x7777...8888', pledgedAmount: 0.5, isWinner: true, pledgedAt: Date.now() - 1000 * 60 * 60 * 24 * 8 },
      { id: 'p6', address: '0xcccc...dddd', pledgedAmount: 0.7, isWinner: false, pledgedAt: Date.now() - 1000 * 60 * 60 * 24 * 7 },
    ],
    winner: '0x7777...8888',
    resolvedAt: Date.now() - 1000 * 60 * 60 * 24,
  },
];
