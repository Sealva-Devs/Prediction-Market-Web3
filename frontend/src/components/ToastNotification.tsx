import { Snackbar, Alert, AlertColor, Link } from '@mui/material';
import { create } from 'zustand';

export interface ToastAction {
  url: string;
  label: string;
}

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
  action?: ToastAction;
  showToast: (message: string, severity?: AlertColor, action?: ToastAction) => void;
  hideToast: () => void;
}

export const useToast = create<ToastState>((set) => ({
  open: false,
  message: '',
  severity: 'info',
  action: undefined,
  showToast: (message, severity = 'info', action) => set({ open: true, message, severity, action }),
  hideToast: () => set({ open: false, action: undefined }),
}));

export const ToastNotification = () => {
  const { open, message, severity, action, hideToast } = useToast();

  return (
    <Snackbar
      open={open}
      autoHideDuration={action ? 8000 : 5000}
      onClose={hideToast}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={hideToast}
        severity={severity}
        variant="filled"
        sx={{
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          '& a': { color: 'inherit', fontWeight: 600, textDecoration: 'underline' },
        }}
      >
        <span>{message}</span>
        {action && (
          <>
            {' '}
            <Link href={action.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              {action.label}
            </Link>
          </>
        )}
      </Alert>
    </Snackbar>
  );
};
