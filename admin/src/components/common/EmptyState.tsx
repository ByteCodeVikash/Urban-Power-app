import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { InboxOutlined as InboxIcon } from '@mui/icons-material';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are no active database items matching this layout context.',
  actionText,
  onAction,
  icon = <InboxIcon sx={{ fontSize: 60, color: '#CBD5E0' }} />,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
        py: 8,
        bgcolor: '#FFFFFF',
        borderRadius: 3,
        border: '1px dashed #E2E8F0',
      }}
    >
      <Box sx={{ mb: 2 }}>{icon}</Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1A202C' }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mb: 3 }}>
        {description}
      </Typography>
      {actionText && onAction && (
        <Button
          variant="contained"
          color="primary"
          onClick={onAction}
          sx={{ fontWeight: 600, px: 3, py: 1 }}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
