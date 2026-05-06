import { useReadContract, useReadContracts, useWriteContract, useAccount } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { parseEther } from 'viem';
import type { Abi } from 'viem';
import { useMemo, useCallback } from 'react';
import { WAGER_ABI, WAGER_CONTRACT_ADDRESS, isContractConfigured } from '../config/contracts';
import type { Wager, WagerStatus, Participant } from '../types';

/** Always read from Polygon Amoy where the contract is deployed */
const CHAIN_ID = polygonAmoy.id;
const AMOY_CHAIN_ID = polygonAmoy.id;
const WRONG_NETWORK_MSG = `Wrong network. Your wallet is not on Polygon Amoy (${AMOY_CHAIN_ID}). Please switch to Polygon Amoy in your wallet and try again.`;

const CONTRACT_CONFIG = {
  address: WAGER_CONTRACT_ADDRESS,
  abi: WAGER_ABI as Abi,
  chainId: CHAIN_ID,
} as const;

/** Contract WagerStatus enum: 0=CREATED, 1=PENDING, 2=ACTIVE, 3=RESOLVED, 4=CANCELLED */
const STATUS_MAP: WagerStatus[] = ['CREATED', 'PENDING', 'ACTIVE', 'RESOLVED', 'CANCELLED'];

function mapStatus(statusNum: number): WagerStatus {
  return STATUS_MAP[Number(statusNum)] ?? 'CREATED';
}

/** Normalize getWager result (array or named object from viem) to tuple for mapping */
function normalizeGetWagerResult(raw: unknown): readonly unknown[] | null {
  if (!raw) return null;
  if (Array.isArray(raw) && raw.length >= 16) return raw;
  if (typeof raw === 'object' && raw !== null && 'id' in raw) {
    const o = raw as Record<string, unknown>;
    return [
      o.id,
      o.title,
      o.description,
      o.creator,
      o.minPledge,
      o.totalPledged,
      o.deadline,
      o.createdAt,
      o.status,
      o.winner,
      o.resolvedAt,
      o.isPublic,
      o.multiSigDeadlineHours,
      o.multiSigDeadline,
      o.marketId,
      o.participantCount,
    ];
  }
  return null;
}

/** Map raw getWager result to frontend Wager type */
export function mapContractWagerToWager(raw: readonly unknown[]): Wager {
  const [
    id,
    title,
    description,
    creator,
    minPledge,
    totalPledged,
    deadline,
    createdAt,
    status,
    winner,
    resolvedAt,
    isPublic,
    multiSigDeadlineHours,
    multiSigDeadline,
    marketId,
    _participantCount,
  ] = raw as [
    bigint, string, string, string, bigint, bigint, bigint, bigint, number, string, bigint, boolean, bigint, bigint, string, bigint,
  ];
  return {
    id: String(id),
    title,
    description,
    creator: creator as string,
    minPledge: Number(minPledge) / 1e18,
    totalPledged: Number(totalPledged) / 1e18,
    deadline: Number(deadline) * 1000,
    createdAt: Number(createdAt) * 1000,
    status: mapStatus(status),
    winner: winner && winner !== '0x0000000000000000000000000000000000000000' ? winner : undefined,
    resolvedAt: resolvedAt ? Number(resolvedAt) * 1000 : undefined,
    isPublic: isPublic ?? true,
    multiSigDeadlineHours: Number(multiSigDeadlineHours ?? 0),
    multiSigDeadline: multiSigDeadline ? Number(multiSigDeadline) * 1000 : undefined,
    participants: [],
    marketId: marketId || undefined,
  };
}

/** Map getParticipants result to Participant[] */
export function mapContractParticipantsToParticipants(
  addresses: readonly `0x${string}`[],
  amounts: readonly bigint[],
  signed: readonly boolean[],
  pledgedAt: readonly bigint[],
  winner?: string
): Participant[] {
  return addresses.map((address, i) => ({
    id: `p-${address}-${i}`,
    address,
    pledgedAmount: Number(amounts[i] ?? 0n) / 1e18,
    isWinner: winner ? address.toLowerCase() === winner.toLowerCase() : false,
    pledgedAt: Number(pledgedAt[i] ?? 0n) * 1000,
    hasSigned: signed[i] ?? false,
  }));
}

export function useWagerContract() {
  const { data: countBig, refetch: refetchCount, isFetching: isFetchingCount } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getWagerCount',
    query: { enabled: isContractConfigured },
  });

  const count = countBig !== undefined ? Number(countBig) : 0;
  const contractReads = useMemo(() => {
    if (count <= 0) return [];
    return Array.from({ length: count }, (_, i) => ({
      address: CONTRACT_CONFIG.address,
      abi: CONTRACT_CONFIG.abi,
      functionName: 'getWager' as const,
      args: [BigInt(i + 1)] as const,
      chainId: CHAIN_ID,
    }));
  }, [count]);

  const { data: wagersData, refetch: refetchWagers, isFetching: isFetchingWagers } = useReadContracts({
    contracts: contractReads,
    query: { enabled: isContractConfigured && count > 0 },
  });

  const wagers: Wager[] = useMemo(() => {
    if (!wagersData || wagersData.length === 0) return [];
    return wagersData
      .map((r) => {
        if (r.status !== 'success' || r.result == null) return null;
        const normalized = normalizeGetWagerResult(r.result);
        return normalized ? mapContractWagerToWager(normalized) : null;
      })
      .filter((w): w is Wager => w !== null);
  }, [wagersData]);

  const refetchAll = useCallback(async () => {
    await Promise.all([refetchCount(), refetchWagers()]);
  }, [refetchCount, refetchWagers]);

  const isLoading = isFetchingCount || (count > 0 && isFetchingWagers);

  return {
    isConfigured: isContractConfigured,
    wagerCount: count,
    wagers,
    isLoading,
    refetchAll,
    refetchCount,
    refetchWagers,
  };
}

/** Valid numeric wager ID (positive integer string). Returns undefined for invalid/empty. */
function parseWagerId(wagerId: string | undefined): bigint | undefined {
  if (!wagerId || wagerId === '0') return undefined;
  const trimmed = wagerId.trim();
  if (!/^\d+$/.test(trimmed)) return undefined;
  const n = BigInt(trimmed);
  return n > 0n ? n : undefined;
}

export function useWagerById(wagerId: string | undefined) {
  const id = useMemo(() => parseWagerId(wagerId), [wagerId]);
  const enabled = isContractConfigured && id !== undefined;

  const { data: raw, refetch: refetchWager, isFetching: isFetchingWager, isFetched: isWagerFetched } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getWager',
    args: id !== undefined ? [id] : undefined,
    query: { enabled },
  });

  const { data: participantsData, refetch: refetchParticipants, isFetching: isFetchingParticipants } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getParticipants',
    args: id !== undefined ? [id] : undefined,
    query: { enabled },
  });

  const wager: Wager | null = useMemo(() => {
    const normalized = normalizeGetWagerResult(raw);
    if (!normalized) return null;
    const w = mapContractWagerToWager(normalized);
    if (!participantsData) return w;
    let addresses: readonly `0x${string}`[] = [];
    let amounts: readonly bigint[] = [];
    let signed: readonly boolean[] = [];
    let pledgedAt: readonly bigint[] = [];
    if (Array.isArray(participantsData) && participantsData.length >= 4) {
      [addresses, amounts, signed, pledgedAt] = participantsData as [readonly `0x${string}`[], readonly bigint[], readonly boolean[], readonly bigint[]];
    } else if (participantsData && typeof participantsData === 'object' && !Array.isArray(participantsData)) {
      const o = participantsData as { addresses?: unknown[]; amounts?: unknown[]; signed?: unknown[]; pledgedAt?: unknown[] };
      addresses = (o.addresses ?? []) as readonly `0x${string}`[];
      amounts = (o.amounts ?? []) as readonly bigint[];
      signed = (o.signed ?? []) as readonly boolean[];
      pledgedAt = (o.pledgedAt ?? []) as readonly bigint[];
    }
    if (addresses.length) {
      w.participants = mapContractParticipantsToParticipants(addresses, amounts, signed, pledgedAt, w.winner);
    }
    return w;
  }, [raw, participantsData]);

  const refetch = () => {
    refetchWager();
    refetchParticipants();
  };

  const isLoading = enabled && (isFetchingWager || isFetchingParticipants);
  const isNotFound = enabled && isWagerFetched && !raw;

  return { wager, refetch, isConfigured: isContractConfigured, isLoading, isNotFound, invalidId: wagerId != null && id === undefined };
}

export function useWagerWrite() {
  const { chainId } = useAccount();
  const { writeContractAsync, isPending, error, reset } = useWriteContract();

  const ensureAmoy = () => {
    if (chainId !== undefined && chainId !== AMOY_CHAIN_ID) {
      throw new Error(WRONG_NETWORK_MSG);
    }
  };

  const createWager = async (params: {
    title: string;
    description: string;
    minPledge: number;
    deadline: number; // unix seconds
    multiSigDeadlineHours: number;
    isPublic: boolean;
    marketId: string;
  }): Promise<`0x${string}`> => {
    ensureAmoy();
    const hash = await writeContractAsync({
      ...CONTRACT_CONFIG,
      functionName: 'createWager',
      args: [
        params.title,
        params.description,
        parseEther(String(params.minPledge)),
        BigInt(Math.floor(params.deadline)),
        BigInt(params.multiSigDeadlineHours),
        params.isPublic,
        params.marketId,
      ],
    });
    return hash as `0x${string}`;
  };

  const pledge = async (wagerId: string, amountMatic: number) => {
    ensureAmoy();
    return writeContractAsync({
      ...CONTRACT_CONFIG,
      functionName: 'pledge',
      args: [BigInt(wagerId)],
      value: parseEther(String(amountMatic)),
    });
  };

  const resolveWager = async (wagerId: string, winner: `0x${string}`) => {
    ensureAmoy();
    return writeContractAsync({
      ...CONTRACT_CONFIG,
      functionName: 'resolveWager',
      args: [BigInt(wagerId), winner],
    });
  };

  const signMultiSig = async (wagerId: string) => {
    ensureAmoy();
    return writeContractAsync({
      ...CONTRACT_CONFIG,
      functionName: 'signMultiSig',
      args: [BigInt(wagerId)],
    });
  };

  const releaseFunds = async (wagerId: string) => {
    ensureAmoy();
    return writeContractAsync({
      ...CONTRACT_CONFIG,
      functionName: 'releaseFunds',
      args: [BigInt(wagerId)],
    });
  };

  const cancelWager = async (wagerId: string) => {
    ensureAmoy();
    return writeContractAsync({
      ...CONTRACT_CONFIG,
      functionName: 'cancelWager',
      args: [BigInt(wagerId)],
    });
  };

  return {
    createWager,
    pledge,
    resolveWager,
    signMultiSig,
    releaseFunds,
    cancelWager,
    isPending,
    error: error?.message,
    reset,
  };
}
