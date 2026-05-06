import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShieldIcon from '@mui/icons-material/Shield';
import PeopleIcon from '@mui/icons-material/People';
import GavelIcon from '@mui/icons-material/Gavel';
import { useNavigate } from 'react-router-dom';
import { mockWagers } from '../data/mockWagers';
import { WagerCard } from '../components/WagerCard';
import { DemoBanner } from '../components/DemoBanner';
import logoUrl from '../../Pledgy_Logo.png';

export const LandingPage = () => {
  const navigate = useNavigate();
  const featured = mockWagers.slice(0, 3);

  return (
    <Stack spacing={5} sx={{ pb: 6 }}>
      <DemoBanner />

      {/* Hero: CTA-first */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 6 },
          position: 'relative',
          background: 'linear-gradient(145deg, #1a1625 0%, #0f0d14 100%)',
          border: '1px solid rgba(240, 90, 120, 0.2)',
          borderRadius: 3,
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(240, 90, 120, 0.05)',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${logoUrl})`,
            backgroundSize: '90%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: 0.07,
            zIndex: 0,
            pointerEvents: 'none',
          },
        }}
      >
        <Stack spacing={3} alignItems="center" textAlign="center" maxWidth={640} mx="auto" position="relative" zIndex={1}>
          <Typography
            variant="h1"
            fontWeight={800}
            sx={{
              fontSize: { xs: '2.25rem', sm: '3rem', md: '3.5rem' },
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #fff 0%, #FF916A 30%, #F05A78 60%, #9D5FE6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              lineHeight: 1.3,
            }}
          >
            Peer-to-peer wagers.{' '}
            <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
              Multi-sig escrow.
            </Box>
          </Typography>
          <Typography variant="h6" color="#A0AEC0" sx={{ lineHeight: 1.6, fontWeight: 400 }}>
            Create a wager with friends or peers. Funds stay in escrow until everyone signs off. Disputes can be submitted to Polymarket for resolution.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create')}
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.1rem',
              fontWeight: 700,
              borderRadius: 2,
              boxShadow: '0 6px 24px rgba(240, 90, 120, 0.4)',
              '&:hover': {
                boxShadow: '0 8px 32px rgba(240, 90, 120, 0.5)',
              },
            }}
          >
            Create Wager
          </Button>
          <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center" useFlexGap>
            <Button variant="text" size="medium" onClick={() => navigate('/dashboard')}>
              Explore Dashboard
            </Button>
            <Button variant="text" size="medium" onClick={() => navigate('/how-it-works')}>
              How it works
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* P2P value props */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {[
          {
            title: 'P2P wagers',
            icon: <PeopleIcon />,
            desc: 'Wager directly with friends or peers. No prediction market—just you, your opponent, and multi-sig escrow.',
          },
          {
            title: 'Multi-sig escrow',
            icon: <ShieldIcon />,
            desc: 'Funds are locked until participants sign off. No single party can move them.',
          },
          {
            title: 'Disputes → Polymarket',
            icon: <GavelIcon />,
            desc: 'If there’s a disagreement, submit a claim to Polymarket for resolution.',
          },
        ].map((item) => (
          <Paper
            key={item.title}
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              backgroundColor: '#1a1625',
              border: '1px solid rgba(240, 90, 120, 0.15)',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.25s ease',
              '&:hover': {
                borderColor: 'rgba(240, 90, 120, 0.35)',
                boxShadow: '0 8px 32px rgba(240, 90, 120, 0.08)',
              },
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" mb={1.5}>
              <Box sx={{ color: '#F05A78', fontSize: 28 }}>{item.icon}</Box>
              <Typography variant="h6" fontWeight={600} color="#FFFFFF">
                {item.title}
              </Typography>
            </Stack>
            <Typography variant="body2" color="#A0AEC0">
              {item.desc}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Featured wagers */}
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={700} color="#FFFFFF">
            Featured wagers
          </Typography>
          <Button variant="outlined" size="medium" onClick={() => navigate('/dashboard')}>
            See all
          </Button>
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {featured.map((w) => (
            <WagerCard key={w.id} wager={w} />
          ))}
        </Box>
      </Stack>
    </Stack>
  );
};
