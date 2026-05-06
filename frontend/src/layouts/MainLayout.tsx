import { AppBar, Box, Button, Container, Stack, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Brand } from '../components/Brand';
import { Footer } from '../components/Footer';
import { WalletConnectButton } from '../components/WalletConnectButton';
import { useState } from 'react';

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isVerySmall = useMediaQuery(theme.breakpoints.down(400));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { label: 'Overview', path: '/' },
    { label: 'Create Wager', path: '/create' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Profile', path: '/profile' },
    { label: 'How It Works', path: '/how-it-works' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const NavButtons = () => (
    <>
      {navigationItems.map((item) => (
        <Button
          key={item.path}
          color="inherit"
          onClick={() => handleNavigation(item.path)}
          sx={{
            color: isActive(item.path) ? '#F05A78' : '#FFFFFF',
            fontWeight: isActive(item.path) ? 600 : 400,
            '&:hover': {
              color: '#FF916A',
              backgroundColor: 'rgba(240, 90, 120, 0.08)',
            },
          }}
        >
          {item.label}
        </Button>
      ))}
    </>
  );

  return (
    <Box 
      minHeight="100vh" 
      bgcolor="background.default" 
      display="flex" 
      flexDirection="column"
      sx={{
        backgroundColor: '#0f0d14',
      }}
    >
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(15, 13, 20, 0.95)',
          borderBottom: '1px solid rgba(240, 90, 120, 0.12)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Toolbar 
            sx={{ 
              gap: { xs: 1, sm: 2 }, 
              justifyContent: 'space-between',
              width: '100%',
              maxWidth: '1440px',
              px: { xs: 1, sm: 2, md: 3 },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, minWidth: 0, flex: 1 }}>
              <Box sx={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate('/')}>
                <Brand />
              </Box>
              {!isMobile && (
                <Stack direction="row" spacing={1.5} ml={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
                  <NavButtons />
                </Stack>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.25, sm: 1 }, flexShrink: 0 }}>
              {isMobile ? (
                <>
                  <Box sx={{ display: 'block', maxWidth: isVerySmall ? '100px' : 'auto', overflow: 'hidden' }}>
                    <WalletConnectButton />
                  </Box>
                  <IconButton
                    color="inherit"
                    edge="end"
                    onClick={() => setMobileMenuOpen(true)}
                    sx={{ 
                      ml: { xs: 0.25, sm: 1 },
                      p: { xs: 0.5, sm: 1 },
                      minWidth: { xs: 32, sm: 40 },
                    }}
                  >
                    <MenuIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
                  </IconButton>
                </>
              ) : (
                <WalletConnectButton />
              )}
            </Box>
          </Toolbar>
        </Box>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#1a1625',
            borderLeft: '1px solid rgba(240, 90, 120, 0.15)',
            width: 280,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(240, 90, 120, 0.15)' }}>
          <Typography variant="h6" color="#FFFFFF" fontWeight={600}>
            Menu
          </Typography>
          <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: '#FFFFFF' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List sx={{ pt: 2 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  color: isActive(item.path) ? '#F05A78' : '#FFFFFF',
                  fontWeight: isActive(item.path) ? 600 : 400,
                  '&:hover': {
                    backgroundColor: 'rgba(240, 90, 120, 0.08)',
                    color: '#FF916A',
                  },
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', flex: 1 }}>
        <Container 
          maxWidth={false}
          sx={{ 
            py: 4, 
            flex: 1,
            px: { xs: 2, sm: 3, md: 4, lg: 6 },
            maxWidth: '1440px',
            width: '100%',
          }}
        >
          <Outlet />
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};
