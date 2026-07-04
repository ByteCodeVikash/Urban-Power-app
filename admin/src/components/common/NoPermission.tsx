import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { GppBadOutlined as ShieldAlertIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface NoPermissionProps {
  requiredPermission?: string;
}

export const NoPermission: React.FC<NoPermissionProps> = ({
  requiredPermission,
}) => {
  const navigate = useNavigate();

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
        minHeight: '60vh',
        bgcolor: '#FFFFFF',
        borderRadius: 3,
        border: '1px solid #E2E8F0',
      }}
    >
      <Box
        sx={{
          mb: 2,
          p: 2,
          borderRadius: '50%',
          bgcolor: 'rgba(245, 101, 101, 0.1)',
        }}
      >
        <ShieldAlertIcon sx={{ fontSize: 64, color: '#F56565' }} />
      </Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          mb: 1,
          color: '#2D3748',
          fontFamily: '"Outfit", sans-serif',
        }}
      >
        Access Restricted
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: 450, mb: 3 }}
      >
        Your user role does not possess the permissions required to view this
        administrative interface scope.
      </Typography>
      {requiredPermission && (
        <Typography
          variant="caption"
          sx={{
            fontFamily: 'monospace',
            bgcolor: '#EDF2F7',
            px: 1.5,
            py: 0.8,
            borderRadius: 1.5,
            color: '#4A5568',
            fontWeight: 600,
            mb: 4,
          }}
        >
          Required key: {requiredPermission}
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate(-1)}
          sx={{ fontWeight: 600, px: 3 }}
        >
          Go Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
          sx={{ fontWeight: 600, px: 3 }}
        >
          Back to Safety
        </Button>
      </Box>
    </Box>
  );
};

export default NoPermission;
