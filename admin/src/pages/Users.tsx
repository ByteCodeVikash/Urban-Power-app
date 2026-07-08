import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  TableSortLabel,
  TablePagination,
  Button,
  Skeleton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Person as UserIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  History as HistoryIcon,
  TrendingUp as SpendIcon,
  CalendarToday as JoinIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  useUsers,
  type UserProfile,
  type UserBooking,
} from '../hooks/useUsers';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  completed: { bg: 'rgba(72,187,120,0.15)', color: '#276749' },
  confirmed: { bg: 'rgba(66,153,225,0.15)', color: '#2B6CB0' },
  assigned: { bg: 'rgba(66,153,225,0.12)', color: '#2C5282' },
  in_progress: { bg: 'rgba(237,137,54,0.15)', color: '#C05621' },
  pending: { bg: 'rgba(250,208,44,0.2)', color: '#B7791F' },
  cancelled: { bg: 'rgba(245,101,101,0.15)', color: '#9B2C2C' },
};

function StatusChip({ status }: { status: string }) {
  const s = status?.toLowerCase() || '';
  const style = STATUS_COLORS[s] || { bg: '#E2E8F0', color: '#4A5568' };
  return (
    <Box
      sx={{
        display: 'inline-block',
        px: 1.5,
        py: 0.4,
        borderRadius: 2,
        fontSize: '0.72rem',
        fontWeight: 700,
        bgcolor: style.bg,
        color: style.color,
      }}
    >
      {status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </Box>
  );
}

function BookingHistoryTable({ bookings }: { bookings: UserBooking[] }) {
  if (!bookings.length) {
    return (
      <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
        No bookings found for this user.
      </Typography>
    );
  }
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}
    >
      <Table size="small">
        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
              Reference
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
              Date
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
              Service
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
              Amount
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
              align="center"
            >
              Status
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map(b => (
            <TableRow key={b.id} hover>
              <TableCell
                sx={{
                  fontWeight: 600,
                  color: 'primary.main',
                  fontSize: '0.78rem',
                }}
              >
                {b.booking_reference || b.id.substring(0, 8)}
              </TableCell>
              <TableCell sx={{ fontSize: '0.78rem' }}>
                {b.booking_date?.split('T')[0] || '—'}
              </TableCell>
              <TableCell sx={{ fontSize: '0.78rem' }}>
                {b.service_name}
              </TableCell>
              <TableCell sx={{ fontSize: '0.78rem', fontWeight: 600 }}>
                {b.total_price > 0
                  ? `₹${b.total_price.toLocaleString('en-IN')}`
                  : '₹0'}
              </TableCell>
              <TableCell align="center">
                <StatusChip status={b.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

type SortKey =
  | 'name'
  | 'joined'
  | 'bookingsCount'
  | 'totalSpend'
  | 'lastActivity';

export const Users: React.FC = () => {
  const { data: users = [], isLoading, isError, refetch } = useUsers();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<SortKey>('lastActivity');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (col: SortKey) => {
    setOrder(orderBy === col && order === 'asc' ? 'desc' : 'asc');
    setOrderBy(col);
    setPage(0);
  };

  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.id.includes(q);
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? u.is_active : !u.is_active);
      return matchSearch && matchStatus;
    });
  }, [users, search, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: any = a[orderBy],
        bv: any = b[orderBy];
      if (typeof av === 'string') {
        av = av.toLowerCase();
        bv = bv.toLowerCase();
      }
      if (av < bv) return order === 'asc' ? -1 : 1;
      if (av > bv) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, orderBy, order]);

  const paginated = sorted.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const SortHeader = ({ col, label }: { col: SortKey; label: string }) => (
    <TableSortLabel
      active={orderBy === col}
      direction={orderBy === col ? order : 'asc'}
      onClick={() => handleSort(col)}
    >
      {label}
    </TableSortLabel>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Page Header */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
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
            Registered Customers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            User profiles derived from booking data · {users.length} unique
            customers found
          </Typography>
        </Box>
        <Tooltip title="Refresh user data">
          <IconButton
            onClick={() => refetch()}
            sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Summary Stats */}
      {!isLoading && !isError && (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {[
            { label: 'Total Customers', value: users.length, color: '#4299E1' },
            {
              label: 'Active',
              value: users.filter(u => u.is_active).length,
              color: '#48BB78',
            },
            {
              label: 'Total Bookings',
              value: users.reduce((s, u) => s + u.bookingsCount, 0),
              color: '#ED8936',
            },
            {
              label: 'Revenue Generated',
              value: `₹${users.reduce((s, u) => s + u.totalSpend, 0).toLocaleString('en-IN')}`,
              color: '#9F7AEA',
            },
          ].map(stat => (
            <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
              <Card
                elevation={0}
                sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 2 }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {stat.label}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, color: stat.color, mt: 0.5 }}
                >
                  {stat.value}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Filters */}
      <Card
        elevation={0}
        sx={{ mb: 3, border: '1px solid #E2E8F0', borderRadius: 3 }}
      >
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name, phone, email or user ID…"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <SearchIcon color="action" sx={{ mr: 1 }} />
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value as any);
                    setPage(0);
                  }}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error State */}
      {isError && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Could not load booking data. Ensure the backend API is reachable and
          you are authenticated.
        </Alert>
      )}

      {/* User Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: '1px solid #E2E8F0', borderRadius: 3 }}
      >
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <SortHeader col="joined" label="First Booking" />
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <SortHeader col="lastActivity" label="Last Activity" />
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                <SortHeader col="bookingsCount" label="Bookings" />
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                <SortHeader col="totalSpend" label="Total Spend" />
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Details
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map(i => (
                <TableRow key={i}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(j => (
                    <TableCell key={j}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <UserIcon sx={{ fontSize: 48, color: '#CBD5E0', mb: 1 }} />
                  <Typography color="text.secondary">
                    No customers found matching your search.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map(user => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: '#2D3748',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, lineHeight: 1.2 }}
                        >
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.id.substring(0, 12)}…
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>
                      {user.phone || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.82rem' }}>
                    {user.joined || '—'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.82rem' }}>
                    {user.lastActivity || '—'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={user.bookingsCount}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: 'rgba(66,153,225,0.12)',
                        color: '#2B6CB0',
                      }}
                    />
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 700, color: '#276749' }}
                  >
                    ₹{user.totalSpend.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell align="center">
                    <StatusChip
                      status={user.is_active ? 'Active' : 'Inactive'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => {
                        setSelectedUser(user);
                        setOpenDialog(true);
                      }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={e => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* User Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontFamily: '"Outfit", sans-serif',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          Customer Profile
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedUser && (
            <Grid container spacing={3}>
              {/* Profile Card */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: '#FAD02C',
                      color: '#1A202C',
                      fontSize: '2rem',
                      fontWeight: 800,
                      mb: 2,
                    }}
                  >
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {selectedUser.name}
                  </Typography>
                  <StatusChip
                    status={selectedUser.is_active ? 'Active' : 'Inactive'}
                  />

                  <Box
                    sx={{
                      width: '100%',
                      mt: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      textAlign: 'left',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon color="action" fontSize="small" />
                      <Typography variant="body2">
                        {selectedUser.phone || 'Not available'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon color="action" fontSize="small" />
                      <Typography
                        variant="body2"
                        sx={{ wordBreak: 'break-all' }}
                      >
                        {selectedUser.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <JoinIcon color="action" fontSize="small" />
                      <Typography variant="body2">
                        First booking: {selectedUser.joined || '—'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <UserIcon color="action" fontSize="small" />
                      <Typography
                        variant="body2"
                        sx={{
                          wordBreak: 'break-all',
                          fontSize: '0.72rem',
                          color: 'text.secondary',
                        }}
                      >
                        ID: {selectedUser.id}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ width: '100%', my: 2 }} />

                  {/* Quick stats */}
                  {[
                    {
                      icon: <HistoryIcon fontSize="small" />,
                      label: 'Total Bookings',
                      value: selectedUser.bookingsCount,
                    },
                    {
                      icon: <SpendIcon fontSize="small" />,
                      label: 'Total Spend',
                      value: `₹${selectedUser.totalSpend.toLocaleString('en-IN')}`,
                    },
                  ].map(stat => (
                    <Box
                      key={stat.label}
                      sx={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: 'text.secondary',
                        }}
                      >
                        {stat.icon}
                        <Typography variant="caption">{stat.label}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>

              {/* Booking History */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                >
                  <HistoryIcon color="action" />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
                  >
                    Booking History
                  </Typography>
                  <Chip
                    label={selectedUser.bookings.length}
                    size="small"
                    sx={{ ml: 'auto', fontWeight: 700 }}
                  />
                </Box>
                <BookingHistoryTable bookings={selectedUser.bookings} />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E2E8F0' }}>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="contained"
            color="secondary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
