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
  Stepper,
  Step,
  StepLabel,
  Chip,
  Divider,
} from '@mui/material';
import {
  PhoneAndroid,
  Shield,
  AdminPanelSettings,
  CheckCircleOutlined,
  ArrowBack,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../api/apiClient';

// ─── Step definitions ──────────────────────────────────────────────────────────
const STEPS = ['Enter Phone', 'Verify OTP'];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function normalizePhone(raw: string): string {
  // Strip all non-digit chars except leading +
  let val = raw.trim();
  if (!val.startsWith('+')) {
    // Add India country code by default if 10 digits
    const digits = val.replace(/\D/g, '');
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
    return `+${digits}`;
  }
  return val;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // Step state
  const [activeStep, setActiveStep] = useState(0);

  // Step 1: phone
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Step 2: OTP
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // Shared state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setPhoneError('');

    const normalized = normalizePhone(phone);
    if (!/^\+\d{10,15}$/.test(normalized)) {
      setPhoneError('Enter a valid phone number (e.g. 9876543210 or +919876543210)');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/api/v1/auth/send-otp', { phone: normalized });
      setSuccessMessage(
        res.data?.otp
          ? `OTP sent! (Dev mode OTP: ${res.data.otp})`
          : 'OTP sent to your phone. Enter it below.'
      );
      setActiveStep(1);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setErrorMessage(typeof detail === 'string' ? detail : 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP & login ────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    setErrorMessage(null);
    setOtpError('');

    if (!otp || otp.trim().length < 6) {
      setOtpError('OTP must be 6 digits');
      return;
    }

    const normalized = normalizePhone(phone);
    setLoading(true);
    try {
      const res = await apiClient.post('/api/v1/auth/verify-otp', {
        phone: normalized,
        otp: otp.trim(),
      });

      const { access_token, refresh_token, user } = res.data;

      if (!access_token) {
        throw new Error('No session token returned. Please register first.');
      }

      // ── Role gate: only admin / super_admin allowed ──
      const role = (user?.role || '').toLowerCase().trim();
      if (role !== 'admin' && role !== 'super_admin') {
        throw new Error(
          `Access Denied: Your account role (${user?.role || 'unknown'}) does not have administrator privileges.`
        );
      }

      // Fetch full profile
      useAuthStore.getState().setToken(access_token);
      let fullUser = {
        id: user?.id || '',
        role: user?.role || 'admin',
        name: 'Admin User',
        phone: user?.phone || normalized,
      };

      try {
        const profileRes = await apiClient.get('/api/v1/users/me');
        const p = profileRes.data;
        fullUser = {
          id: p.id || fullUser.id,
          role: p.role || fullUser.role,
          name: p.full_name || p.name || 'Admin User',
          phone: p.phone || normalized,
        };
      } catch {
        // profile fetch is best-effort
      }

      login(fullUser, access_token, refresh_token);
      navigate('/');
    } catch (err: any) {
      let msg = 'Invalid or expired OTP. Please try again.';
      if (err?.response?.data?.detail) {
        const d = err.response.data.detail;
        msg = typeof d === 'string' ? d : JSON.stringify(d);
      } else if (err?.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setActiveStep(0);
    setOtp('');
    setOtpError('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ width: '100%' }}>
      {/* Brand header */}
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
        Secure administrator access via OTP
      </Typography>

      {/* Role badge */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Chip
          icon={<Shield sx={{ fontSize: 14 }} />}
          label="Admin &amp; Super Admin Only"
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

      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {STEPS.map(label => (
          <Step key={label}>
            <StepLabel
              sx={{
                '& .MuiStepLabel-label': { fontSize: '0.78rem', fontWeight: 600 },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Divider sx={{ mb: 3 }} />

      {/* Global alerts */}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} icon={<CheckCircleOutlined />}>
          {successMessage}
        </Alert>
      )}

      {/* ── Step 0: Phone number ── */}
      {activeStep === 0 && (
        <Box>
          <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: '#4A5568' }}>
            Enter your registered admin phone number
          </Typography>
          <TextField
            fullWidth
            id="admin-phone"
            label="Phone Number"
            placeholder="9876543210 or +919876543210"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
            error={!!phoneError}
            helperText={phoneError || 'Indian numbers: enter 10 digits without country code'}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneAndroid sx={{ color: '#A0AEC0' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 3 }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleSendOtp}
            disabled={loading || !phone.trim()}
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
                Sending OTP...
              </Box>
            ) : (
              'Send OTP'
            )}
          </Button>
        </Box>
      )}

      {/* ── Step 1: OTP verification ── */}
      {activeStep === 1 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Button
              size="small"
              startIcon={<ArrowBack />}
              onClick={handleBack}
              sx={{ color: '#718096', minWidth: 0, px: 0.5 }}
            >
              Change
            </Button>
            <Typography variant="body2" color="text.secondary">
              OTP sent to{' '}
              <strong style={{ color: '#2D3748' }}>{normalizePhone(phone)}</strong>
            </Typography>
          </Box>

          <TextField
            fullWidth
            variant="outlined"
            id="admin-otp"
            label="6-digit OTP"
            placeholder="123456"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
            error={!!otpError}
            helperText={otpError || 'Enter the OTP received on your phone'}
            slotProps={{
              htmlInput: {
                maxLength: 6,
                style: { letterSpacing: 8, fontSize: '1.4rem', fontWeight: 700 }
              }
            }}
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleVerifyOtp}
            disabled={loading || otp.length < 6}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #48BB78 0%, #276749 100%)',
              boxShadow: '0 4px 15px rgba(72, 187, 120, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #38A169 0%, #1C4532 100%)',
                boxShadow: '0 6px 20px rgba(72, 187, 120, 0.5)',
              },
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={18} color="inherit" />
                Verifying...
              </Box>
            ) : (
              'Verify & Sign In'
            )}
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              size="small"
              variant="text"
              onClick={handleSendOtp}
              disabled={loading}
              sx={{ color: '#718096', fontSize: '0.8rem' }}
            >
              Didn't receive OTP? Resend
            </Button>
          </Box>
        </Box>
      )}

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
