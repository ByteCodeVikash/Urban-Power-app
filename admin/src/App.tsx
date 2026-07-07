import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider } from '@tanstack/react-query';
import { Box, CircularProgress } from '@mui/material';
import { queryClient } from './api/queryClient';
import { theme } from './theme';
import { AppRoutes } from './routes/AppRoutes';
import { useAuthStore } from './store/authStore';
import { apiClient } from './api/apiClient';

function App() {
  const token = useAuthStore(state => state.token);
  const isInitializing = useAuthStore(state => state.isInitializing);
  const setInitializing = useAuthStore(state => state.setInitializing);
  const setUser = useAuthStore(state => state.setUser);
  const logout = useAuthStore(state => state.logout);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) {
        setInitializing(false);
        return;
      }

      try {
        // Fetch current active user profile to verify token validity on startup
        const response = await apiClient.get('/api/v1/users/me');
        setUser({
          id: response.data.id,
          role: response.data.role,
          phone: response.data.phone,
          name: response.data.full_name || 'Admin User',
          email: response.data.email || '',
        });
      } catch (error) {
        console.error('Session initialization failed:', error);
        // If the token is cleared or invalid, log out to ensure consistent state
        if (!useAuthStore.getState().token) {
          logout();
        }
      } finally {
        setInitializing(false);
      }
    };

    initializeAuth();
  }, [token, setInitializing, setUser, logout]);

  if (isInitializing) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            bgcolor: '#F7FAFC',
            gap: 2,
          }}
        >
          <CircularProgress color="primary" size={40} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

