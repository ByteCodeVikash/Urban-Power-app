import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  FormControlLabel,
  Switch,
  TableSortLabel,
  TablePagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

// Initial Mock Technicians Data
const initialTechnicians = [
  { id: 'T-001', name: 'Ramesh Kumar', phone: '+91 98765 00001', service: 'Scrap', area: 'Green Glen Layout, HSR Layout', available: true },
  { id: 'T-002', name: 'Suman Lata', phone: '+91 98765 00002', service: 'Beautician', area: 'Gachibowli, Madhapur', available: true },
  { id: 'T-003', name: 'Vikram Singh', phone: '+91 98765 00003', service: 'Maintenance', area: 'Sector 7 Dwarka, Sector 12', available: false },
  { id: 'T-004', name: 'Anil Mehta', phone: '+91 98765 00004', service: 'Maintenance', area: 'Indiranagar, Koramangala', available: true },
];

const mockAreas = ['Green Glen Layout', 'HSR Layout', 'Gachibowli', 'Madhapur', 'Sector 7 Dwarka', 'Sector 12 Dwarka', 'Indiranagar', 'Koramangala'];
const mockServices = ['Scrap', 'Maintenance', 'Beautician'];

export const Technicians: React.FC = () => {
  const [techs, setTechs] = useState(initialTechnicians);
  const [search, setSearch] = useState('');

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Sorting states
  const [orderBy, setOrderBy] = useState<'id' | 'name' | 'service' | 'available'>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  
  // Dialog States
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingTech, setEditingTech] = useState<typeof initialTechnicians[0] | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [available, setAvailable] = useState(true);

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
  const handleOpenEdit = (tech: typeof initialTechnicians[0]) => {
    setEditingTech(tech);
    setName(tech.name);
    setPhone(tech.phone);
    setService(tech.service);
    setSelectedAreas(tech.area.split(', '));
    setAvailable(tech.available);
    setOpenFormDialog(true);
  };

  // Open Delete Dialog
  const handleOpenDelete = (tech: typeof initialTechnicians[0]) => {
    setEditingTech(tech);
    setOpenDeleteDialog(true);
  };

  // Save Add/Edit
  const handleSave = () => {
    if (editingTech) {
      // Edit mode
      setTechs(
        techs.map((t) =>
          t.id === editingTech.id
            ? { ...t, name, phone, service, area: selectedAreas.join(', '), available }
            : t
        )
      );
    } else {
      // Add mode
      const newTech = {
        id: `T-00${techs.length + 1}`,
        name,
        phone,
        service,
        area: selectedAreas.join(', '),
        available,
      };
      setTechs([...techs, newTech]);
    }
    setOpenFormDialog(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (editingTech) {
      setTechs(techs.filter((t) => t.id !== editingTech.id));
      setOpenDeleteDialog(false);
    }
  };

  const handleToggleAvailability = (techId: string) => {
    setTechs(techs.map((t) => (t.id === techId ? { ...t, available: !t.available } : t)));
  };

  // Search Filter
  const filteredTechs = techs.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.area.toLowerCase().includes(search.toLowerCase()) ||
      t.service.toLowerCase().includes(search.toLowerCase())
  );

  const handleRequestSort = (property: 'id' | 'name' | 'service' | 'available') => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  const sortedTechs = [...filteredTechs].sort((a, b) => {
    let aVal: any = a[orderBy];
    let bVal: any = b[orderBy];

    if (orderBy === 'available') {
      aVal = a.available ? 1 : 0;
      bVal = b.available ? 1 : 0;
    } else {
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
    }

    if (aVal < bVal) {
      return order === 'asc' ? -1 : 1;
    }
    if (aVal > bVal) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const paginatedTechs = sortedTechs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', color: '#1A202C' }}>
            Field Technicians & Staff
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage dispatchers, configure specialized services, allocate service zones, and toggle field availability.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
          Add Technician
        </Button>
      </Box>

      {/* Search Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by Name, Service, or Area..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                slotProps={{
                  input: {
                    startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                  },
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Technician Listing Grid */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'id'}
                  direction={orderBy === 'id' ? order : 'asc'}
                  onClick={() => handleRequestSort('id')}
                >
                  Tech ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                >
                  Full Name
                </TableSortLabel>
              </TableCell>
              <TableCell>Contact Phone</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'service'}
                  direction={orderBy === 'service' ? order : 'asc'}
                  onClick={() => handleRequestSort('service')}
                >
                  Assigned Service
                </TableSortLabel>
              </TableCell>
              <TableCell>Service Areas</TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={orderBy === 'available'}
                  direction={orderBy === 'available' ? order : 'asc'}
                  onClick={() => handleRequestSort('available')}
                >
                  Availability
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTechs.map((tech) => (
              <TableRow key={tech.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{tech.id}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{tech.name}</TableCell>
                <TableCell>{tech.phone}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1.5,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      bgcolor:
                        tech.service === 'Scrap'
                          ? 'rgba(128, 90, 213, 0.15)'
                          : tech.service === 'Maintenance'
                          ? 'rgba(49, 151, 149, 0.15)'
                          : 'rgba(237, 100, 166, 0.15)',
                      color:
                        tech.service === 'Scrap'
                          ? '#805AD5'
                          : tech.service === 'Maintenance'
                          ? '#319795'
                          : '#ED64A6',
                    }}
                  >
                    {tech.service}
                  </Box>
                </TableCell>
                <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tech.area}
                </TableCell>
                <TableCell align="center">
                  <Switch
                    checked={tech.available}
                    onChange={() => handleToggleAvailability(tech.id)}
                    color="primary"
                    size="small"
                  />
                  <span style={{ fontSize: '0.75rem', marginLeft: 4, color: tech.available ? '#48BB78' : '#A0AEC0' }}>
                    {tech.available ? 'Online' : 'Offline'}
                  </span>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <IconButton color="secondary" size="small" onClick={() => handleOpenEdit(tech)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => handleOpenDelete(tech)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {paginatedTechs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No technicians found matching that query.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTechs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Add / Edit Technician Form Dialog */}
      <Dialog open={openFormDialog} onClose={() => setOpenFormDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}>
          {editingTech ? 'Modify Technician Profile' : 'Register New Technician'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              label="Technician Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <FormControl fullWidth size="small">
              <InputLabel id="service-select-label">Assign Service Specialization</InputLabel>
              <Select
                labelId="service-select-label"
                value={service}
                label="Assign Service Specialization"
                onChange={(e) => setService(e.target.value)}
              >
                {mockServices.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="area-select-label">Select Service Areas</InputLabel>
              <Select
                labelId="area-select-label"
                multiple
                value={selectedAreas}
                label="Select Service Areas"
                onChange={(e) => setSelectedAreas(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                renderValue={(selected) => selected.join(', ')}
              >
                {mockAreas.map((area) => (
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
                  onChange={(e) => setAvailable(e.target.checked)}
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
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}>
          De-register Technician
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to remove <strong>{editingTech?.name}</strong> from the database? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default Technicians;
