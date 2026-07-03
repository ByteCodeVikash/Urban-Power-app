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
import { DeleteOutline as DeleteIcon } from '@mui/icons-material';

interface DeleteDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  title = 'Delete Database Entry',
  message,
  itemName = 'this item',
  onConfirm,
  onCancel,
  loading = false,
}) => {
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
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pl: 2, pb: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: 'rgba(245, 101, 101, 0.1)',
            color: '#F56565',
          }}
        >
          <DeleteIcon />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', color: '#1A202C' }}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ py: 2 }}>
        <DialogContentText sx={{ color: 'text.primary', fontSize: '0.95rem' }}>
          {message || `Are you absolutely certain you wish to permanently delete ${itemName}? This operation is destructive and cannot be undone.`}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 1.5, gap: 1.5 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          color="secondary"
          disabled={loading}
          sx={{ fontWeight: 600, borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            fontWeight: 600,
            borderRadius: 2,
            bgcolor: '#F56565',
            color: '#FFFFFF',
            '&:hover': {
              bgcolor: '#E53E3E',
            },
          }}
          autoFocus
        >
          {loading ? 'Deleting...' : 'Delete Permanently'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
