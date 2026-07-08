import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  textColor?: string;
  change?: {
    value: number | string;
    type: 'increase' | 'decrease';
  };
  dataSource?: {
    type: 'real' | 'mock';
    label?: string;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  textColor = '#FFFFFF',
  change,
  dataSource,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3.5,
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.03)',
        border: '1px solid #E2E8F0',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                fontSize: '0.72rem',
                letterSpacing: 1.2,
                mb: 1.2,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 850, color: '#1A202C', letterSpacing: -0.5 }}
            >
              {value}
            </Typography>

            {change && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mt: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: change.type === 'increase' ? '#48BB78' : '#F56565',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}
                >
                  {change.type === 'increase' ? (
                    <ArrowUpIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <ArrowDownIcon sx={{ fontSize: 16 }} />
                  )}
                  <span>{change.value}</span>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  vs last month
                </Typography>
              </Box>
            )}
            {dataSource && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mt: change ? 1.0 : 2.0,
                  px: 1.2,
                  py: 0.3,
                  borderRadius: 1.5,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  bgcolor:
                    dataSource.type === 'real'
                      ? 'rgba(72, 187, 120, 0.12)'
                      : 'rgba(237, 137, 54, 0.12)',
                  color: dataSource.type === 'real' ? '#276749' : '#C05621',
                  border:
                    dataSource.type === 'real'
                      ? '1px solid rgba(72, 187, 120, 0.25)'
                      : '1px solid rgba(237, 137, 54, 0.25)',
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: dataSource.type === 'real' ? '#48BB78' : '#ED8936',
                  }}
                />
                <span>
                  {dataSource.label ||
                    (dataSource.type === 'real' ? 'Real API' : 'Pending API')}
                </span>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: color,
              color: textColor,
              boxShadow: `0px 4px 10px rgba(0,0,0,0.05)`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
