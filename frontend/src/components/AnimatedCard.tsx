import { Card, CardProps } from '@mui/material';
import { keyframes } from '@mui/system';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

interface AnimatedCardProps extends CardProps {
  delay?: number;
}

export const AnimatedCard = ({ delay = 0, sx, ...props }: AnimatedCardProps) => {
  return (
    <Card
      {...props}
      sx={{
        animation: `${fadeInUp} 0.6s ease-out ${delay}s both`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 48px rgba(240, 90, 120, 0.25)',
        },
        ...sx,
      }}
    />
  );
};
