export const formatAmount = (amount: number, decimals = 2) => amount.toFixed(decimals);

export const formatAddress = (addr: string, size = 4) =>
  addr.length > size * 2 + 2 ? `${addr.slice(0, size + 2)}...${addr.slice(-size)}` : addr;

export const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

export const timeRemaining = (timestamp: number) => {
  const diff = timestamp - Date.now();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return `${days}d ${hours}h`;
};

const CHAIN_MISMATCH_FRIENDLY = 'Wrong network. Switch to Polygon Amoy (80002) in your wallet and try again.';

const RPC_ERROR_FRIENDLY =
  'RPC error. Ensure your wallet is on Polygon Amoy (80002), then try again. If it persists, the RPC may be busy—wait a moment or use a custom RPC (see docs).';

/** Extract a user-friendly message from wagmi/viem/contract errors (works in dev and production/Vercel) */
export function getContractErrorMessage(error: unknown): string {
  const raw = (() => {
    if (error instanceof Error) return error.message ?? '';
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object') {
      const o = error as Record<string, unknown>;
      return [o.shortMessage, o.message, o.details].filter((x): x is string => typeof x === 'string').join(' ');
    }
    return String(error);
  })();
  if (/80001|80002|does not match the target chain|ChainMismatch|current chain of the wallet/i.test(raw)) {
    return CHAIN_MISMATCH_FRIENDLY;
  }
  if (/Internal JSON-RPC error|JSON-RPC error|RPC Error|code -32603/i.test(raw)) {
    return RPC_ERROR_FRIENDLY;
  }
  if (error instanceof Error) {
    const msg = error.message?.trim();
    if (msg) return msg;
    if ((error as any).cause != null) return getContractErrorMessage((error as any).cause);
  }
  if (typeof error === 'string' && error.trim()) return error.trim();
  if (error && typeof error === 'object') {
    const o = error as Record<string, unknown>;
    if (typeof o.shortMessage === 'string' && o.shortMessage.trim()) return o.shortMessage.trim();
    if (typeof o.message === 'string' && o.message.trim()) return o.message.trim();
    if (typeof o.details === 'string' && o.details.trim()) return o.details.trim();
    if (typeof o.reason === 'string' && o.reason.trim()) return o.reason.trim();
    if (o.cause != null) return getContractErrorMessage(o.cause);
    // Minified/bundled errors sometimes use different keys
    const walk = (obj: unknown): string | null => {
      if (obj instanceof Error && obj.message) return obj.message;
      if (typeof obj === 'string') return obj;
      if (obj && typeof obj === 'object') {
        const r = obj as Record<string, unknown>;
        for (const k of ['shortMessage', 'message', 'details', 'reason', 'error']) {
          if (typeof r[k] === 'string' && (r[k] as string).trim()) return (r[k] as string).trim();
        }
        if (r.cause != null) return walk(r.cause) ?? null;
      }
      return null;
    };
    const nested = walk(o);
    if (nested) return nested;
  }
  const fallback = typeof error === 'object' && error !== null ? String((error as Error).message ?? error) : String(error);
  if (fallback && fallback !== '[object Object]') return fallback;
  return 'Transaction failed. Please try again.';
}
