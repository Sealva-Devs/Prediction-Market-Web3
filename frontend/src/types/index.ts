export type WagerStatus = 'CREATED' | 'PENDING' | 'ACTIVE' | 'RESOLVED' | 'CANCELLED';

export interface Participant {
  id: string;
  address: string;
  pledgedAmount: number;
  isWinner: boolean;
  pledgedAt: number;
  /** From contract: whether this participant has signed multi-sig release */
  hasSigned?: boolean;
}

export type WagerVisibility = 'public' | 'private';

export interface Wager {
  id: string;
  title: string;
  marketId?: string;
  description: string;
  status: WagerStatus;
  minPledge: number;
  totalPledged: number;
  deadline: number;
  createdAt: number;
  creator: string;
  participants: Participant[];
  winner?: string;
  resolvedAt?: number;
  // Public wagers show on dashboard, private ones only visible to creator + invited
  isPublic?: boolean;
  // Hours for multi-sig signing deadline - after this passes, can go to dispute
  multiSigDeadlineHours?: number;
  // Actual multi-sig deadline timestamp (set after resolution)
  multiSigDeadline?: number;
  // Email addresses of people invited to join
  inviteEmails?: string[];
}

export interface Transaction {
  hash: string;
  type: 'CREATE' | 'PLEDGE' | 'RESOLVE' | 'PAYOUT';
  wagerId: string;
  from: string;
  to?: string;
  amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  timestamp: number;
}

export interface WalletState {
  address: string | null;
  connected: boolean;
  balance: number;
  chain: 'Polygon' | 'Polygon Amoy';
}
