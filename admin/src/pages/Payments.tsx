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
} from '@mui/material';
import {
  CreditCard as RazorpayIcon,
  LocalAtm as CodIcon,
  KeyboardReturn as RefundIcon,
  AccountBalanceWallet as BalanceIcon,
} from '@mui/icons-material';
import { DataTable, type ColumnConfig } from '../components/common/DataTable';
import {
  FilterPanel,
  type FilterField,
} from '../components/common/FilterPanel';

// Initial Mock Transactions
const initialTransactions = [
  {
    id: 'TXN-749102',
    orderId: 'ORD-101',
    customer: 'Vikash Kumar',
    gateway: 'Razorpay',
    amount: '₹1,200',
    status: 'Settled',
    date: '2026-07-03',
  },
  {
    id: 'TXN-839210',
    orderId: 'ORD-102',
    customer: 'Amit Sharma',
    gateway: 'Razorpay',
    amount: '₹2,500',
    status: 'Escrow',
    date: '2026-07-03',
  },
  {
    id: 'TXN-394019',
    orderId: 'ORD-103',
    customer: 'Priya Singh',
    gateway: 'COD',
    amount: '₹1,800',
    status: 'Pending Cash',
    date: '2026-07-03',
  },
  {
    id: 'TXN-104928',
    orderId: 'ORD-104',
    customer: 'Rohan Verma',
    gateway: 'Razorpay',
    amount: '₹800',
    status: 'Refunded',
    date: '2026-07-02',
  },
  {
    id: 'TXN-293810',
    orderId: 'ORD-105',
    customer: 'Sneha Gupta',
    gateway: 'COD',
    amount: '₹4,200',
    status: 'Settled',
    date: '2026-07-01',
  },
];

export const Payments: React.FC = () => {
  const [txns, setTxns] = useState(initialTransactions);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({
    search: '',
    gateway: '',
    status: '',
  });

  const [openRefundDialog, setOpenRefundDialog] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<
    (typeof initialTransactions)[0] | null
  >(null);

  // Refund Form Fields
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter change handler
  const handleFilterChange = (filters: Record<string, any>) => {
    setActiveFilters(filters);
  };

  // Filter logic
  const filteredTransactions = txns.filter(txn => {
    const searchVal = activeFilters.search || '';
    const matchesSearch =
      txn.id.toLowerCase().includes(searchVal.toLowerCase()) ||
      txn.orderId.toLowerCase().includes(searchVal.toLowerCase()) ||
      txn.customer.toLowerCase().includes(searchVal.toLowerCase());

    const matchesGateway =
      !activeFilters.gateway || txn.gateway === activeFilters.gateway;
    const matchesStatus =
      !activeFilters.status || txn.status === activeFilters.status;

    return matchesSearch && matchesGateway && matchesStatus;
  });

  const handleOpenRefund = (txn: (typeof initialTransactions)[0]) => {
    setSelectedTxn(txn);
    setRefundAmount(txn.amount.replace('₹', '').replace(',', ''));
    setRefundReason('');
    setSuccessMessage(null);
    setOpenRefundDialog(true);
  };

  const handleExecuteRefund = () => {
    if (selectedTxn) {
      setTxns(
        txns.map(t =>
          t.id === selectedTxn.id ? { ...t, status: 'Refunded' } : t,
        ),
      );
      setSuccessMessage(
        `Refund of ₹${refundAmount} processed successfully for Transaction ${selectedTxn.id}.`,
      );
      setTimeout(() => {
        setOpenRefundDialog(false);
        setSuccessMessage(null);
      }, 1500);
    }
  };

  // DataTable column configuration
  const columns: ColumnConfig<(typeof initialTransactions)[0]>[] = [
    { id: 'id', label: 'Transaction ID' },
    { id: 'orderId', label: 'Order ID' },
    {
      id: 'customer',
      label: 'Customer',
      render: row => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.customer}
        </Typography>
      ),
    },
    {
      id: 'gateway',
      label: 'Gateway Mode',
      render: row => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {row.gateway === 'Razorpay' ? (
            <RazorpayIcon fontSize="small" color="primary" />
          ) : (
            <CodIcon fontSize="small" color="success" />
          )}
          <Typography variant="body2">{row.gateway}</Typography>
        </Box>
      ),
    },
    { id: 'date', label: 'Date' },
    {
      id: 'amount',
      label: 'Paid Amount',
      render: row => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {row.amount}
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
        <Box>
          {row.gateway === 'Razorpay' && row.status !== 'Refunded' ? (
            <Button
              size="small"
              color="error"
              variant="outlined"
              startIcon={<RefundIcon />}
              onClick={() => handleOpenRefund(row)}
            >
              Trigger Refund
            </Button>
          ) : (
            <Button size="small" variant="outlined" disabled>
              No Action
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
                    ₹4,82,900
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
                    ₹3,20,500
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
                    ₹1,62,400
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
                    ₹800
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
        emptyMessage="No transaction logs match current filters."
      />

      {/* Process Refund Dialog */}
      <Dialog
        open={openRefundDialog}
        onClose={() => setOpenRefundDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
        >
          Issue Gateway Refund
        </DialogTitle>
        <DialogContent>
          {successMessage ? (
            <Alert severity="success" sx={{ mt: 1.5, borderRadius: 2 }}>
              {successMessage}
            </Alert>
          ) : (
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
                <strong>{selectedTxn?.orderId}</strong>. This transaction will
                be credited back via Razorpay.
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="Refund Amount (₹)"
                value={refundAmount}
                onChange={e => setRefundAmount(e.target.value)}
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
              />
            </Box>
          )}
        </DialogContent>
        {!successMessage && (
          <DialogActions sx={{ p: 2.5 }}>
            <Button
              onClick={() => setOpenRefundDialog(false)}
              color="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecuteRefund}
              variant="contained"
              color="error"
            >
              Execute Refund
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
};

export default Payments;
