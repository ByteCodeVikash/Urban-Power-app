import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
  Chip,
  Grid,
} from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import type { ColumnConfig } from '../../components/common/DataTable';
import DeleteDialog from '../../components/common/DeleteDialog';
import { Add as AddIcon } from '@mui/icons-material';

interface Coupon {
  id: string;
  code: string;
  type: 'Percentage' | 'Flat Discount' | 'Referral';
  value: number;
  expiryDate: string;
  usageCount: number;
  status: 'Active' | 'Expired';
}

const mockCoupons: Coupon[] = [
  { id: '1', code: 'UPWELCOME10', type: 'Percentage', value: 10, expiryDate: '2026-12-31', usageCount: 428, status: 'Active' },
  { id: '2', code: 'UPFLAT200', type: 'Flat Discount', value: 200, expiryDate: '2026-08-15', usageCount: 145, status: 'Active' },
  { id: '3', code: 'REF-VIKASH50', type: 'Referral', value: 50, expiryDate: '2027-01-01', usageCount: 22, status: 'Active' },
  { id: '4', code: 'UPEXPIRED', type: 'Percentage', value: 15, expiryDate: '2026-05-01', usageCount: 98, status: 'Expired' },
];

export const CouponManager: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  // Form Fields State
  const [code, setCode] = useState('');
  const [type, setType] = useState<'Percentage' | 'Flat Discount' | 'Referral'>('Percentage');
  const [value, setValue] = useState(0);
  const [expiryDate, setExpiryDate] = useState('');

  const handleOpenCreate = () => {
    setSelectedCoupon(null);
    setCode('');
    setType('Percentage');
    setValue(0);
    setExpiryDate('');
    setOpenForm(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setCode(coupon.code);
    setType(coupon.type);
    setValue(coupon.value);
    setExpiryDate(coupon.expiryDate);
    setOpenForm(true);
  };

  const handleSave = () => {
    if (selectedCoupon) {
      // Update
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === selectedCoupon.id
            ? { ...c, code, type, value, expiryDate }
            : c
        )
      );
    } else {
      // Create
      const newCoupon: Coupon = {
        id: Math.random().toString(),
        code,
        type,
        value,
        expiryDate,
        usageCount: 0,
        status: new Date(expiryDate) > new Date() ? 'Active' : 'Expired',
      };
      setCoupons((prev) => [newCoupon, ...prev]);
    }
    setOpenForm(false);
  };

  const handleDeleteTrigger = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setOpenDelete(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedCoupon) {
      setCoupons((prev) => prev.filter((c) => c.id !== selectedCoupon.id));
    }
    setOpenDelete(false);
  };

  const columns: ColumnConfig<Coupon>[] = [
    { id: 'code', label: 'Coupon Code', render: (row) => <strong>{row.code}</strong> },
    { id: 'type', label: 'Type' },
    {
      id: 'value',
      label: 'Discount Value',
      render: (row) => (row.type === 'Percentage' ? `${row.value}%` : `₹${row.value}`),
    },
    { id: 'expiryDate', label: 'Expiry Date' },
    { id: 'usageCount', label: 'Total Usages', align: 'center' },
    {
      id: 'status',
      label: 'Status',
      render: (row) => (
        <Chip
          label={row.status}
          size="small"
          color={row.status === 'Active' ? 'success' : 'default'}
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="text" size="small" onClick={() => handleOpenEdit(row)}>
            Edit
          </Button>
          <Button variant="text" size="small" color="error" onClick={() => handleDeleteTrigger(row)}>
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Coupon Management"
        subtitle="Configure flat, percentage, and referral discounts."
        actionText="Create Coupon"
        actionIcon={<AddIcon />}
        onActionClick={handleOpenCreate}
      />

      <DataTable
        columns={columns}
        data={coupons}
        title="Coupon List"
        filename="coupons_export"
      />

      {/* Create / Edit Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
          {selectedCoupon ? 'Update Coupon' : 'Create New Coupon'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Coupon Code"
                placeholder="e.g. SUMMER50"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                fullWidth
                label="Discount Type"
                value={type}
                onChange={(e) => setType(e.target.value as Coupon['type'])}
              >
                <MenuItem value="Percentage">Percentage Discount (%)</MenuItem>
                <MenuItem value="Flat Discount">Flat Value Discount (₹)</MenuItem>
                <MenuItem value="Referral">Referral Coupon</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type="number"
                label={type === 'Percentage' ? 'Discount Percentage (%)' : 'Discount Value (₹)'}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type="date"
                label="Expiry Date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenForm(false)} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {selectedCoupon ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteDialog
        open={openDelete}
        itemName={selectedCoupon?.code || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setOpenDelete(false)}
      />
    </Box>
  );
};

export default CouponManager;
