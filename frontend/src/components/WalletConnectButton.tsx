import { Button, Menu, MenuItem, Chip, Box, Stack, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { useWallet } from '../hooks/useWallet';
import { formatAddress } from '../utils/format';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { polygonAmoy } from 'wagmi/chains';

export const WalletConnectButton = () => {
  const {
    address,
    isConnected,
    isCorrectNetwork,
    balance,
    connectMetaMask,
    connectWalletConnect,
    disconnect,
    connectors,
    isConnecting,
    switchToAmoy,
    isSwitchingChain,
    connectError,
    reset,
  } = useWallet();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [connectingConnector, setConnectingConnector] = useState<string | null>(null);
  const connectionInProgressRef = useRef(false);
  const wcOriginReminderLogged = useRef(false);
  const open = Boolean(anchorEl);

  // One-time reminder on production: add Vercel URL to WalletConnect Cloud Allowed Origins
  useEffect(() => {
    if (wcOriginReminderLogged.current || typeof window === 'undefined') return;
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return;
    const hasWalletConnect = connectors.some((c) => c.id === 'walletConnect');
    if (!hasWalletConnect) return;
    wcOriginReminderLogged.current = true;
    console.info(
      '[Pledgy] Running on production. If WalletConnect (mobile) connections fail, add this URL to WalletConnect Cloud → Allowed Origins:',
      window.location.origin
    );
  }, [connectors]);

  const isMetaMaskInstalled = typeof window !== 'undefined' && 
    typeof (window as any).ethereum !== 'undefined' &&
    ((window as any).ethereum.isMetaMask === true || (window as any).ethereum.providers?.some((p: any) => p.isMetaMask));
  
  // MetaMask connector ID varies, so check a few options
  const metaMaskConnector = connectors.find(
    (c) =>
      c.id === 'metaMask' ||
      c.id === 'io.metamask' ||
      c.name === 'MetaMask' ||
      c.name?.toLowerCase().includes('metamask')
  );

  // Log connectors if MetaMask not found (for debugging)
  if (connectors.length > 0 && !metaMaskConnector) {
    console.log('Available connectors:', connectors.map((c) => ({ id: c.id, name: c.name, type: c.type })));
  }

  // Auto-switch to Polygon Amoy after connection if on wrong network (e.g. Mumbai)
  useEffect(() => {
    if (isConnected && !isCorrectNetwork && switchToAmoy && !isSwitchingChain && address) {
      const timer = setTimeout(async () => {
        try {
          await switchToAmoy();
        } catch (error: any) {
          console.error('Auto-switch network error:', error);
          if (error?.code !== 4001 && !error?.message?.includes('rejected')) {
            // Could show toast here if needed
          }
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isCorrectNetwork, switchToAmoy, isSwitchingChain, address]);

  // Close dialog when successfully connected and reset connection state
  useEffect(() => {
    if (isConnected && showConnectDialog) {
      // Brief delay to let connection finish
      const timer = setTimeout(() => {
        setConnectingConnector(null);
        setShowConnectDialog(false);
        connectionInProgressRef.current = false;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, showConnectDialog]);

  // Reset connecting state if connection fails
  useEffect(() => {
    if (connectError && connectingConnector) {
      // Reset after a delay to allow error message to be displayed
      const timer = setTimeout(() => {
        setConnectingConnector(null);
        connectionInProgressRef.current = false;
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [connectError, connectingConnector]);

  // Reset connection in progress flag when connection succeeds
  useEffect(() => {
    if (isConnected) {
      connectionInProgressRef.current = false;
    }
  }, [isConnected]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isConnected) {
      setAnchorEl(event.currentTarget);
    } else {
      // Reset any stale state from a previous WalletConnect modal close or abandoned attempt
      connectionInProgressRef.current = false;
      setConnectingConnector(null);
      reset?.();
      setShowConnectDialog(true);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDisconnect = () => {
    disconnect();
    handleClose();
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToAmoy();
      handleClose();
    } catch (error) {
      console.error('Network switch error:', error);
    }
  };

  if (isConnected) {
    return (
      <>
        <Button
          variant="contained"
          color={isCorrectNetwork ? 'secondary' : 'warning'}
          onClick={handleClick}
          startIcon={isCorrectNetwork ? <CheckCircleIcon /> : <WarningIcon />}
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            padding: { xs: '6px 12px', sm: '8px 16px' },
            minWidth: { xs: 'auto', sm: '64px' },
            '& .MuiButton-startIcon': {
              marginRight: { xs: 0.5, sm: 1 },
            },
          }}
        >
          <Box
            component="span"
            sx={{
              display: { xs: 'none', sm: 'inline' },
            }}
          >
            {formatAddress(address || '')}
          </Box>
          <Box
            component="span"
            sx={{
              display: { xs: 'inline', sm: 'none' },
            }}
          >
            {address ? `${address.slice(0, 4)}...${address.slice(-2)}` : ''}
          </Box>
          {!isCorrectNetwork && (
            <Chip
              label="Wrong Network"
              size="small"
              color="error"
              sx={{ 
                ml: { xs: 0.5, sm: 1 }, 
                height: { xs: 18, sm: 20 },
                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                display: { xs: 'none', sm: 'flex' },
              }}
            />
          )}
        </Button>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem disabled>
            <Stack spacing={0.5}>
              <Typography variant="body2" fontWeight="bold">
                {formatAddress(address || '')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Balance: {balance} MATIC
              </Typography>
            </Stack>
          </MenuItem>
          {!isCorrectNetwork && (
            <MenuItem onClick={handleSwitchNetwork} disabled={isSwitchingChain}>
              <Typography variant="body2">
                {isSwitchingChain ? 'Switching...' : `Switch to ${polygonAmoy.name}`}
              </Typography>
            </MenuItem>
          )}
          <MenuItem onClick={handleDisconnect}>
            <Typography variant="body2" color="error">
              Disconnect
            </Typography>
          </MenuItem>
        </Menu>
      </>
    );
  }

  return (
    <>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleClick} 
        startIcon={<AccountBalanceWalletIcon />}
        sx={{
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          padding: { xs: '6px 12px', sm: '8px 16px' },
          minWidth: { xs: 'auto', sm: '64px' },
          '& .MuiButton-startIcon': {
            marginRight: { xs: 0.5, sm: 1 },
            '& > *:nth-of-type(1)': {
              fontSize: { xs: '1rem', sm: '1.25rem' },
            },
          },
        }}
      >
        <Box
          component="span"
          sx={{
            display: { xs: 'none', sm: 'inline' },
          }}
        >
          Connect Wallet
        </Box>
        <Box
          component="span"
          sx={{
            display: { xs: 'inline', sm: 'none' },
          }}
        >
          Connect
        </Box>
      </Button>
      <Dialog 
        open={showConnectDialog} 
        onClose={() => {
          // Only allow closing if not currently connecting
          if (!connectionInProgressRef.current && !isConnecting) {
            setShowConnectDialog(false);
            setConnectingConnector(null);
            connectionInProgressRef.current = false;
          }
        }} 
        maxWidth="sm" 
        fullWidth
        sx={{
          // Keep z-index below WalletConnect modal
          zIndex: 1300,
          '& .MuiBackdrop-root': {
            zIndex: 1300,
          },
        }}
        PaperProps={{
          sx: {
            zIndex: 1300,
          },
        }}
      >
        <DialogTitle>Connect Wallet</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Always show MetaMask option if connector exists */}
            {metaMaskConnector ? (
              <>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={async () => {
                    // Prevent multiple simultaneous connection attempts
                    if (connectionInProgressRef.current || isConnecting) {
                      console.warn('Connection already in progress, ignoring duplicate request');
                      return;
                    }

                    try {
                      connectionInProgressRef.current = true;
                      setConnectingConnector('metaMask');
                      await connectMetaMask();
                      // Connection successful - dialog will close via useEffect
                    } catch (error: any) {
                      console.error('MetaMask connection error:', error);
                      setConnectingConnector(null);
                      connectionInProgressRef.current = false;
                      reset?.();
                    }
                  }}
                  disabled={connectionInProgressRef.current || connectingConnector === 'metaMask' || isConnecting}
                  startIcon={<AccountBalanceWalletIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #f6851b 0%, #e2761b 100%)',
                    color: '#ffffff',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #e2761b 0%, #d1650f 100%)',
                    },
                    '&:disabled': {
                      opacity: 0.6,
                    },
                  }}
                >
                  {connectingConnector === 'metaMask' || (isConnecting && connectingConnector === 'metaMask') ? 'Connecting...' : 'MetaMask (Browser Extension)'}
                </Button>
                {connectError && connectingConnector === 'metaMask' && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      <strong>Connection failed:</strong> {connectError}
                      <br />
                      <Typography variant="caption" component="span">
                        Make sure MetaMask is unlocked and try again. If the issue persists, refresh the page.
                      </Typography>
                    </Typography>
                  </Alert>
                )}
                {!isMetaMaskInstalled && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      <strong>MetaMask not detected.</strong> Install MetaMask extension:{' '}
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'inherit', textDecoration: 'underline' }}
                      >
                        Download MetaMask
                      </a>
                    </Typography>
                  </Alert>
                )}
              </>
            ) : (
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>MetaMask connector not available.</strong>
                  <br />
                  Please install MetaMask:{' '}
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'underline' }}
                  >
                    Download MetaMask
                  </a>
                  {' '}then refresh this page.
                </Typography>
              </Alert>
            )}

            {/* WalletConnect option - always show if connector exists */}
            {connectors.find((c) => c.id === 'walletConnect') ? (
              <>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={async () => {
                    // Prevent multiple simultaneous connection attempts
                    if (connectionInProgressRef.current || isConnecting) {
                      console.warn('Connection already in progress, ignoring duplicate request');
                      return;
                    }

                    try {
                      connectionInProgressRef.current = true;
                      setConnectingConnector('walletConnect');
                      // Close our dialog immediately since WalletConnect has its own QR modal
                      // This prevents modal stacking issues
                      setShowConnectDialog(false);
                      // Quick delay so our dialog closes before WalletConnect opens
                      await new Promise(resolve => setTimeout(resolve, 150));
                      await connectWalletConnect();
                      // Connection successful - state will be reset when connection completes
                      // If connection fails, the error will be caught below
                    } catch (error: any) {
                      console.error('WalletConnect connection error:', error);
                      setConnectingConnector(null);
                      connectionInProgressRef.current = false;
                      reset?.();
                      // Re-open our dialog on error so user can see the error message
                      // Only if the error is not a user rejection (which is normal)
                      if (error?.code !== 4001 && !error?.message?.includes('rejected')) {
                        setShowConnectDialog(true);
                      }
                    }
                  }}
                  disabled={connectionInProgressRef.current || connectingConnector === 'walletConnect' || isConnecting}
                  startIcon={<AccountBalanceWalletIcon />}
                  sx={{
                    '&:disabled': {
                      opacity: 0.6,
                    },
                  }}
                >
                  {connectingConnector === 'walletConnect' || (isConnecting && connectingConnector === 'walletConnect') ? 'Connecting...' : 'WalletConnect (Mobile)'}
                </Button>
                {connectError && connectingConnector === 'walletConnect' && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      <strong>WalletConnect failed:</strong> {connectError}
                      <br />
                      <Typography variant="caption" component="span">
                        Make sure your mobile wallet app is open and try again. If the issue persists, check your network connection.
                      </Typography>
                    </Typography>
                  </Alert>
                )}
              </>
            ) : (
              <Alert severity="info">
                <Typography variant="body2">
                  WalletConnect is not available. Please use MetaMask or install a compatible wallet extension.
                </Typography>
              </Alert>
            )}

            <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
              Please ensure you're connected to Polygon Amoy testnet
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              // Only allow canceling if not currently connecting
              if (!connectionInProgressRef.current && !isConnecting) {
                setShowConnectDialog(false);
                setConnectingConnector(null);
                connectionInProgressRef.current = false;
              }
            }}
            disabled={connectionInProgressRef.current || isConnecting}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
