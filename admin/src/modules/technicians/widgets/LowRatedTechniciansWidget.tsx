import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Skeleton,
  Chip,
} from '@mui/material';
import { Warning as WarningIcon, Star as StarIcon } from '@mui/icons-material';
import { useTechnicians } from '../../../hooks/useTechnicians';

export const LowRatedTechniciansWidget: React.FC = () => {
  const { data: techData = [], isLoading } = useTechnicians();

  // Filter technicians with rating less than 4.0
  const lowRatedTechs = [...techData]
    .filter(t => t.rating && t.rating < 4.0)
    .sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0));

  return (
    <Card sx={{ border: '1px solid #F56565', borderRadius: 3.5, boxShadow: 'none' }}>
      <CardContent sx={{ pb: '16px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon sx={{ color: '#F56565' }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif', color: '#1A202C' }}
            >
              Low Rated Technicians
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 1,
              py: 0.2,
              borderRadius: 1.5,
              fontSize: '0.65rem',
              fontWeight: 700,
              bgcolor: 'rgba(245, 101, 101, 0.12)',
              color: '#C53030',
              border: '1px solid rgba(245, 101, 101, 0.3)',
            }}
          >
            ● Live Data
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2].map(i => (
              <Skeleton key={i} variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        ) : lowRatedTechs.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
            No technicians are currently rated below 4.0.
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: '#FFF5F5',
                      color: '#C53030',
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
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2D3748' }}>
                      {tech.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tech.service} • {tech.phone}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={<StarIcon sx={{ '&&': { color: '#FFF' }, fontSize: '0.9rem' }} />}
                    label={tech.rating?.toFixed(1) || '—'}
                    size="small"
                    sx={{
                      bgcolor: '#E53E3E',
                      color: '#FFF',
                      fontWeight: 700,
                      height: 24,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
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
