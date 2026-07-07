import React, { useState, useEffect } from 'react';
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
  Badge,
  Popover,
  ListItem,
  ListItemAvatar,
  Snackbar,
  Alert,
  Button,
  Collapse,
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
  Notifications as BellIcon,
  DoneAll as DoneAllIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  ContactSupport as SupportIcon,
  ConfirmationNumber as TicketIcon,
  ReportProblem as ProblemIcon,
  Feedback as FeedbackIcon,
  Warning as WarningIcon,
  LocalOffer as OfferIcon,
  Web as WebIcon,
  SettingsApplications as SettingsAppIcon,
  AcUnit as AcIcon,
  BugReport as BugIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useNotificationPolling } from '../hooks/useNotificationPolling';
import { menuConfig } from '../config/menuConfig';
import type { MenuItem as SidebarMenuItem } from '../config/menuConfig';
import { ModuleRegistry } from '../modules/registry';
import type { MenuItemConfig } from '../modules/registry';
import { useHasPermission } from '../hooks/useHasPermission';
import type { Permission } from '../config/roles';

const drawerWidth = 260;

const iconMap: Record<string, React.ReactNode> = {
  Dashboard: <DashboardIcon />,
  Receipt: <ReceiptIcon />,
  People: <PeopleIcon />,
  Engineering: <EngineeringIcon />,
  Build: <BuildIcon />,
  Category: <CategoryIcon />,
  Payment: <PaymentIcon />,
  Chart: <ChartIcon />,
  Settings: <SettingsIcon />,
  Person: <PersonIcon />,
  Support: <SupportIcon />,
  ConfirmationNumber: <TicketIcon />,
  ReportProblem: <ProblemIcon />,
  Feedback: <FeedbackIcon />,
  Warning: <WarningIcon />,
  LocalOffer: <OfferIcon />,
  Web: <WebIcon />,
  SettingsApplications: <SettingsAppIcon />,
  ReceiptLong: <ReceiptIcon />,
  AirConditioner: <AcIcon />,
  BugReport: <BugIcon />,
};

const renderIcon = (iconName: string) => {
  const icon = iconMap[iconName];
  if (icon) return icon;
  return <InfoIcon />;
};

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { checkPermission } = useHasPermission();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItems, setMenuItems] = useState<(SidebarMenuItem | MenuItemConfig)[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const staticItems = menuConfig;
    const dynamicItems = ModuleRegistry.getMenuItems();
    const combined = [...staticItems];
    dynamicItems.forEach(item => {
      if (!combined.some(existing => existing.route === item.route)) {
        combined.push(item);
      }
    });
    setMenuItems(combined);
  }, []);

  const handleToggleCollapse = (title: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const filterMenuItems = (items: (SidebarMenuItem | MenuItemConfig)[]): (SidebarMenuItem | MenuItemConfig)[] => {
    return items
      .map(item => {
        if (item.children && item.children.length > 0) {
          const filteredChildren = filterMenuItems(item.children);
          return {
            ...item,
            children: filteredChildren,
          };
        }
        return item;
      })
      .filter(item => {
        if (item.permission && !checkPermission(item.permission as Permission)) {
          return false;
        }
        if (item.children && item.children.length === 0) {
          return false;
        }
        return true;
      });
  };

  const filteredMenu = filterMenuItems(menuItems);

  // Initialize background notification polling (runs every 15s)
  useNotificationPolling();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    latestToast,
    setLatestToast,
  } = useNotificationStore();

  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<any>(null);

  useEffect(() => {
    if (latestToast) {
      setActiveToast(latestToast);
      setToastOpen(true);
      setLatestToast(null); // Clear toast trigger immediately
    }
  }, [latestToast, setLatestToast]);

  const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return new Date(isoString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return '';
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'New Order':
        return <ReceiptIcon sx={{ color: '#3182CE' }} />;
      case 'Order Assigned':
      case 'Technician Joined':
        return <EngineeringIcon sx={{ color: '#DD6B20' }} />;
      case 'Payment Success':
        return <PaymentIcon sx={{ color: '#38A169' }} />;
      case 'Payment Failed':
      case 'Refund Approved':
      case 'Refund Requested':
        return <PaymentIcon sx={{ color: '#E53E3E' }} />;
      case 'System Notification':
      default:
        return <InfoIcon sx={{ color: '#4A5568' }} />;
    }
  };

  const getNotifColor = (type: string) => {
    switch (type) {
      case 'New Order':
        return 'rgba(49, 130, 206, 0.1)';
      case 'Order Assigned':
      case 'Technician Joined':
        return 'rgba(221, 107, 32, 0.1)';
      case 'Payment Success':
        return 'rgba(56, 161, 105, 0.1)';
      case 'Payment Failed':
      case 'Refund Approved':
      case 'Refund Requested':
        return 'rgba(229, 62, 62, 0.1)';
      case 'System Notification':
      default:
        return 'rgba(74, 85, 104, 0.1)';
    }
  };

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

  const renderMenuItem = (item: SidebarMenuItem | MenuItemConfig, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = !!expandedItems[item.title];
    const isActive =
      item.route === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(item.route);

    const handleItemClick = () => {
      if (hasChildren) {
        handleToggleCollapse(item.title);
      } else {
        navigate(item.route);
        setMobileOpen(false);
      }
    };

    return (
      <React.Fragment key={item.title}>
        <ListItemButton
          onClick={handleItemClick}
          sx={{
            mb: 0.8,
            borderRadius: 2.5,
            py: depth > 0 ? 0.8 : 1.2,
            pl: depth > 0 ? depth * 2.5 + 2 : 2,
            pr: 2,
            color: isActive && !hasChildren ? '#1A202C' : '#A0AEC0',
            bgcolor: isActive && !hasChildren ? '#FAD02C' : 'transparent',
            fontWeight: isActive && !hasChildren ? 600 : 500,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: isActive && !hasChildren ? '#E5BD1B' : 'rgba(255, 255, 255, 0.04)',
              color: isActive && !hasChildren ? '#1A202C' : '#FFFFFF',
              '& .MuiListItemIcon-root': {
                color: isActive && !hasChildren ? '#1A202C' : '#FFFFFF',
              },
            },
            '& .MuiListItemIcon-root': {
              color: isActive && !hasChildren ? '#1A202C' : '#A0AEC0',
              minWidth: 40,
            },
          }}
        >
          <ListItemIcon>{renderIcon(item.icon)}</ListItemIcon>
          <ListItemText
            primary={
              <Typography
                sx={{
                  fontSize: depth > 0 ? '0.88rem' : '0.95rem',
                  fontWeight: isActive && !hasChildren ? 600 : 500,
                }}
              >
                {item.title}
              </Typography>
            }
          />
          {hasChildren && (
            isExpanded ? (
              <ExpandLess sx={{ color: '#A0AEC0', fontSize: '1.2rem' }} />
            ) : (
              <ExpandMore sx={{ color: '#A0AEC0', fontSize: '1.2rem' }} />
            )
          )}
        </ListItemButton>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 1 }}>
              {item.children!.map(child => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

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
      <List sx={{ px: 1.5, py: 2, flexGrow: 1, overflowY: 'auto' }}>
        {filteredMenu.map(item => renderMenuItem(item))}
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
    
    const findTitle = (items: (SidebarMenuItem | MenuItemConfig)[]): string | null => {
      for (const item of items) {
        if (item.route !== '/' && location.pathname.startsWith(item.route)) {
          return item.title;
        }
        if (item.children) {
          const childTitle = findTitle(item.children);
          if (childTitle) return childTitle;
        }
      }
      return null;
    };

    return findTitle(filteredMenu) || 'Admin Panel';
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
            {/* Notification Bell */}
            <Tooltip title="Notifications">
              <IconButton onClick={handleNotifOpen} color="inherit" sx={{ mr: 1 }}>
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <BellIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Popover
              open={Boolean(notifAnchorEl)}
              anchorEl={notifAnchorEl}
              onClose={handleNotifClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              slotProps={{
                paper: {
                  sx: {
                    width: 360,
                    maxHeight: 480,
                    borderRadius: 3.5,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    mt: 1.5,
                    border: '1px solid #E2E8F0',
                  }
                }
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F0F4F8' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', display: 'flex', alignItems: 'center', gap: 1 }}>
                  Notifications
                  {unreadCount > 0 && (
                    <Box sx={{ px: 1, py: 0.2, bgcolor: '#FEE2E2', color: '#EF4444', borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 700 }}>
                      {unreadCount} new
                    </Box>
                  )}
                </Typography>
                {unreadCount > 0 && (
                  <Button
                    size="small"
                    startIcon={<DoneAllIcon />}
                    onClick={markAllAsRead}
                    sx={{ fontSize: '0.75rem', py: 0.2 }}
                  >
                    Mark all read
                  </Button>
                )}
              </Box>

              <List sx={{ p: 0, overflowY: 'auto', flexGrow: 1, maxHeight: 340 }}>
                {notifications.length === 0 ? (
                  <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <BellIcon sx={{ fontSize: 40, color: '#A0AEC0' }} />
                    <Typography variant="body2" color="text.secondary">
                      No notifications yet
                    </Typography>
                  </Box>
                ) : (
                  notifications.map((notif) => (
                    <ListItem
                      key={notif.id}
                      onClick={() => {
                        markAsRead(notif.id);
                        if (notif.meta?.bookingId) {
                          navigate(`/orders/${notif.meta.bookingId}`);
                          handleNotifClose();
                        }
                      }}
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderBottom: '1px solid #F0F4F8',
                        cursor: 'pointer',
                        bgcolor: notif.isRead ? 'transparent' : 'rgba(240, 244, 255, 0.6)',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.02)',
                        },
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 48 }}>
                        <Avatar sx={{ bgcolor: getNotifColor(notif.type), width: 36, height: 36 }}>
                          {getNotifIcon(notif.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: notif.isRead ? 600 : 700, fontSize: '0.85rem' }}>
                              {notif.type}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                              {formatTimeAgo(notif.timestamp)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem', lineHeight: 1.3 }}>
                            {notif.message}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                )}
              </List>

              {notifications.length > 0 && (
                <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'center', borderTop: '1px solid #F0F4F8', bgcolor: '#F8FAFC' }}>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={clearAll}
                    sx={{ width: '100%', fontSize: '0.75rem' }}
                  >
                    Clear All Notifications
                  </Button>
                </Box>
              )}
            </Popover>

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

      {/* Toast Notification Snackbar */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={6000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {activeToast && (
          <Alert
            onClose={() => setToastOpen(false)}
            severity={
              activeToast.type === 'Payment Failed' || activeToast.type === 'Refund Requested'
                ? 'error'
                : activeToast.type === 'Payment Success' || activeToast.type === 'Refund Approved'
                ? 'success'
                : activeToast.type === 'New Order' || activeToast.type === 'Order Assigned'
                ? 'info'
                : 'warning'
            }
            sx={{
              width: '100%',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              borderRadius: 2.5,
              alignItems: 'center',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {activeToast.type}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              {activeToast.message}
            </Typography>
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};
export default MainLayout;
