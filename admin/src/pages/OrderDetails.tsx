import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  CircularProgress,
  Chip,
  TextField,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Person as CustomerIcon,
  Engineering as TechIcon,
  Room as LocationIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Receipt as ReceiptIcon,
  CalendarMonth as CalendarIcon,
  Payments as PaymentIcon,
  CheckCircle as DoneIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import {
  useAdminOrderDetail,
  useAdminOrderStatusUpdate,
} from '../hooks/useAdminOrders';
import { useTechnicians } from '../hooks/useTechnicians';

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
  requested: 'Requested',
  accepted: 'Accepted',
  confirmed: 'Confirmed',
  assigned: 'Assigned',
  technician_on_the_way: 'On The Way',
  reached: 'Reached',
  work_started: 'Work Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refund_requested: 'Refund Requested',
  refunded: 'Refunded',
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  completed: { bg: 'rgba(72,187,120,0.15)', color: '#276749' },
  pending: { bg: 'rgba(250,208,44,0.2)', color: '#B7791F' },
  requested: { bg: 'rgba(250,208,44,0.2)', color: '#B7791F' },
  confirmed: { bg: 'rgba(66,153,225,0.15)', color: '#2B6CB0' },
  accepted: { bg: 'rgba(66,153,225,0.15)', color: '#2B6CB0' },
  assigned: { bg: 'rgba(102,126,234,0.15)', color: '#553C9A' },
  technician_on_the_way: { bg: 'rgba(159,122,234,0.15)', color: '#6B46C1' },
  reached: { bg: 'rgba(159,122,234,0.15)', color: '#6B46C1' },
  work_started: { bg: 'rgba(237,137,54,0.15)', color: '#DD6B20' },
  in_progress: { bg: 'rgba(237,137,54,0.15)', color: '#DD6B20' },
  cancelled: { bg: 'rgba(245,101,101,0.15)', color: '#9B2C2C' },
  refund_requested: { bg: 'rgba(245,101,101,0.1)', color: '#9B2C2C' },
  refunded: { bg: 'rgba(160,174,192,0.15)', color: '#4A5568' },
};

const BOOKING_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  beautician: { bg: 'rgba(233,30,99,0.12)', color: '#C2185B' },
  scrap: { bg: 'rgba(76,175,80,0.12)', color: '#2E7D32' },
  maintenance: { bg: 'rgba(33,150,243,0.12)', color: '#1565C0' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d?: string | null) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('en-IN', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  } catch {
    return d;
  }
};

const fmtShort = (d?: string | null) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return d;
  }
};

// ─── Info row sub-component ───────────────────────────────────────────────────

const InfoRow: React.FC<{ label: string; value?: string | null }> = ({
  label,
  value,
}) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: 'block', mb: 0.3 }}
    >
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2D3748' }}>
      {value || '—'}
    </Typography>
  </Box>
);

// ─── Page skeleton ────────────────────────────────────────────────────────────

const PageSkeleton: React.FC = () => (
  <Box sx={{ flexGrow: 1 }}>
    <Skeleton variant="text" width={300} height={50} sx={{ mb: 1 }} />
    <Skeleton variant="text" width={200} height={24} sx={{ mb: 4 }} />
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 7 }}>
        {[0, 1, 2].map(i => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={160}
            sx={{ borderRadius: 3, mb: 3 }}
          />
        ))}
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <Skeleton variant="rectangular" height={480} sx={{ borderRadius: 3 }} />
      </Grid>
    </Grid>
  </Box>
);

// ─── Card wrapper ─────────────────────────────────────────────────────────────

const DetailCard: React.FC<{
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <Card
    sx={{
      borderRadius: '16px',
      border: '1px solid rgba(226,232,240,0.8)',
      boxShadow: '0 4px 20px -2px rgba(148,163,184,0.08)',
      mb: 3,
      '&:hover': { boxShadow: '0 10px 25px -3px rgba(148,163,184,0.12)' },
      transition: 'box-shadow 0.2s',
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        {icon}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontFamily: '"Outfit",sans-serif',
            color: '#2D3748',
          }}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </CardContent>
  </Card>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const OrderDetails: React.FC = () => {
  const { bookingType, bookingId, id } = useParams<{
    bookingType?: string;
    bookingId?: string;
    id?: string;
  }>();
  const navigate = useNavigate();

  // Support both /orders/:bookingType/:bookingId and legacy /orders/:id
  const resolvedType = bookingType as
    | 'beautician'
    | 'scrap'
    | 'maintenance'
    | null
    | undefined;
  const resolvedId = bookingId || id || null;

  // If only :id is given (legacy), we can't know the type — show an error nudge
  const hasFullParams = !!resolvedType && !!resolvedId;

  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useAdminOrderDetail(resolvedType ?? null, resolvedId);

  const updateMutation = useAdminOrderStatusUpdate();
  const { data: technicianList = [] } = useTechnicians();

  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [assignedTech, setAssignedTech] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message: string, severity: 'success' | 'error') =>
    setSnackbar({ open: true, message, severity });

  const handleOpenStatus = () => {
    setOrderStatus(order?.status?.toLowerCase() || 'pending');
    setStatusNotes('');
    setOpenStatusDialog(true);
  };

  const handleOpenAssign = () => {
    setAssignedTech(order?.assigned_technician || '');
    setOpenAssignDialog(true);
  };

  const handleSaveStatus = async () => {
    if (!order) return;
    try {
      await updateMutation.mutateAsync({
        bookingType: order.booking_type,
        bookingId: order.booking_id,
        payload: { status: orderStatus, notes: statusNotes || undefined },
      });
      showSnackbar('Status updated successfully.', 'success');
    } catch {
      showSnackbar('Failed to update status.', 'error');
    }
    setOpenStatusDialog(false);
  };

  const handleSaveAssign = async () => {
    if (!order) return;
    try {
      await updateMutation.mutateAsync({
        bookingType: order.booking_type,
        bookingId: order.booking_id,
        payload: {
          status: order.status,
          assigned_technician: assignedTech || null,
        },
      });
      showSnackbar('Technician assignment saved.', 'success');
    } catch {
      showSnackbar('Failed to save technician.', 'error');
    }
    setOpenAssignDialog(false);
  };

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (isLoading) return <PageSkeleton />;

  if (!hasFullParams) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<BackIcon />}
          onClick={() => navigate('/orders')}
          sx={{ mb: 3 }}
        >
          Back to Orders
        </Button>
        <Alert severity="warning">
          This link is missing the booking type. Please navigate from the Orders
          list.
        </Alert>
      </Box>
    );
  }

  if (isError || !order) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<BackIcon />}
          onClick={() => navigate('/orders')}
          sx={{ mb: 3 }}
        >
          Back to Orders
        </Button>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Booking not found or failed to load. The booking ID may be invalid.
        </Alert>
      </Box>
    );
  }

  const normStatus = order.status?.toLowerCase() || 'pending';
  const statusColors = STATUS_COLORS[normStatus] || STATUS_COLORS.pending;
  const typeColors =
    BOOKING_TYPE_COLORS[order.booking_type] || BOOKING_TYPE_COLORS.beautician;

  return (
    <Box sx={{ flexGrow: 1, pb: 6 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<BackIcon />}
            onClick={() => navigate('/orders')}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Back to Orders
          </Button>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontFamily: '"Outfit",sans-serif',
                color: '#1A202C',
              }}
            >
              Order Detail
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ref:{' '}
              <strong style={{ color: '#2B6CB0' }}>
                {order.booking_reference}
              </strong>
              {' · '}
              <Chip
                label={order.booking_type}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  bgcolor: typeColors.bg,
                  color: typeColors.color,
                }}
              />
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<TechIcon />}
            onClick={handleOpenAssign}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {order.assigned_technician
              ? 'Change Technician'
              : 'Assign Technician'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleOpenStatus}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
            }}
          >
            Update Status
          </Button>
        </Box>
      </Box>

      {/* Status banner */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box
          sx={{
            px: 2.5,
            py: 1,
            borderRadius: 3,
            bgcolor: statusColors.bg,
            color: statusColors.color,
            fontWeight: 800,
            fontSize: '0.9rem',
            fontFamily: '"Outfit",sans-serif',
          }}
        >
          {STATUS_LABEL[normStatus] || order.status}
        </Box>
        <Box
          sx={{
            px: 2.5,
            py: 1,
            borderRadius: 3,
            bgcolor: '#F7FAFC',
            fontWeight: 600,
            fontSize: '0.85rem',
            color: '#4A5568',
          }}
        >
          ₹{Number(order.price || 0).toLocaleString('en-IN')}
        </Box>
        {order.assigned_technician && (
          <Box
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: 3,
              bgcolor: 'rgba(102,126,234,0.1)',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: '#553C9A',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <TechIcon sx={{ fontSize: 16 }} /> {order.assigned_technician}
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Left column */}
        <Grid size={{ xs: 12, md: 7 }}>
          {/* Customer Info */}
          <DetailCard
            title="Customer Information"
            icon={<CustomerIcon sx={{ color: '#553C9A' }} />}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoRow label="CUSTOMER NAME" value={order.customer_name} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mb: 1.5,
                  }}
                >
                  <PhoneIcon sx={{ color: '#718096', fontSize: 16 }} />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block' }}
                    >
                      PHONE
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {order.customer_phone || '—'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EmailIcon sx={{ color: '#718096', fontSize: 16 }} />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block' }}
                    >
                      EMAIL
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {order.customer_email || '—'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationIcon sx={{ color: '#718096', fontSize: 16 }} />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block' }}
                    >
                      ADDRESS
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {order.address || '—'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </DetailCard>

          {/* Booking Info */}
          <DetailCard
            title="Booking Information"
            icon={<ReceiptIcon sx={{ color: '#2B6CB0' }} />}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoRow label="SERVICE" value={order.service_name} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoRow label="CATEGORY" value={order.category} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoRow
                  label="BOOKING DATE"
                  value={fmtDate(order.booking_date)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoRow label="CREATED AT" value={fmtDate(order.created_at)} />
              </Grid>
              {order.booking_type === 'scrap' && (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow label="ITEM" value={order.item_name} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow
                      label="ESTIMATED WEIGHT"
                      value={
                        order.estimated_weight_kg
                          ? `${order.estimated_weight_kg} kg`
                          : undefined
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow label="TIME SLOT" value={order.time_slot} />
                  </Grid>
                </>
              )}
              {order.booking_type === 'maintenance' && order.service_names && (
                <Grid size={12}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    SERVICES SELECTED
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {order.service_names.map((sn, i) => (
                      <Chip
                        key={i}
                        label={sn}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
              )}
              {order.notes && (
                <Grid size={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    NOTES
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      bgcolor: '#F7FAFC',
                      p: 1.5,
                      borderRadius: 2,
                      borderLeft: '3px solid #CBD5E0',
                      color: '#4A5568',
                    }}
                  >
                    {order.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </DetailCard>

          {/* Assignment Section (UI only) */}
          <DetailCard
            title="Technician Assignment"
            icon={<TechIcon sx={{ color: '#D69E2E' }} />}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.5 }}
                >
                  ASSIGNED TECHNICIAN
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 700,
                    color: order.assigned_technician ? '#2D3748' : '#A0AEC0',
                  }}
                >
                  {order.assigned_technician || 'Not yet assigned'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<TechIcon />}
                  onClick={handleOpenAssign}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 'none',
                  }}
                >
                  {order.assigned_technician
                    ? 'Change Technician'
                    : 'Assign Technician'}
                </Button>
              </Box>
            </Box>
          </DetailCard>
        </Grid>

        {/* Right column */}
        <Grid size={{ xs: 12, md: 5 }}>
          {/* Status Timeline */}
          <Card
            sx={{
              borderRadius: '16px',
              border: '1px solid rgba(226,232,240,0.8)',
              boxShadow: '0 4px 20px -2px rgba(148,163,184,0.08)',
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}
              >
                <HistoryIcon sx={{ color: '#553C9A' }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontFamily: '"Outfit",sans-serif',
                    color: '#2D3748',
                  }}
                >
                  Status Timeline
                </Typography>
              </Box>

              {order.status_history && order.status_history.length > 0 ? (
                <Stepper orientation="vertical" nonLinear>
                  {order.status_history.map((entry, idx) => (
                    <Step key={idx} active completed={idx > 0}>
                      <StepLabel
                        icon={
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              bgcolor: idx === 0 ? '#553C9A' : '#E2E8F0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <DoneIcon
                              sx={{
                                fontSize: 16,
                                color: idx === 0 ? 'white' : '#A0AEC0',
                              }}
                            />
                          </Box>
                        }
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, color: '#2D3748' }}
                        >
                          {STATUS_LABEL[entry.status?.toLowerCase()] ||
                            entry.status}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          {fmtShort(entry.created_at)}
                        </Typography>
                        {entry.updated_by_name && (
                          <Typography
                            variant="caption"
                            sx={{ color: '#553C9A', fontWeight: 600 }}
                          >
                            By: {entry.updated_by_name}
                          </Typography>
                        )}
                        {entry.notes && (
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', color: '#718096', mt: 0.5 }}
                          >
                            {entry.notes}
                          </Typography>
                        )}
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              ) : (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  No status changes recorded yet. The first update will appear
                  here.
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <DetailCard
            title="Payment Summary"
            icon={<PaymentIcon sx={{ color: '#276749' }} />}
          >
            <InfoRow
              label="AMOUNT"
              value={`₹${Number(order.price || 0).toLocaleString('en-IN')}`}
            />
            <InfoRow
              label="PAYMENT METHOD"
              value={order.payment_method || 'Not specified'}
            />
            <InfoRow
              label="PAYMENT STATUS"
              value={
                order.payment_status
                  ? order.payment_status.toUpperCase()
                  : 'PENDING'
              }
            />
            <InfoRow label="LAST UPDATED" value={fmtShort(order.updated_at)} />
          </DetailCard>
        </Grid>
      </Grid>

      {/* Update Status Dialog */}
      <Dialog
        open={openStatusDialog}
        onClose={() => setOpenStatusDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontFamily: '"Outfit",sans-serif' }}
        >
          Change Order Status
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Update status for <strong>{order.booking_reference}</strong>.
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Select Status</InputLabel>
            <Select
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
          <TextField
            label="Notes (optional)"
            placeholder="Reason for status change..."
            fullWidth
            size="small"
            multiline
            rows={2}
            value={statusNotes}
            onChange={e => setStatusNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenStatusDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSaveStatus}
            variant="contained"
            color="primary"
            disabled={updateMutation.isPending}
            startIcon={
              updateMutation.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Technician Dialog */}
      <Dialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontFamily: '"Outfit",sans-serif' }}
        >
          Assign Technician
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Assign a field professional to{' '}
            <strong>{order.booking_reference}</strong>.
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Select Technician</InputLabel>
            <Select
              value={assignedTech}
              label="Select Technician"
              onChange={e => setAssignedTech(e.target.value)}
            >
              <MenuItem value="">
                <em>Unassigned / Remove</em>
              </MenuItem>
              {technicianList.map((t: any) => (
                <MenuItem key={t.name} value={t.name}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenAssignDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSaveAssign}
            variant="contained"
            color="primary"
            disabled={updateMutation.isPending}
            startIcon={
              updateMutation.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            Confirm Assignment
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

export default OrderDetails;
