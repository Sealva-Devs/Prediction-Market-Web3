import { Box, Container, Link, Stack, Typography } from '@mui/material';
import { Brand } from './Brand';

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        py: 4,
        borderTop: '1px solid rgba(240, 90, 120, 0.12)',
        bgcolor: '#1a1625',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Container 
          maxWidth={false}
          sx={{ 
            maxWidth: '1440px',
            width: '100%',
            px: { xs: 2, sm: 3, md: 4, lg: 6 },
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="space-between" alignItems="center">
            <Brand compact />
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Pledgy — Peer-to-peer wagering with multi-sig escrow and Polymarket governance
            </Typography>
            <Stack direction="row" spacing={2}>
              <Link href="#" color="text.secondary" underline="hover" variant="body2">
                Demo
              </Link>
              <Link href="#" color="text.secondary" underline="hover" variant="body2">
                Docs
              </Link>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};
