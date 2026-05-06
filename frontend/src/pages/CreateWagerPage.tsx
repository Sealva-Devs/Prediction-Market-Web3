import { useState, useEffect, useRef } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert, Divider, ToggleButtonGroup, ToggleButton, CircularProgress, Tooltip, IconButton, InputAdornment } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useNavigate } from 'react-router-dom';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useWagerStore } from '../store/useWagerStore';
import { useWallet } from '../hooks/useWallet';
import { useWagerContract, useWagerWrite } from '../hooks/useWagerContract';
import { isContractConfigured } from '../config/contracts';
import { DemoBanner } from '../components/DemoBanner';
import { useToast } from '../components/ToastNotification';
import { getExplorerTxUrl } from '../utils/explorer';
import { getContractErrorMessage } from '../utils/format';
import type { WagerVisibility } from '../types';

export const CreateWagerPage = () => {
  const navigate = useNavigate();
  const storeCreateWager = useWagerStore((s) => s.createWager);
  const { address, isConnected, isCorrectNetwork, switchToAmoy } = useWallet();
  const { showToast } = useToast();
  const { wagerCount, refetchAll, refetchCount } = useWagerContract();
  const { createWager: contractCreateWager, isPending: isContractPending } = useWagerWrite();

  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | null>(null);
  const [pendingNewId, setPendingNewId] = useState<number | null>(null);
  const successHandledRef = useRef(false);

  const { isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: pendingTxHash ?? undefined });
  useEffect(() => {
    if (!isTxSuccess || pendingNewId == null || !pendingTxHash || successHandledRef.current) return;
    successHandledRef.current = true;
    showToast(
      'Wager created successfully!',
      'success',
      { url: getExplorerTxUrl(pendingTxHash), label: 'View on explorer' }
    );
    navigate(`/wagers/${pendingNewId}`);
    setPendingTxHash(null);
    setPendingNewId(null);
    refetchAll();
  }, [isTxSuccess, pendingNewId, pendingTxHash, showToast, navigate, refetchAll]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    marketId: '',
    minPledge: '0.1',
    deadlineHours: '72',
    multiSigDeadlineHours: '48',
    visibility: 'public' as WagerVisibility,
    inviteEmails: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (Number(form.minPledge) <= 0) newErrors.minPledge = 'Minimum pledge must be greater than 0';
    if (Number(form.deadlineHours) <= 0) newErrors.deadlineHours = 'Deadline must be greater than 0';
    const ms = Number(form.multiSigDeadlineHours);
    if (isNaN(ms) || ms < 1) newErrors.multiSigDeadlineHours = 'Must be at least 1 hour';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseEmails = (raw: string): string[] => {
    return raw
      .split(/[\n,]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!isConnected) {
      showToast('Please connect your wallet first', 'warning');
      return;
    }
    if (!isCorrectNetwork) {
      showToast('Wrong network. Switching to Polygon Amoy… Approve in your wallet, then try again.', 'warning');
      try {
        await switchToAmoy();
      } catch (e) {
        console.warn('Switch network:', e);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const deadlineMs = Number(form.deadlineHours || '0') * 60 * 60 * 1000;
      const deadlineSec = Math.floor((Date.now() + deadlineMs) / 1000);
      const inviteEmails = parseEmails(form.inviteEmails);

      if (isContractConfigured) {
        const { data: freshCount } = (await refetchCount?.()) ?? {};
        const countBefore = freshCount !== undefined ? Number(freshCount) : wagerCount;
        const hash = await contractCreateWager({
          title: form.title || 'Untitled wager',
          description: form.description,
          minPledge: Number(form.minPledge) || 0.1,
          deadline: deadlineSec,
          multiSigDeadlineHours: Number(form.multiSigDeadlineHours) || 48,
          isPublic: form.visibility === 'public',
          marketId: form.marketId || '',
        });
        successHandledRef.current = false;
        setPendingTxHash(hash);
        setPendingNewId(countBefore + 1);
      } else {
        const wager = storeCreateWager({
          title: form.title || 'Untitled wager',
          description: form.description,
          marketId: form.marketId || undefined,
          minPledge: Number(form.minPledge) || 0.1,
          deadline: Date.now() + deadlineMs,
          creator: address ?? '0xcreator...demo',
          isPublic: form.visibility === 'public',
          multiSigDeadlineHours: Number(form.multiSigDeadlineHours) || 48,
          inviteEmails: inviteEmails.length ? inviteEmails : undefined,
        });
        showToast('Wager created successfully!', 'success');
        setTimeout(() => navigate(`/wagers/${wager.id}`), 800);
      }
    } catch (error: unknown) {
      console.error('[CreateWager]', error);
      const msg = getContractErrorMessage(error);
      showToast(msg.length > 120 ? `${msg.slice(0, 117)}…` : msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  return (
    <Stack spacing={3}>
      <DemoBanner />
      
      <Typography variant="h4" fontWeight="bold">
        Create a New Wager
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
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Define your wager outcome, set terms, and link it to a Polymarket market for automatic resolution.
                </Typography>
              </Box>

              <TextField
                label="Wager Title *"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                fullWidth
                error={!!errors.title}
                helperText={errors.title || `${form.title.length}/100 characters. e.g., "Will BTC reach $50k by end of month?"`}
                required
                inputProps={{ maxLength: 100 }}
              />

              <TextField
                label="Description *"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                fullWidth
                multiline
                minRows={3}
                error={!!errors.description}
                helperText={errors.description || `${form.description.length}/500 characters. Explain the wager outcome clearly.`}
                required
                inputProps={{ maxLength: 500 }}
              />

              <TextField
                label="Polymarket Market ID (Optional)"
                value={form.marketId}
                onChange={(e) => updateField('marketId', e.target.value)}
                fullWidth
                placeholder="e.g., POLY-BTC-50K"
                helperText="Link to a Polymarket market for dispute resolution."
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="If linked, Polymarket can be used to resolve disputes between participants">
                        <IconButton size="small" edge="end">
                          <HelpOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />

              <Divider />

              <Box>
                <Typography variant="h6" gutterBottom>
                  Terms & Conditions
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Set the minimum pledge amount and deadline for your wager.
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Minimum Pledge (POL) *"
                  value={form.minPledge}
                  onChange={(e) => updateField('minPledge', e.target.value)}
                  type="number"
                  fullWidth
                  error={!!errors.minPledge}
                  helperText={errors.minPledge || 'Minimum amount required to join this wager'}
                  required
                  inputProps={{ min: 0.01, step: 0.01 }}
                />
                <TextField
                  label="Wager Deadline (Hours) *"
                  value={form.deadlineHours}
                  onChange={(e) => updateField('deadlineHours', e.target.value)}
                  type="number"
                  fullWidth
                  error={!!errors.deadlineHours}
                  helperText={errors.deadlineHours || 'Hours from now until outcome deadline'}
                  required
                  inputProps={{ min: 1 }}
                />
              </Stack>

              <Box>
                <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Multi-sig signature deadline (Hours) *
                  </Typography>
                  <Tooltip title="If not all participants sign within this timeframe, the wager can go to dispute resolution via Polymarket" arrow>
                    <HelpOutlineIcon fontSize="small" sx={{ color: 'text.secondary', cursor: 'help' }} />
                  </Tooltip>
                </Stack>
                <TextField
                  fullWidth
                  value={form.multiSigDeadlineHours}
                  onChange={(e) => updateField('multiSigDeadlineHours', e.target.value)}
                  type="number"
                  error={!!errors.multiSigDeadlineHours}
                  helperText={errors.multiSigDeadlineHours || 'Time allowed for participants to sign the multi-sig after wager ends.'}
                  inputProps={{ min: 1 }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Visibility
                </Typography>
                <ToggleButtonGroup
                  value={form.visibility}
                  exclusive
                  onChange={(_, v) => v != null && updateField('visibility', v)}
                  sx={{ mt: 0.5 }}
                >
                  <ToggleButton value="public">
                    <PublicIcon sx={{ mr: 0.5, fontSize: 18 }} /> Public
                  </ToggleButton>
                  <ToggleButton value="private">
                    <LockIcon sx={{ mr: 0.5, fontSize: 18 }} /> Private
                  </ToggleButton>
                </ToggleButtonGroup>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                  Public wagers appear on the dashboard. Private wagers are only visible to you and invited participants.
                </Typography>
              </Box>

              <Box>
                <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Add Pledgys
                  </Typography>
                  <Tooltip title="Invite specific people to join your wager via email" arrow>
                    <HelpOutlineIcon fontSize="small" sx={{ color: 'text.secondary', cursor: 'help' }} />
                  </Tooltip>
                </Stack>
                <TextField
                  fullWidth
                  value={form.inviteEmails}
                  onChange={(e) => updateField('inviteEmails', e.target.value)}
                  placeholder="friend@example.com, other@example.com"
                  multiline
                  minRows={2}
                  helperText={`${form.inviteEmails.length}/500 characters. Add emails separated by commas.`}
                  inputProps={{ maxLength: 500 }}
                />
              </Box>

              <Button 
                variant="contained" 
                size="large" 
                onClick={handleSubmit} 
                fullWidth 
                sx={{ mt: 2 }}
                disabled={!isConnected || !isCorrectNetwork || isSubmitting || isContractPending || pendingTxHash != null}
                startIcon={(isSubmitting || isContractPending || pendingTxHash) ? <CircularProgress size={20} color="inherit" /> : undefined}
              >
                {pendingTxHash
                  ? 'Confirming...'
                  : isSubmitting || isContractPending
                  ? 'Creating Wager...'
                  : !isConnected 
                  ? 'Connect Wallet to Create Wager' 
                  : !isCorrectNetwork 
                  ? 'Switch to Polygon Amoy' 
                  : 'Create Wager'}
              </Button>
              {!isConnected && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Please connect your wallet to create a wager
                </Alert>
              )}
              {isConnected && !isCorrectNetwork && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Please switch to Polygon Amoy testnet to create wagers
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={2}>
          <Card elevation={2}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <InfoIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    How It Works
                  </Typography>
                </Stack>
                <Divider />
                <Typography variant="body2" color="text.secondary">
                  When you create a wager:
                </Typography>
                <Box component="ol" sx={{ pl: 2, color: 'text.secondary' }}>
                  <li>You pledge the minimum amount first</li>
                  <li>Funds lock in multi-sig escrow</li>
                  <li>Others join by pledging</li>
                  <li>Participants sign multi-sig to release funds</li>
                  <li>Disputes can go to Polymarket</li>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Alert severity="info" icon={<InfoIcon />}>
            <Typography variant="body2">
              <strong>Disputes:</strong> If participants disagree on the outcome, disputes can be submitted to Polymarket for resolution.
            </Typography>
          </Alert>

          <Card elevation={1}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                <strong>Note:</strong> This is a demo. Wallet connections and transactions are simulated for demonstration purposes.
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Stack>
  );
};
