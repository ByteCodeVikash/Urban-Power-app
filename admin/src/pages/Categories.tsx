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
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  InputAdornment,
  Avatar,
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
  Category as CategoryIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import {
  useServices,
  type ServiceCategory,
  type ServiceDomain,
} from '../hooks/useServices';
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

const DOMAIN_COLORS: Record<
  ServiceDomain,
  { bg: string; text: string; avatar: string }
> = {
  Scrap: { bg: 'rgba(72,187,120,0.12)', text: '#276749', avatar: '#276749' },
  Beautician: {
    bg: 'rgba(213,63,140,0.12)',
    text: '#97266D',
    avatar: '#97266D',
  },
  Maintenance: {
    bg: 'rgba(49,130,206,0.12)',
    text: '#2B6CB0',
    avatar: '#2B6CB0',
  },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export const Categories: React.FC = () => {
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
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ServiceCategory | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('');
  const [formActive, setFormActive] = useState(true);

  // ── Derived: live categories for active domain ──────────────────────────────

  const liveCategories: ServiceCategory[] = useMemo(() => {
    if (!data) return [];
    const domainKey = activeDomain.toLowerCase() as
      | 'scrap'
      | 'beautician'
      | 'maintenance';
    return data[domainKey];
  }, [data, activeDomain]);

  const displayedCategories = useMemo(() => {
    if (!searchQuery.trim()) return liveCategories;
    const q = searchQuery.toLowerCase();
    return liveCategories.filter(
      cat =>
        cat.name.toLowerCase().includes(q) ||
        (cat.description ?? '').toLowerCase().includes(q),
    );
  }, [liveCategories, searchQuery]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const openAdd = () => {
    // Disabled in UI
  };

  const openEdit = (_cat: ServiceCategory) => {
    // Disabled in UI
  };

  const openDelete = (_cat: ServiceCategory) => {
    // Disabled in UI
  };

  const openDetail = (cat: ServiceCategory) => {
    setEditingCategory(cat);
    setOpenDetailDialog(true);
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

  const colors = DOMAIN_COLORS[activeDomain];

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
            Service Categories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and organise categories for Scrap, Beautician &amp;
            Maintenance domains.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Refresh live data">
            <IconButton
              onClick={handleRefresh}
              size="small"
              disabled={isLoading}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Create Category API is not implemented in the backend (Pending Backend API)">
            <span>
              <Button variant="contained" startIcon={<AddIcon />} disabled>
                Add Category
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Pending Backend API Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Note:</strong> Category creation, editing, and deletion are
        currently <strong>Pending Backend API</strong> integration and are
        disabled in the UI. Live categories can still be viewed, searched, and
        filtered.
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
          Could not reach backend: {(error as any)?.message ?? 'Network error'}.
        </Alert>
      )}

      {/* Domain Tabs */}
      <Paper
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
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
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <TextField
          size="small"
          placeholder="Search categories…"
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
              {displayedCategories.length} categor
              {displayedCategories.length !== 1 ? 'ies' : 'y'}
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
              <TableCell
                sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#4A5568' }}
              >
                Category
              </TableCell>
              <TableCell
                sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#4A5568' }}
              >
                Description
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#4A5568' }}
              >
                Services
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#4A5568' }}
              >
                Status
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#4A5568' }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Loading live category data…
                  </Typography>
                </TableCell>
              </TableRow>
            ) : displayedCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchQuery
                      ? `No categories matching "${searchQuery}".`
                      : 'No categories found in this domain.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              displayedCategories.map(cat => (
                <TableRow key={cat.id} hover>
                  {/* Category Name + Icon */}
                  <TableCell>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
                    >
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          bgcolor: colors.bg,
                          color: colors.avatar,
                          fontSize: '0.8rem',
                          fontWeight: 700,
                        }}
                      >
                        {cat.icon ? (
                          <Typography variant="body2" sx={{ fontSize: '1rem' }}>
                            {cat.icon}
                          </Typography>
                        ) : (
                          <CategoryIcon sx={{ fontSize: 18 }} />
                        )}
                      </Avatar>
                      <Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: '#1A202C' }}
                          >
                            {cat.name}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {activeDomain}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Description */}
                  <TableCell sx={{ maxWidth: 340 }}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {cat.description ?? '—'}
                    </Typography>
                  </TableCell>

                  {/* Service Count */}
                  <TableCell align="center">
                    <Chip
                      icon={
                        <ViewListIcon sx={{ fontSize: '14px !important' }} />
                      }
                      label={cat.services.length}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: colors.text,
                        borderColor: colors.bg,
                        bgcolor: colors.bg,
                        cursor: cat.services.length > 0 ? 'pointer' : 'default',
                      }}
                      onClick={
                        cat.services.length > 0
                          ? () => openDetail(cat)
                          : undefined
                      }
                    />
                  </TableCell>

                  {/* Status */}
                  <TableCell align="center">
                    <Chip
                      label={cat.active ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        bgcolor: cat.active
                          ? 'rgba(72,187,120,0.15)'
                          : 'rgba(160,160,160,0.15)',
                        color: cat.active ? '#276749' : '#718096',
                      }}
                    />
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 0.5,
                      }}
                    >
                      <Tooltip title="View services">
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => openDetail(cat)}
                            disabled={cat.services.length === 0}
                          >
                            <ViewListIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Edit category (Pending Backend API)">
                        <span>
                          <IconButton color="secondary" size="small" disabled>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Delete category (Pending Backend API)">
                        <span>
                          <IconButton color="error" size="small" disabled>
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

      {/* ── Add / Edit Category Dialog ──────────────────────────────────────── */}
      <Dialog
        open={openFormDialog}
        onClose={() => setOpenFormDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
        >
          {editingCategory
            ? `Edit Category — ${editingCategory.name}`
            : `Add Category — ${DOMAIN_LABEL[activeDomain]}`}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1.5 }}
          >
            <TextField
              fullWidth
              size="small"
              label="Category Name"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              required
            />
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="Description"
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              placeholder="Brief description of this category"
            />
            <TextField
              fullWidth
              size="small"
              label="Icon (emoji or identifier)"
              value={formIcon}
              onChange={e => setFormIcon(e.target.value)}
              placeholder="e.g. 🔧 or icon-name"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
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
          {!editingCategory && (
            <Alert severity="info" sx={{ mt: 2, fontSize: '0.78rem' }}>
              This category will be added locally. Backend write APIs are not
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
            {editingCategory ? 'Save Changes' : 'Add Category'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm Dialog ────────────────────────────────────────────── */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
        >
          Remove Category
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to remove{' '}
            <strong>{editingCategory?.name}</strong>?
            {(editingCategory?.services?.length ?? 0) > 0 && (
              <>
                {' '}
                This category has{' '}
                <strong>{editingCategory?.services.length}</strong> service(s)
                linked to it.
              </>
            )}
          </Typography>
          {editingCategory?.fromApi && (
            <Alert severity="warning" sx={{ mt: 2, fontSize: '0.78rem' }}>
              This will hide the category in this session only. The backend
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

      {/* ── Category Services Detail Dialog ─────────────────────────────────── */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: colors.bg,
                color: colors.avatar,
              }}
            >
              <CategoryIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
              >
                {editingCategory?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {editingCategory?.services.length ?? 0} service(s) in this
                category
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F7FAFC' }}>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      color: '#4A5568',
                    }}
                  >
                    Service Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      color: '#4A5568',
                    }}
                  >
                    Price
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      color: '#4A5568',
                    }}
                  >
                    Duration
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      color: '#4A5568',
                    }}
                  >
                    Description
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      color: '#4A5568',
                    }}
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {editingCategory?.services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No services in this category.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  editingCategory?.services.map(svc => (
                    <TableRow key={svc.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {svc.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: '#C29D0A', fontWeight: 700 }}
                        >
                          {svc.priceLabel}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {svc.duration ? `${svc.duration} min` : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 240 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {svc.description ?? '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={svc.active ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            bgcolor: svc.active
                              ? 'rgba(72,187,120,0.15)'
                              : 'rgba(160,160,160,0.15)',
                            color: svc.active ? '#276749' : '#718096',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDetailDialog(false)} variant="outlined">
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => {
              setOpenDetailDialog(false);
              if (editingCategory) openEdit(editingCategory);
            }}
          >
            Edit Category
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories;
