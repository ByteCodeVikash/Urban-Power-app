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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as ApprovedIcon,
  Close as RejectedIcon,
  Map as MapIcon,
  Star as StarIcon,
  Description as DocIcon,
  CellTower as SpeedIcon,
  Battery90 as BatteryIcon,
  Navigation as NavIcon,
  ThumbsUpDown as ThumbsIcon,
} from '@mui/icons-material';
import { DataTable, type ColumnConfig } from '../components/common/DataTable';
import {
  FilterPanel,
  type FilterField,
} from '../components/common/FilterPanel';

// Initial Mock Technicians Data
const initialTechnicians = [
  {
    id: 'T-001',
    name: 'Ramesh Kumar',
    phone: '+91 98765 00001',
    service: 'Scrap',
    area: 'Green Glen Layout, HSR Layout',
    available: true,
    rating: 4.8,
    jobsCompleted: 142,
  },
  {
    id: 'T-002',
    name: 'Suman Lata',
    phone: '+91 98765 00002',
    service: 'Beautician',
    area: 'Gachibowli, Madhapur',
    available: true,
    rating: 4.9,
    jobsCompleted: 98,
  },
  {
    id: 'T-003',
    name: 'Vikram Singh',
    phone: '+91 98765 00003',
    service: 'Maintenance',
    area: 'Sector 7 Dwarka, Sector 12',
    available: false,
    rating: 4.2,
    jobsCompleted: 210,
  },
  {
    id: 'T-004',
    name: 'Anil Mehta',
    phone: '+91 98765 00004',
    service: 'Maintenance',
    area: 'Indiranagar, Koramangala',
    available: true,
    rating: 4.5,
    jobsCompleted: 85,
  },
];

const mockAreas = [
  'Green Glen Layout',
  'HSR Layout',
  'Gachibowli',
  'Madhapur',
  'Sector 7 Dwarka',
  'Sector 12 Dwarka',
  'Indiranagar',
  'Koramangala',
];
const mockServices = ['Scrap', 'Maintenance', 'Beautician'];

// Verification Queue Mock Data
const initialVerificationQueue = [
  {
    id: 'V-001',
    name: 'Rajesh Patil',
    phone: '+91 91234 11223',
    service: 'Maintenance',
    docType: 'Aadhar Card & Electrical License',
    docName: 'EE_License_Rajesh.pdf',
    status: 'Pending',
  },
  {
    id: 'V-002',
    name: 'Amit Solanki',
    phone: '+91 94567 44556',
    service: 'Scrap',
    docType: 'Pan Card & Driving License',
    docName: 'DL_Amit.pdf',
    status: 'Pending',
  },
];

// Live tracking simulated coordinates
const initialLiveTracking = [
  {
    id: 'T-001',
    name: 'Ramesh Kumar',
    lat: 12.9141,
    lng: 77.6413,
    status: 'Active (On The Way)',
    battery: '85%',
    speed: '24 km/h',
    currentOrder: 'ORD-103',
  },
  {
    id: 'T-002',
    name: 'Suman Lata',
    lat: 12.9082,
    lng: 77.6325,
    status: 'Idle (Available)',
    battery: '92%',
    speed: '0 km/h',
    currentOrder: 'None',
  },
  {
    id: 'T-004',
    name: 'Anil Mehta',
    lat: 12.9225,
    lng: 77.6508,
    status: 'Busy (Working)',
    battery: '45%',
    speed: '0 km/h',
    currentOrder: 'ORD-105',
  },
];

// Feedback reviews logs
const mockReviews = [
  {
    id: 'R-1',
    customer: 'Vikash Kumar',
    rating: 5,
    comment: 'Excellent behavior and clean work by Ramesh. Very professional!',
    technician: 'Ramesh Kumar',
    date: '2026-07-03',
  },
  {
    id: 'R-2',
    customer: 'Priya Singh',
    rating: 4,
    comment:
      'Suman Lata was punctual, though she could have finished 10 mins earlier.',
    technician: 'Suman Lata',
    date: '2026-07-02',
  },
  {
    id: 'R-3',
    customer: 'Amit Sharma',
    rating: 5,
    comment:
      'Vikram resolved a complex AC pipe leakage within an hour. Excellent!',
    technician: 'Vikram Singh',
    date: '2026-07-01',
  },
];

export const Technicians: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [techs, setTechs] = useState(initialTechnicians);
  const [verifyQueue, setVerifyQueue] = useState(initialVerificationQueue);

  // Filter state for Tab 0 Directory
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({
    search: '',
    service: '',
  });

  // Dialog States
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingTech, setEditingTech] = useState<
    (typeof initialTechnicians)[0] | null
  >(null);

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
  const handleOpenEdit = (tech: (typeof initialTechnicians)[0]) => {
    setEditingTech(tech);
    setName(tech.name);
    setPhone(tech.phone);
    setService(tech.service);
    setSelectedAreas(tech.area.split(', '));
    setAvailable(tech.available);
    setOpenFormDialog(true);
  };

  // Open Delete Dialog
  const handleOpenDelete = (tech: (typeof initialTechnicians)[0]) => {
    setEditingTech(tech);
    setOpenDeleteDialog(true);
  };

  // Save Add/Edit
  const handleSave = () => {
    if (editingTech) {
      setTechs(
        techs.map(t =>
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
        ),
      );
    } else {
      const newTech = {
        id: `T-00${techs.length + 1}`,
        name,
        phone,
        service,
        area: selectedAreas.join(', '),
        available,
        rating: 5.0,
        jobsCompleted: 0,
      };
      setTechs([...techs, newTech]);
    }
    setOpenFormDialog(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (editingTech) {
      setTechs(techs.filter(t => t.id !== editingTech.id));
      setOpenDeleteDialog(false);
    }
  };

  const handleToggleAvailability = (techId: string) => {
    setTechs(
      techs.map(t => (t.id === techId ? { ...t, available: !t.available } : t)),
    );
  };

  const handleApproveVerify = (
    id: string,
    nameStr: string,
    svc: string,
    ph: string,
  ) => {
    // Add verified tech to list
    const newTech = {
      id: `T-00${techs.length + 1}`,
      name: nameStr,
      phone: ph,
      service: svc,
      area: 'HSR Layout',
      available: true,
      rating: 5.0,
      jobsCompleted: 0,
    };
    setTechs([...techs, newTech]);
    setVerifyQueue(verifyQueue.filter(v => v.id !== id));
  };

  const handleRejectVerify = (id: string) => {
    setVerifyQueue(verifyQueue.filter(v => v.id !== id));
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

  // Table Column Definitions for Tab 0 (Directory)
  const columns: ColumnConfig<(typeof initialTechnicians)[0]>[] = [
    { id: 'id', label: 'Tech ID' },
    {
      id: 'name',
      label: 'Full Name',
      render: row => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
      options: mockServices.map(s => ({ value: s, label: s })),
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
      >
        <Tab label="Directory" sx={{ fontWeight: 600 }} />
        <Tab
          label={`Verification Queue (${verifyQueue.length})`}
          sx={{ fontWeight: 600 }}
        />
        <Tab label="Live Map Tracker" sx={{ fontWeight: 600 }} />
        <Tab label="Performance & Ratings" sx={{ fontWeight: 600 }} />
      </Tabs>

      {/* Tab Panels */}
      {tabIndex === 0 && (
        <Box>
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
        </Box>
      )}

      {tabIndex === 1 && (
        <Box>
          <Grid container spacing={3}>
            {verifyQueue.length === 0 ? (
              <Grid size={12}>
                <Card
                  sx={{
                    border: '1px solid #E2E8F0',
                    borderRadius: 3,
                    boxShadow: 'none',
                    textAlign: 'center',
                    py: 4,
                  }}
                >
                  <DocIcon sx={{ fontSize: 48, color: '#A0AEC0', mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    All document verifications are up to date! No pending
                    applications.
                  </Typography>
                </Card>
              </Grid>
            ) : (
              verifyQueue.map(item => (
                <Grid size={{ xs: 12, md: 6 }} key={item.id}>
                  <Card
                    sx={{
                      border: '1px solid #E2E8F0',
                      borderRadius: 3.5,
                      boxShadow: 'none',
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 2,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              fontFamily: '"Outfit", sans-serif',
                            }}
                          >
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.phone} | Specialization:{' '}
                            <strong>{item.service}</strong>
                          </Typography>
                        </Box>
                        <Chip
                          label="Pending Review"
                          color="warning"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                      <Divider sx={{ my: 1.5 }} />
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.5,
                          bgcolor: '#F8FAFC',
                          borderRadius: 2,
                          mb: 2,
                        }}
                      >
                        <DocIcon color="primary" />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: '#2D3748' }}
                          >
                            {item.docType}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            File: {item.docName}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant="text"
                          color="primary"
                          sx={{ fontWeight: 600 }}
                        >
                          View File
                        </Button>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: 1,
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<RejectedIcon />}
                          onClick={() => handleRejectVerify(item.id)}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<ApprovedIcon />}
                          onClick={() =>
                            handleApproveVerify(
                              item.id,
                              item.name,
                              item.service,
                              item.phone,
                            )
                          }
                        >
                          Approve & Activate
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}

      {tabIndex === 2 && (
        <Box>
          <Grid container spacing={3}>
            {/* Map Container Mock */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card
                sx={{
                  height: 480,
                  border: '1px solid #E2E8F0',
                  borderRadius: 3.5,
                  position: 'relative',
                  overflow: 'hidden',
                  bgcolor: '#E5E9F0',
                }}
              >
                {/* Simulated Grid Overlay representing Map Layout */}
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    background:
                      'radial-gradient(circle, #D3D8E2 10%, transparent 11%), radial-gradient(circle, #D3D8E2 10%, transparent 11%)',
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 12px 12px',
                    position: 'absolute',
                    opacity: 0.6,
                  }}
                />
                {/* Simulated Roads/Lanes */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: 16,
                    bgcolor: '#FFF',
                    top: '30%',
                    transform: 'rotate(-5deg)',
                    boxShadow: 1,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: 16,
                    bgcolor: '#FFF',
                    top: '65%',
                    transform: 'rotate(10deg)',
                    boxShadow: 1,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    width: 16,
                    height: '100%',
                    bgcolor: '#FFF',
                    left: '40%',
                    transform: 'rotate(15deg)',
                    boxShadow: 1,
                  }}
                />

                {/* Technician pins on Map */}
                {initialLiveTracking.map((tech, idx) => (
                  <Tooltip
                    key={tech.id}
                    title={`${tech.name} - ${tech.status}`}
                    arrow
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${20 + idx * 25}%`,
                        top: `${40 + (idx % 2) * 20}%`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: tech.status.includes('Active')
                            ? '#FAD02C'
                            : tech.status.includes('Busy')
                              ? '#E53E3E'
                              : '#48BB78',
                          color: '#1A202C',
                          width: 36,
                          height: 36,
                          border: '2px solid white',
                          boxShadow: 2,
                        }}
                      >
                        <NavIcon
                          sx={{ transform: 'rotate(45deg)', fontSize: 16 }}
                        />
                      </Avatar>
                      <Box
                        sx={{
                          bgcolor: 'rgba(26, 32, 44, 0.85)',
                          color: 'white',
                          px: 1,
                          py: 0.2,
                          borderRadius: 1,
                          mt: 0.5,
                          boxShadow: 1,
                        }}
                      >
                        <Typography
                          sx={{ fontSize: '0.65rem', fontWeight: 600 }}
                        >
                          {tech.name}
                        </Typography>
                      </Box>
                    </Box>
                  </Tooltip>
                ))}

                {/* Map HUD controller */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid #E2E8F0',
                    zIndex: 20,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                  >
                    MAP LEGEND:
                  </Typography>
                  <Box
                    sx={{ display: 'flex', gap: 1.5, flexDirection: 'column' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          bgcolor: '#FAD02C',
                          borderRadius: '50%',
                        }}
                      />
                      <Typography variant="caption">En-route order</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          bgcolor: '#E53E3E',
                          borderRadius: '50%',
                        }}
                      />
                      <Typography variant="caption">Active site job</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          bgcolor: '#48BB78',
                          borderRadius: '50%',
                        }}
                      />
                      <Typography variant="caption">Available</Typography>
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Grid>

            {/* Live Stats side panel */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card
                sx={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 3.5,
                  boxShadow: 'none',
                  height: 480,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
                  >
                    Live Field Roster
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Real-time battery metrics and speed data.
                  </Typography>
                </CardContent>
                <Divider />
                <Box sx={{ overflowY: 'auto', flexGrow: 1, p: 1.5 }}>
                  {initialLiveTracking.map(tech => (
                    <Box
                      key={tech.id}
                      sx={{
                        p: 1.5,
                        border: '1px solid #E2E8F0',
                        borderRadius: 2.5,
                        mb: 1.5,
                        '&:last-child': { mb: 0 },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700 }}
                        >
                          {tech.name}
                        </Typography>
                        <Chip
                          label={tech.status}
                          size="small"
                          sx={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            bgcolor: tech.status.includes('Active')
                              ? 'rgba(250, 208, 44, 0.2)'
                              : tech.status.includes('Busy')
                                ? 'rgba(245, 101, 101, 0.15)'
                                : 'rgba(72, 187, 120, 0.15)',
                            color: tech.status.includes('Active')
                              ? '#B7791F'
                              : tech.status.includes('Busy')
                                ? '#9B2C2C'
                                : '#276749',
                          }}
                        />
                      </Box>
                      <Grid container spacing={1}>
                        <Grid
                          size={6}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <BatteryIcon
                            sx={{ fontSize: 14, color: '#718096' }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Battery: {tech.battery}
                          </Typography>
                        </Grid>
                        <Grid
                          size={6}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <SpeedIcon sx={{ fontSize: 14, color: '#718096' }} />
                          <Typography variant="caption" color="text.secondary">
                            Speed: {tech.speed}
                          </Typography>
                        </Grid>
                        <Grid size={12} sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Current Task: <strong>{tech.currentOrder}</strong>
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {tabIndex === 3 && (
        <Box>
          <Grid container spacing={3}>
            {/* Stats Aggregates */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 3.5,
                  boxShadow: 'none',
                }}
              >
                <CardContent>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 700, textTransform: 'uppercase' }}
                  >
                    Average Rating
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>
                      4.65
                    </Typography>
                    <Box sx={{ color: '#FAD02C', display: 'flex' }}>
                      <StarIcon sx={{ fontSize: 28 }} />
                    </Box>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1 }}
                  >
                    Calculated over 535 reviews this month.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 3.5,
                  boxShadow: 'none',
                }}
              >
                <CardContent>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 700, textTransform: 'uppercase' }}
                  >
                    Job Completion Rate
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>
                    96.4%
                  </Typography>
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={96.4}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: '#E2E8F0',
                        '& .MuiLinearProgress-bar': { bgcolor: '#48BB78' },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 3.5,
                  boxShadow: 'none',
                }}
              >
                <CardContent>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 700, textTransform: 'uppercase' }}
                  >
                    Customer Satisfaction
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>
                    98.1%
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1.5 }}
                  >
                    Net positive feedback ratio.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Detailed logs */}
            <Grid size={12}>
              <Card
                sx={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 3.5,
                  boxShadow: 'none',
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      fontFamily: '"Outfit", sans-serif',
                    }}
                  >
                    Recent Client Reviews & Feedback
                  </Typography>
                  <List>
                    {mockReviews.map(rev => (
                      <Box key={rev.id}>
                        <ListItem alignItems="flex-start" sx={{ px: 0, py: 2 }}>
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor: '#FAD02C',
                                color: '#1A202C',
                                fontWeight: 600,
                              }}
                            >
                              {rev.customer.substring(0, 1)}
                            </Avatar>
                          </ListItemAvatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700 }}
                              >
                                {rev.customer}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {rev.date}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                my: 0.5,
                                color: '#FAD02C',
                              }}
                            >
                              {Array.from({ length: rev.rating }).map(
                                (_, i) => (
                                  <StarIcon key={i} sx={{ fontSize: 16 }} />
                                ),
                              )}
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontStyle: 'italic' }}
                            >
                              "{rev.comment}"
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                mt: 0.5,
                                color: '#718096',
                              }}
                            >
                              Technician: <strong>{rev.technician}</strong>
                            </Typography>
                          </Box>
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </Box>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

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
                {mockServices.map(s => (
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
                {mockAreas.map(area => (
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
