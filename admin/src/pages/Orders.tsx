import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Grid,
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
  TableSortLabel,
  TablePagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Engineering as AssignIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Sorting states
  const [orderBy, setOrderBy] = useState<'id' | 'customer' | 'type' | 'date' | 'amount' | 'status'>('date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Dialog management states
  const [selectedOrder, setSelectedOrder] = useState<typeof initialOrders[0] | null>(null);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [assignedTech, setAssignedTech] = useState('');
  const [orderStatus, setOrderStatus] = useState('');

  // Handle Search & Filter logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.phone.includes(search);
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const matchesType = typeFilter === 'All' || order.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleRequestSort = (property: 'id' | 'customer' | 'type' | 'date' | 'amount' | 'status') => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aVal: any = a[orderBy];
    let bVal: any = b[orderBy];

    if (orderBy === 'amount') {
      aVal = Number(a.amount.replace(/[^\d]/g, ''));
      bVal = Number(b.amount.replace(/[^\d]/g, ''));
    } else if (orderBy === 'customer') {
      aVal = a.customer.toLowerCase();
      bVal = b.customer.toLowerCase();
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

  const paginatedOrders = sortedOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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

      {/* Filters & Search Control Bar */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by Order ID, Customer, Phone..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                slotProps={{
                  input: {
                    startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status Filter"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                {mockStatuses.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Category Filter"
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
              >
                <MenuItem value="All">All Categories</MenuItem>
                <MenuItem value="Scrap">Scrap</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Beautician">Beautician</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearch('');
                  setStatusFilter('All');
                  setTypeFilter('All');
                  setPage(0);
                }}
                fullWidth
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Orders Data Grid Table */}
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
                  Order ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'customer'}
                  direction={orderBy === 'customer' ? order : 'asc'}
                  onClick={() => handleRequestSort('customer')}
                >
                  Customer Details
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'type'}
                  direction={orderBy === 'type' ? order : 'asc'}
                  onClick={() => handleRequestSort('type')}
                >
                  Service Category
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'date'}
                  direction={orderBy === 'date' ? order : 'asc'}
                  onClick={() => handleRequestSort('date')}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'amount'}
                  direction={orderBy === 'amount' ? order : 'asc'}
                  onClick={() => handleRequestSort('amount')}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
              <TableCell>Assigned Tech</TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => handleRequestSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{order.id}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {order.customer}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {order.phone}
                  </Typography>
                </TableCell>
                <TableCell>{order.type}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.amount}</TableCell>
                <TableCell>
                  {order.technician === 'None' ? (
                    <Button
                      size="small"
                      color="warning"
                      startIcon={<AssignIcon fontSize="inherit" />}
                      onClick={() => handleOpenAssign(order)}
                      sx={{ fontSize: '0.75rem', px: 1, py: 0.2 }}
                    >
                      Assign Tech
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2">{order.technician}</Typography>
                      <IconButton size="small" onClick={() => handleOpenAssign(order)}>
                        <EditIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      bgcolor:
                        order.status === 'Completed'
                          ? 'rgba(72, 187, 120, 0.15)'
                          : order.status === 'Pending'
                          ? 'rgba(250, 208, 44, 0.2)'
                          : order.status === 'Assigned'
                          ? 'rgba(66, 153, 225, 0.15)'
                          : order.status === 'In Progress'
                          ? 'rgba(237, 137, 54, 0.15)'
                          : 'rgba(245, 101, 101, 0.15)',
                      color:
                        order.status === 'Completed'
                          ? '#276749'
                          : order.status === 'Pending'
                          ? '#B7791F'
                          : order.status === 'Assigned'
                          ? '#2B6CB0'
                          : order.status === 'In Progress'
                          ? '#DD6B20'
                          : '#9B2C2C',
                    }}
                  >
                    {order.status}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <IconButton
                      color="secondary"
                      size="small"
                      onClick={() => handleOpenStatus(order)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {paginatedOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No orders matched your search criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

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
