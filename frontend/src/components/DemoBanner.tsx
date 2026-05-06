import { Alert, Box, Chip } from '@mui/material';
import { Info } from '@mui/icons-material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { isContractConfigured } from '../config/contracts';

export const DemoBanner = () => {
  const isLive = isContractConfigured;

  return (
    <Alert
      icon={isLive ? <CheckCircleOutlineIcon /> : <Info />}
      severity={isLive ? 'success' : 'info'}
      sx={{
        mb: 3,
        borderRadius: 2,
        bgcolor: isLive ? 'rgba(76, 175, 80, 0.12)' : '#1a1625',
        border: isLive ? '1px solid rgba(76, 175, 80, 0.35)' : '1px solid rgba(240, 90, 120, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        '& .MuiAlert-icon': {
          color: isLive ? '#4CAF50' : '#F05A78',
        },
        color: '#FFFFFF',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1 }}>
          {isLive ? (
            <>
              <strong>Live:</strong> Connected to your deployed WagerContract on Polygon Amoy. Transactions are on-chain and real.
              <Chip label="Contract connected" size="small" color="success" sx={{ ml: 1 }} />
            </>
          ) : (
            <>
              <strong>Demo Mode:</strong> No contract address set. Set <code>VITE_WAGER_CONTRACT_ADDRESS</code> in .env (local) or in Vercel → Project → Settings → Environment Variables, then redeploy.
            </>
          )}
        </Box>
      </Box>
    </Alert>
  );
};
