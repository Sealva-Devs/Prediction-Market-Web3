import { useState, useMemo } from 'react';
import { Stack, Typography, Box, Chip, ToggleButtonGroup, ToggleButton, TextField, InputAdornment } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import { useWagerStore } from '../store/useWagerStore';
import { useWallet } from '../hooks/useWallet';
import { WagerCard } from '../components/WagerCard';
import { EmptyState } from '../components/EmptyState';
import { DemoBanner } from '../components/DemoBanner';
import type { WagerStatus } from '../types';

export const ProfilePage = () => {
  const { wagers } = useWagerStore();
  const { address, isConnected } = useWallet();
  const [statusFilter, setStatusFilter] = useState<WagerStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const userWagers = useMemo(() => {
    if (!address) return [];
    return wagers.filter(
      (w) => w.creator === address || w.participants.some((p) => p.address === address)
    );
  }, [wagers, address]);

  const filteredWagers = useMemo(() => {
    return userWagers
      .filter((w) => statusFilter === 'ALL' || w.status === statusFilter)
      .filter((w) => 
        searchQuery === '' || 
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [userWagers, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = userWagers.length;
    const active = userWagers.filter((w) => w.status === 'ACTIVE').length;
    const resolved = userWagers.filter((w) => w.status === 'RESOLVED').length;
    const totalPledged = userWagers.reduce((sum, w) => 
      sum + (w.totalPledged / Math.max(w.participants.length, 1)), 
      0
    );
    const wins = userWagers.filter((w) => w.winner === address).length;
    
    return { total, active, resolved, totalPledged, wins };
  }, [userWagers, address]);

  if (!isConnected) {
    return (
      <Stack spacing={3}>
        <DemoBanner />
        <EmptyState
          title="Connect Your Wallet"
          description="Connect your wallet to view your wager history and track your performance."
          actionLabel="View Overview"
          actionPath="/"
        />
      </Stack>
    );
  }

  if (userWagers.length === 0) {
    return (
      <Stack spacing={3}>
        <DemoBanner />
        <Typography variant="h4" fontWeight="bold">
          My Wagers
        </Typography>
        <EmptyState
          title="No Wagers Yet"
          description="You haven't created or joined any wagers. Start by creating your first wager!"
          actionLabel="Create Wager"
          actionPath="/create"
        />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <DemoBanner />
      
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Wagers
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your wagers, view history, and manage your pledges
        </Typography>
      </Box>

      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, 
          gap: 2 
        }}
      >
        <Box 
          sx={{ 
            p: 2.5, 
            borderRadius: 2, 
            background: 'linear-gradient(145deg, rgba(26, 22, 37, 0.6) 0%, rgba(15, 13, 20, 0.8) 100%)',
            border: '1px solid rgba(240, 90, 120, 0.2)',
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Total Wagers
          </Typography>
          <Typography variant="h5" fontWeight={700} color="primary">
            {stats.total}
          </Typography>
        </Box>

        <Box 
          sx={{ 
            p: 2.5, 
            borderRadius: 2, 
            background: 'linear-gradient(145deg, rgba(26, 22, 37, 0.6) 0%, rgba(15, 13, 20, 0.8) 100%)',
            border: '1px solid rgba(240, 90, 120, 0.2)',
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Active
          </Typography>
          <Typography variant="h5" fontWeight={700} color="info.main">
            {stats.active}
          </Typography>
        </Box>

        <Box 
          sx={{ 
            p: 2.5, 
            borderRadius: 2, 
            background: 'linear-gradient(145deg, rgba(26, 22, 37, 0.6) 0%, rgba(15, 13, 20, 0.8) 100%)',
            border: '1px solid rgba(240, 90, 120, 0.2)',
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Resolved
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {stats.resolved}
          </Typography>
        </Box>

        <Box 
          sx={{ 
            p: 2.5, 
            borderRadius: 2, 
            background: 'linear-gradient(145deg, rgba(26, 22, 37, 0.6) 0%, rgba(15, 13, 20, 0.8) 100%)',
            border: '1px solid rgba(240, 90, 120, 0.2)',
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Wins
          </Typography>
          <Typography variant="h5" fontWeight={700} color="success.main">
            {stats.wins}
          </Typography>
        </Box>

        <Box 
          sx={{ 
            p: 2.5, 
            borderRadius: 2, 
            background: 'linear-gradient(145deg, rgba(26, 22, 37, 0.6) 0%, rgba(15, 13, 20, 0.8) 100%)',
            border: '1px solid rgba(240, 90, 120, 0.2)',
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Total Pledged
          </Typography>
          <Typography variant="h5" fontWeight={700} color="primary">
            {stats.totalPledged.toFixed(2)} MATIC
          </Typography>
        </Box>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
        <TextField
          placeholder="Search wagers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" spacing={1} alignItems="center">
          <FilterListIcon sx={{ color: 'text.secondary' }} />
          <ToggleButtonGroup
            value={statusFilter}
            exclusive
            onChange={(_, value) => value != null && setStatusFilter(value)}
            size="small"
          >
            <ToggleButton value="ALL">
              All
            </ToggleButton>
            <ToggleButton value="ACTIVE">
              Active
            </ToggleButton>
            <ToggleButton value="PENDING">
              Pending
            </ToggleButton>
            <ToggleButton value="RESOLVED">
              Resolved
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      {filteredWagers.length === 0 && searchQuery ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Matching Wagers
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            No wagers found matching "{searchQuery}"
          </Typography>
          <Chip 
            label="Clear Search" 
            onClick={() => setSearchQuery('')} 
            clickable
            color="primary"
          />
        </Box>
      ) : filteredWagers.length === 0 && statusFilter !== 'ALL' ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No {statusFilter.toLowerCase()} wagers
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Try selecting a different filter
          </Typography>
          <Chip 
            label="View All" 
            onClick={() => setStatusFilter('ALL')} 
            clickable
            color="primary"
          />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
          {filteredWagers.map((wager) => {
            const isCreator = wager.creator === address;
            
            return (
              <Box key={wager.id} sx={{ position: 'relative' }}>
                {isCreator && (
                  <Chip 
                    label="Creator" 
                    size="small" 
                    sx={{ 
                      position: 'absolute', 
                      top: 16, 
                      right: 16, 
                      zIndex: 1,
                      bgcolor: 'rgba(240, 90, 120, 0.2)',
                      color: 'primary.main',
                      fontWeight: 600,
                    }} 
                  />
                )}
                <WagerCard wager={wager} />
              </Box>
            );
          })}
        </Box>
      )}
    </Stack>
  );
};
