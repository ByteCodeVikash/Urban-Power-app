import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Rating,
} from '@mui/material';

interface Technician {
  name: string;
  rating: number;
  completedJobs: number;
  status: 'Available' | 'Busy' | 'Offline';
  avatarLetter: string;
}

const topTechnicians: Technician[] = [
  {
    name: 'Amit Sharma',
    rating: 4.9,
    completedJobs: 142,
    status: 'Available',
    avatarLetter: 'AS',
  },
  {
    name: 'Rohan Verma',
    rating: 4.8,
    completedJobs: 110,
    status: 'Busy',
    avatarLetter: 'RV',
  },
  {
    name: 'Sunil Yadav',
    rating: 4.8,
    completedJobs: 95,
    status: 'Available',
    avatarLetter: 'SY',
  },
  {
    name: 'Vikram Singh',
    rating: 4.7,
    completedJobs: 88,
    status: 'Offline',
    avatarLetter: 'VS',
  },
  {
    name: 'Karan Johar',
    rating: 4.7,
    completedJobs: 82,
    status: 'Available',
    avatarLetter: 'KJ',
  },
];

const getStatusColor = (status: Technician['status']) => {
  switch (status) {
    case 'Available':
      return '#48BB78';
    case 'Busy':
      return '#ED8936';
    default:
      return '#A0AEC0';
  }
};

export const TopTechniciansWidget: React.FC = () => {
  return (
    <Card
      sx={{ border: '1px solid #E2E8F0', borderRadius: 3.5, boxShadow: 'none' }}
    >
      <CardContent sx={{ pb: '16px !important' }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 2, fontFamily: '"Outfit", sans-serif' }}
        >
          Top Performing Technicians
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {topTechnicians.map(tech => (
            <Box
              key={tech.name}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  flexGrow: 1,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: '#EDF2F7',
                    color: '#4A5568',
                    width: 36,
                    height: 36,
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}
                >
                  {tech.avatarLetter}
                </Avatar>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: '#2D3748' }}
                  >
                    {tech.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating
                      value={tech.rating}
                      precision={0.1}
                      readOnly
                      size="small"
                    />
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: '#4A5568' }}
                    >
                      {tech.rating}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: '#2D3748' }}
                >
                  {tech.completedJobs} jobs
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: getStatusColor(tech.status),
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: getStatusColor(tech.status),
                    }}
                  />
                  {tech.status}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TopTechniciansWidget;
