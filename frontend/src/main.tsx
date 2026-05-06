import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import App from './App';
import './index.css';
import { theme } from './theme/theme';
import { WagmiProvider } from './providers/WagmiProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastNotification } from './components/ToastNotification';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <ErrorBoundary>
      <WagmiProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
          <ToastNotification />
        </ThemeProvider>
      </WagmiProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
