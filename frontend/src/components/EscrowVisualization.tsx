import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { formatAmount } from '../utils/format';

interface EscrowVisualizationProps {
  totalPledged: number;
  isResolved: boolean;
  winner?: string;
}

export const EscrowVisualization: React.FC<EscrowVisualizationProps> = ({ totalPledged, isResolved, winner }) => {
  return (
    <Card
      sx={{
        backgroundColor: '#1a1625',
        border: '1px solid rgba(240, 90, 120, 0.15)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#F05A78' }} />
            <Typography variant="h6" fontWeight="bold" color="#FFFFFF">
              Escrow Status
            </Typography>
          </Stack>

          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: '#0f0d14',
              border: `1px solid ${isResolved ? 'rgba(72, 187, 120, 0.3)' : 'rgba(240, 90, 120, 0.2)'}`,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
              position: 'relative',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              {isResolved ? (
                <LockOpenIcon sx={{ fontSize: 40, color: '#48BB78' }} />
              ) : (
                <LockIcon sx={{ fontSize: 40, color: '#F05A78' }} />
              )}
              <Box flex={1}>
                <Typography variant="body2" color="#A0AEC0" gutterBottom>
                  Escrow Status
                </Typography>
                <Typography variant="h5" fontWeight="bold" color={isResolved ? '#48BB78' : '#F05A78'}>
                  {isResolved ? 'Released' : 'Locked'}
                </Typography>
              </Box>
            </Stack>

            <Typography variant="h4" fontWeight="bold" gutterBottom color="#FFFFFF">
              {formatAmount(totalPledged)} MATIC
            </Typography>
            <Typography variant="body2" color="#A0AEC0">
              {isResolved
                ? winner
                  ? `Funds released to winner: ${winner.slice(0, 8)}...`
                  : 'Funds have been released from escrow'
                : 'All pledged funds held securely in multi-sig escrow'}
            </Typography>
          </Box>

          <Box sx={{ pt: 1 }}>
            <Typography variant="caption" color="#A0AEC0">
              <strong>How it works:</strong> When you pledge, your funds are locked in a multi-signature escrow wallet. The escrow requires multiple approvals to release funds, ensuring security. Once the wager is resolved and validated by governance, funds are automatically released to the winner.
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
