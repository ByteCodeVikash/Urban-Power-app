import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoaderProps {
  message?: string;
  minHeight?: string | number;
}

export const Loader: React.FC<LoaderProps> = ({
  message = 'Loading workspace data...',
  minHeight = '50vh',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        width: '100%',
        gap: 2,
      }}
    >
      <CircularProgress size={44} thickness={4} sx={{ color: '#FAD02C' }} />
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontWeight: 500 }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default Loader;
