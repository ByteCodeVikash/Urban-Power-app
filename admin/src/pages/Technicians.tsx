import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  Divider,
  Tooltip,
  TextField,
  Skeleton,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useTechnicians, type TechnicianOrder } from '../hooks/useTechnicians';
import { useTechnicianAssign } from '../hooks/useTechnicianAssign';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import { parseBookingNotes, useBookings } from '../hooks/useBookings';
import { useNavigate } from 'react-router-dom';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as ApprovedIcon,
  Close as RejectedIcon,
  Map as MapIcon,
  Star as StarIcon,
  Description as DocIcon,
  ThumbsUpDown as ThumbsIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { DataTable, type ColumnConfig } from '../components/common/DataTable';
import {
  FilterPanel,
  type FilterField,
} from '../components/common/FilterPanel';

// Static service/area reference lists (used in Add/Edit dialog)
// Technician directory data now comes from useTechnicians hook.

// Service types sourced from the platform's real service domains.
const SERVICES = ['Scrap', 'Maintenance', 'Beautician'];

// Common service areas. Pending backend API: no /areas endpoint exists yet.
// When GET /api/v1/areas is available, fetch and replace this list.
const SERVICE_AREAS = [
  'Green Glen Layout',
  'HSR Layout',
  'Gachibowli',
  'Madhapur',
  'Sector 7 Dwarka',
  'Sector 12 Dwarka',
  'Indiranagar',
  'Koramangala',
];


// Types for local state
interface LocalTech {
  id: string;
  name: string;
  phone: string;
  service: string;
  area: string;
  available: boolean;
  rating: number;
  jobsCompleted: number;
  assignedOrders?: TechnicianOrder[];
}

export const Technicians: React.FC = () => {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);

  // Real technician roster from API
  const { data: techData = [], isLoading: techLoading } = useTechnicians();

  const { data: allBookings = [], isLoading: bookingsLoading } = useBookings();

  // Technician assignment mutation
  const { assignTechnician, reassignTechnician, isPending: assignPending } = useTechnicianAssign();

  // Local mirror for Directory tab (allows add/edit/delete in UI with persistence)
  const [techs, setTechs] = useState<LocalTech[]>(() => {
    const saved = localStorage.getItem('urban_power_technicians_directory');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    if (techLoading) return;

    setTechs(prevTechs => {
      const existingMap = new Map(prevTechs.map(t => [t.name.toLowerCase(), t]));
      const newTechs = [...prevTechs];

      techData.forEach((t, idx) => {
        const key = t.name.toLowerCase();
        const existing = existingMap.get(key);

        if (existing) {
          const updatedIndex = newTechs.findIndex(nt => nt.name.toLowerCase() === key);
          if (updatedIndex !== -1) {
            newTechs[updatedIndex] = {
              ...newTechs[updatedIndex],
              jobsCompleted: t.jobsCompleted,
              assignedOrders: t.assignedOrders || [],
              available: newTechs[updatedIndex].available !== undefined ? newTechs[updatedIndex].available : t.isAvailable,
            };
          }
        } else {
          newTechs.push({
            id: `T-${String(newTechs.length + 1).padStart(3, '0')}`,
            name: t.name,
            phone: t.phone,
            service: t.service,
            area: 'Service Area',
            available: t.isAvailable,
            rating: 4.5,
            jobsCompleted: t.jobsCompleted,
            assignedOrders: t.assignedOrders || [],
          });
        }
      });

      // If local storage is empty, initialize it
      if (newTechs.length > 0) {
        localStorage.setItem('urban_power_technicians_directory', JSON.stringify(newTechs));
      }
      return newTechs;
    });
  }, [techData, techLoading]);

  // Assignments tab state
  const [assignFilterTech, setAssignFilterTech] = useState('');
  const [assignStatusFilter, setAssignStatusFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [openReassignDialog, setOpenReassignDialog] = useState(false);
  const [reassignBooking, setReassignBooking] = useState<any>(null);
  const [reassignTechName, setReassignTechName] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  // Details dialog state
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedTechForDetails, setSelectedTechForDetails] = useState<LocalTech | null>(null);

  const [verifyQueue] = useState<any[]>([]); // Pending Backend API: no verification queue endpoint

  // Filter state for Tab 0 Directory
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({
    search: '',
    service: '',
  });

  // Dialog States
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingTech, setEditingTech] = useState<LocalTech | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [available, setAvailable] = useState(true);

  // Tab switcher
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Open Add Dialog
  const handleOpenAdd = () => {
    setEditingTech(null);
    setName('');
    setPhone('');
    setService('');
    setSelectedAreas([]);
    setAvailable(true);
    setOpenFormDialog(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (tech: LocalTech) => {
    setEditingTech(tech);
    setName(tech.name);
    setPhone(tech.phone);
    setService(tech.service);
    setSelectedAreas(tech.area.split(', '));
    setAvailable(tech.available);
    setOpenFormDialog(true);
  };

  // Open Delete Dialog
  const handleOpenDelete = (tech: LocalTech) => {
    setEditingTech(tech);
    setOpenDeleteDialog(true);
  };

  // Open Details Dialog
  const handleOpenDetails = (tech: LocalTech) => {
    setSelectedTechForDetails(tech);
    setOpenDetailsDialog(true);
  };

  // Save Add/Edit
  const handleSave = () => {
    let updatedTechs: LocalTech[];
    if (editingTech) {
      updatedTechs = techs.map(t =>
        t.id === editingTech.id
          ? {
              ...t,
              name,
              phone,
              service,
              area: selectedAreas.join(', '),
              available,
            }
          : t,
      );
    } else {
      const newTech: LocalTech = {
        id: `T-${String(techs.length + 1).padStart(3, '0')}`,
        name,
        phone,
        service,
        area: selectedAreas.join(', '),
        available,
        rating: 5.0,
        jobsCompleted: 0,
        assignedOrders: [],
      };
      updatedTechs = [...techs, newTech];
    }
    setTechs(updatedTechs);
    localStorage.setItem('urban_power_technicians_directory', JSON.stringify(updatedTechs));
    setOpenFormDialog(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (editingTech) {
      const updatedTechs = techs.filter(t => t.id !== editingTech.id);
      setTechs(updatedTechs);
      localStorage.setItem('urban_power_technicians_directory', JSON.stringify(updatedTechs));
      setOpenDeleteDialog(false);
    }
  };

  const handleToggleAvailability = (techId: string) => {
    const updatedTechs = techs.map(t => (t.id === techId ? { ...t, available: !t.available } : t));
    setTechs(updatedTechs);
    localStorage.setItem('urban_power_technicians_directory', JSON.stringify(updatedTechs));
  };




  // Tab 0 Filter logic
  const handleFilterChange = (filters: Record<string, any>) => {
    setActiveFilters(filters);
  };

  const filteredTechs = techs.filter(t => {
    const query = activeFilters.search || '';
    const matchesSearch =
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.area.toLowerCase().includes(query.toLowerCase()) ||
      t.service.toLowerCase().includes(query.toLowerCase());
    const matchesService =
      !activeFilters.service || t.service === activeFilters.service;
    return matchesSearch && matchesService;
  });

  // Assignments tab data: bookings that have a technician assigned
  const assignedBookings = allBookings.filter(b => {
    const parsed = parseBookingNotes(b.notes);
    return parsed.technician && parsed.technician !== 'None' && parsed.technician !== '';
  });

  const filteredAssignedBookings = allBookings.filter(b => {
    const parsed = parseBookingNotes(b.notes);
    const hasTech = parsed.technician && parsed.technician !== 'None' && parsed.technician !== '';

    // 1. Status Filter
    if (assignStatusFilter === 'assigned' && !hasTech) return false;
    if (assignStatusFilter === 'unassigned' && hasTech) return false;

    // 2. Technician Name filter
    if (assignFilterTech) {
      return parsed.technician.toLowerCase().includes(assignFilterTech.toLowerCase());
    }

    return true;
  });

  const handleOpenReassign = (booking: any) => {
    const parsed = parseBookingNotes(booking.notes);
    setReassignBooking(booking);
    setReassignTechName(parsed.technician !== 'None' ? parsed.technician : '');
    setOpenReassignDialog(true);
  };

  const handleConfirmReassign = async () => {
    if (!reassignBooking) return;
    try {
      await assignTechnician(
        reassignBooking.id || reassignBooking.booking_id,
        String(reassignBooking.user_id),
        reassignBooking.notes,
        reassignTechName,
        reassignBooking.status,
      );
      setSnackbar({ open: true, message: 'Technician assignment updated successfully.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to assign technician.', severity: 'error' });
    }
    setOpenReassignDialog(false);
  };

  // Table Column Definitions for Tab 0 (Directory)
  const columns: ColumnConfig<LocalTech>[] = [
    { id: 'id', label: 'Tech ID' },
    {
      id: 'name',
      label: 'Full Name',
      render: row => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' }
          }}
          onClick={() => handleOpenDetails(row)}
        >
          {row.name}
        </Typography>
      ),
    },
    { id: 'phone', label: 'Contact Phone' },
    {
      id: 'service',
      label: 'Assigned Service',
      render: row => (
        <Chip
          label={row.service}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor:
              row.service === 'Scrap'
                ? 'rgba(128, 90, 213, 0.15)'
                : row.service === 'Maintenance'
                  ? 'rgba(49, 151, 149, 0.15)'
                  : 'rgba(237, 100, 166, 0.15)',
            color:
              row.service === 'Scrap'
                ? '#805AD5'
                : row.service === 'Maintenance'
                  ? '#319795'
                  : '#ED64A6',
          }}
        />
      ),
    },
    { id: 'area', label: 'Service Areas' },
    {
      id: 'available',
      label: 'Availability',
      align: 'center',
      render: row => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <Switch
            checked={row.available}
            onChange={() => handleToggleAvailability(row.id)}
            color="primary"
            size="small"
          />
          <Typography
            variant="caption"
            sx={{
              color: row.available ? '#48BB78' : '#A0AEC0',
              fontWeight: 600,
            }}
          >
            {row.available ? 'Online' : 'Offline'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: row => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleOpenDetails(row)}
          >
            <ViewIcon fontSize="small" />
          </IconButton>
          <IconButton
            color="secondary"
            size="small"
            onClick={() => handleOpenEdit(row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleOpenDelete(row)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const filterFields: FilterField[] = [
    {
      id: 'service',
      label: 'Service Specialization',
      type: 'select',
      options: SERVICES.map(s => ({ value: s, label: s })),
    },
  ];

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
            Field Technicians & Staff
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage dispatchers, configure specialized services, allocate service
            zones, and toggle field availability.
          </Typography>
        </Box>
        {tabIndex === 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
          >
            Add Technician
          </Button>
        )}
      </Box>

      {/* Tabs Menu navigation */}
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        sx={{ borderBottom: '1px solid #E2E8F0', mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Directory" sx={{ fontWeight: 600 }} />
        <Tab
          label="Verification Queue"
          sx={{ fontWeight: 600 }}
        />
        <Tab label="Live Map Tracker" sx={{ fontWeight: 600 }} />
        <Tab label="Performance & Ratings" sx={{ fontWeight: 600 }} />
        <Tab
          label={`Assignments (${assignedBookings.length})`}
          sx={{ fontWeight: 600 }}
        />
      </Tabs>

      {/* Tab Panels */}
      {tabIndex === 0 && (
        <Box>
          {techLoading ? (
            <Box>
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} variant="rectangular" height={56} sx={{ borderRadius: 2, mb: 1.5 }} />
              ))}
            </Box>
          ) : (
            <>
              <FilterPanel
                fields={filterFields}
                onFilterChange={handleFilterChange}
              />
              <DataTable
                title="Technicians Directory"
                filename="technicians_directory"
                columns={columns}
                data={filteredTechs}
              />
            </>
          )}
        </Box>
      )}

      {tabIndex === 1 && (
        <Box>
          <Alert
            severity="warning"
            sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}
          >
            <strong>Pending Backend API</strong> — No technician document
            verification endpoint exists. A dedicated{' '}
            <code>GET /api/v1/technicians/verification-queue</code> API is
            required to populate this module.
          </Alert>
          <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <DocIcon sx={{ fontSize: 56, color: '#CBD5E0', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#4A5568', mb: 1 }}>
                Verification Queue — Awaiting Backend Integration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, mx: 'auto' }}>
                This section will show real document verification requests once
                the backend provides a verification queue API. No mock data is
                shown.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {tabIndex === 2 && (
        <Box>
          <Alert
            severity="warning"
            sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}
          >
            <strong>Pending Backend API</strong> — Live GPS tracking requires a
            real-time location data API (e.g.{' '}
            <code>GET /api/v1/technicians/locations</code>). No simulated
            coordinates are shown.
          </Alert>
          <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <MapIcon sx={{ fontSize: 56, color: '#CBD5E0', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#4A5568', mb: 1 }}>
                Live Map Tracker — Awaiting Backend Integration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, mx: 'auto' }}>
                Once a real-time location broadcast API is available, this panel
                will display live technician positions, battery status, and
                current task details. No mock location data is shown.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {tabIndex === 3 && (
        <Box>
          <Alert
            severity="warning"
            sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}
          >
            <strong>Pending Backend API</strong> — Technician ratings, completion
            rates, and customer feedback require a dedicated reviews / analytics
            API (e.g. <code>GET /api/v1/technicians/performance</code>).
          </Alert>

          {/* Real derived stats from booking data */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3.5, boxShadow: 'none' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary"
                    sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    Total Jobs Assigned
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>
                    {techs.reduce((sum, t) => sum + (t.jobsCompleted ?? 0), 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary"
                    sx={{ display: 'block', mt: 1 }}>
                    Derived from real booking assignments.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3.5, boxShadow: 'none' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary"
                    sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    Active Technicians
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>
                    {techs.filter(t => t.available).length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary"
                    sx={{ display: 'block', mt: 1 }}>
                    Currently available / online.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3.5, boxShadow: 'none' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary"
                    sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    Average Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>N/A</Typography>
                    <StarIcon sx={{ fontSize: 28, color: '#CBD5E0' }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary"
                    sx={{ display: 'block', mt: 1 }}>
                    Pending Backend API: no reviews endpoint.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={12}>
              <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3.5, boxShadow: 'none' }}>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <ThumbsIcon sx={{ fontSize: 48, color: '#CBD5E0', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#4A5568', mb: 1 }}>
                    Recent Reviews — Awaiting Backend Integration
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, mx: 'auto' }}>
                    Customer reviews and ratings will appear here once a{' '}
                    <code>GET /api/v1/reviews</code> API is available. No mock
                    review data is shown.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
      {tabIndex === 4 && (
        <Box>
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif', flexGrow: 1 }}>
              Technician Assignments
            </Typography>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="assign-status-filter-label">Assignment Status</InputLabel>
              <Select
                labelId="assign-status-filter-label"
                value={assignStatusFilter}
                label="Assignment Status"
                onChange={e => setAssignStatusFilter(e.target.value as any)}
              >
                <MenuItem value="all">All Bookings</MenuItem>
                <MenuItem value="assigned">Assigned Only</MenuItem>
                <MenuItem value="unassigned">Unassigned Only</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="Filter by technician name…"
              value={assignFilterTech}
              onChange={e => setAssignFilterTech(e.target.value)}
              sx={{ minWidth: 240 }}
            />
          </Box>

          {bookingsLoading ? (
            <Box>{[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height={56} sx={{ borderRadius: 2, mb: 1.5 }} />)}</Box>
          ) : filteredAssignedBookings.length === 0 ? (
            <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                <Typography color="text.secondary">
                  {assignFilterTech ? 'No assignments match that filter.' : 'No bookings found.'}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Booking Ref</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Assigned Technician</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Availability</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAssignedBookings.map(b => {
                    const parsed = parseBookingNotes(b.notes);
                    const hasTech = parsed.technician && parsed.technician !== 'None' && parsed.technician !== '';
                    const tech = hasTech ? techData.find(t => t.name.toLowerCase() === parsed.technician.toLowerCase()) : null;
                    const normalStatus = (b.status || '').toLowerCase();
                    const statusColors: Record<string, { bg: string; color: string }> = {
                      completed: { bg: 'rgba(72,187,120,0.15)', color: '#276749' },
                      pending: { bg: 'rgba(250,208,44,0.2)', color: '#B7791F' },
                      confirmed: { bg: 'rgba(66,153,225,0.15)', color: '#2B6CB0' },
                      assigned: { bg: 'rgba(66,153,225,0.15)', color: '#2B6CB0' },
                      in_progress: { bg: 'rgba(237,137,54,0.15)', color: '#DD6B20' },
                      cancelled: { bg: 'rgba(245,101,101,0.15)', color: '#9B2C2C' },
                    };
                    const sc = statusColors[normalStatus] || statusColors.pending;
                    return (
                      <TableRow key={b.id || b.booking_id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: 'primary.main',
                              cursor: 'pointer',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                            onClick={() => navigate(`/orders/${b.id || b.booking_id}`)}
                          >
                            {b.booking_reference || String(b.id).slice(0, 8).toUpperCase()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'inline-block', px: 1.5, py: 0.4, borderRadius: 2, fontSize: '0.72rem', fontWeight: 700, bgcolor: sc.bg, color: sc.color }}>
                            {normalStatus.replace('_', ' ')}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {new Date(b.booking_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell>
                          {hasTech ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 28, height: 28, bgcolor: '#2D3748', fontSize: '0.75rem' }}>
                                {parsed.technician.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{parsed.technician}</Typography>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 28, height: 28, bgcolor: '#E2E8F0', color: '#718096', fontSize: '0.75rem' }}>
                                ?
                              </Avatar>
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>Unassigned</Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          {hasTech && tech ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: tech.isAvailable ? '#48BB78' : '#E53E3E' }} />
                              <Typography variant="caption" sx={{ fontWeight: 600, color: tech.isAvailable ? '#276749' : '#9B2C2C' }}>
                                {tech.isAvailable ? 'Available' : 'Busy'}
                              </Typography>
                            </Box>
                          ) : <Typography variant="caption" color="text.secondary">—</Typography>}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant={hasTech ? "outlined" : "contained"}
                            color={hasTech ? "warning" : "primary"}
                            onClick={() => handleOpenReassign(b)}
                          >
                            {hasTech ? "Reassign" : "Assign"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Reassign Dialog */}
      <Dialog open={openReassignDialog} onClose={() => setOpenReassignDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}>
          {reassignBooking && parseBookingNotes(reassignBooking.notes).technician && parseBookingNotes(reassignBooking.notes).technician !== 'None' ? 'Reassign Technician' : 'Assign Technician'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Booking: <strong>{reassignBooking?.booking_reference || '—'}</strong>
          </Typography>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel id="reassign-tech-label">Select Technician</InputLabel>
            <Select
              labelId="reassign-tech-label"
              value={reassignTechName}
              label="Select Technician"
              onChange={e => setReassignTechName(e.target.value)}
            >
              <MenuItem value=""><em>Unassign / None</em></MenuItem>
              {techs.map(t => (
                <MenuItem key={t.name} value={t.name}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: t.available ? '#48BB78' : '#E53E3E' }} />
                    <Box sx={{ flexGrow: 1 }}>{t.name}</Box>
                    <Box component="span" sx={{ fontSize: '0.7rem', color: t.available ? '#276749' : '#9B2C2C' }}>
                      {t.available ? 'Available' : 'Busy'}
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenReassignDialog(false)} color="secondary">Cancel</Button>
          <Button
            onClick={handleConfirmReassign}
            variant="contained"
            color="primary"
            disabled={assignPending}
            startIcon={assignPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Technician Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif', pb: 1 }}>
          Technician Profile & Assigned Orders
        </DialogTitle>
        <DialogContent>
          {selectedTechForDetails && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              {/* Profile Card */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#F8FAFC', borderRadius: 3 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.25rem' }}>
                  {selectedTechForDetails.name.charAt(0)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {selectedTechForDetails.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedTechForDetails.phone} · {selectedTechForDetails.service} Specialization
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon sx={{ fontSize: 16, color: '#FAD02C' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>{selectedTechForDetails.rating}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">|</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{selectedTechForDetails.jobsCompleted} Jobs Completed</Typography>
                  </Box>
                </Box>
                <Chip
                  label={selectedTechForDetails.available ? 'Online' : 'Offline'}
                  color={selectedTechForDetails.available ? 'success' : 'default'}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {/* Service Areas */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Service Areas
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
                  {selectedTechForDetails.area || 'Service Area'}
                </Typography>
              </Box>

              {/* Assigned Orders Section */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                  Active Assigned Orders ({selectedTechForDetails.assignedOrders?.length || 0})
                </Typography>

                {!selectedTechForDetails.assignedOrders || selectedTechForDetails.assignedOrders.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No active bookings assigned to this technician.
                  </Typography>
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Booking Ref</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Service</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedTechForDetails.assignedOrders.map(order => {
                          const normalStatus = (order.status || '').toLowerCase();
                          const statusColors: Record<string, { bg: string; color: string }> = {
                            completed: { bg: 'rgba(72,187,120,0.15)', color: '#276749' },
                            pending: { bg: 'rgba(250,208,44,0.2)', color: '#B7791F' },
                            confirmed: { bg: 'rgba(66,153,225,0.15)', color: '#2B6CB0' },
                            assigned: { bg: 'rgba(66,153,225,0.15)', color: '#2B6CB0' },
                            in_progress: { bg: 'rgba(237,137,54,0.15)', color: '#DD6B20' },
                            cancelled: { bg: 'rgba(245,101,101,0.15)', color: '#9B2C2C' },
                          };
                          const sc = statusColors[normalStatus] || statusColors.pending;
                          return (
                            <TableRow key={order.bookingId} hover>
                              <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 700,
                                    color: 'primary.main',
                                    cursor: 'pointer',
                                    '&:hover': { textDecoration: 'underline' }
                                  }}
                                  onClick={() => {
                                    setOpenDetailsDialog(false);
                                    navigate(`/orders/${order.bookingId}`);
                                  }}
                                >
                                  {order.bookingReference}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.75rem' }}>{order.serviceName}</TableCell>
                              <TableCell sx={{ fontSize: '0.75rem' }}>
                                {new Date(order.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'inline-block', px: 1, py: 0.2, borderRadius: 1, fontSize: '0.65rem', fontWeight: 700, bgcolor: sc.bg, color: sc.color }}>
                                  {normalStatus.replace('_', ' ')}
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDetailsDialog(false)} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Add / Edit Technician Form Dialog */}
      <Dialog
        open={openFormDialog}
        onClose={() => setOpenFormDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
        >
          {editingTech
            ? 'Modify Technician Profile'
            : 'Register New Technician'}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1.5 }}
          >
            <TextField
              fullWidth
              size="small"
              label="Technician Name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
            />
            <TextField
              fullWidth
              size="small"
              label="Phone Number"
              value={phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPhone(e.target.value)
              }
            />
            <FormControl fullWidth size="small">
              <InputLabel id="service-select-label">
                Assign Service Specialization
              </InputLabel>
              <Select
                labelId="service-select-label"
                value={service}
                label="Assign Service Specialization"
                onChange={e => setService(e.target.value)}
              >
                {SERVICES.map(s => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="area-select-label">
                Select Service Areas
              </InputLabel>
              <Select
                labelId="area-select-label"
                multiple
                value={selectedAreas}
                label="Select Service Areas"
                onChange={e =>
                  setSelectedAreas(
                    typeof e.target.value === 'string'
                      ? e.target.value.split(',')
                      : e.target.value,
                  )
                }
                renderValue={selected => selected.join(', ')}
              >
                {SERVICE_AREAS.map(area => (
                  <MenuItem key={area} value={area}>
                    <Checkbox checked={selectedAreas.indexOf(area) > -1} />
                    <ListItemText primary={area} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={available}
                  onChange={e => setAvailable(e.target.checked)}
                  color="primary"
                />
              }
              label="Make Online Immediately"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenFormDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
        >
          De-register Technician
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to remove <strong>{editingTech?.name}</strong>{' '}
            from the database? This action cannot be undone.
          </Typography>
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

export default Technicians;
