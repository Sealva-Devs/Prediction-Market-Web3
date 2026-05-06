import { Box, Card, CardContent, Stack, Typography, Chip, Avatar, LinearProgress, Tooltip, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { formatAddress } from '../utils/format';
import { useWallet } from '../hooks/useWallet';

interface MultiSigStatusProps {
  participants: Array<{ address: string; amount: number }>;
  signatures?: string[];
  deadline?: number;
  onSign?: () => void;
  isSigning?: boolean;
}

export const MultiSigStatus = ({ 
  participants, 
  signatures = [], 
  deadline, 
  onSign,
  isSigning = false 
}: MultiSigStatusProps) => {
  const { address } = useWallet();
  const signedCount = signatures.length;
  const totalCount = participants.length;
  const signedPercent = (signedCount / Math.max(totalCount, 1)) * 100;
  
  const hasUserSigned = address && signatures.includes(address);
  const isUserParticipant = participants.some(p => p.address === address);
  const canSign = isUserParticipant && !hasUserSigned && address;

  const getTimeRemaining = () => {
    if (!deadline) return null;
    const now = Date.now();
    const remaining = deadline - now;
    if (remaining <= 0) return 'Deadline passed';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    return hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`;
  };

  const timeRemaining = getTimeRemaining();

  return (
    <Card 
      sx={{ 
        background: 'linear-gradient(145deg, rgba(26, 22, 37, 0.6) 0%, rgba(15, 13, 20, 0.8) 100%)',
        border: '1px solid rgba(240, 90, 120, 0.2)',
      }}
    >
      <CardContent>
        <Stack spacing={2.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              Multi-Sig Status
            </Typography>
            <Chip 
              label={`${signedCount} of ${totalCount} signed`}
              size="small"
              sx={{
                bgcolor: signedCount === totalCount ? 'success.main' : 'rgba(240, 90, 120, 0.15)',
                color: signedCount === totalCount ? 'success.contrastText' : 'primary.main',
                fontWeight: 600,
              }}
            />
          </Stack>

          {deadline && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {timeRemaining}
              </Typography>
            </Stack>
          )}

          <Box>
            <LinearProgress 
              variant="determinate" 
              value={signedPercent}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #FF916A 0%, #F05A78 50%, #9D5FE6 100%)',
                  borderRadius: 4,
                },
              }}
            />
          </Box>

          <Stack spacing={1.5}>
            {participants.map((participant, index) => {
              const hasSigned = signatures.includes(participant.address);
              const isCurrentUser = participant.address === address;
              
              return (
                <Stack 
                  key={participant.address}
                  direction="row" 
                  alignItems="center" 
                  spacing={1.5}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: isCurrentUser ? 'rgba(240, 90, 120, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: isCurrentUser ? '1px solid rgba(240, 90, 120, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32,
                      bgcolor: hasSigned ? 'success.main' : 'rgba(240, 90, 120, 0.2)',
                      fontSize: 14,
                    }}
                  >
                    {index + 1}
                  </Avatar>
                  
                  <Stack flex={1}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography variant="body2" fontWeight={600}>
                        {formatAddress(participant.address)}
                      </Typography>
                      {isCurrentUser && (
                        <Chip label="You" size="small" sx={{ height: 18, fontSize: 10 }} />
                      )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {participant.amount} MATIC pledged
                    </Typography>
                  </Stack>

                  <Tooltip title={hasSigned ? 'Signed' : 'Pending signature'}>
                    {hasSigned ? (
                      <CheckCircleIcon sx={{ color: 'success.main', fontSize: 24 }} />
                    ) : (
                      <PendingIcon sx={{ color: 'text.disabled', fontSize: 24 }} />
                    )}
                  </Tooltip>
                </Stack>
              );
            })}
          </Stack>

          {canSign && onSign && (
            <Button
              variant="contained"
              fullWidth
              onClick={onSign}
              disabled={isSigning}
              sx={{ mt: 1 }}
            >
              {isSigning ? 'Signing...' : '✍️ Sign Multi-Sig'}
            </Button>
          )}

          {signedCount === totalCount && (
            <Stack 
              direction="row" 
              alignItems="center" 
              spacing={1}
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
              }}
            >
              <CheckCircleIcon sx={{ color: 'success.main' }} />
              <Typography variant="body2" color="success.main" fontWeight={600}>
                All participants have signed! Funds can be released.
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
