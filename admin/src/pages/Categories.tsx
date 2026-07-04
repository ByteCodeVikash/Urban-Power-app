import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';

// Initial Mock Categories
const initialCategories = [
  {
    id: 'CAT-01',
    name: 'Scrap',
    description:
      'Domestic & office scrap pick-up services with weighing and payment processing',
    subCategories: 'Electronics, Metals, Cardboard & Paper',
    status: 'Active',
  },
  {
    id: 'CAT-02',
    name: 'Maintenance',
    description:
      'Home appliances cleaning, repairs, electrical, plumbing services',
    subCategories: 'AC Servicing, Water Purifier, Refrigerator, Plumbing',
    status: 'Active',
  },
  {
    id: 'CAT-03',
    name: 'Beautician',
    description:
      'Professional doorstep salon and beauty grooming services for ladies',
    subCategories: 'Makeup Packages, Facial Skin Care, Pedicure Salon',
    status: 'Active',
  },
];

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState(initialCategories);

  // Dialog States
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    (typeof initialCategories)[0] | null
  >(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subCategories, setSubCategories] = useState('');

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setSubCategories('');
    setOpenFormDialog(true);
  };

  const handleOpenEdit = (categoryItem: (typeof initialCategories)[0]) => {
    setEditingCategory(categoryItem);
    setName(categoryItem.name);
    setDescription(categoryItem.description);
    setSubCategories(categoryItem.subCategories);
    setOpenFormDialog(true);
  };

  const handleOpenDelete = (categoryItem: (typeof initialCategories)[0]) => {
    setEditingCategory(categoryItem);
    setOpenDeleteDialog(true);
  };

  const handleSave = () => {
    if (editingCategory) {
      setCategories(
        categories.map(c =>
          c.id === editingCategory.id
            ? { ...c, name, description, subCategories }
            : c,
        ),
      );
    } else {
      const newCategory = {
        id: `CAT-0${categories.length + 1}`,
        name,
        description,
        subCategories,
        status: 'Active',
      };
      setCategories([...categories, newCategory]);
    }
    setOpenFormDialog(false);
  };

  const handleConfirmDelete = () => {
    if (editingCategory) {
      setCategories(categories.filter(c => c.id !== editingCategory.id));
      setOpenDeleteDialog(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontFamily: '"Outfit", sans-serif',
              color: '#1A202C',
            }}
          >
            Service Categories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage main divisions and organize related sub-services under key
            catalog headings.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
        >
          Add Category
        </Button>
      </Box>

      {/* Categories Grid Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: '1px solid #E2E8F0' }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category ID</TableCell>
              <TableCell>Title / Name</TableCell>
              <TableCell>Description Summary</TableCell>
              <TableCell>Sub-Categories List</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map(cat => (
              <TableRow key={cat.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{cat.id}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: '#FAD02C',
                        color: '#1A202C',
                      }}
                    >
                      <CategoryIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {cat.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ maxWidth: 280 }}>{cat.description}</TableCell>
                <TableCell>{cat.subCategories}</TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      bgcolor: 'rgba(72, 187, 120, 0.15)',
                      color: '#276749',
                    }}
                  >
                    {cat.status}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 0.5,
                    }}
                  >
                    <IconButton
                      color="secondary"
                      size="small"
                      onClick={() => handleOpenEdit(cat)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleOpenDelete(cat)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Category Dialog */}
      <Dialog
        open={openFormDialog}
        onClose={() => setOpenFormDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
        >
          {editingCategory
            ? 'Modify Category Settings'
            : 'Create New Category Group'}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1.5 }}
          >
            <TextField
              fullWidth
              size="small"
              label="Category Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="Description Summary"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="Sub-categories (comma separated list)"
              value={subCategories}
              onChange={e => setSubCategories(e.target.value)}
              placeholder="e.g. Subcategory A, Subcategory B"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenFormDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
        >
          Delete Category
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete category{' '}
            <strong>{editingCategory?.name}</strong>? All services associated
            with this category might be affected.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default Categories;
