import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: '70vh',
        p: 3,
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '6rem', sm: '9rem' },
          fontWeight: 900,
          color: '#2D3748',
          lineHeight: 1,
          mb: 2,
          fontFamily: '"Outfit", sans-serif',
        }}
      >
        404
      </Typography>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: '#1A202C',
          mb: 1.5,
          fontFamily: '"Outfit", sans-serif',
        }}
      >
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450, mb: 4 }}>
        The administrative panel page you are seeking does not exist or has been relocated to another workspace coordinate.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<HomeIcon />}
        onClick={() => navigate('/')}
        sx={{ px: 4, py: 1.5, fontSize: '1rem', fontWeight: 600 }}
      >
        Return to Dashboard
      </Button>
    </Box>
  );
};
export default NotFound;
