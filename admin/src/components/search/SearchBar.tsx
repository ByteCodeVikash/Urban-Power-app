import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  SearchOff as NoSearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../../hooks/useBookings';
import { useUsers } from '../../hooks/useUsers';
import { useTechnicians } from '../../hooks/useTechnicians';

interface SearchResult {
  id: string;
  category:
    | 'Orders'
    | 'Users'
    | 'Technicians'
    | 'Payments'
    | 'Services'
    | 'Categories'
    | 'Settings';
  title: string;
  subtitle: string;
  route: string;
}

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Real data sources
  const { data: bookings = [] } = useBookings();
  const { data: users = [] } = useUsers();
  const { data: technicians = [] } = useTechnicians();

  // Build live search index from real API data
  const SEARCH_INDEX: SearchResult[] = useMemo(() => {
    const index: SearchResult[] = [];

    // Orders (bookings)
    bookings.slice(0, 200).forEach(b => {
      index.push({
        id: `order-${b.id}`,
        category: 'Orders',
        title: `${b.id?.substring(0, 12).toUpperCase() ?? 'ORD'} — ${b.customer_name ?? 'Customer'}`,
        subtitle: `${b.service_name ?? 'Service'} | ${b.status ?? 'Unknown'}`,
        route: `/orders/${b.id}`,
      });
    });

    // Users
    users.slice(0, 100).forEach(u => {
      index.push({
        id: `user-${u.id}`,
        category: 'Users',
        title: u.name || 'User',
        subtitle: `${u.phone ?? ''} | ${u.email ?? 'Customer'}`,
        route: '/users',
      });
    });

    // Technicians
    technicians.slice(0, 50).forEach(t => {
      index.push({
        id: `tech-${t.name}`,
        category: 'Technicians',
        title: t.name,
        subtitle: `${t.service} | ${t.isAvailable ? 'Available' : 'Busy'}`,
        route: '/technicians',
      });
    });

    // Static nav shortcuts (these are real module links, not fake data)
    index.push(
      {
        id: 'nav-payments',
        category: 'Payments',
        title: 'Payments Dashboard',
        subtitle: 'View transactions and refunds',
        route: '/payments',
      },
      {
        id: 'nav-services',
        category: 'Services',
        title: 'Services Management',
        subtitle: 'Manage all services',
        route: '/services',
      },
      {
        id: 'nav-categories',
        category: 'Categories',
        title: 'Categories Management',
        subtitle: 'Manage service categories',
        route: '/categories',
      },
      {
        id: 'nav-settings',
        category: 'Settings',
        title: 'System Settings',
        subtitle: 'API keys, RBAC, configurations',
        route: '/settings',
      },
    );

    return index;
  }, [bookings, users, technicians]);

  // Handle outside clicks to close search dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const filtered = SEARCH_INDEX.filter(
      item =>
        item.title.toLowerCase().includes(value.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(value.toLowerCase()) ||
        item.category.toLowerCase().includes(value.toLowerCase()),
    );

    setResults(filtered.slice(0, 7)); // limit to 7 results
    setShowDropdown(true);
  };

  const handleItemSelect = (route: string) => {
    setQuery('');
    setShowDropdown(false);
    navigate(route);
  };

  // Group results by category for elegant structural layout
  const groupedResults = results.reduce(
    (acc, current) => {
      if (!acc[current.category]) {
        acc[current.category] = [];
      }
      acc[current.category].push(current);
      return acc;
    },
    {} as Record<string, SearchResult[]>,
  );

  return (
    <Box
      ref={dropdownRef}
      sx={{ position: 'relative', width: { xs: '100%', sm: 320, md: 400 } }}
    >
      <TextField
        fullWidth
        size="small"
        placeholder="Search orders, users, technicians..."
        value={query}
        onChange={handleSearch}
        onFocus={() => query.trim() && setShowDropdown(true)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 3,
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              '& fieldset': { border: 'none' },
            },
          },
        }}
      />

      {showDropdown && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            mt: 1,
            maxHeight: 400,
            overflowY: 'auto',
            borderRadius: 3,
            border: '1px solid #E2E8F0',
          }}
        >
          {results.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <NoSearchIcon sx={{ fontSize: 32, mb: 1, color: '#A0AEC0' }} />
              <Typography variant="body2">
                No results matched "{query}"
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {Object.entries(groupedResults).map(
                ([category, items], groupIndex) => (
                  <Box key={category}>
                    {groupIndex > 0 && <Divider sx={{ my: 0.5 }} />}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        px: 2,
                        py: 1,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        bgcolor: '#F8FAFC',
                      }}
                    >
                      {category}
                    </Typography>
                    {items.map(item => (
                      <ListItemButton
                        key={item.id}
                        onClick={() => handleItemSelect(item.route)}
                        sx={{ px: 3, py: 1 }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: '#2D3748' }}
                            >
                              {item.title}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.subtitle}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    ))}
                  </Box>
                ),
              )}
            </List>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar;
