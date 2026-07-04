import React from 'react';
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
  Avatar,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Person as CustomerIcon,
  Engineering as TechIcon,
  Room as LocationIcon,
  AccessTime as DateIcon,
} from '@mui/icons-material';

// Mock list of orders for detail view extraction
const mockOrdersDetail: Record<
  string,
  {
    id: string;
    customer: string;
    email: string;
    phone: string;
    address: string;
    type: string;
    serviceDetail: string;
    amount: string;
    status: string;
    technician: string;
    date: string;
    timeSlot: string;
    timeline: { title: string; desc: string; date: string; active: boolean }[];
  }
> = {
  'ORD-101': {
    id: 'ORD-101',
    customer: 'Vikash Kumar',
    email: 'vikash.kumar@gmail.com',
    phone: '+91 98765 43210',
    address:
      'Flat 405, Block B, Green Glen Layout, Outer Ring Road, Bangalore - 560103',
    type: 'Scrap',
    serviceDetail:
      'Electronic Scrap Pick-up (Bulk Old Computers, Printers, Keyboard & Cables)',
    amount: '₹1,200',
    status: 'Completed',
    technician: 'Ramesh Kumar',
    date: '2026-07-03',
    timeSlot: '10:00 AM - 12:00 PM',
    timeline: [
      {
        title: '1. Booking Initiated',
        desc: 'Order registered on client application.',
        date: 'July 03, 2026 - 08:15 AM',
        active: true,
      },
      {
        title: '2. Payment Confirmed',
        desc: 'Pre-auth checkout verified via secure Razorpay gateway.',
        date: 'July 03, 2026 - 08:17 AM',
        active: true,
      },
      {
        title: '3. Scanning Partners',
        desc: 'AI routing engine scans matching local technicians.',
        date: 'July 03, 2026 - 08:20 AM',
        active: true,
      },
      {
        title: '4. Partner Assigned',
        desc: 'Ramesh Kumar allocated to service booking.',
        date: 'July 03, 2026 - 08:30 AM',
        active: true,
      },
      {
        title: '5. In Transit',
        desc: 'Partner departed towards client site with tools.',
        date: 'July 03, 2026 - 09:00 AM',
        active: true,
      },
      {
        title: '6. Arrived at Location',
        desc: 'Partner checked in at HSR Layout center.',
        date: 'July 03, 2026 - 09:20 AM',
        active: true,
      },
      {
        title: '7. Inspection Commenced',
        desc: 'Diagnostic / scrap item weighing scale setup in progress.',
        date: 'July 03, 2026 - 09:30 AM',
        active: true,
      },
      {
        title: '8. Measurements Approved',
        desc: 'Final quantity weights verified and accepted by customer.',
        date: 'July 03, 2026 - 09:38 AM',
        active: true,
      },
      {
        title: '9. Payout Settled',
        desc: 'Platform payout transferred directly to user bank account.',
        date: 'July 03, 2026 - 09:40 AM',
        active: true,
      },
      {
        title: '10. Booking Closed',
        desc: 'Order resolved and archived as successful transaction.',
        date: 'July 03, 2026 - 09:45 AM',
        active: true,
      },
    ],
  },
  'ORD-102': {
    id: 'ORD-102',
    customer: 'Amit Sharma',
    email: 'amit.sharma@yahoo.com',
    phone: '+91 98765 12345',
    address: 'House No. 12, Road 4, Sector 7, Dwarka, New Delhi - 110075',
    type: 'Maintenance',
    serviceDetail: 'Air Conditioner Deep Cleaning & Gas Refilling',
    amount: '₹2,500',
    status: 'Pending',
    technician: 'None',
    date: '2026-07-03',
    timeSlot: '02:00 PM - 04:00 PM',
    timeline: [
      {
        title: '1. Booking Initiated',
        desc: 'Order registered on client application.',
        date: 'July 03, 2026 - 09:30 AM',
        active: true,
      },
      {
        title: '2. Payment Confirmed',
        desc: 'Awaiting cash settlement on service delivery.',
        date: 'July 03, 2026 - 09:32 AM',
        active: true,
      },
      {
        title: '3. Scanning Partners',
        desc: 'AI routing engine scans matching local technicians.',
        date: 'July 03, 2026 - 09:35 AM',
        active: true,
      },
      {
        title: '4. Partner Assigned',
        desc: 'Awaiting manual assign override or auto-dispatch matching.',
        date: 'Awaiting Allocation',
        active: false,
      },
      {
        title: '5. In Transit',
        desc: 'Pending partner assignment.',
        date: 'Pending',
        active: false,
      },
      {
        title: '6. Arrived at Location',
        desc: 'Pending partner assignment.',
        date: 'Pending',
        active: false,
      },
      {
        title: '7. Inspection Commenced',
        desc: 'Pending partner assignment.',
        date: 'Pending',
        active: false,
      },
      {
        title: '8. Measurements Approved',
        desc: 'Pending partner assignment.',
        date: 'Pending',
        active: false,
      },
      {
        title: '9. Payout Settled',
        desc: 'Pending partner assignment.',
        date: 'Pending',
        active: false,
      },
      {
        title: '10. Booking Closed',
        desc: 'Pending partner assignment.',
        date: 'Pending',
        active: false,
      },
    ],
  },
  'ORD-103': {
    id: 'ORD-103',
    customer: 'Priya Singh',
    email: 'priya.singh@gmail.com',
    phone: '+91 91234 56789',
    address: 'Villa 5A, Jasmine Gardens, Gachibowli, Hyderabad - 500032',
    type: 'Beautician',
    serviceDetail: 'Bridal Make-up & Hair Styling Package',
    amount: '₹1,800',
    status: 'Assigned',
    technician: 'Suman Lata',
    date: '2026-07-03',
    timeSlot: '11:00 AM - 01:00 PM',
    timeline: [
      {
        title: '1. Booking Initiated',
        desc: 'Order registered on client application.',
        date: 'July 03, 2026 - 07:00 AM',
        active: true,
      },
      {
        title: '2. Payment Confirmed',
        desc: 'Payment verified via secure Razorpay gateway.',
        date: 'July 03, 2026 - 07:02 AM',
        active: true,
      },
      {
        title: '3. Scanning Partners',
        desc: 'AI routing engine scans matching local technicians.',
        date: 'July 03, 2026 - 07:05 AM',
        active: true,
      },
      {
        title: '4. Partner Assigned',
        desc: 'Suman Lata selected for the Beautician package dispatch.',
        date: 'July 03, 2026 - 08:30 AM',
        active: true,
      },
      {
        title: '5. In Transit',
        desc: 'Partner will depart at scheduled time.',
        date: 'Awaiting departure',
        active: false,
      },
      {
        title: '6. Arrived at Location',
        desc: 'Pending arrival.',
        date: 'Pending',
        active: false,
      },
      {
        title: '7. Inspection Commenced',
        desc: 'Pending execution.',
        date: 'Pending',
        active: false,
      },
      {
        title: '8. Measurements Approved',
        desc: 'Pending execution.',
        date: 'Pending',
        active: false,
      },
      {
        title: '9. Payout Settled',
        desc: 'Pending execution.',
        date: 'Pending',
        active: false,
      },
      {
        title: '10. Booking Closed',
        desc: 'Pending execution.',
        date: 'Pending',
        active: false,
      },
    ],
  },
};

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find order or default to the first mock order if not found
  const orderId = id && mockOrdersDetail[id] ? id : 'ORD-101';
  const order = mockOrdersDetail[orderId];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header with Back Navigation */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<BackIcon />}
          onClick={() => navigate('/orders')}
        >
          Back to List
        </Button>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontFamily: '"Outfit", sans-serif',
              color: '#1A202C',
            }}
          >
            Order Details: {order.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Operational timelines, status checks, and customer contacts.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Side: Summary & Customer Card */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Grid container spacing={3}>
            {/* Service & Payment Detail Summary */}
            <Grid size={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      fontFamily: '"Outfit", sans-serif',
                    }}
                  >
                    Service Specification
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Category
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {order.type}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Amount Paid
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {order.amount}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Order Status
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
                              order.status === 'Completed'
                                ? 'rgba(72, 187, 120, 0.15)'
                                : order.status === 'Pending'
                                  ? 'rgba(250, 208, 44, 0.2)'
                                  : 'rgba(66, 153, 225, 0.15)',
                            color:
                              order.status === 'Completed'
                                ? '#276749'
                                : order.status === 'Pending'
                                  ? '#B7791F'
                                  : '#2B6CB0',
                          }}
                        >
                          {order.status}
                        </Box>
                      </Box>
                    </Grid>
                    <Grid size={12}>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        Job Scope Details
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {order.serviceDetail}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Customer Details Block */}
            <Grid size={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 2.5,
                    }}
                  >
                    <Avatar sx={{ bgcolor: '#FAD02C', color: '#1A202C' }}>
                      <CustomerIcon />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          fontFamily: '"Outfit", sans-serif',
                        }}
                      >
                        Customer Record
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Contact details and address
                      </Typography>
                    </Box>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {order.customer}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Phone Number
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {order.phone}
                      </Typography>
                    </Grid>
                    <Grid size={12}>
                      <Typography variant="caption" color="text.secondary">
                        Email Address
                      </Typography>
                      <Typography variant="body1">{order.email}</Typography>
                    </Grid>
                    <Grid size={12}>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <LocationIcon color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Service Address
                          </Typography>
                          <Typography variant="body2" color="text.primary">
                            {order.address}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Allocated Technician Details */}
            <Grid size={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 2.5,
                    }}
                  >
                    <Avatar sx={{ bgcolor: '#2D3748', color: '#FFFFFF' }}>
                      <TechIcon />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          fontFamily: '"Outfit", sans-serif',
                        }}
                      >
                        Assigned Professional
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Assigned service specialist
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1">
                    {order.technician === 'None' ? (
                      <span style={{ color: '#E53E3E', fontWeight: 600 }}>
                        Unassigned (Awaiting Action)
                      </span>
                    ) : (
                      <span>
                        <strong>{order.technician}</strong> has been assigned to
                        this ticket.
                      </span>
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Side: Booking Timeline (Stepper) */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}
              >
                <DateIcon color="action" />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
                >
                  Booking Timeline
                </Typography>
              </Box>

              <Box sx={{ pl: 1 }}>
                <Stepper
                  orientation="vertical"
                  activeStep={order.timeline.filter(t => t.active).length - 1}
                >
                  {order.timeline.map(step => (
                    <Step key={step.title} expanded>
                      <StepLabel
                        error={!step.active && order.status === 'Cancelled'}
                        optional={
                          <Typography variant="caption" color="text.secondary">
                            {step.date}
                          </Typography>
                        }
                      >
                        <Typography
                          sx={{
                            fontWeight: step.active ? 600 : 400,
                            color: step.active
                              ? 'text.primary'
                              : 'text.disabled',
                          }}
                        >
                          {step.title}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary">
                          {step.desc}
                        </Typography>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default OrderDetails;
