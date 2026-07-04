import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ReceiptLong as ReceiptIcon,
  People as PeopleIcon,
  Engineering as EngineeringIcon,
  Build as BuildIcon,
  Category as CategoryIcon,
  Payment as PaymentIcon,
  BarChart as ChartIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';

const drawerWidth = 260;

interface SidebarItem {
  text: string;
  path: string;
  icon: React.ReactNode;
}

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    handleProfileMenuClose();
    navigate('/profile');
  };

  const sidebarItems: SidebarItem[] = [
    { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { text: 'Orders', path: '/orders', icon: <ReceiptIcon /> },
    { text: 'Users', path: '/users', icon: <PeopleIcon /> },
    { text: 'Technicians', path: '/technicians', icon: <EngineeringIcon /> },
    { text: 'Services', path: '/services', icon: <BuildIcon /> },
    { text: 'Categories', path: '/categories', icon: <CategoryIcon /> },
    { text: 'Payments', path: '/payments', icon: <PaymentIcon /> },
    { text: 'Reports', path: '/reports', icon: <ChartIcon /> },
    { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
    { text: 'Profile', path: '/profile', icon: <PersonIcon /> },
  ];

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1A202C',
        color: '#FFFFFF',
      }}
    >
      {/* Brand logo container */}
      <Box
        sx={{
          py: 2.5,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: '#111827',
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: '#FAD02C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#1A202C',
          }}
        >
          UP
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            fontFamily: '"Outfit", sans-serif',
            letterSpacing: 0.5,
            color: '#FFFFFF',
          }}
        >
          Urban Power
        </Typography>
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)' }} />

      {/* Navigation List */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {sidebarItems.map(item => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <ListItemButton
              key={item.text}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                mb: 0.8,
                borderRadius: 2.5,
                py: 1.2,
                px: 2,
                color: isActive ? '#1A202C' : '#A0AEC0',
                bgcolor: isActive ? '#FAD02C' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: isActive ? '#E5BD1B' : 'rgba(255, 255, 255, 0.04)',
                  color: isActive ? '#1A202C' : '#FFFFFF',
                  '& .MuiListItemIcon-root': {
                    color: isActive ? '#1A202C' : '#FFFFFF',
                  },
                },
                '& .MuiListItemIcon-root': {
                  color: isActive ? '#1A202C' : '#A0AEC0',
                  minWidth: 40,
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      fontSize: '0.95rem',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    {item.text}
                  </Typography>
                }
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)' }} />

      {/* Quick logout trigger in sidebar footer */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2.5,
            py: 1.2,
            color: '#F56565',
            '&:hover': {
              bgcolor: 'rgba(245, 101, 101, 0.1)',
            },
            '& .MuiListItemIcon-root': {
              color: '#F56565',
              minWidth: 40,
            },
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                Logout
              </Typography>
            }
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    const activeItem = sidebarItems.find(
      item => item.path !== '/' && location.pathname.startsWith(item.path),
    );
    return activeItem ? activeItem.text : 'Admin Panel';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F7FAFC' }}>
      {/* Header Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
          >
            {getPageTitle()}
          </Typography>

          {/* User Account Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: '#1A202C' }}
              >
                {user?.name || 'Admin'}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: '#718096', textTransform: 'capitalize' }}
              >
                {user?.role || 'Administrator'}
              </Typography>
            </Box>
            <Tooltip title="Account settings">
              <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
                <Avatar
                  sx={{
                    bgcolor: '#2D3748',
                    color: '#FAD02C',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    border: '2px solid #E2E8F0',
                  }}
                >
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              slotProps={{
                paper: {
                  elevation: 3,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                    mt: 1.5,
                    borderRadius: 2.5,
                    minWidth: 160,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleProfileClick} sx={{ py: 1.2 }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                My Profile
              </MenuItem>
              <Divider sx={{ my: 1 }} />
              <MenuItem
                onClick={handleLogout}
                sx={{ py: 1.2, color: '#F56565' }}
              >
                <ListItemIcon
                  sx={{ '& .MuiSvgIcon-root': { color: '#F56565' } }}
                >
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer Components (Mobile & Desktop) */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Permanent Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid #E2E8F0',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main scrolling content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, md: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar /> {/* Creates spacing under AppBar */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
export default MainLayout;
