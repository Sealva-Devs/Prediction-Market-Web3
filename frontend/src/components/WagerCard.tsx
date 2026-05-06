import { Card, CardContent, CardHeader, Chip, Stack, Typography, LinearProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Wager } from '../types';
import { formatAmount, formatDate, timeRemaining } from '../utils/format';

interface Props {
  wager: Wager;
}

const statusColor: Record<Wager['status'], 'default' | 'primary' | 'warning' | 'success' | 'error'> = {
  CREATED: 'default',
  PENDING: 'warning',
  ACTIVE: 'primary',
  RESOLVED: 'success',
  CANCELLED: 'error',
};

export const WagerCard: React.FC<Props> = ({ wager }) => {
  const navigate = useNavigate();
  const pledgedPercent = Math.min((wager.totalPledged / Math.max(wager.minPledge, 0.0001)) * 100, 100);

  return (
    <Card
      onClick={() => navigate(`/wagers/${wager.id}`)}
      sx={{
        cursor: 'pointer',
        backgroundColor: '#1a1625',
        border: '1px solid rgba(240, 90, 120, 0.15)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.25s ease',
        '&:hover': {
          borderColor: 'rgba(240, 90, 120, 0.4)',
          boxShadow: '0 8px 32px rgba(240, 90, 120, 0.1)',
        },
      }}
    >
      <CardHeader
        title={
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={600} color="#FFFFFF">
              {wager.title}
            </Typography>
            <Chip 
              label={wager.status} 
              size="small" 
              sx={{
                backgroundColor: statusColor[wager.status] === 'primary' ? '#F05A78' :
                                 statusColor[wager.status] === 'success' ? '#48BB78' :
                                 statusColor[wager.status] === 'warning' ? '#ED8936' :
                                 statusColor[wager.status] === 'error' ? '#E53E3E' : '#4A5568',
                color: '#FFFFFF',
                fontWeight: 500,
                fontSize: '0.75rem',
              }}
            />
          </Stack>
        }
        subheader={
          wager.marketId ? (
            <Typography variant="caption" color="#A0AEC0" sx={{ mt: 0.5, display: 'block' }}>
              Market: {wager.marketId}
            </Typography>
          ) : undefined
        }
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="body2" color="#A0AEC0" mb={2} sx={{ minHeight: 40 }}>
          {wager.description}
        </Typography>
        <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
          <Typography variant="body2" color="#A0AEC0">
            Min: {formatAmount(wager.minPledge)} POL
          </Typography>
          <Typography variant="body2" color="#A0AEC0">
            Total: {formatAmount(wager.totalPledged)} POL
          </Typography>
          <Typography variant="body2" color="#A0AEC0">
            {wager.participants.length} participants
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center" mb={1}>
          <Box flex={1}>
            <LinearProgress 
              variant="determinate" 
              value={pledgedPercent} 
              sx={{ 
                height: 6, 
                borderRadius: 3,
                backgroundColor: 'rgba(240, 90, 120, 0.15)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #FF916A 0%, #F05A78 50%, #9D5FE6 100%)',
                  borderRadius: 3,
                },
              }} 
            />
          </Box>
          <Typography variant="caption" color="#A0AEC0" fontWeight={500}>
            {timeRemaining(wager.deadline)}
          </Typography>
        </Stack>
        <Typography variant="caption" color="#718096">
          Created {formatDate(wager.createdAt)}
        </Typography>
      </CardContent>
    </Card>
  );
};
