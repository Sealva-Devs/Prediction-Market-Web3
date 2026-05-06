import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  Tooltip,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import InfoIcon from '@mui/icons-material/Info';
import { useState } from 'react';
import { useWagerStore } from '../store/useWagerStore';
import { useWallet } from '../hooks/useWallet';
import { useWagerById, useWagerWrite } from '../hooks/useWagerContract';
import { isContractConfigured } from '../config/contracts';
import { formatAddress, formatAmount, formatDate, timeRemaining, getContractErrorMessage } from '../utils/format';
import { DemoBanner } from '../components/DemoBanner';
import { EscrowVisualization } from '../components/EscrowVisualization';
import { useToast } from '../components/ToastNotification';
import { MultiSigStatus } from '../components/MultiSigStatus';
import { DisputeButton } from '../components/DisputeButton';
import { getExplorerTxUrl } from '../utils/explorer';

const NETWORK_LABEL = 'Polygon Amoy';

export const WagerDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const storeGetWager = useWagerStore((s) => s.getWager);
  const storePledge = useWagerStore((s) => s.pledge);
  const storeResolve = useWagerStore((s) => s.resolve);
  const { address, isConnected, isCorrectNetwork, switchToAmoy } = useWallet();
  const { showToast } = useToast();
  const { wager: contractWager, refetch: refetchWager, isConfigured, isLoading: isContractLoading, isNotFound, invalidId } = useWagerById(id || undefined);
  const { pledge: contractPledge, resolveWager: contractResolveWager, signMultiSig: contractSignMultiSig, releaseFunds: contractReleaseFunds, cancelWager: contractCancelWager, isPending: isWritePending } = useWagerWrite();

  const wager = isContractConfigured && isConfigured ? contractWager : storeGetWager(id || '');
  const [amount, setAmount] = useState('0.1');
  const [isPledging, setIsPledging] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [localSignatures, setLocalSignatures] = useState<string[]>([]);
  const signatures =
    isContractConfigured && wager
      ? (wager.participants?.filter((p) => p.hasSigned).map((p) => p.address) ?? []) as string[]
      : localSignatures;

  if (isContractConfigured && isConfigured) {
    if (invalidId) {
      return (
        <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
          <Typography color="text.secondary">Invalid wager ID. Use a positive number (e.g. 1, 2).</Typography>
        </Stack>
      );
    }
    if (isContractLoading && !wager) {
      return (
        <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
          <CircularProgress />
          <Typography color="text.secondary">Loading wager…</Typography>
        </Stack>
      );
    }
    if (isNotFound || !wager) {
      return (
        <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
          <Typography>Wager not found.</Typography>
        </Stack>
      );
    }
  } else if (!wager) {
    return (
      <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
        <Typography>Wager not found.</Typography>
      </Stack>
    );
  }

  const pledgedPercent = Math.min((wager.totalPledged / Math.max(wager.minPledge, 0.0001)) * 100, 100);

  const handlePledge = async () => {
    if (!isConnected) {
      showToast('Please connect your wallet first', 'warning');
      return;
    }
    if (!isCorrectNetwork) {
      showToast(`Wrong network. Switching to ${NETWORK_LABEL}… Approve in your wallet, then try again.`, 'warning');
      try {
        await switchToAmoy();
      } catch (e) {
        console.warn('Switch network:', e);
      }
      return;
    }
    if (!address) {
      showToast('Wallet address not available', 'error');
      return;
    }

    const amountNum = Number(amount) || 0;
    if (amountNum < wager.minPledge) {
      showToast(`Pledge amount must be at least ${wager.minPledge} (min for this wager).`, 'warning');
      return;
    }
    setIsPledging(true);
    try {
      if (isContractConfigured) {
        const txHash = await contractPledge(wager.id, amountNum);
        refetchWager();
        showToast(
          `Pledged ${amount} POL! Funds are in escrow.`,
          'success',
          { url: getExplorerTxUrl(txHash), label: 'View on explorer' }
        );
      } else {
        await new Promise((r) => setTimeout(r, 500));
        storePledge(wager.id, address, amountNum);
        showToast(`Successfully pledged ${amount} POL! Funds are now in escrow.`, 'success');
      }
    } catch (error: unknown) {
      console.error('[Pledge]', error);
      const msg = getContractErrorMessage(error);
      showToast(msg.length > 120 ? `${msg.slice(0, 117)}…` : msg, 'error');
    } finally {
      setIsPledging(false);
    }
  };

  const handleResolve = async () => {
    if (!isCorrectNetwork) {
      showToast(`Wrong network. Switching to ${NETWORK_LABEL}… Approve in your wallet, then try again.`, 'warning');
      try {
        await switchToAmoy();
      } catch (e) {
        console.warn('Switch network:', e);
      }
      return;
    }
    if (wager.participants.length === 0) {
      showToast('Cannot resolve: no participants. Winner must be a participant.', 'warning');
      return;
    }
    const winner = selectedWinner || wager.participants[0]?.address;
    if (!winner) {
      showToast('Please select a winner', 'error');
      return;
    }
    if (!wager.participants.some(p => p.address.toLowerCase() === winner.toLowerCase())) {
      showToast('Selected winner must be a participant in this wager', 'error');
      return;
    }
    setIsResolving(true);
    try {
      if (isContractConfigured) {
        const txHash = await contractResolveWager(wager.id, winner as `0x${string}`);
        refetchWager();
        showToast(
          `Wager resolved! Winner: ${formatAddress(winner)}.`,
          'success',
          { url: getExplorerTxUrl(txHash), label: 'View on explorer' }
        );
      } else {
        await new Promise((r) => setTimeout(r, 500));
        storeResolve(wager.id, winner);
        showToast(`Wager resolved! Winner: ${formatAddress(winner)}.`, 'success');
      }
    } catch (error: unknown) {
      console.error('[ResolveWager]', error);
      const msg = getContractErrorMessage(error);
      showToast(msg.length > 120 ? `${msg.slice(0, 117)}…` : msg, 'error');
    } finally {
      setIsResolving(false);
    }
  };

  const handleSign = async () => {
    if (!address) return;
    if (!isCorrectNetwork) {
      showToast(`Wrong network. Switching to ${NETWORK_LABEL}… Approve in your wallet, then try again.`, 'warning');
      try {
        await switchToAmoy();
      } catch (e) {
        console.warn('Switch network:', e);
      }
      return;
    }
    setIsSigning(true);
    try {
      if (isContractConfigured) {
        const txHash = await contractSignMultiSig(wager.id);
        refetchWager();
        showToast(
          'Multi-sig signed successfully!',
          'success',
          { url: getExplorerTxUrl(txHash), label: 'View on explorer' }
        );
      } else {
        await new Promise((r) => setTimeout(r, 800));
        setLocalSignatures((prev) => [...prev, address]);
        showToast('Multi-sig signed successfully!', 'success');
      }
    } catch (error: unknown) {
      console.error('[SignMultiSig]', error);
      const msg = getContractErrorMessage(error);
      showToast(msg.length > 120 ? `${msg.slice(0, 117)}…` : msg, 'error');
    } finally {
      setIsSigning(false);
    }
  };

  const handleReleaseFunds = async () => {
    if (!isCorrectNetwork) {
      showToast(`Wrong network. Switching to ${NETWORK_LABEL}… Approve in your wallet, then try again.`, 'warning');
      try {
        await switchToAmoy();
      } catch (e) {
        console.warn('Switch network:', e);
      }
      return;
    }
    if (wager.status !== 'RESOLVED') {
      showToast('Wager must be resolved before releasing funds', 'warning');
      return;
    }
    setIsReleasing(true);
    try {
      if (isContractConfigured) {
        const txHash = await contractReleaseFunds(wager.id);
        refetchWager();
        showToast(
          'Funds released successfully!',
          'success',
          { url: getExplorerTxUrl(txHash), label: 'View on explorer' }
        );
      } else {
        await new Promise((r) => setTimeout(r, 500));
        showToast('Funds released successfully!', 'success');
      }
    } catch (error: unknown) {
      console.error('[ReleaseFunds]', error);
      const msg = getContractErrorMessage(error);
      showToast(msg.length > 120 ? `${msg.slice(0, 117)}…` : msg, 'error');
    } finally {
      setIsReleasing(false);
    }
  };

  const handleCancelWager = async () => {
    if (!isCorrectNetwork) {
      showToast(`Wrong network. Switching to ${NETWORK_LABEL}… Approve in your wallet, then try again.`, 'warning');
      try {
        await switchToAmoy();
      } catch (e) {
        console.warn('Switch network:', e);
      }
      return;
    }
    if (address?.toLowerCase() !== wager.creator.toLowerCase()) {
      showToast('Only the creator can cancel this wager', 'error');
      return;
    }
    const canCancel = wager.participants.length === 0 || (Date.now() > wager.deadline && wager.status !== 'RESOLVED');
    if (!canCancel) {
      showToast('Cannot cancel: wager has participants and deadline has not passed', 'warning');
      return;
    }
    setIsCancelling(true);
    try {
      if (isContractConfigured) {
        const txHash = await contractCancelWager(wager.id);
        refetchWager();
        showToast(
          'Wager cancelled successfully. Funds refunded.',
          'success',
          { url: getExplorerTxUrl(txHash), label: 'View on explorer' }
        );
      } else {
        await new Promise((r) => setTimeout(r, 500));
        showToast('Wager cancelled successfully. Funds refunded.', 'success');
      }
    } catch (error: unknown) {
      console.error('[CancelWager]', error);
      const msg = getContractErrorMessage(error);
      showToast(msg.length > 120 ? `${msg.slice(0, 117)}…` : msg, 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const isCreator = address?.toLowerCase() === wager.creator.toLowerCase();
  const canCancel = isCreator && (wager.participants.length === 0 || (Date.now() > wager.deadline && wager.status !== 'RESOLVED' && wager.status !== 'CANCELLED'));
  const canRelease = wager.status === 'RESOLVED' && wager.winner && (
    (wager.multiSigDeadline && Date.now() >= wager.multiSigDeadline) ||
    (wager.participants?.every(p => p.hasSigned) ?? false)
  );

  return (
    <Stack spacing={3}>
      <DemoBanner />
      <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
        <Typography variant="h4" fontWeight="bold">
          {wager.title}
        </Typography>
        <Chip label={wager.status} color={wager.status === 'RESOLVED' ? 'success' : 'primary'} size="medium" />
        {wager.winner && (
          <Chip
            icon={<EmojiEventsIcon />}
            label={`Winner: ${formatAddress(wager.winner)}`}
            color="secondary"
            size="medium"
          />
        )}
        {wager.marketId && (
          <Tooltip
            title={
              <Box>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Polymarket Governance Enabled
                </Typography>
                <Typography variant="caption">
                  This wager is linked to Polymarket market {wager.marketId}. The outcome will be automatically resolved using Polymarket's trusted oracle system, ensuring fair and transparent governance.
                </Typography>
              </Box>
            }
            arrow
          >
            <Chip
              icon={<InfoIcon />}
              label={`Polymarket: ${wager.marketId}`}
              variant="outlined"
              color="secondary"
              size="small"
              sx={{ cursor: 'help' }}
            />
          </Tooltip>
        )}
      </Stack>
      <Typography variant="body1" color="text.secondary" paragraph>
        {wager.description}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 3,
        }}
      >
        <Card elevation={2}>
          <CardContent>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Wager Details
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                    gap: 3,
                    mt: 1,
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Min Pledge
                    </Typography>
                    <Typography variant="h6">{formatAmount(wager.minPledge)} POL</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Pledged
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {formatAmount(wager.totalPledged)} POL
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Participants
                    </Typography>
                    <Typography variant="h6">{wager.participants.length}</Typography>
                  </Box>
                </Box>
              </Box>

                <Divider />

                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Escrow Progress
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {timeRemaining(wager.deadline)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={pledgedPercent}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  <Typography variant="caption" color="text.secondary" mt={0.5}>
                    {pledgedPercent.toFixed(0)}% of minimum reached
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" gutterBottom>
                    Join This Wager
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Pledge funds to join. All funds are held in multi-sig escrow until resolution.
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                    <TextField
                      label="Pledge amount (POL)"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      size="medium"
                      sx={{ minWidth: 220 }}
                      error={Number(amount) > 0 && Number(amount) < wager.minPledge}
                      helperText={
                        Number(amount) > 0 && Number(amount) < wager.minPledge
                          ? `Minimum for this wager: ${formatAmount(wager.minPledge)} POL`
                          : `Minimum: ${formatAmount(wager.minPledge)} POL`
                      }
                      inputProps={{ min: wager.minPledge, step: 0.01 }}
                    />
                    <Stack spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                      <Button 
                        variant="contained" 
                        size="large" 
                        onClick={handlePledge} 
                        fullWidth
                        disabled={!isConnected || !isCorrectNetwork || isPledging || isWritePending || Number(amount) < wager.minPledge}
                        startIcon={(isPledging || isWritePending) ? <CircularProgress size={20} color="inherit" /> : undefined}
                      >
                        {(isPledging || isWritePending)
                          ? 'Pledging...'
                          : !isConnected 
                          ? 'Connect Wallet to Pledge' 
                          : !isCorrectNetwork 
                          ? `Switch to ${NETWORK_LABEL}` 
                          : 'Confirm Pledge'}
                      </Button>
                      {wager.status !== 'RESOLVED' && wager.participants.length > 0 && (
                        <>
                          <FormControl fullWidth sx={{ mt: 1 }}>
                            <InputLabel id="winner-select-label">Select Winner</InputLabel>
                            <Select
                              labelId="winner-select-label"
                              id="winner-select"
                              value={selectedWinner}
                              label="Select Winner"
                              onChange={(e) => setSelectedWinner(e.target.value)}
                              disabled={isResolving || isWritePending}
                            >
                              {wager.participants.map((p) => (
                                <MenuItem key={p.id} value={p.address}>
                                  {formatAddress(p.address)} - {formatAmount(p.pledgedAmount)} POL
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Button 
                            variant="outlined" 
                            color="secondary" 
                            onClick={handleResolve} 
                            fullWidth
                            disabled={isResolving || isWritePending || !selectedWinner || wager.participants.length === 0}
                            startIcon={(isResolving || isWritePending) ? <CircularProgress size={20} color="inherit" /> : undefined}
                            sx={{ mt: 1 }}
                          >
                            {isResolving || isWritePending ? 'Resolving...' : '🎯 Resolve Wager'}
                          </Button>
                          <DisputeButton 
                            wagerId={wager.id} 
                            marketId={wager.marketId}
                            disabled={!!wager.winner}
                          />
                          {canCancel && (
                            <Button 
                              variant="outlined" 
                              color="error" 
                              onClick={handleCancelWager} 
                              fullWidth
                              disabled={isCancelling || isWritePending}
                              startIcon={(isCancelling || isWritePending) ? <CircularProgress size={20} color="inherit" /> : undefined}
                              sx={{ mt: 1 }}
                            >
                              {isCancelling || isWritePending ? 'Cancelling...' : '❌ Cancel Wager'}
                            </Button>
                          )}
                        </>
                      )}
                      {wager.status === 'RESOLVED' && canRelease && (
                        <Button 
                          variant="contained" 
                          color="success" 
                          onClick={handleReleaseFunds} 
                          fullWidth
                          disabled={isReleasing || isWritePending}
                          startIcon={(isReleasing || isWritePending) ? <CircularProgress size={20} color="inherit" /> : undefined}
                          sx={{ mt: 1 }}
                        >
                          {isReleasing || isWritePending ? 'Releasing...' : '💰 Release Funds to Winner'}
                        </Button>
                      )}
                    </Stack>
                    {!isConnected && (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        Connect your wallet to pledge funds
                      </Alert>
                    )}
                    {isConnected && !isCorrectNetwork && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        Please switch to {NETWORK_LABEL} testnet
                      </Alert>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>

        <Stack spacing={2}>
          <EscrowVisualization
            totalPledged={wager.totalPledged}
            isResolved={wager.status === 'RESOLVED'}
            winner={wager.winner}
          />

          <MultiSigStatus 
            participants={wager.participants.map((p) => ({ address: p.address, amount: p.pledgedAmount }))}
            signatures={signatures}
            deadline={
              wager.multiSigDeadline 
                ? wager.multiSigDeadline 
                : wager.resolvedAt && wager.multiSigDeadlineHours 
                  ? wager.resolvedAt + wager.multiSigDeadlineHours * 60 * 60 * 1000 
                  : undefined
            }
            onSign={handleSign}
            isSigning={isSigning || isWritePending}
          />

          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Participants ({wager.participants.length})
              </Typography>
              <Stack spacing={2}>
                {wager.participants.map((p) => (
                  <Stack
                    key={p.id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: p.isWinner ? 'rgba(156, 39, 176, 0.1)' : 'rgba(255,255,255,0.02)',
                      border: p.isWinner ? '1px solid rgba(156, 39, 176, 0.3)' : '1px solid transparent',
                    }}
                  >
                    <Stack>
                      <Typography variant="body2" fontWeight={p.isWinner ? 600 : 400}>
                        {formatAddress(p.address)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(p.pledgedAt)}
                      </Typography>
                    </Stack>
                    <Stack alignItems="flex-end">
                      <Typography variant="body2" fontWeight={600}>
                        {formatAmount(p.pledgedAmount)} POL
                      </Typography>
                      {p.isWinner && (
                        <Chip
                          icon={<EmojiEventsIcon />}
                          label="Winner"
                          size="small"
                          color="secondary"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Stack>
                  </Stack>
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                Created {formatDate(wager.createdAt)}
              </Typography>
              {wager.resolvedAt && (
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                  Resolved {formatDate(wager.resolvedAt)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Stack>
  );
};
