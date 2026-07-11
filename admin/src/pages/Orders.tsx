import React, { useState, useCallback } from 'react';
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
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  Pagination,
  Stack,
  Skeleton,
  Tooltip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DataTable, type ColumnConfig } from '../components/common/DataTable';
import {
  useAdminOrders,
  useAdminOrderStatusUpdate,
} from '../hooks/useAdminOrders';
import type {
  AdminOrderItem,
  AdminOrderFilters,
} from '../api/adminOrderService';

// ─── Status constants ─────────────────────────────────────────────────────────

const ADMIN_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'technician_on_the_way', label: 'Technician On The Way' },
  { value: 'reached', label: 'Reached' },
  { value: 'work_started', label: 'Work Started' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refund_requested', label: 'Refund Requested' },
  { value: 'refunded', label: 'Refunded' },
];

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  confirmed: 'Confirmed',
  assigned: 'Assigned',
  technician_on_the_way: 'On The Way',
  reached: 'Reached',
  work_started: 'Work Started',
  in_progress: 'In Progress',
  requested: 'Requested',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refund_requested: 'Refund Requested',
  refunded: 'Refunded',
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  completed: { bg: 'rgba(72, 187, 120, 0.15)', color: '#276749' },
  pending: { bg: 'rgba(250, 208, 44, 0.2)', color: '#B7791F' },
  requested: { bg: 'rgba(250, 208, 44, 0.2)', color: '#B7791F' },
  confirmed: { bg: 'rgba(66, 153, 225, 0.15)', color: '#2B6CB0' },
  accepted: { bg: 'rgba(66, 153, 225, 0.15)', color: '#2B6CB0' },
  assigned: { bg: 'rgba(102, 126, 234, 0.15)', color: '#553C9A' },
  technician_on_the_way: { bg: 'rgba(159, 122, 234, 0.15)', color: '#6B46C1' },
  reached: { bg: 'rgba(159, 122, 234, 0.15)', color: '#6B46C1' },
  work_started: { bg: 'rgba(237, 137, 54, 0.15)', color: '#DD6B20' },
  in_progress: { bg: 'rgba(237, 137, 54, 0.15)', color: '#DD6B20' },
  cancelled: { bg: 'rgba(245, 101, 101, 0.15)', color: '#9B2C2C' },
  refund_requested: { bg: 'rgba(245, 101, 101, 0.1)', color: '#9B2C2C' },
  refunded: { bg: 'rgba(160, 174, 192, 0.15)', color: '#4A5568' },
};

const BOOKING_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  beautician: { bg: 'rgba(233, 30, 99, 0.12)', color: '#C2185B' },
  scrap: { bg: 'rgba(76, 175, 80, 0.12)', color: '#2E7D32' },
  maintenance: { bg: 'rgba(33, 150, 243, 0.12)', color: '#1565C0' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const key = status?.toLowerCase() || 'pending';
  const colors = STATUS_COLORS[key] || STATUS_COLORS.pending;
  return (
    <Box
      sx={{
        display: 'inline-block',
        px: 1.5,
        py: 0.5,
        borderRadius: 2,
        fontSize: '0.72rem',
        fontWeight: 700,
        bgcolor: colors.bg,
        color: colors.color,
        whiteSpace: 'nowrap',
      }}
    >
      {STATUS_LABEL[key] || status}
    </Box>
  );
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

// ─── Main component ───────────────────────────────────────────────────────────

export const Orders: React.FC = () => {
  const navigate = useNavigate();

  // ── Pagination state ──────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // ── Filter state ──────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Build query filters
  const filters: AdminOrderFilters = {
    page,
    page_size: PAGE_SIZE,
    ...(filterStatus && { status: filterStatus }),
    ...(filterType && { booking_type: filterType }),
    ...(searchApplied && { search: searchApplied }),
    ...(filterDateFrom && { date_from: filterDateFrom }),
    ...(filterDateTo && { date_to: filterDateTo }),
  };

  const { data, isLoading, isError, refetch, isFetching } =
    useAdminOrders(filters);
  const updateStatusMutation = useAdminOrderStatusUpdate();

  const orders = data?.items || [];
  const totalPages = data?.total_pages || 1;
  const total = data?.total || 0;

  // ── Status update dialog ─────────────────────────────────────────────────
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderItem | null>(
    null,
  );
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenStatus = (order: AdminOrderItem) => {
    setSelectedOrder(order);
    setOrderStatus(order.status?.toLowerCase() || 'pending');
    setOpenStatusDialog(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;
    try {
      await updateStatusMutation.mutateAsync({
        bookingType: selectedOrder.booking_type,
        bookingId: selectedOrder.booking_id,
        payload: { status: orderStatus },
      });
      showSnackbar('Booking status updated successfully.', 'success');
    } catch {
      showSnackbar('Failed to update booking status.', 'error');
    }
    setOpenStatusDialog(false);
  };

  const handleSearch = useCallback(() => {
    setSearchApplied(searchInput);
    setPage(1);
  }, [searchInput]);

  const handleFilterChange = useCallback(() => {
    setPage(1);
  }, []);

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchApplied('');
    setFilterStatus('');
    setFilterType('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setPage(1);
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns: ColumnConfig<AdminOrderItem>[] = [
    {
      id: 'booking_reference',
      label: 'Order ID',
      render: row => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            fontFamily: 'monospace',
            color: '#553C9A',
            fontSize: '0.8rem',
          }}
        >
          {row.booking_reference}
        </Typography>
      ),
    },
    {
      id: 'customer_name',
      label: 'Customer',
      render: row => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.customer_name || '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.customer_phone || '—'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'booking_type',
      label: 'Type',
      render: row => {
        const colors =
          BOOKING_TYPE_COLORS[row.booking_type] ||
          BOOKING_TYPE_COLORS.beautician;
        return (
          <Chip
            label={
              row.booking_type.charAt(0).toUpperCase() +
              row.booking_type.slice(1)
            }
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: colors.bg,
              color: colors.color,
              fontSize: '0.72rem',
            }}
          />
        );
      },
    },
    {
      id: 'service_name',
      label: 'Service',
      render: row => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {row.service_name || '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.category || '—'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'address',
      label: 'Address',
      render: row => (
        <Tooltip title={row.address || 'No address'} arrow enterDelay={200}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              maxWidth: 240,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'normal',
              cursor: 'pointer',
            }}
          >
            {row.address || 'No address'}
          </Typography>
        </Tooltip>
      ),
    },
    {
      id: 'price',
      label: 'Amount',
      render: row => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#2B6CB0' }}>
          ₹{Number(row.price || 0).toLocaleString('en-IN')}
        </Typography>
      ),
    },
    {
      id: 'booking_date',
      label: 'Booking Date',
      render: row => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: '0.8rem' }}
        >
          {row.booking_date ? formatDate(row.booking_date) : '—'}
        </Typography>
      ),
    },
    {
      id: 'preferred_time',
      label: 'Preferred Time',
      render: row => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: '0.8rem' }}
        >
          {row.preferred_time || '—'}
        </Typography>
      ),
    },
    {
      id: 'created_at',
      label: 'Created Time',
      render: row => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: '0.8rem' }}
        >
          {formatDate(row.created_at)}
        </Typography>
      ),
    },
    {
      id: 'assigned_technician',
      label: 'Technician',
      render: row => (
        <Typography
          variant="body2"
          sx={{ color: row.assigned_technician ? '#2D3748' : '#A0AEC0' }}
        >
          {row.assigned_technician || 'Unassigned'}
        </Typography>
      ),
    },
    {
      id: 'payment_status',
      label: 'Payment Status',
      render: row => {
        const payStatus = row.payment_status?.toLowerCase() || 'pending';
        const colors =
          payStatus === 'completed' || payStatus === 'settled'
            ? { bg: 'rgba(72, 187, 120, 0.15)', color: '#276749' }
            : payStatus === 'refunded'
              ? { bg: 'rgba(160, 174, 192, 0.15)', color: '#4A5568' }
              : { bg: 'rgba(250, 208, 44, 0.2)', color: '#B7791F' };
        return (
          <Box
            sx={{
              display: 'inline-block',
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              fontSize: '0.72rem',
              fontWeight: 700,
              bgcolor: colors.bg,
              color: colors.color,
              whiteSpace: 'nowrap',
            }}
          >
            {row.payment_status ? row.payment_status.toUpperCase() : 'PENDING'}
          </Box>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      render: row => <StatusBadge status={row.status} />,
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
            title="Update Status"
            onClick={() => handleOpenStatus(row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            color="primary"
            size="small"
            title="View Details"
            onClick={() =>
              navigate(`/orders/${row.booking_type}/${row.booking_id}`)
            }
          >
            <ViewIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // ── Error state ───────────────────────────────────────────────────────────
  if (isError) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Alert
          severity="error"
          sx={{ mt: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Failed to load bookings from server. Please check backend connectivity
          and try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontFamily: '"Outfit", sans-serif',
            color: '#1A202C',
          }}
        >
          Manage Bookings & Orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track and manage all customer bookings — Beautician, Scrap,
          Maintenance.
          {!isLoading && !isFetching && (
            <strong style={{ color: '#553C9A', marginLeft: 8 }}>
              {total} total booking{total !== 1 ? 's' : ''}
            </strong>
          )}
        </Typography>
      </Box>

      {/* Filters */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          mb: 3,
          p: 2,
          bgcolor: '#F7FAFC',
          borderRadius: 3,
          border: '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        {/* Search */}
        <TextField
          placeholder="Search reference, name, phone..."
          size="small"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          sx={{ minWidth: 260, bgcolor: 'white', borderRadius: 2 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#A0AEC0', fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: searchInput && (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    onClick={handleSearch}
                    sx={{ minWidth: 'unset', px: 1 }}
                  >
                    Go
                  </Button>
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Booking Type */}
        <FormControl
          size="small"
          sx={{ minWidth: 150, bgcolor: 'white', borderRadius: 2 }}
        >
          <InputLabel>Booking Type</InputLabel>
          <Select
            value={filterType}
            label="Booking Type"
            onChange={e => {
              setFilterType(e.target.value);
              handleFilterChange();
            }}
          >
            <MenuItem value="">
              <em>All Types</em>
            </MenuItem>
            <MenuItem value="beautician">Beautician</MenuItem>
            <MenuItem value="scrap">Scrap</MenuItem>
            <MenuItem value="maintenance">Maintenance</MenuItem>
          </Select>
        </FormControl>

        {/* Status */}
        <FormControl
          size="small"
          sx={{ minWidth: 160, bgcolor: 'white', borderRadius: 2 }}
        >
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={e => {
              setFilterStatus(e.target.value);
              handleFilterChange();
            }}
          >
            <MenuItem value="">
              <em>All Statuses</em>
            </MenuItem>
            {ADMIN_STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Date From */}
        <TextField
          label="From Date"
          type="date"
          size="small"
          value={filterDateFrom}
          onChange={e => {
            setFilterDateFrom(e.target.value);
            handleFilterChange();
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 150, bgcolor: 'white', borderRadius: 2 }}
        />

        {/* Date To */}
        <TextField
          label="To Date"
          type="date"
          size="small"
          value={filterDateTo}
          onChange={e => {
            setFilterDateTo(e.target.value);
            handleFilterChange();
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 150, bgcolor: 'white', borderRadius: 2 }}
        />

        {/* Refresh + Clear */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 'auto' }}>
          {isFetching && <CircularProgress size={16} />}
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Refresh
          </Button>
          <Button
            size="small"
            variant="text"
            color="secondary"
            onClick={handleClearFilters}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Clear
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <Box
        sx={{
          width: '100%',
          overflow: 'hidden',
          '& .MuiTableContainer-root': {
            overflowX: 'auto !important',
          },
          '& .MuiTable-root': {
            minWidth: '1600px !important',
          },
        }}
      >
        <DataTable
          title="Bookings & Orders"
          filename="bookings_report"
          columns={columns}
          data={orders}
          isLoading={isLoading}
          emptyMessage="No orders found. Adjust your filters or check backend connectivity."
        />
      </Box>

      {/* Pagination */}
      {!isLoading && total > PAGE_SIZE && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 3,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, val) => setPage(val)}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Page {page} of {totalPages} · {total} total records
          </Typography>
        </Box>
      )}

      {/* Update Status Dialog */}
      <Dialog
        open={openStatusDialog}
        onClose={() => setOpenStatusDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
        >
          Change Order Status
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Update status for order{' '}
            <strong>{selectedOrder?.booking_reference}</strong> (
            {selectedOrder?.booking_type}).
          </Typography>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel id="status-label">Select Status</InputLabel>
            <Select
              labelId="status-label"
              value={orderStatus}
              label="Select Status"
              onChange={e => setOrderStatus(e.target.value)}
            >
              {ADMIN_STATUS_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenStatusDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSaveStatus}
            variant="contained"
            color="primary"
            disabled={updateStatusMutation.isPending}
            startIcon={
              updateStatusMutation.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            Update Status
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
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Orders;
