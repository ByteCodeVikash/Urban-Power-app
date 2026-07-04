import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Rating,
  Button,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface LowRatedTech {
  name: string;
  rating: number;
  completedJobs: number;
  avatarLetter: string;
  issue: string;
}

const lowRatedTechs: LowRatedTech[] = [
  {
    name: 'Rakesh Verma',
    rating: 3.5,
    completedJobs: 18,
    avatarLetter: 'RV',
    issue: 'Customer Complaints: Delay',
  },
  {
    name: 'Sanjay Kumar',
    rating: 3.8,
    completedJobs: 24,
    avatarLetter: 'SK',
    issue: 'Poor behavior reported',
  },
];

export const LowRatedTechniciansWidget: React.FC = () => {
  return (
    <Card
      sx={{ border: '1px solid #F56565', borderRadius: 3.5, boxShadow: 'none' }}
    >
      <CardContent sx={{ pb: '16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <WarningIcon sx={{ color: '#F56565' }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontFamily: '"Outfit", sans-serif',
              color: '#1A202C',
            }}
          >
            Low Rated Technicians
          </Typography>
        </Box>
        {lowRatedTechs.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No technicians under the rating threshold (4.0).
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {lowRatedTechs.map(tech => (
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
                      bgcolor: 'rgba(245, 101, 101, 0.1)',
                      color: '#F56565',
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
                        sx={{ fontWeight: 700, color: '#F56565' }}
                      >
                        {tech.rating}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', fontWeight: 500 }}
                  >
                    {tech.issue}
                  </Typography>
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    sx={{
                      p: 0,
                      minWidth: 0,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'none',
                    }}
                  >
                    Take Action
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default LowRatedTechniciansWidget;
