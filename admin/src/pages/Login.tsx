import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  FormControlLabel,
  Checkbox,
  IconButton,
} from '@mui/material';
import {
  Shield,
  AdminPanelSettings,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../api/apiClient';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // Form states
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation/UI states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setUsernameError('');
    setPasswordError('');

    let hasError = false;

    if (!usernameOrEmail.trim()) {
      setUsernameError('Email or Username is required');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      // 1. Post to login endpoint
      const res = await apiClient.post('/api/v1/admin/login', {
        username_or_email: usernameOrEmail.trim(),
        password: password,
      });

      const { access_token, refresh_token, admin } = res.data;

      if (!access_token) {
        throw new Error('Invalid response from authentication server.');
      }

      // Set token to authorize the /me request
      useAuthStore.getState().setToken(access_token);

      // 2. Fetch admin profile and permissions
      const meRes = await apiClient.get('/api/v1/admin/me');
      const { name, email, role, permissions } = meRes.data;

      // 3. Save to store
      login(
        {
          id: admin.id,
          name: name || admin.username,
          email: email || admin.email,
          role: role || admin.role,
        },
        access_token,
        refresh_token,
        permissions || []
      );

      navigate('/');
    } catch (err: any) {
      let msg = 'Authentication failed. Please check your credentials.';
      if (err?.response?.data?.detail) {
        const d = err.response.data.detail;
        msg = typeof d === 'string' ? d : JSON.stringify(d);
      } else if (err?.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
      useAuthStore.getState().setToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Brand Header */}
      <Box
        sx={{
          mx: 'auto',
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FAD02C 0%, #F6A623 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          boxShadow: '0 4px 14px rgba(250, 208, 44, 0.4)',
        }}
      >
        <AdminPanelSettings sx={{ color: '#1A202C', fontSize: 28 }} />
      </Box>

      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', color: '#1A202C' }}
      >
        Urban Power Admin
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 0.5 }}>
        Secure administrator console authentication
      </Typography>

      {/* Role Badge */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Chip
          icon={<Shield sx={{ fontSize: 14 }} />}
          label="Authorized Staff Only"
          size="small"
          sx={{
            bgcolor: 'rgba(102, 126, 234, 0.1)',
            color: '#553C9A',
            fontWeight: 600,
            fontSize: '0.72rem',
            border: '1px solid rgba(102, 126, 234, 0.25)',
          }}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Global Alerts */}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {/* Form Content */}
      <Box component="form" onSubmit={handleLogin} noValidate>
        <TextField
          fullWidth
          margin="normal"
          id="username-or-email"
          label="Email or Username"
          variant="outlined"
          placeholder="admin@urbanpower.com or admin"
          value={usernameOrEmail}
          onChange={e => setUsernameOrEmail(e.target.value)}
          error={!!usernameError}
          helperText={usernameError}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: '#A0AEC0' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          margin="normal"
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          variant="outlined"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          error={!!passwordError}
          helperText={passwordError}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: '#A0AEC0' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 2 }}
        />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={
              <Typography variant="body2" sx={{ color: '#4A5568', userSelect: 'none' }}>
                Remember Me
              </Typography>
            }
          />
          <Button
            variant="text"
            size="small"
            sx={{
              textTransform: 'none',
              color: '#764ba2',
              fontWeight: 600,
              fontSize: '0.8rem',
            }}
            onClick={() =>
              setErrorMessage('Please contact your System Administrator to recover password.')
            }
          >
            Forgot Password?
          </Button>
        </Box>

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4291 100%)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
            },
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={18} color="inherit" />
              Authenticating...
            </Box>
          ) : (
            'Sign In'
          )}
        </Button>
      </Box>

      {/* Footer note */}
      <Typography
        variant="caption"
        color="text.secondary"
        align="center"
        sx={{ display: 'block', mt: 3, opacity: 0.7 }}
      >
        Only registered admin accounts can access this panel.
      </Typography>
    </Box>
  );
};

export default Login;
