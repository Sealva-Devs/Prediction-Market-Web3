import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface Stat {
  label: string;
  value: string;
  icon: React.ReactNode;
}

interface Props {
  totalVolume: string;
  activeWagers: number;
  avgTime: string;
}

export const StatCards: React.FC<Props> = ({ totalVolume, activeWagers, avgTime }) => {
  const stats: Stat[] = [
    { label: 'Total Pledged Volume', value: `${totalVolume} MATIC`, icon: <TrendingUpIcon color="secondary" /> },
    { label: 'Active Wagers', value: activeWagers.toString(), icon: <AccountBalanceWalletIcon color="primary" /> },
    { label: 'Avg Resolution Time', value: avgTime, icon: <AccessTimeIcon color="primary" /> },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 2,
        mb: 2,
      }}
    >
      {stats.map((stat) => (
        <Card 
          key={stat.label}
          sx={{ 
            height: '100%',
            backgroundColor: '#1a1625',
            border: '1px solid rgba(240, 90, 120, 0.15)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.25s ease',
            '&:hover': {
              borderColor: 'rgba(240, 90, 120, 0.35)',
              boxShadow: '0 8px 32px rgba(240, 90, 120, 0.08)',
            },
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Stack spacing={0.5}>
                <Typography variant="body2" color="#A0AEC0">
                  {stat.label}
                </Typography>
                <Typography 
                  variant="h6"
                  sx={{
                    color: '#FFFFFF',
                    fontWeight: 700,
                  }}
                >
                  {stat.value}
                </Typography>
              </Stack>
              <Box
                sx={{
                  color: '#F05A78',
                  fontSize: 32,
                  opacity: 0.85,
                }}
              >
                {stat.icon}
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};
