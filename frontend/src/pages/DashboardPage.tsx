import { Box, Stack, Typography, ToggleButton, ToggleButtonGroup, TextField, InputAdornment, CircularProgress, IconButton, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useMemo, useState } from 'react';
import { WagerCard } from '../components/WagerCard';
import { useWagerStore } from '../store/useWagerStore';
import { useWagerContract } from '../hooks/useWagerContract';
import { isContractConfigured } from '../config/contracts';
import { StatCards } from '../components/StatCards';
import { DemoBanner } from '../components/DemoBanner';
import { EmptyState } from '../components/EmptyState';

export const DashboardPage = () => {
  const storeWagers = useWagerStore((s) => s.wagers);
  const { wagers: contractWagers, isConfigured, isLoading: isContractLoading, refetchAll } = useWagerContract();
  const wagers = isContractConfigured && isConfigured ? contractWagers : storeWagers;
  const [status, setStatus] = useState<string | null>('ALL');
  const [query, setQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = async () => {
    if (!isContractConfigured || !refetchAll) return;
    setIsRefreshing(true);
    await refetchAll();
    setIsRefreshing(false);
  };

  const publicWagers = useMemo(() => wagers.filter((w) => w.isPublic !== false), [wagers]);
  const filtered = useMemo(() => {
    return publicWagers.filter((w) => {
      const matchStatus = status === 'ALL' || w.status === status;
      const matchQuery = w.title.toLowerCase().includes(query.toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [publicWagers, status, query]);

  const totalVolume = publicWagers.reduce((sum, w) => sum + w.totalPledged, 0).toFixed(2);
  const active = publicWagers.filter((w) => w.status === 'ACTIVE').length;

  return (
    <Stack spacing={3}>
      <DemoBanner />
      <Typography variant="h4" fontWeight="bold">
        Dashboard
      </Typography>
      <StatCards totalVolume={totalVolume} activeWagers={active} avgTime="~12h" />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} flexWrap="wrap">
        <ToggleButtonGroup
          exclusive
          value={status}
          onChange={(_, val) => setStatus(val)}
          size="small"
          color="primary"
        >
          {['ALL', 'ACTIVE', 'PENDING', 'RESOLVED'].map((s) => (
            <ToggleButton key={s} value={s}>
              {s}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <TextField
          placeholder="Search wagers"
          size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 320 }}
        />
        {isContractConfigured && isConfigured && (
          <Tooltip title="Refresh wagers from contract">
            <span>
              <IconButton
                onClick={handleRefresh}
                disabled={isContractLoading || isRefreshing}
                aria-label="Refresh wagers"
                sx={{ color: 'text.secondary' }}
              >
                <RefreshIcon sx={{ transform: isRefreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.5s' }} />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Stack>

      {isContractConfigured && isConfigured && isContractLoading ? (
        <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
          <CircularProgress />
          <Typography color="text.secondary">Loading wagers from contract…</Typography>
        </Stack>
      ) : filtered.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2,
          }}
        >
          {filtered.map((w) => (
            <WagerCard key={w.id} wager={w} />
          ))}
        </Box>
      ) : (
        <EmptyState
          title="No wagers found"
          description={
            query
              ? `No wagers match "${query}". Try adjusting your search or filters.`
              : status && status !== 'ALL'
              ? `No wagers with status "${status}". Try selecting a different status.`
              : 'No wagers available. Be the first to create one!'
          }
          actionLabel={!query && status === 'ALL' ? 'Create Your First Wager' : undefined}
          actionPath={!query && status === 'ALL' ? '/create' : undefined}
        />
      )}
    </Stack>
  );
};
