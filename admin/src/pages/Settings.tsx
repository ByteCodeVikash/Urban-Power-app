import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Alert,
  TextField,
  FormControlLabel,
} from '@mui/material';
import {
  Security as SecurityIcon,
  SettingsApplications as ConfigIcon,
  People as RolesIcon,
  VpnKey as CredentialsIcon,
  Tune as ThresholdsIcon,
  Restore as ResetIcon,
} from '@mui/icons-material';
import { useSettingsStore } from '../store/settingsStore';

export const Settings: React.FC = () => {
  const store = useSettingsStore();

  const [activeTab, setActiveTab] = useState(0);
  const [alertText, setAlertText] = useState<string | null>(null);

  // Access Matrix State
  const [permissions, setPermissions] = useState(store.permissions);

  // Business Rules State
  const [minScrapPickupValue, setMinScrapPickupValue] = useState(store.minScrapPickupValue);
  const [commissionRate, setCommissionRate] = useState(store.commissionRate);
  const [payoutCutoffHours, setPayoutCutoffHours] = useState(store.payoutCutoffHours);
  const [maxDispatchRadius, setMaxDispatchRadius] = useState(store.maxDispatchRadius);

  // API Credentials State
  const [razorpayKeyId, setRazorpayKeyId] = useState(store.razorpayKeyId);
  const [razorpayKeySecret, setRazorpayKeySecret] = useState(store.razorpayKeySecret);
  const [twilioSid, setTwilioSid] = useState(store.twilioSid);
  const [twilioToken, setTwilioToken] = useState(store.twilioToken);
  const [firebaseConfig, setFirebaseConfig] = useState(store.firebaseConfig);

  // Global System Controls State
  const [mfaEnabled, setMfaEnabled] = useState(store.mfaEnabled);
  const [emailAlerts, setEmailAlerts] = useState(store.emailAlerts);
  const [maintenanceMode, setMaintenanceMode] = useState(store.maintenanceMode);

  // Sync state if store updates externally or is reset
  useEffect(() => {
    setPermissions(store.permissions);
    setMinScrapPickupValue(store.minScrapPickupValue);
    setCommissionRate(store.commissionRate);
    setPayoutCutoffHours(store.payoutCutoffHours);
    setMaxDispatchRadius(store.maxDispatchRadius);
    setRazorpayKeyId(store.razorpayKeyId);
    setRazorpayKeySecret(store.razorpayKeySecret);
    setTwilioSid(store.twilioSid);
    setTwilioToken(store.twilioToken);
    setFirebaseConfig(store.firebaseConfig);
    setMfaEnabled(store.mfaEnabled);
    setEmailAlerts(store.emailAlerts);
    setMaintenanceMode(store.maintenanceMode);
  }, [
    store.permissions,
    store.minScrapPickupValue,
    store.commissionRate,
    store.payoutCutoffHours,
    store.maxDispatchRadius,
    store.razorpayKeyId,
    store.razorpayKeySecret,
    store.twilioSid,
    store.twilioToken,
    store.firebaseConfig,
    store.mfaEnabled,
    store.emailAlerts,
    store.maintenanceMode,
  ]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePermissionToggle = (
    permId: string,
    role: 'admin' | 'manager' | 'dispatcher' | 'viewer',
  ) => {
    setPermissions(prev =>
      prev.map(p => (p.id === permId ? { ...p, [role]: !p[role] } : p)),
    );
  };

  const handleSaveConfigs = (sectionName: string) => {
    if (sectionName === 'Access Roles Matrix') {
      store.setPermissions(permissions);
    } else if (sectionName === 'Business Rules') {
      store.updateBusinessRules({
        minScrapPickupValue,
        commissionRate,
        payoutCutoffHours,
        maxDispatchRadius,
      });
    } else if (sectionName === 'API Gateways') {
      store.updateApiCredentials({
        razorpayKeyId,
        razorpayKeySecret,
        twilioSid,
        twilioToken,
        firebaseConfig,
      });
    } else if (sectionName === 'System Flags') {
      store.updateSystemControls({
        mfaEnabled,
        emailAlerts,
        maintenanceMode,
      });
    }

    setAlertText(
      `${sectionName} configurations updated and synchronized successfully.`,
    );
    setTimeout(() => setAlertText(null), 2500);
  };

  const handleResetToDefault = () => {
    store.resetToDefault();
    setAlertText('All settings reset to system defaults successfully.');
    setTimeout(() => setAlertText(null), 2500);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontFamily: '"Outfit", sans-serif',
              color: '#1A202C',
            }}
          >
            System Settings & Controls
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure security roles, business parameters, third-party API
            gateways, and main operational flags.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="warning"
          startIcon={<ResetIcon />}
          onClick={handleResetToDefault}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Reset to Defaults
        </Button>
      </Box>

      {alertText && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {alertText}
        </Alert>
      )}

      {/* Tabs Menu */}
      <Paper
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<RolesIcon />}
            iconPosition="start"
            label="Access Roles Matrix"
          />
          <Tab
            icon={<ThresholdsIcon />}
            iconPosition="start"
            label="Business Rules & Thresholds"
          />
          <Tab
            icon={<CredentialsIcon />}
            iconPosition="start"
            label="API Gateways & Credentials"
          />
          <Tab
            icon={<ConfigIcon />}
            iconPosition="start"
            label="System Flags & Controls"
          />
        </Tabs>
      </Paper>

      {/* Access Roles Matrix */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid size={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                >
                  <SecurityIcon color="action" />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
                  >
                    Roles & Permissions Checklist
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Assign and toggle precise module access rules for the standard
                  personnel ranks in the company.
                </Typography>

                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{ border: '1px solid #E2E8F0', mb: 3 }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Module/Section</TableCell>
                        <TableCell>Permission Scope</TableCell>
                        <TableCell align="center">Super Admin</TableCell>
                        <TableCell align="center">Manager</TableCell>
                        <TableCell align="center">Dispatcher</TableCell>
                        <TableCell align="center">View-Only Agent</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {permissions.map(perm => (
                        <TableRow key={perm.id} hover>
                          <TableCell
                            sx={{ fontWeight: 600, color: 'text.secondary' }}
                          >
                            {perm.section}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {perm.name}
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={perm.admin}
                              onChange={() =>
                                handlePermissionToggle(perm.id, 'admin')
                              }
                              color="primary"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={perm.manager}
                              onChange={() =>
                                handlePermissionToggle(perm.id, 'manager')
                              }
                              color="primary"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={perm.dispatcher}
                              onChange={() =>
                                handlePermissionToggle(perm.id, 'dispatcher')
                              }
                              color="primary"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={perm.viewer}
                              onChange={() =>
                                handlePermissionToggle(perm.id, 'viewer')
                              }
                              color="primary"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleSaveConfigs('Access Roles Matrix')}
                  >
                    Save Role Matrix
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Business Rules & Thresholds */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid size={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}
                >
                  <ThresholdsIcon color="action" />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
                  >
                    Core Dispatch & Payout Rules
                  </Typography>
                </Box>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Minimum Booking Value for Scrap Pickup (₹)"
                      type="number"
                      value={minScrapPickupValue}
                      onChange={e => setMinScrapPickupValue(e.target.value)}
                      helperText="Minimum scrap estimate value required to dispatch a vehicle."
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Urban Power Maintenance Commission (%)"
                      type="number"
                      value={commissionRate}
                      onChange={e => setCommissionRate(e.target.value)}
                      helperText="Platform share cut deducted from maintenance and repair services."
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Technician Payout Cutoff Window (Hours)"
                      type="number"
                      value={payoutCutoffHours}
                      onChange={e => setPayoutCutoffHours(e.target.value)}
                      helperText="Time elapsed before complete orders qualify for technician payouts."
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Maximum Dispatch Assignment Radius (KM)"
                      type="number"
                      value={maxDispatchRadius}
                      onChange={e => setMaxDispatchRadius(e.target.value)}
                      helperText="Maximum distance from order address to scan for technicians."
                    />
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleSaveConfigs('Business Rules')}
                  >
                    Save Threshold Parameters
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* API Gateways & Credentials */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid size={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}
                >
                  <CredentialsIcon color="action" />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
                  >
                    Payment & SMS Gateways Credentials
                  </Typography>
                </Box>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Razorpay Production Key ID"
                      value={razorpayKeyId}
                      onChange={e => setRazorpayKeyId(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Razorpay Secret Key"
                      type="password"
                      value={razorpayKeySecret}
                      onChange={e => setRazorpayKeySecret(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Twilio Account SID"
                      value={twilioSid}
                      onChange={e => setTwilioSid(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Twilio Auth Token"
                      type="password"
                      value={twilioToken}
                      onChange={e => setTwilioToken(e.target.value)}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={5}
                      label="Firebase Service Account JSON Configuration"
                      value={firebaseConfig}
                      onChange={e => setFirebaseConfig(e.target.value)}
                      sx={{ fontFamily: 'monospace' }}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleSaveConfigs('API Gateways')}
                  >
                    Update Credentials
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* System Flags & Controls */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    fontFamily: '"Outfit", sans-serif',
                  }}
                >
                  Identity Security Flags
                </Typography>
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={mfaEnabled}
                        onChange={e => setMfaEnabled(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Enforce Multi-Factor Authentication (MFA) for Admin Portal"
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: -2, ml: 4, display: 'block' }}
                  >
                    If turned on, all admins must verify with Google
                    Authenticator token codes during session login.
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={emailAlerts}
                        onChange={e => setEmailAlerts(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Send Automated Invoice PDF to Client upon Order Completion"
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: -2, ml: 4, display: 'block' }}
                  >
                    Dispatches a transactional GST-invoice mail as soon as the
                    technician marks a ticket as complete.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    fontFamily: '"Outfit", sans-serif',
                  }}
                >
                  Operational State Override
                </Typography>
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={maintenanceMode}
                        onChange={e => setMaintenanceMode(e.target.checked)}
                        color="error"
                      />
                    }
                    label="Activate Maintenance Mode (Locks Customer Applications)"
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: -2, ml: 4, display: 'block' }}
                  >
                    Warning: Activating this locks the Android & iOS customer
                    apps, showing a "Back Soon" screen and blocking checkout api
                    endpoints.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSaveConfigs('System Flags')}
              >
                Save Operational Flags
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Settings;
