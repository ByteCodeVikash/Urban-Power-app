import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  severity?: 'info' | 'warning' | 'error' | 'success';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  severity = 'info',
}) => {
  const getColor = () => {
    switch (severity) {
      case 'error':
        return '#F56565';
      case 'warning':
        return '#DD6B20';
      case 'success':
        return '#48BB78';
      default:
        return '#3182CE';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1.5,
            minWidth: { xs: 280, sm: 400 },
          },
        },
      }}
    >
      <DialogTitle sx={{ borderLeft: `6px solid ${getColor()}`, pl: 2, py: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ py: 2 }}>
        <DialogContentText sx={{ color: 'text.primary', fontSize: '0.95rem' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 1.5, gap: 1.5 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          color="secondary"
          sx={{ fontWeight: 600, borderRadius: 2 }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            fontWeight: 600,
            borderRadius: 2,
            bgcolor: getColor(),
            color: '#FFFFFF',
            '&:hover': {
              filter: 'brightness(0.9)',
            },
          }}
          autoFocus
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
