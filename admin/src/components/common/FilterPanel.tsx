import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Grid,
  Collapse,
  IconButton,
  Typography,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  ClearAll as ClearIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from '@mui/icons-material';

export interface FilterField {
  id: string;
  label: string;
  type: 'select' | 'text' | 'dateRange';
  options?: { value: string; label: string }[];
  defaultValue?: string;
}

interface FilterPanelProps {
  fields: FilterField[];
  onFilterChange: (filters: Record<string, any>) => void;
  onClearFilters?: () => void;
  showSearch?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  fields,
  onFilterChange,
  onClearFilters,
  showSearch = true,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Set initial filter values based on default values
  const getInitialState = () => {
    const state: Record<string, string> = {};
    fields.forEach(f => {
      state[f.id] = f.defaultValue || '';
      if (f.type === 'dateRange') {
        state[`${f.id}_start`] = '';
        state[`${f.id}_end`] = '';
      }
    });
    return state;
  };

  const [filters, setFilters] =
    useState<Record<string, string>>(getInitialState());

  const handleFieldChange = (id: string, value: string) => {
    const updated = { ...filters, [id]: value };
    setFilters(updated);
    onFilterChange({ ...updated, search: searchQuery });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    onFilterChange({ ...filters, search: query });
  };

  const handleClear = () => {
    const clearedState = getInitialState();
    setFilters(clearedState);
    setSearchQuery('');
    onFilterChange({ ...clearedState, search: '' });
    if (onClearFilters) onClearFilters();
  };

  return (
    <Card
      sx={{
        mb: 3,
        border: '1px solid #E2E8F0',
        borderRadius: 3,
        boxShadow: 'none',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {showSearch && (
            <TextField
              size="small"
              placeholder="Global Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ flexGrow: 1, minWidth: 260 }}
            />
          )}

          <Button
            variant="outlined"
            color="secondary"
            startIcon={<FilterIcon />}
            endIcon={expanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
            onClick={() => setExpanded(!expanded)}
            sx={{ fontWeight: 600, borderRadius: 2.5 }}
          >
            Filters
          </Button>

          <IconButton
            onClick={handleClear}
            title="Clear Filters"
            sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #E2E8F0' }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, mb: 2, color: '#4A5568' }}
            >
              Advanced Search Filters
            </Typography>
            <Grid container spacing={2}>
              {fields.map(field => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={field.id}>
                  {field.type === 'select' ? (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label={field.label}
                      value={filters[field.id]}
                      onChange={e =>
                        handleFieldChange(field.id, e.target.value)
                      }
                    >
                      <MenuItem value="">
                        <em>Any {field.label}</em>
                      </MenuItem>
                      {field.options?.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : field.type === 'dateRange' ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        type="date"
                        fullWidth
                        size="small"
                        label={`Start ${field.label}`}
                        slotProps={{ inputLabel: { shrink: true } }}
                        value={filters[`${field.id}_start`]}
                        onChange={e =>
                          handleFieldChange(`${field.id}_start`, e.target.value)
                        }
                      />
                      <TextField
                        type="date"
                        fullWidth
                        size="small"
                        label={`End ${field.label}`}
                        slotProps={{ inputLabel: { shrink: true } }}
                        value={filters[`${field.id}_end`]}
                        onChange={e =>
                          handleFieldChange(`${field.id}_end`, e.target.value)
                        }
                      />
                    </Box>
                  ) : (
                    <TextField
                      fullWidth
                      size="small"
                      label={field.label}
                      value={filters[field.id]}
                      onChange={e =>
                        handleFieldChange(field.id, e.target.value)
                      }
                    />
                  )}
                </Grid>
              ))}
            </Grid>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;
