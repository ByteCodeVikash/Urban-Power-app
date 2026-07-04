import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DeleteOutlined as ScrapIcon,
  SettingsSuggest as MaintenanceIcon,
  Face as BeauticianIcon,
} from '@mui/icons-material';

// Initial Mock Services Catalog
const initialServices = [
  // Scrap Services
  {
    id: 'S-001',
    name: 'Electronic Scrap Pick-up',
    category: 'Scrap',
    basePrice: '₹10/kg',
    description:
      'Computers, printers, keyboard, mouse, and old server hardware',
  },
  {
    id: 'S-002',
    name: 'Metal Scrap Pick-up',
    category: 'Scrap',
    basePrice: '₹15/kg',
    description:
      'Iron rods, copper wires, aluminium sheets, and domestic alloys',
  },
  {
    id: 'S-003',
    name: 'Cardboard & Paper Scrap',
    category: 'Scrap',
    basePrice: '₹6/kg',
    description: 'Office packaging boxes, old newspapers, and shred papers',
  },

  // Maintenance Services
  {
    id: 'S-101',
    name: 'AC Deep Cleaning',
    category: 'Maintenance',
    basePrice: '₹1,200',
    description:
      'High-pressure water cleaning of indoor unit filters and outdoor condenser check',
  },
  {
    id: 'S-102',
    name: 'Water Purifier Service',
    category: 'Maintenance',
    basePrice: '₹800',
    description: 'Filter inspection, RO membrane check, and water TDS testing',
  },
  {
    id: 'S-103',
    name: 'Refrigerator Repair',
    category: 'Maintenance',
    basePrice: '₹1,500',
    description:
      'Compressor health check, thermostat repairs, and coolant gas refilling',
  },

  // Beautician Services
  {
    id: 'S-201',
    name: 'Bridal Make-up Pack',
    category: 'Beautician',
    basePrice: '₹12,000',
    description:
      'HD makeup with premium cosmetics, hairstyling, and draping services',
  },
  {
    id: 'S-202',
    name: 'Facial & Skin Polish',
    category: 'Beautician',
    basePrice: '₹2,200',
    description: 'Deep exfoliation, herbal mask pack, and facial massage',
  },
  {
    id: 'S-203',
    name: 'Pedicure & Foot Reflexology',
    category: 'Beautician',
    basePrice: '₹1,000',
    description: 'Classic massage therapy, sanitization, and foot scrub',
  },
];

export const Services: React.FC = () => {
  const [services, setServices] = useState(initialServices);
  const [activeTab, setActiveTab] = useState(0);

  // Dialog States
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingService, setEditingService] = useState<
    (typeof initialServices)[0] | null
  >(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Scrap');
  const [basePrice, setBasePrice] = useState('');
  const [description, setDescription] = useState('');

  const tabsMapping = ['Scrap', 'Maintenance', 'Beautician'];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setName('');
    setCategory(tabsMapping[activeTab]);
    setBasePrice('');
    setDescription('');
    setOpenFormDialog(true);
  };

  const handleOpenEdit = (serviceItem: (typeof initialServices)[0]) => {
    setEditingService(serviceItem);
    setName(serviceItem.name);
    setCategory(serviceItem.category);
    setBasePrice(serviceItem.basePrice);
    setDescription(serviceItem.description);
    setOpenFormDialog(true);
  };

  const handleOpenDelete = (serviceItem: (typeof initialServices)[0]) => {
    setEditingService(serviceItem);
    setOpenDeleteDialog(true);
  };

  const handleSave = () => {
    if (editingService) {
      setServices(
        services.map(s =>
          s.id === editingService.id
            ? { ...s, name, category, basePrice, description }
            : s,
        ),
      );
    } else {
      const prefix =
        category === 'Scrap'
          ? 'S-0'
          : category === 'Maintenance'
            ? 'S-1'
            : 'S-2';
      const newService = {
        id: `${prefix}${services.length + 10}`,
        name,
        category,
        basePrice,
        description,
      };
      setServices([...services, newService]);
    }
    setOpenFormDialog(false);
  };

  const handleConfirmDelete = () => {
    if (editingService) {
      setServices(services.filter(s => s.id !== editingService.id));
      setOpenDeleteDialog(false);
    }
  };

  const currentCategory = tabsMapping[activeTab];
  const displayedServices = services.filter(
    s => s.category === currentCategory,
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
            Service Catalog Catalog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure, add, or edit available services offered by Urban Power.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
        >
          Add Service
        </Button>
      </Box>

      {/* Tab Selectors */}
      <Paper
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            '& .MuiTab-root': {
              fontSize: '1rem',
              fontWeight: 600,
              minHeight: 56,
            },
          }}
        >
          <Tab
            icon={<ScrapIcon />}
            iconPosition="start"
            label="Scrap Management"
          />
          <Tab
            icon={<MaintenanceIcon />}
            iconPosition="start"
            label="Maintenance & Repairs"
          />
          <Tab
            icon={<BeauticianIcon />}
            iconPosition="start"
            label="Beautician & Salon"
          />
        </Tabs>
      </Paper>

      {/* Service Table Grid */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: '1px solid #E2E8F0' }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Service ID</TableCell>
              <TableCell>Service Name</TableCell>
              <TableCell>Base Pricing Structure</TableCell>
              <TableCell>Description Scope</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedServices.map(serviceItem => (
              <TableRow key={serviceItem.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{serviceItem.id}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {serviceItem.name}
                </TableCell>
                <TableCell sx={{ color: '#C29D0A', fontWeight: 700 }}>
                  {serviceItem.basePrice}
                </TableCell>
                <TableCell sx={{ maxWidth: 300 }}>
                  {serviceItem.description}
                </TableCell>
                <TableCell align="right">
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 0.5,
                    }}
                  >
                    <IconButton
                      color="secondary"
                      size="small"
                      onClick={() => handleOpenEdit(serviceItem)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleOpenDelete(serviceItem)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {displayedServices.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No services configured in this category yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create / Edit Service Dialog */}
      <Dialog
        open={openFormDialog}
        onClose={() => setOpenFormDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
        >
          {editingService ? 'Modify Service Details' : 'Introduce New Service'}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1.5 }}
          >
            <TextField
              fullWidth
              size="small"
              label="Service Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <TextField
              select
              fullWidth
              size="small"
              label="Category"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {tabsMapping.map(cat => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              size="small"
              label="Base Pricing (e.g. ₹500 or ₹10/kg)"
              value={basePrice}
              onChange={e => setBasePrice(e.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              label="Service Description Details"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenFormDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save Service
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
        >
          Remove Service Item
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete the service{' '}
            <strong>{editingService?.name}</strong>? This will remove it from
            the mobile app catalog.
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
export default Services;
