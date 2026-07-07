import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  InputAdornment,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DeleteOutlined as ScrapIcon,
  SettingsSuggest as MaintenanceIcon,
  Face as BeauticianIcon,
  Search as SearchIcon,
  CloudOff as OfflineIcon,
  Refresh as RefreshIcon,
  Timer as TimerIcon,
  CurrencyRupee as RupeeIcon,
} from '@mui/icons-material';
import { useServices, type ServiceItem, type ServiceDomain } from '../hooks/useServices';
import { useQueryClient } from '@tanstack/react-query';

// ─── Types ─────────────────────────────────────────────────────────────────────

// ─── Helpers ───────────────────────────────────────────────────────────────────

const DOMAINS: ServiceDomain[] = ['Scrap', 'Beautician', 'Maintenance'];

const DOMAIN_ICON: Record<ServiceDomain, React.ReactNode> = {
  Scrap: <ScrapIcon />,
  Beautician: <BeauticianIcon />,
  Maintenance: <MaintenanceIcon />,
};

const DOMAIN_LABEL: Record<ServiceDomain, string> = {
  Scrap: 'Scrap Management',
  Beautician: 'Beautician & Salon',
  Maintenance: 'Maintenance & Repairs',
};

// ─── Component ─────────────────────────────────────────────────────────────────

export const Services: React.FC = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useServices();

  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  const activeDomain = DOMAINS[activeTab];

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog state (kept for UI component compatibility but disabled in entry points)
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formActive, setFormActive] = useState(true);

  // ── Derived: compute merged item list ───────────────────────────────────────

  const liveItems: ServiceItem[] = useMemo(() => {
    if (!data) return [];
    const domainKey = activeDomain.toLowerCase() as 'scrap' | 'beautician' | 'maintenance';
    return data[domainKey].flatMap(cat => cat.services);
  }, [data, activeDomain]);

  const categories = useMemo(() => {
    if (!data) return [];
    const domainKey = activeDomain.toLowerCase() as 'scrap' | 'beautician' | 'maintenance';
    return data[domainKey];
  }, [data, activeDomain]);

  const displayedItems = useMemo(() => {
    if (!searchQuery.trim()) return liveItems;
    const q = searchQuery.toLowerCase();
    return liveItems.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q) ||
        (item.description ?? '').toLowerCase().includes(q),
    );
  }, [liveItems, searchQuery]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const openAdd = () => {
    // Disabled in UI
  };

  const openEdit = (_item: ServiceItem) => {
    // Disabled in UI
  };

  const openDelete = (_item: ServiceItem) => {
    // Disabled in UI
  };

  const handleSave = () => {
    // Disabled in UI
  };

  const handleConfirmDelete = () => {
    // Disabled in UI
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['services-all'] });
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2,
          flexWrap: 'wrap',
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
            Service Catalog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage services from Scrap, Beautician & Maintenance domains.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Refresh live data">
            <IconButton onClick={handleRefresh} size="small" disabled={isLoading}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Create Service API is not implemented in the backend (Pending Backend API)">
            <span>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                disabled
              >
                Add Service
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Pending Backend API Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Note:</strong> Service creation, editing, and deletion are currently <strong>Pending Backend API</strong> integration and are disabled in the UI. Live services can still be viewed, searched, and filtered.
      </Alert>

      {/* Error Banner */}
      {isError && (
        <Alert
          severity="warning"
          icon={<OfflineIcon />}
          sx={{ mb: 2 }}
          action={
            <Button size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          Could not reach backend:{' '}
          {(error as any)?.message ?? 'Network error'}.
        </Alert>
      )}

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_e, v) => {
            setActiveTab(v);
            setSearchQuery('');
          }}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            '& .MuiTab-root': {
              fontSize: '0.95rem',
              fontWeight: 600,
              minHeight: 56,
            },
          }}
        >
          {DOMAINS.map(domain => (
            <Tab
              key={domain}
              icon={DOMAIN_ICON[domain] as React.ReactElement}
              iconPosition="start"
              label={DOMAIN_LABEL[domain]}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Search + summary bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search services…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 240 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {isLoading ? (
            'Loading…'
          ) : (
            <>
              {displayedItems.length} service{displayedItems.length !== 1 ? 's' : ''}
            </>
          )}
        </Typography>
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: '1px solid #E2E8F0' }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F7FAFC' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#4A5568' }}>
                Category
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#4A5568' }}>
                Service Name
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#4A5568' }}>
                Price
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#4A5568' }}>
                Duration
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#4A5568' }}>
                Description
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#4A5568' }}
              >
                Status
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#4A5568' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Loading live service data…
                  </Typography>
                </TableCell>
              </TableRow>
            ) : displayedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchQuery
                      ? `No services matching "${searchQuery}".`
                      : 'No services found in this category.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              displayedItems.map(item => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Chip
                      label={item.categoryName}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.72rem', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <RupeeIcon sx={{ fontSize: 14, color: '#C29D0A' }} />
                      <Typography
                        variant="body2"
                        sx={{ color: '#C29D0A', fontWeight: 700 }}
                      >
                        {item.priceLabel.replace('₹', '')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {item.duration ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimerIcon sx={{ fontSize: 14, color: '#718096' }} />
                        <Typography variant="body2" color="text.secondary">
                          {item.duration} min
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {item.description ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={item.active ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        bgcolor: item.active
                          ? 'rgba(72,187,120,0.15)'
                          : 'rgba(160,160,160,0.15)',
                        color: item.active ? '#276749' : '#718096',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title="Edit service (Pending Backend API)">
                        <span>
                          <IconButton
                            color="secondary"
                            size="small"
                            disabled
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Delete service (Pending Backend API)">
                        <span>
                          <IconButton
                            color="error"
                            size="small"
                            disabled
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog
        open={openFormDialog}
        onClose={() => setOpenFormDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}>
          {editingItem ? 'Edit Service' : `Add Service — ${activeDomain}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              label="Service Name"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              required
            />
            {/* Category selector from live data */}
            <TextField
              select
              fullWidth
              size="small"
              label="Category"
              value={formCategoryId}
              onChange={e => {
                setFormCategoryId(e.target.value);
                const cat = categories.find(c => c.id === e.target.value);
                if (cat) setFormCategory(cat.name);
              }}
            >
              {categories.length > 0 ? (
                categories.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="local-cat">{activeDomain}</MenuItem>
              )}
            </TextField>
            <TextField
              fullWidth
              size="small"
              label={
                activeDomain === 'Scrap'
                  ? 'Price per kg (₹/kg)'
                  : 'Price (₹)'
              }
              value={formPrice}
              onChange={e => setFormPrice(e.target.value)}
              type="number"
              slotProps={{
                htmlInput: { min: 0, step: 0.01 },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                },
              }}
              required
            />
            {activeDomain !== 'Scrap' && (
              <TextField
                fullWidth
                size="small"
                label="Duration (minutes)"
                value={formDuration}
                onChange={e => setFormDuration(e.target.value)}
                type="number"
                slotProps={{
                  htmlInput: { min: 1 },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <TimerIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              label="Description"
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formActive}
                  onChange={e => setFormActive(e.target.checked)}
                  color="success"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formActive ? 'Active' : 'Inactive'}
                </Typography>
              }
            />
          </Box>
          {!editingItem && (
            <Alert severity="info" sx={{ mt: 2, fontSize: '0.78rem' }}>
              This service will be added locally. Backend write APIs are not
              available — your changes persist for this session only.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenFormDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={!formName.trim()}
          >
            {editingItem ? 'Save Changes' : 'Add Service'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}>
          Remove Service
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to remove{' '}
            <strong>{editingItem?.name}</strong> from the catalog?
          </Typography>
          {editingItem?.fromApi && (
            <Alert severity="warning" sx={{ mt: 2, fontSize: '0.78rem' }}>
              This will hide the service in this session only. The backend
              record is unmodified.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Services;
