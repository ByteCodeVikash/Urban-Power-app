import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  FormControlLabel,
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
} from '@mui/material';
import {
  Security as SecurityIcon,
  SettingsApplications as ConfigIcon,
  People as RolesIcon,
} from '@mui/icons-material';

// Initial Mock Roles & Permissions Matrix
const initialPermissions = [
  { id: 'perm-1', section: 'Orders & Bookings', name: 'View Orders', admin: true, manager: true, dispatcher: true, viewer: true },
  { id: 'perm-2', section: 'Orders & Bookings', name: 'Update Order Status', admin: true, manager: true, dispatcher: true, viewer: false },
  { id: 'perm-3', section: 'Orders & Bookings', name: 'Assign Technician', admin: true, manager: true, dispatcher: true, viewer: false },
  { id: 'perm-4', section: 'Technicians', name: 'Manage Technicians CRUD', admin: true, manager: true, dispatcher: false, viewer: false },
  { id: 'perm-5', section: 'Service Catalog', name: 'Edit Pricing & Services', admin: true, manager: false, dispatcher: false, viewer: false },
  { id: 'perm-6', section: 'Payments & Refunds', name: 'Process Refunds', admin: true, manager: true, dispatcher: false, viewer: false },
];

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [permissions, setPermissions] = useState(initialPermissions);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [alertText, setAlertText] = useState<string | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePermissionToggle = (permId: string, role: 'admin' | 'manager' | 'dispatcher' | 'viewer') => {
    setPermissions(
      permissions.map((p) => (p.id === permId ? { ...p, [role]: !p[role] } : p))
    );
  };

  const handleSaveConfigs = () => {
    setAlertText('System configuration saved successfully.');
    setTimeout(() => setAlertText(null), 2500);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', color: '#1A202C' }}>
          System Settings & Control
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure security roles, checklist permission parameters, and manage global system defaults.
        </Typography>
      </Box>

      {alertText && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {alertText}
        </Alert>
      )}

      {/* Tabs Menu */}
      <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
          <Tab icon={<RolesIcon />} iconPosition="start" label="Access Roles Matrix" />
          <Tab icon={<ConfigIcon />} iconPosition="start" label="Global Parameters" />
        </Tabs>
      </Paper>

      {/* Access Roles Matrix */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid size={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SecurityIcon color="action" />
                  <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}>
                    Roles & Permissions Checklist
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Assign and toggle precise module access rules for the standard personnel ranks in the company.
                </Typography>

                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0' }}>
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
                      {permissions.map((perm) => (
                        <TableRow key={perm.id} hover>
                          <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>{perm.section}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{perm.name}</TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={perm.admin}
                              onChange={() => handlePermissionToggle(perm.id, 'admin')}
                              color="primary"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={perm.manager}
                              onChange={() => handlePermissionToggle(perm.id, 'manager')}
                              color="primary"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={perm.dispatcher}
                              onChange={() => handlePermissionToggle(perm.id, 'dispatcher')}
                              color="primary"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={perm.viewer}
                              onChange={() => handlePermissionToggle(perm.id, 'viewer')}
                              color="primary"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" color="primary" onClick={handleSaveConfigs}>
                    Save Role Matrix
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Global Parameters */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontFamily: '"Outfit", sans-serif' }}>
                  Security & Identity Defaults
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={mfaEnabled}
                        onChange={(e) => setMfaEnabled(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Force Multi-Factor Authentication (MFA) for Admin logs"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: -2, ml: 4, display: 'block' }}>
                    Requires verification codes on Google Authenticator for login access.
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={emailAlerts}
                        onChange={(e) => setEmailAlerts(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Send automated email receipts to clients on order complete"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontFamily: '"Outfit", sans-serif' }}>
                  Operational Flags
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        color="error"
                      />
                    }
                    label="Put Customer Application under Maintenance Mode"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: -2, ml: 4, display: 'block' }}>
                    Warning: Activating this locks the Android & iOS apps, showing a "Back Soon" screen.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="contained" color="primary" onClick={handleSaveConfigs}>
                Save System Configs
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
export default Settings;
