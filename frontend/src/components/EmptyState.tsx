import { Box, Button, Stack, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionPath?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  actionPath,
  icon = <InboxIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />,
}) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <Stack spacing={2} alignItems="center">
        {icon}
        <Typography variant="h6" fontWeight="bold" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={400}>
          {description}
        </Typography>
        {actionLabel && actionPath && (
          <Button variant="contained" onClick={() => navigate(actionPath)} sx={{ mt: 2 }}>
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Box>
  );
};
