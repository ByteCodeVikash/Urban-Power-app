import React from 'react';
import { Box, Typography, Button, Breadcrumbs, Link } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  link?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actionText?: string;
  onActionClick?: () => void;
  actionIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actionText,
  onActionClick,
  actionIcon,
  children,
}) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={
            <NavigateNextIcon fontSize="small" sx={{ color: '#A0AEC0' }} />
          }
          aria-label="breadcrumb"
          sx={{ mb: 0.5 }}
        >
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={e => {
              e.preventDefault();
              navigate('/');
            }}
            sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#718096' }}
          >
            Home
          </Link>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography
                key={item.label}
                color="text.primary"
                sx={{ fontSize: '0.85rem', fontWeight: 600 }}
              >
                {item.label}
              </Typography>
            ) : (
              <Link
                key={item.label}
                underline="hover"
                color="inherit"
                href="#"
                onClick={e => {
                  e.preventDefault();
                  if (item.link) navigate(item.link);
                }}
                sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#718096' }}
              >
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      {/* Main Row */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          width: '100%',
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 850,
              fontFamily: '"Outfit", sans-serif',
              color: '#1A202C',
              letterSpacing: -0.5,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, fontSize: '0.9rem' }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            alignSelf: { xs: 'stretch', sm: 'auto' },
          }}
        >
          {children}
          {actionText && onActionClick && (
            <Button
              variant="contained"
              color="primary"
              startIcon={actionIcon}
              onClick={onActionClick}
              sx={{
                fontWeight: 700,
                px: 3,
                py: 1.2,
                borderRadius: 2.5,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0px 4px 12px rgba(250, 208, 44, 0.3)',
                },
              }}
            >
              {actionText}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PageHeader;
