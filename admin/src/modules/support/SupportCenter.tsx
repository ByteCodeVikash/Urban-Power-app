import React, { useState } from 'react';
import { Box, Tab, Tabs, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Grid } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import type { ColumnConfig } from '../../components/common/DataTable';

interface Ticket {
  id: string;
  customer: string;
  subject: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedExecutive: string;
  createdAt: string;
  description: string;
}

const mockTickets: Ticket[] = [
  {
    id: 'TKT-1002',
    customer: 'Vikash Kumar',
    subject: 'Delayed pickup for scrap materials',
    status: 'In Progress',
    priority: 'High',
    assignedExecutive: 'Amit Patel',
    createdAt: '2026-07-03 09:30',
    description: 'The technician has not reached the pickup point and is unreachable on phone. Customer requested immediate intervention.',
  },
  {
    id: 'TKT-1003',
    customer: 'Shweta Sharma',
    subject: 'Incorrect refund amount received',
    status: 'Open',
    priority: 'Critical',
    assignedExecutive: 'Rohan Joshi',
    createdAt: '2026-07-03 10:15',
    description: 'The refund was calculated for 2 items instead of 3. Difference of ₹450 pending settlement.',
  },
  {
    id: 'TKT-1004',
    customer: 'John Doe',
    subject: 'App crash during booking payment checkout',
    status: 'Resolved',
    priority: 'Medium',
    assignedExecutive: 'Sneha Rao',
    createdAt: '2026-07-02 14:00',
    description: 'Session timed out during payment gateway redirect. Payment confirmed via Razorpay logs and booking approved manually.',
  },
];

export const SupportCenter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Sync tab active index with current URL path
  const getActiveTab = () => {
    switch (location.pathname) {
      case '/support/complaints':
        return 1;
      case '/support/feedback':
        return 2;
      case '/support/escalations':
        return 3;
      default:
        return 0; // Tickets
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 1:
        navigate('/support/complaints');
        break;
      case 2:
        navigate('/support/feedback');
        break;
      case 3:
        navigate('/support/escalations');
        break;
      default:
        navigate('/support/tickets');
        break;
    }
  };

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'error';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'Resolved':
        return 'success';
      case 'In Progress':
        return 'warning';
      case 'Escalated':
        return 'error';
      default:
        return 'info';
    }
  };

  const columns: ColumnConfig<Ticket>[] = [
    { id: 'id', label: 'Ticket ID', render: (row) => <strong>{row.id}</strong> },
    { id: 'customer', label: 'Customer' },
    { id: 'subject', label: 'Subject' },
    {
      id: 'priority',
      label: 'Priority',
      render: (row) => <Chip label={row.priority} size="small" color={getPriorityColor(row.priority)} />,
    },
    {
      id: 'status',
      label: 'Status',
      render: (row) => <Chip label={row.status} size="small" variant="outlined" color={getStatusColor(row.status)} />,
    },
    { id: 'assignedExecutive', label: 'Assigned Executive' },
    { id: 'createdAt', label: 'Created At' },
    {
      id: 'actions',
      label: 'Actions',
      render: (row) => (
        <Button variant="text" size="small" onClick={() => setSelectedTicket(row)}>
          View Details
        </Button>
      ),
    },
  ];

  // Filter mock lists based on current path
  const getFilteredData = () => {
    const tab = getActiveTab();
    switch (tab) {
      case 1: // Complaints
        return mockTickets.filter((t) => t.subject.toLowerCase().includes('pickup') || t.subject.toLowerCase().includes('refund'));
      case 2: // Customer Feedback
        return mockTickets.filter((t) => t.status === 'Resolved');
      case 3: // Escalations
        return mockTickets.filter((t) => t.priority === 'Critical' || t.status === 'Escalated');
      default: // All Tickets / Tickets Tab
        return mockTickets;
    }
  };

  return (
    <Box>
      <PageHeader title="Support Center" subtitle="Manage help tickets, escalations, and feedbacks." />

      <Tabs value={getActiveTab()} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Tickets" />
        <Tab label="Complaints" />
        <Tab label="Customer Feedback" />
        <Tab label="Escalations" />
      </Tabs>

      <DataTable
        columns={columns}
        data={getFilteredData()}
        title="Support Tickets"
        filename="support_tickets_export"
      />

      {/* Ticket Details Dialog */}
      <Dialog open={!!selectedTicket} onClose={() => setSelectedTicket(null)} maxWidth="sm" fullWidth>
        {selectedTicket && (
          <>
            <DialogTitle sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
              {selectedTicket.id} - Ticket Details
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">Subject</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedTicket.subject}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Customer</Typography>
                  <Typography variant="body2">{selectedTicket.customer}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Assigned Executive</Typography>
                  <Typography variant="body2">{selectedTicket.assignedExecutive}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Priority</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selectedTicket.priority} size="small" color={getPriorityColor(selectedTicket.priority)} />
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selectedTicket.status} size="small" color={getStatusColor(selectedTicket.status)} />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">Issue Details</Typography>
                  <Typography variant="body2" sx={{ bgcolor: '#F7FAFC', p: 2, borderRadius: 2, border: '1px solid #E2E8F0', mt: 0.5 }}>
                    {selectedTicket.description}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedTicket(null)} variant="contained" color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default SupportCenter;
