import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  Avatar,
  Divider,
} from '@mui/material';
import { useAuthStore } from '../store/authStore';

// Form Schema
const profileSchema = zod.object({
  name: zod.string().min(1, 'Name is required'),
  email: zod
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  phone: zod.string().min(10, 'Phone must be at least 10 digits'),
  newPassword: zod.string().optional().or(zod.literal('')),
});

type ProfileFormValues = zod.infer<typeof profileSchema>;

export const Profile: React.FC = () => {
  const { user, login, token } = useAuthStore();
  const [successText, setSuccessText] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || 'Super Admin',
      email: user?.email || 'admin@urbanpower.com',
      phone: '+91 98765 00000',
      newPassword: '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setSuccessText(null);
    try {
      // Simulate API Save
      await new Promise(resolve => setTimeout(resolve, 800));

      // Update state in store
      if (user && token) {
        login(
          {
            ...user,
            name: data.name,
            email: data.email,
          },
          token,
        );
      }
      setSuccessText('Profile details saved successfully.');
      setTimeout(() => setSuccessText(null), 3000);
    } catch {
      // Stub catch
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontFamily: '"Outfit", sans-serif',
            color: '#1A202C',
          }}
        >
          My Admin Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure security credentials, contact details, and name.
        </Typography>
      </Box>

      {successText && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {successText}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Card left */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent
              sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <Avatar
                sx={{
                  width: 90,
                  height: 90,
                  bgcolor: '#FAD02C',
                  color: '#1A202C',
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  mb: 2,
                  border: '3px solid #E2E8F0',
                }}
              >
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {user?.name || 'Super Admin'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.email || 'admin@urbanpower.com'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: '#2D3748',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {user?.role || 'Administrator'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details Edit Form right */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontFamily: '"Outfit", sans-serif',
                }}
              >
                Profile Coordinates
              </Typography>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Full Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      {...register('name')}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Contact Number"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      {...register('phone')}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Email Address"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      {...register('email')}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        fontFamily: '"Outfit", sans-serif',
                      }}
                    >
                      Change Security Password
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="password"
                      label="New Password"
                      placeholder="Leave blank to keep current"
                      error={!!errors.newPassword}
                      helperText={errors.newPassword?.message}
                      {...register('newPassword')}
                    />
                  </Grid>
                </Grid>

                <Box
                  sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    sx={{ px: 3, py: 1 }}
                  >
                    {isSubmitting
                      ? 'Saving Changes...'
                      : 'Save Profile details'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default Profile;
