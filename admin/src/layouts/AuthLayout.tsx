import React from 'react';
import { Box, Container, Paper } from '@mui/material';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1A202C', // Dark gray background to make the white/yellow content pop
        backgroundImage:
          'radial-gradient(circle at 10% 20%, rgba(250, 208, 44, 0.08) 0%, transparent 40%)',
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={4}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 4,
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(226, 232, 240, 0.8)',
          }}
        >
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
};
export default AuthLayout;
