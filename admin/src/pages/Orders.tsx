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
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Engineering as AssignIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DataTable, type ColumnConfig } from '../components/common/DataTable';
import { FilterPanel, type FilterField } from '../components/common/FilterPanel';

// Mock list of orders
const initialOrders = [
  { id: 'ORD-101', customer: 'Vikash Kumar', phone: '+91 98765 43210', type: 'Scrap', amount: '₹1,200', status: 'Completed', technician: 'Ramesh Kumar', date: '2026-07-03' },
  { id: 'ORD-102', customer: 'Amit Sharma', phone: '+91 98765 12345', type: 'Maintenance', amount: '₹2,500', status: 'Pending', technician: 'None', date: '2026-07-03' },
  { id: 'ORD-103', customer: 'Priya Singh', phone: '+91 91234 56789', type: 'Beautician', amount: '₹1,800', status: 'Assigned', technician: 'Suman Lata', date: '2026-07-03' },
  { id: 'ORD-104', customer: 'Rohan Verma', phone: '+91 99988 77766', type: 'Scrap', amount: '₹800', status: 'Cancelled', technician: 'None', date: '2026-07-02' },
  { id: 'ORD-105', customer: 'Sneha Gupta', phone: '+91 92233 44556', type: 'Maintenance', amount: '₹4,200', status: 'Completed', technician: 'Vikram Singh', date: '2026-07-01' },
  { id: 'ORD-106', customer: 'Kunal Sen', phone: '+91 93344 55667', type: 'Beautician', amount: '₹950', status: 'Pending', technician: 'None', date: '2026-06-30' },
];

const mockTechnicians = [
  { id: 'T-1', name: 'Ramesh Kumar', service: 'Scrap' },
  { id: 'T-2', name: 'Suman Lata', service: 'Beautician' },
  { id: 'T-3', name: 'Vikram Singh', service: 'Maintenance' },
  { id: 'T-4', name: 'Anil Mehta', service: 'Maintenance' },
];

const mockStatuses = ['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'];

export const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(initialOrders);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({
    search: '',
    status: '',
    type: '',
  });

  // Dialog management states
  const [selectedOrder, setSelectedOrder] = useState<typeof initialOrders[0] | null>(null);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [assignedTech, setAssignedTech] = useState('');
  const [orderStatus, setOrderStatus] = useState('');

  // Handle Search & Filter logic
  const handleFilterChange = (filters: Record<string, any>) => {
    setActiveFilters(filters);
  };

  const filteredOrders = orders.filter((order) => {
    const searchStr = activeFilters.search || '';
    const matchesSearch =
      order.customer.toLowerCase().includes(searchStr.toLowerCase()) ||
      order.id.toLowerCase().includes(searchStr.toLowerCase()) ||
      order.phone.includes(searchStr);
    
    const matchesStatus = !activeFilters.status || order.status === activeFilters.status;
    const matchesType = !activeFilters.type || order.type === activeFilters.type;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleOpenAssign = (order: typeof initialOrders[0]) => {
    setSelectedOrder(order);
    setAssignedTech(order.technician === 'None' ? '' : order.technician);
    setOpenAssignDialog(true);
  };

  const handleOpenStatus = (order: typeof initialOrders[0]) => {
    setSelectedOrder(order);
    setOrderStatus(order.status);
    setOpenStatusDialog(true);
  };

  const handleSaveAssign = () => {
    if (selectedOrder) {
      setOrders(
        orders.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, technician: assignedTech || 'None', status: assignedTech ? 'Assigned' : o.status }
            : o
        )
      );
      setOpenAssignDialog(false);
    }
  };

  const handleSaveStatus = () => {
    if (selectedOrder) {
      setOrders(
        orders.map((o) => (o.id === selectedOrder.id ? { ...o, status: orderStatus } : o))
      );
      setOpenStatusDialog(false);
    }
  };

  // Define column configuration for DataTable
  const columns: ColumnConfig<typeof initialOrders[0]>[] = [
    { id: 'id', label: 'Order ID' },
    {
      id: 'customer',
      label: 'Customer Details',
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.customer}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.phone}
          </Typography>
        </Box>
      ),
    },
    { id: 'type', label: 'Service Category' },
    { id: 'date', label: 'Date' },
    { id: 'amount', label: 'Amount' },
    {
      id: 'technician',
      label: 'Assigned Tech',
      render: (row) => (
        <Box>
          {row.technician === 'None' ? (
            <Button
              size="small"
              color="warning"
              variant="outlined"
              startIcon={<AssignIcon fontSize="inherit" />}
              onClick={() => handleOpenAssign(row)}
              sx={{ fontSize: '0.75rem', px: 1, py: 0.2 }}
            >
              Assign Tech
            </Button>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2">{row.technician}</Typography>
              <IconButton size="small" onClick={() => handleOpenAssign(row)}>
                <EditIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      render: (row) => (
        <Box
          sx={{
            display: 'inline-block',
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            fontSize: '0.75rem',
            fontWeight: 700,
            bgcolor:
              row.status === 'Completed'
                ? 'rgba(72, 187, 120, 0.15)'
                : row.status === 'Pending'
                ? 'rgba(250, 208, 44, 0.2)'
                : row.status === 'Assigned'
                ? 'rgba(66, 153, 225, 0.15)'
                : row.status === 'In Progress'
                ? 'rgba(237, 137, 54, 0.15)'
                : 'rgba(245, 101, 101, 0.15)',
            color:
              row.status === 'Completed'
                ? '#276749'
                : row.status === 'Pending'
                ? '#B7791F'
                : row.status === 'Assigned'
                ? '#2B6CB0'
                : row.status === 'In Progress'
                ? '#DD6B20'
                : '#9B2C2C',
          }}
        >
          {row.status}
        </Box>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <IconButton color="secondary" size="small" onClick={() => handleOpenStatus(row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton color="primary" size="small" onClick={() => navigate(`/orders/${row.id}`)}>
            <ViewIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Define filter fields for FilterPanel
  const filterFields: FilterField[] = [
    {
      id: 'status',
      label: 'Status Filter',
      type: 'select',
      options: mockStatuses.map((s) => ({ value: s, label: s })),
    },
    {
      id: 'type',
      label: 'Category Filter',
      type: 'select',
      options: [
        { value: 'Scrap', label: 'Scrap' },
        { value: 'Maintenance', label: 'Maintenance' },
        { value: 'Beautician', label: 'Beautician' },
      ],
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', color: '#1A202C' }}>
          Manage Bookings & Orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track and dispatch orders, filter statuses, and coordinate service technicians.
        </Typography>
      </Box>

      {/* Unified Filter Panel */}
      <FilterPanel fields={filterFields} onFilterChange={handleFilterChange} />

      {/* Orders DataTable */}
      <DataTable
        title="Bookings & Orders"
        filename="bookings_report"
        columns={columns}
        data={filteredOrders}
        emptyMessage="No orders found matching search filters."
      />

      {/* Assign Technician Dialog */}
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}>
          Assign Dispatch Technician
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Assign a field professional to service order <strong>{selectedOrder?.id}</strong> ({selectedOrder?.type}).
          </Typography>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel id="assign-tech-label">Select Technician</InputLabel>
            <Select
              labelId="assign-tech-label"
              id="assign-tech"
              value={assignedTech}
              label="Select Technician"
              onChange={(e) => setAssignedTech(e.target.value)}
            >
              <MenuItem value=""><em>Unassigned / Remove</em></MenuItem>
              {mockTechnicians
                .filter((t) => selectedOrder === null || t.service === selectedOrder.type)
                .map((t) => (
                  <MenuItem key={t.id} value={t.name}>
                    {t.name} (Specialist)
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenAssignDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveAssign} variant="contained" color="primary">
            Confirm Assignment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}>
          Change Order Status
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set operations status for order <strong>{selectedOrder?.id}</strong>.
          </Typography>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel id="status-label">Select Status</InputLabel>
            <Select
              labelId="status-label"
              value={orderStatus}
              label="Select Status"
              onChange={(e) => setOrderStatus(e.target.value)}
            >
              {mockStatuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenStatusDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveStatus} variant="contained" color="primary">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;
