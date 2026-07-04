import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';

interface ServiceStat {
  name: string;
  count: number;
  revenue: string;
  percentage: number;
  color: string;
}

const serviceStats: ServiceStat[] = [
  {
    name: 'AC Repair & Service',
    count: 184,
    revenue: '₹2,39,200',
    percentage: 45,
    color: '#3182CE',
  },
  {
    name: 'Home Deep Cleaning',
    count: 120,
    revenue: '₹1,80,000',
    percentage: 30,
    color: '#48BB78',
  },
  {
    name: 'Electrical Wiring',
    count: 98,
    revenue: '₹44,100',
    percentage: 15,
    color: '#ED8936',
  },
  {
    name: 'Plumbing Works',
    count: 45,
    revenue: '₹19,600',
    percentage: 10,
    color: '#E53E3E',
  },
];

export const TopServicesWidget: React.FC = () => {
  return (
    <Card
      sx={{ border: '1px solid #E2E8F0', borderRadius: 3.5, boxShadow: 'none' }}
    >
      <CardContent sx={{ pb: '16px !important' }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 2, fontFamily: '"Outfit", sans-serif' }}
        >
          Top Performing Services
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
          {serviceStats.map(service => (
            <Box key={service.name}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: '#2D3748' }}
                >
                  {service.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: '#4A5568' }}
                >
                  {service.revenue}{' '}
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{ color: 'text.secondary', fontWeight: 500 }}
                  >
                    ({service.count} jobs)
                  </Typography>
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={service.percentage}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#EDF2F7',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: service.color,
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TopServicesWidget;
