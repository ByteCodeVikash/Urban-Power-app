import React, { useState, useEffect, useRef } from 'react';
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

// Simulated dynamic indices for global search mapping
const SEARCH_INDEX: SearchResult[] = [
  {
    id: '1',
    category: 'Orders',
    title: 'ORD-001 - Vikash Kumar',
    subtitle: 'Scrap Order | Completed',
    route: '/orders/ORD-001',
  },
  {
    id: '2',
    category: 'Orders',
    title: 'ORD-002 - Amit Sharma',
    subtitle: 'Maintenance Order | Pending',
    route: '/orders/ORD-002',
  },
  {
    id: '3',
    category: 'Users',
    title: 'Vikash Kumar',
    subtitle: 'Customer | Active',
    route: '/users',
  },
  {
    id: '4',
    category: 'Users',
    title: 'Priya Singh',
    subtitle: 'Customer | Active',
    route: '/users',
  },
  {
    id: '5',
    category: 'Technicians',
    title: 'Rajesh Patil',
    subtitle: 'Technician | Available',
    route: '/technicians',
  },
  {
    id: '6',
    category: 'Technicians',
    title: 'Sunil Jadhav',
    subtitle: 'Technician | Busy',
    route: '/technicians',
  },
  {
    id: '7',
    category: 'Payments',
    title: 'TXN-100293',
    subtitle: '₹1,200 | COD | Successful',
    route: '/payments',
  },
  {
    id: '8',
    category: 'Payments',
    title: 'TXN-100294',
    subtitle: '₹2,500 | Razorpay | Pending',
    route: '/payments',
  },
  {
    id: '9',
    category: 'Services',
    title: 'AC Repair & Cleaning',
    subtitle: 'Maintenance',
    route: '/services',
  },
  {
    id: '10',
    category: 'Categories',
    title: 'Scrap Material Collection',
    subtitle: 'Scrap Services',
    route: '/categories',
  },
  {
    id: '11',
    category: 'Settings',
    title: 'Razorpay Keys Configuration',
    subtitle: 'Payment Keys',
    route: '/settings',
  },
];

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
