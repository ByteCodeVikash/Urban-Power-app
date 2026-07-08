import React from 'react';
import {
  Box,
  Tab,
  Tabs,
  Typography,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { HourglassEmpty as PendingIcon } from '@mui/icons-material';

export const SupportCenter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  const tabLabels = [
    'All Tickets',
    'Complaints',
    'Customer Feedback',
    'Escalations',
  ];

  return (
    <Box>
      <PageHeader
        title="Support Center"
        subtitle="Manage help tickets, escalations, and feedbacks."
      />

      <Tabs value={getActiveTab()} onChange={handleTabChange} sx={{ mb: 3 }}>
        {tabLabels.map(label => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      <Alert
        severity="warning"
        icon={<PendingIcon />}
        sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}
      >
        <strong>Pending Backend API</strong> — No support ticket endpoint exists
        in the backend. A dedicated <code>GET /api/v1/support/tickets</code> API
        is required to populate this module. Once available, integrate it here
        to list, filter, assign, and resolve tickets.
      </Alert>

      <Card
        sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}
      >
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <PendingIcon sx={{ fontSize: 56, color: '#CBD5E0', mb: 2 }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: '#4A5568', mb: 1 }}
          >
            {tabLabels[getActiveTab()]} — Awaiting Backend Integration
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 480, mx: 'auto' }}
          >
            This section will display real support tickets once the backend
            provides a support ticket management API. No mock data is shown.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SupportCenter;
