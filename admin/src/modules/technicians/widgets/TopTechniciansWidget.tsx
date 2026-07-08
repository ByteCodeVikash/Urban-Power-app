import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Skeleton,
} from '@mui/material';
import { useTechnicians } from '../../../hooks/useTechnicians';

const getStatusColor = (available: boolean) =>
  available ? '#48BB78' : '#ED8936';

export const TopTechniciansWidget: React.FC = () => {
  const { data: techData = [], isLoading } = useTechnicians();

  // Top 5 by jobs completed (descending)
  const top5 = [...techData]
    .sort((a, b) => (b.jobsCompleted ?? 0) - (a.jobsCompleted ?? 0))
    .slice(0, 5);

  return (
    <Card
      sx={{ border: '1px solid #E2E8F0', borderRadius: 3.5, boxShadow: 'none' }}
    >
      <CardContent sx={{ pb: '16px !important' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
          >
            Top Performing Technicians
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 1,
              py: 0.2,
              borderRadius: 1.5,
              fontSize: '0.65rem',
              fontWeight: 700,
              bgcolor: 'rgba(72, 187, 120, 0.12)',
              color: '#276749',
              border: '1px solid rgba(72, 187, 120, 0.3)',
            }}
          >
            ● Live Data
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={40}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Box>
        ) : top5.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No technician data available yet.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {top5.map(tech => (
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
                    {tech.name
                      .split(' ')
                      .slice(0, 2)
                      .map((w: string) => w[0])
                      .join('')
                      .toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: '#2D3748' }}
                    >
                      {tech.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tech.service}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: '#2D3748' }}
                  >
                    {tech.jobsCompleted ?? 0} jobs
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: getStatusColor(tech.isAvailable ?? false),
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
                        bgcolor: getStatusColor(tech.isAvailable ?? false),
                      }}
                    />
                    {tech.isAvailable ? 'Available' : 'Busy'}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TopTechniciansWidget;
