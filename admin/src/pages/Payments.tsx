import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Avatar,
  CircularProgress,
  Snackbar,
  Divider,
  IconButton,
} from '@mui/material';
import {
  CreditCard as RazorpayIcon,
  LocalAtm as CodIcon,
  KeyboardReturn as RefundIcon,
  AccountBalanceWallet as BalanceIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable, type ColumnConfig } from '../components/common/DataTable';
import {
  FilterPanel,
  type FilterField,
} from '../components/common/FilterPanel';
import { usePayments, type PaymentTransaction } from '../hooks/usePayments';
import { parseBookingNotes, buildBookingNotes } from '../hooks/useBookings';
import { apiClient } from '../api/apiClient';

const formatINR = (amount: number) => {
  return `₹${new Intl.NumberFormat('en-IN').format(Math.round(amount))}`;
};

export const Payments: React.FC = () => {
  const queryClient = useQueryClient();
  const { transactions = [], summary, isLoading, isError } = usePayments();

  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({
    search: '',
    gateway: '',
    status: '',
  });

  const [openRefundDialog, setOpenRefundDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<PaymentTransaction | null>(
    null,
  );

  // Refund Form Fields
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // Filter change handler
  const handleFilterChange = (filters: Record<string, any>) => {
    setActiveFilters(filters);
  };

  // Filter logic
  const filteredTransactions = transactions.filter(txn => {
    const searchVal = activeFilters.search || '';
    const matchesSearch =
      txn.id.toLowerCase().includes(searchVal.toLowerCase()) ||
      txn.bookingReference.toLowerCase().includes(searchVal.toLowerCase()) ||
      txn.customerName.toLowerCase().includes(searchVal.toLowerCase()) ||
      txn.customerPhone.toLowerCase().includes(searchVal.toLowerCase()) ||
      txn.serviceName.toLowerCase().includes(searchVal.toLowerCase());

    const matchesGateway =
      !activeFilters.gateway || txn.gateway === activeFilters.gateway;
    const matchesStatus =
      !activeFilters.status || txn.status === activeFilters.status;

    return matchesSearch && matchesGateway && matchesStatus;
  });

  const handleOpenRefund = (txn: PaymentTransaction) => {
    setSelectedTxn(txn);
    setRefundAmount(String(txn.amount));
    setRefundReason('');
    setOpenRefundDialog(true);
  };

  const handleOpenDetails = (txn: PaymentTransaction) => {
    setSelectedTxn(txn);
    setOpenDetailsDialog(true);
  };

  // Refund mutation using existing update booking endpoint
  const refundMutation = useMutation({
    mutationFn: async ({
      bookingId,
      status,
      notes,
    }: {
      bookingId: string;
      status: string;
      notes: string;
    }) => {
      const response = await apiClient.put(`/api/v1/bookings/${bookingId}`, {
        status,
        notes,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments-derived'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      showSnackbar(
        'Refund triggered and booking cancelled successfully.',
        'success',
      );
      setOpenRefundDialog(false);
    },
    onError: (err: any) => {
      const detail = err.response?.data?.detail || 'Failed to process refund.';
      showSnackbar(detail, 'error');
    },
  });

  const handleExecuteRefund = () => {
    if (!selectedTxn) return;
    const parsed = parseBookingNotes(selectedTxn.notes);
    const refundMarker = `Refunded: ₹${refundAmount} (Reason: ${refundReason || 'No reason specified'})`;
    const updatedCustomNotes = parsed.customNotes
      ? `${parsed.customNotes}, ${refundMarker}`
      : refundMarker;

    const newNotes = buildBookingNotes(
      parsed.customerName,
      parsed.phone,
      parsed.technician,
      updatedCustomNotes,
    );

    refundMutation.mutate({
      bookingId: selectedTxn.bookingId,
      status: 'cancelled',
      notes: newNotes,
    });
  };

  // DataTable column configuration
  const columns: ColumnConfig<PaymentTransaction>[] = [
    {
      id: 'id',
      label: 'Transaction ID',
      render: row => (
        <Typography
          variant="body2"
          sx={{ fontFamily: 'monospace', fontWeight: 600 }}
        >
          {row.id}
        </Typography>
      ),
    },
    {
      id: 'bookingReference',
      label: 'Booking Ref',
      render: row => (
        <Typography
          variant="body2"
          sx={{ fontFamily: 'monospace', color: '#553C9A', fontWeight: 700 }}
        >
          {row.bookingReference}
        </Typography>
      ),
    },
    {
      id: 'customerName',
      label: 'Customer',
      render: row => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.customerName}
          </Typography>
          {row.customerPhone && (
            <Typography variant="caption" color="text.secondary">
              {row.customerPhone}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'gateway',
      label: 'Gateway Mode',
      render: row => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {row.gateway === 'Razorpay' ? (
            <RazorpayIcon fontSize="small" color="primary" />
          ) : row.gateway === 'COD' ? (
            <CodIcon fontSize="small" color="success" />
          ) : (
            <BalanceIcon fontSize="small" color="disabled" />
          )}
          <Typography variant="body2">{row.gateway}</Typography>
        </Box>
      ),
    },
    { id: 'dateLabel', label: 'Date' },
    {
      id: 'amount',
      label: 'Paid Amount',
      render: row => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {row.amountLabel}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Settlement Status',
      align: 'center',
      render: row => (
        <Box
          sx={{
            display: 'inline-block',
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            fontSize: '0.75rem',
            fontWeight: 700,
            bgcolor:
              row.status === 'Settled'
                ? 'rgba(72, 187, 120, 0.15)'
                : row.status === 'Escrow'
                  ? 'rgba(66, 153, 225, 0.15)'
                  : row.status === 'Refunded'
                    ? 'rgba(245, 101, 101, 0.15)'
                    : 'rgba(250, 208, 44, 0.2)',
            color:
              row.status === 'Settled'
                ? '#276749'
                : row.status === 'Escrow'
                  ? '#2B6CB0'
                  : row.status === 'Refunded'
                    ? '#9B2C2C'
                    : '#B7791F',
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
      render: row => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleOpenDetails(row)}
            title="View Details"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          {row.status !== 'Refunded' ? (
            <Button
              size="small"
              color="error"
              variant="outlined"
              startIcon={<RefundIcon />}
              onClick={() => handleOpenRefund(row)}
            >
              Refund
            </Button>
          ) : (
            <Button size="small" variant="outlined" disabled>
              Refunded
            </Button>
          )}
        </Box>
      ),
    },
  ];

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      id: 'gateway',
      label: 'Gateway Mode',
      type: 'select',
      options: [
        { value: 'Razorpay', label: 'Razorpay' },
        { value: 'COD', label: 'Cash on Delivery (COD)' },
        { value: 'Unknown', label: 'Unknown' },
      ],
    },
    {
      id: 'status',
      label: 'Settlement Status',
      type: 'select',
      options: [
        { value: 'Settled', label: 'Settled' },
        { value: 'Escrow', label: 'Escrow' },
        { value: 'Pending Cash', label: 'Pending Cash' },
        { value: 'Refunded', label: 'Refunded' },
      ],
    },
  ];

  if (isError) {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Alert severity="error">
          Failed to fetch payment transactions. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontFamily: '"Outfit", sans-serif',
            color: '#1A202C',
          }}
        >
          Payment Accounts & Transactions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track transaction ledgers, compare Razorpay card gateways vs. Cash on
          Delivery (COD) channels, and process client refunds.
        </Typography>
      </Box>

      {/* Payment Channels Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    TOTAL REVENUE
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                    {isLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      formatINR(summary?.totalRevenue || 0)
                    )}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#2D3748', color: '#FFFFFF' }}>
                  <BalanceIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    RAZORPAY GATEWAY
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                    {isLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      formatINR(summary?.razorpayTotal || 0)
                    )}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#4299E1', color: '#FFFFFF' }}>
                  <RazorpayIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    CASH ON DELIVERY (COD)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                    {isLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      formatINR(summary?.codTotal || 0)
                    )}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#48BB78', color: '#FFFFFF' }}>
                  <CodIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    REFUNDED SETTLEMENTS
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, mt: 0.5, color: '#F56565' }}
                  >
                    {isLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      formatINR(summary?.refundedTotal || 0)
                    )}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#F56565', color: '#FFFFFF' }}>
                  <RefundIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Unified Filter Panel */}
      <FilterPanel fields={filterFields} onFilterChange={handleFilterChange} />

      {/* Transaction Ledger DataTable */}
      <DataTable
        title="Transaction Ledger"
        filename="transactions_ledger"
        columns={columns}
        data={filteredTransactions}
        isLoading={isLoading}
        emptyMessage="No transaction logs match current filters."
      />

      {/* Process Refund Dialog */}
      <Dialog
        open={openRefundDialog}
        onClose={() => !refundMutation.isPending && setOpenRefundDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
        >
          Issue Gateway Refund
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              mt: 1.5,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              You are issuing a refund for order{' '}
              <strong>{selectedTxn?.bookingReference}</strong>. This transaction
              will be credited back via Razorpay/Gateway and the booking status
              will be set to cancelled.
            </Typography>
            <TextField
              fullWidth
              size="small"
              label="Refund Amount (₹)"
              value={refundAmount}
              onChange={e => setRefundAmount(e.target.value)}
              disabled={refundMutation.isPending}
            />
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="Reason for Refund"
              value={refundReason}
              onChange={e => setRefundReason(e.target.value)}
              placeholder="e.g. Service cancellation request by user"
              disabled={refundMutation.isPending}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setOpenRefundDialog(false)}
            color="secondary"
            disabled={refundMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExecuteRefund}
            variant="contained"
            color="error"
            disabled={refundMutation.isPending}
            startIcon={
              refundMutation.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : null
            }
          >
            Execute Refund
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
        >
          Payment & Transaction Details
        </DialogTitle>
        <DialogContent dividers sx={{ pb: 3 }}>
          {selectedTxn && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', fontWeight: 600 }}
                  >
                    Transaction ID
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, fontFamily: 'monospace', mt: 0.5 }}
                  >
                    {selectedTxn.id}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', fontWeight: 600 }}
                  >
                    Booking Reference
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      color: '#553C9A',
                      mt: 0.5,
                    }}
                  >
                    {selectedTxn.bookingReference}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', fontWeight: 600 }}
                  >
                    Customer Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {selectedTxn.customerName}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', fontWeight: 600 }}
                  >
                    Customer Phone
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {selectedTxn.customerPhone || '—'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', fontWeight: 600 }}
                  >
                    Service Booked
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {selectedTxn.serviceName}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', fontWeight: 600 }}
                  >
                    Booking Date
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {selectedTxn.dateLabel}{' '}
                    {selectedTxn.timeslot ? `(${selectedTxn.timeslot})` : ''}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', fontWeight: 600 }}
                  >
                    Amount Paid
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: 'text.primary', mt: 0.5 }}
                  >
                    {selectedTxn.amountLabel}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', fontWeight: 600 }}
                  >
                    Payment Gateway Mode
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {selectedTxn.gateway}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', fontWeight: 600 }}
                  >
                    Settlement Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        bgcolor:
                          selectedTxn.status === 'Settled'
                            ? 'rgba(72, 187, 120, 0.15)'
                            : selectedTxn.status === 'Escrow'
                              ? 'rgba(66, 153, 225, 0.15)'
                              : selectedTxn.status === 'Refunded'
                                ? 'rgba(245, 101, 101, 0.15)'
                                : 'rgba(250, 208, 44, 0.2)',
                        color:
                          selectedTxn.status === 'Settled'
                            ? '#276749'
                            : selectedTxn.status === 'Escrow'
                              ? '#2B6CB0'
                              : selectedTxn.status === 'Refunded'
                                ? '#9B2C2C'
                                : '#B7791F',
                      }}
                    >
                      {selectedTxn.status}
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', fontWeight: 600 }}
                  >
                    Raw Booking Status
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ textTransform: 'capitalize', mt: 0.5 }}
                  >
                    {selectedTxn.bookingStatus}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 1 }} />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', fontWeight: 600, mb: 1 }}
                >
                  Booking Notes & Audit Trail
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    p: 1.5,
                    bgcolor: '#F8FAFC',
                    borderRadius: 2,
                    border: '1px solid #E2E8F0',
                    whiteSpace: 'pre-line',
                    fontFamily: 'sans-serif',
                    maxHeight: '150px',
                    overflowY: 'auto',
                  }}
                >
                  {selectedTxn.notes ||
                    'No notes or audit trail on this booking.'}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setOpenDetailsDialog(false)}
            color="primary"
            variant="contained"
          >
            Close Details
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback */}
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

export default Payments;
