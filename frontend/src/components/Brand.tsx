import { Box } from '@mui/material';
import logoUrl from '../../Pledgy_Logo.png';

type BrandProps = {
  compact?: boolean;
};

export const Brand: React.FC<BrandProps> = ({ compact = false }) => {
  const height = compact ? 56 : 72;
  return (
    <Box
      component="img"
      src={logoUrl}
      alt="Pledgy"
      sx={{
        height: { xs: compact ? 40 : 48, sm: compact ? 48 : 56, md: height },
        width: 'auto',
        display: 'block',
        transition: 'opacity 0.3s ease, transform 0.2s ease',
        '&:hover': { opacity: 0.9, transform: 'scale(1.02)' },
      }}
    />
  );
};
