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
  Avatar,
  TableSortLabel,
  TablePagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Person as UserIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

// Mock users database
const mockUsers = [
  {
    id: 'U-001',
    name: 'Vikash Kumar',
    email: 'vikash.kumar@gmail.com',
    phone: '+91 98765 43210',
    joined: '2026-01-15',
    bookingsCount: 8,
    status: 'Active',
    history: [
      {
        id: 'ORD-101',
        date: '2026-07-03',
        service: 'Electronic Scrap Pick-up',
        amount: '₹1,200',
        status: 'Completed',
      },
      {
        id: 'ORD-085',
        date: '2026-05-12',
        service: 'AC Filter Replacement',
        amount: '₹850',
        status: 'Completed',
      },
      {
        id: 'ORD-043',
        date: '2026-03-20',
        service: 'House Painting Survey',
        amount: '₹0',
        status: 'Completed',
      },
    ],
  },
  {
    id: 'U-002',
    name: 'Amit Sharma',
    email: 'amit.sharma@yahoo.com',
    phone: '+91 98765 12345',
    joined: '2026-02-10',
    bookingsCount: 4,
    status: 'Active',
    history: [
      {
        id: 'ORD-102',
        date: '2026-07-03',
        service: 'Air Conditioner Deep Cleaning',
        amount: '₹2,500',
        status: 'Pending',
      },
      {
        id: 'ORD-076',
        date: '2026-04-05',
        service: 'Refrigerator Repair',
        amount: '₹1,400',
        status: 'Completed',
      },
    ],
  },
  {
    id: 'U-003',
    name: 'Priya Singh',
    email: 'priya.singh@gmail.com',
    phone: '+91 91234 56789',
    joined: '2026-03-01',
    bookingsCount: 12,
    status: 'Active',
    history: [
      {
        id: 'ORD-103',
        date: '2026-07-03',
        service: 'Bridal Make-up & Hair Package',
        amount: '₹1,800',
        status: 'Assigned',
      },
      {
        id: 'ORD-092',
        date: '2026-06-18',
        service: 'Pedicure & Facial Salon Service',
        amount: '₹1,500',
        status: 'Completed',
      },
    ],
  },
  {
    id: 'U-004',
    name: 'Rohan Verma',
    email: 'rohan.verma@outlook.com',
    phone: '+91 99988 77766',
    joined: '2026-04-20',
    bookingsCount: 1,
    status: 'Suspended',
    history: [
      {
        id: 'ORD-104',
        date: '2026-07-02',
        service: 'Electronic Scrap Pick-up',
        amount: '₹800',
        status: 'Cancelled',
      },
    ],
  },
];

export const Users: React.FC = () => {
  const [users] = useState(mockUsers);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<
    (typeof mockUsers)[0] | null
  >(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Sorting states
  const [orderBy, setOrderBy] = useState<
    'id' | 'name' | 'email' | 'joined' | 'bookingsCount' | 'status'
  >('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  // Filter users based on search string
  const filteredUsers = users.filter(
    u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search),
  );

  const handleRequestSort = (
    property: 'id' | 'name' | 'email' | 'joined' | 'bookingsCount' | 'status',
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aVal: any = a[orderBy];
    let bVal: any = b[orderBy];

    if (orderBy === 'bookingsCount') {
      aVal = Number(a.bookingsCount);
      bVal = Number(b.bookingsCount);
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

  const paginatedUsers = sortedUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDetails = (user: (typeof mockUsers)[0]) => {
    setSelectedUser(user);
    setOpenDetailDialog(true);
  };

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
          Registered Customers
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Browse customer profile details, account active status, and individual
          order booking histories.
        </Typography>
      </Box>

      {/* Search Filter Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search customers by Name, Email, or Phone..."
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
          </Grid>
        </CardContent>
      </Card>

      {/* Users List Data Grid */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: '1px solid #E2E8F0' }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'id'}
                  direction={orderBy === 'id' ? order : 'asc'}
                  onClick={() => handleRequestSort('id')}
                >
                  Customer ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'email'}
                  direction={orderBy === 'email' ? order : 'asc'}
                  onClick={() => handleRequestSort('email')}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'joined'}
                  direction={orderBy === 'joined' ? order : 'asc'}
                  onClick={() => handleRequestSort('joined')}
                >
                  Joined Date
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={orderBy === 'bookingsCount'}
                  direction={orderBy === 'bookingsCount' ? order : 'asc'}
                  onClick={() => handleRequestSort('bookingsCount')}
                >
                  Total Bookings
                </TableSortLabel>
              </TableCell>
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
            {paginatedUsers.map(user => (
              <TableRow key={user.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{user.id}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: '#2D3748',
                        fontSize: '0.85rem',
                      }}
                    >
                      {user.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.joined}</TableCell>
                <TableCell align="center">{user.bookingsCount}</TableCell>
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
                        user.status === 'Active'
                          ? 'rgba(72, 187, 120, 0.15)'
                          : 'rgba(245, 101, 101, 0.15)',
                      color: user.status === 'Active' ? '#276749' : '#9B2C2C',
                    }}
                  >
                    {user.status}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => handleOpenDetails(user)}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {paginatedUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No customers found matching that query.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* User Details & Booking History Dialog */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
        >
          Customer Dossier
        </DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Grid container spacing={3}>
              {/* Profile card summary */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 1,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: '#FAD02C',
                      color: '#1A202C',
                      fontSize: '2rem',
                      mb: 2,
                      fontWeight: 'bold',
                    }}
                  >
                    {selectedUser.name.charAt(0)}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {selectedUser.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                  >
                    Customer ID: {selectedUser.id}
                  </Typography>
                  <Box
                    sx={{
                      mt: 1,
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      bgcolor:
                        selectedUser.status === 'Active'
                          ? 'rgba(72, 187, 120, 0.15)'
                          : 'rgba(245, 101, 101, 0.15)',
                      color:
                        selectedUser.status === 'Active'
                          ? '#276749'
                          : '#9B2C2C',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {selectedUser.status}
                  </Box>

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
                      <EmailIcon color="action" fontSize="small" />
                      <Typography variant="body2">
                        {selectedUser.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon color="action" fontSize="small" />
                      <Typography variant="body2">
                        {selectedUser.phone}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <UserIcon color="action" fontSize="small" />
                      <Typography variant="body2">
                        Joined: {selectedUser.joined}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              {/* Booking history table */}
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
                </Box>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{ border: '1px solid #E2E8F0' }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Service</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedUser.history.map(hist => (
                        <TableRow key={hist.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {hist.id}
                          </TableCell>
                          <TableCell>{hist.date}</TableCell>
                          <TableCell>{hist.service}</TableCell>
                          <TableCell>{hist.amount}</TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{
                                display: 'inline-block',
                                px: 1,
                                py: 0.2,
                                borderRadius: 1.5,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                bgcolor:
                                  hist.status === 'Completed'
                                    ? 'rgba(72, 187, 120, 0.15)'
                                    : hist.status === 'Pending'
                                      ? 'rgba(250, 208, 44, 0.2)'
                                      : hist.status === 'Assigned'
                                        ? 'rgba(66, 153, 225, 0.15)'
                                        : 'rgba(245, 101, 101, 0.15)',
                                color:
                                  hist.status === 'Completed'
                                    ? '#276749'
                                    : hist.status === 'Pending'
                                      ? '#B7791F'
                                      : hist.status === 'Assigned'
                                        ? '#2B6CB0'
                                        : '#9B2C2C',
                              }}
                            >
                              {hist.status}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setOpenDetailDialog(false)}
            color="secondary"
            variant="contained"
          >
            Close Dossier
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default Users;
