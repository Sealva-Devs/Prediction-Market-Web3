import {
  Box,
  Card,
  CardContent,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PeopleIcon from '@mui/icons-material/People';
import GavelIcon from '@mui/icons-material/Gavel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SecurityIcon from '@mui/icons-material/Security';
import { DemoBanner } from '../components/DemoBanner';

const steps = [
  {
    label: 'Create Wager',
    description: 'Create a wager with outcome, minimum pledge, deadline, and multi-sig signature deadline. Funds go into multi-sig escrow.',
    icon: <AccountBalanceWalletIcon />,
    details: 'The creator pledges their amount and funds move into a secure multi-signature escrow wallet. You can invite Pledgys by email.',
  },
  {
    label: 'Participants Pledge',
    description: 'Others join by pledging. All funds stay in the same escrow. No one can withdraw until the wager is resolved.',
    icon: <PeopleIcon />,
    details: 'Each participant\'s funds are locked in escrow. Release requires multi-sig sign-off from participants.',
  },
  {
    label: 'Outcome & Sign-Off',
    description: 'For P2P wagers (e.g. who wins a game), the outcome is agreed by participants—not by a smart contract. Peers sign the multi-sig to release funds.',
    icon: <GavelIcon />,
    details: 'If you linked a Polymarket market, it can inform resolution. Otherwise, participants agree on the winner and sign off.',
  },
  {
    label: 'Multi-Sig Release',
    description: 'Participants who pledged sign the multi-sig to release funds. There is a signature deadline; if not everyone signs in time, the wager can go to dispute.',
    icon: <SecurityIcon />,
    details: 'No single party controls the escrow. Disputes (e.g. someone won\'t sign) can be submitted to Polymarket for resolution.',
  },
  {
    label: 'Payout',
    description: 'Once the multi-sig is complete, funds are released to the winner. If there\'s a dispute, Polymarket can be used to resolve it.',
    icon: <EmojiEventsIcon />,
    details: 'The winner receives the full escrow. Disputes go to Polymarket—smart contracts cannot decide real-world outcomes like who won a game.',
  },
];

export const HowItWorksPage = () => {
  return (
    <Stack spacing={4}>
      <DemoBanner />
      
      <Box>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          How Pledgy Works
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Peer-to-peer wagering with multi-sig escrow and Polymarket-backed governance
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          backgroundColor: '#1a1625',
          border: '1px solid rgba(240, 90, 120, 0.15)',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 4,
            alignItems: 'center',
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <LockIcon sx={{ fontSize: 40, color: '#F05A78' }} />
              <Typography variant="h5" fontWeight="bold">
                Secure Multi-Sig Escrow
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary">
              All funds are held in a multi-signature escrow wallet that requires multiple approvals to release funds. This ensures:
            </Typography>
            <Box component="ul" sx={{ pl: 3, color: 'text.secondary' }}>
              <li>Funds cannot be stolen or withdrawn prematurely</li>
              <li>No single party controls the escrow</li>
              <li>Complete transparency through on-chain records</li>
              <li>Automatic release only upon validated resolution</li>
            </Box>
          </Stack>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Escrow Mechanism
              </Typography>
              <Stack spacing={2} mt={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LockIcon sx={{ color: 'white' }} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={600}>
                      Funds Locked
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      All pledged amounts held securely
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <EmojiEventsIcon sx={{ color: 'white' }} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={600}>
                      Automatic Release
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Winner receives funds automatically
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Paper>

      <Box>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          The Complete Flow
        </Typography>
        <Stepper orientation="vertical" sx={{ mt: 3 }}>
          {steps.map((step) => (
            <Step key={step.label} active={true} completed={false}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    {step.icon}
                  </Box>
                )}
              >
                <Typography variant="h6" fontWeight={600}>
                  {step.label}
                </Typography>
              </StepLabel>
              <StepContent>
                <Card elevation={2} sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="body1" paragraph>
                      {step.description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Details:</strong> {step.details}
                    </Typography>
                  </CardContent>
                </Card>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          backgroundColor: '#1a1625',
          border: '1px solid rgba(240, 90, 120, 0.15)',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <GavelIcon sx={{ fontSize: 40, color: '#F05A78' }} />
            <Typography variant="h5" fontWeight="bold">
              Polymarket & Dispute Resolution
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary" paragraph>
            P2P wagers are resolved by participants agreeing and signing the multi-sig. Smart contracts cannot decide real-world outcomes (e.g. who won a game). If there&apos;s a dispute, you can submit a claim to Polymarket:
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 2,
              mt: 1,
            }}
          >
            <Box sx={{ p: 2, bgcolor: 'rgba(240, 90, 120, 0.06)', borderRadius: 2, border: '1px solid rgba(240, 90, 120, 0.1)' }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                📋 P2P Agreement
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Participants agree on the outcome and sign the multi-sig to release funds.
              </Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'rgba(240, 90, 120, 0.06)', borderRadius: 2, border: '1px solid rgba(240, 90, 120, 0.1)' }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                ⏱ Signature Deadline
              </Typography>
              <Typography variant="caption" color="text.secondary">
                A deadline applies for everyone to sign. If not all sign in time, the wager can go to dispute.
              </Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'rgba(240, 90, 120, 0.06)', borderRadius: 2, border: '1px solid rgba(240, 90, 120, 0.1)' }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                🏛 Disputes → Polymarket
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Disputes can be submitted to Polymarket for resolution when participants don&apos;t agree or won&apos;t sign.
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>

      <Card elevation={0} sx={{ backgroundColor: '#1a1625', border: '1px solid rgba(240, 90, 120, 0.15)', borderRadius: 2 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight="bold">
              Key Benefits
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              {[
                { title: 'Secure', desc: 'Multi-sig escrow prevents fund theft' },
                { title: 'P2P', desc: 'Wager directly with peers; no prediction market required' },
                { title: 'Clear rules', desc: 'Signature deadline; disputes go to Polymarket' },
                { title: 'Transparent', desc: 'All transactions on-chain and verifiable' },
                { title: 'Dispute path', desc: 'Polymarket available when participants disagree' },
                { title: 'Simple', desc: 'Create a wager in under a minute' },
              ].map((benefit) => (
                <Box key={benefit.title} sx={{ p: 2, bgcolor: 'rgba(240, 90, 120, 0.04)', borderRadius: 1, border: '1px solid rgba(240, 90, 120, 0.08)' }}>
                  <Typography variant="body2" fontWeight={600}>
                    {benefit.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {benefit.desc}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};
