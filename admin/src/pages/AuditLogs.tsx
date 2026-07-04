import React, { useState } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { DeleteSweep as ClearIcon } from '@mui/icons-material';
import { useAuditStore, type AuditLogItem } from '../store/auditStore';
import { DataTable, type ColumnConfig } from '../components/common/DataTable';
import {
  FilterPanel,
  type FilterField,
} from '../components/common/FilterPanel';

export const AuditLogs: React.FC = () => {
  const { logs, clearLogs } = useAuditStore();
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({
    search: '',
    action: '',
    module: '',
  });

  const handleFilterChange = (filters: Record<string, any>) => {
    setActiveFilters(filters);
  };

  const filteredLogs = logs.filter(log => {
    const searchVal = activeFilters.search || '';
    const matchesSearch =
      log.user.toLowerCase().includes(searchVal.toLowerCase()) ||
      log.ip.includes(searchVal);

    const matchesAction =
      !activeFilters.action || log.action === activeFilters.action;
    const matchesModule =
      !activeFilters.module || log.module === activeFilters.module;

    return matchesSearch && matchesAction && matchesModule;
  });

  const columns: ColumnConfig<AuditLogItem>[] = [
    {
      id: 'time',
      label: 'Timestamp',
      render: row => new Date(row.time).toLocaleString(),
    },
    {
      id: 'user',
      label: 'Administrator',
      render: row => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.user}
        </Typography>
      ),
    },
    {
      id: 'action',
      label: 'Action Taken',
      render: row => (
        <Chip
          label={row.action}
          size="small"
          color={
            row.action === 'Login'
              ? 'success'
              : row.action === 'Logout'
                ? 'default'
                : row.action === 'Refund Processed'
                  ? 'error'
                  : 'primary'
          }
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      id: 'module',
      label: 'System Module',
      render: row => (
        <Chip label={row.module} variant="outlined" size="small" />
      ),
    },
    {
      id: 'ip',
      label: 'IP Address',
    },
  ];

  const filterFields: FilterField[] = [
    {
      id: 'action',
      label: 'Action',
      type: 'select',
      options: [
        { value: 'Login', label: 'Login' },
        { value: 'Logout', label: 'Logout' },
        { value: 'Order Updated', label: 'Order Updated' },
        { value: 'Payment Updated', label: 'Payment Updated' },
        { value: 'Service Updated', label: 'Service Updated' },
        { value: 'Category Updated', label: 'Category Updated' },
        { value: 'User Updated', label: 'User Updated' },
        { value: 'Technician Assigned', label: 'Technician Assigned' },
        { value: 'Refund Processed', label: 'Refund Processed' },
      ],
    },
    {
      id: 'module',
      label: 'Module',
      type: 'select',
      options: [
        { value: 'Auth', label: 'Auth' },
        { value: 'Orders', label: 'Orders' },
        { value: 'Payments', label: 'Payments' },
        { value: 'Technicians', label: 'Technicians' },
        { value: 'Services', label: 'Services' },
        { value: 'Settings', label: 'Settings' },
      ],
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
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
            System Audit & Activity Logs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View security checkpoints, administrative actions, updates, login
            history, and API client activity.
          </Typography>
        </Box>
        {logs.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<ClearIcon />}
            onClick={clearLogs}
          >
            Clear Roster Logs
          </Button>
        )}
      </Box>

      {/* Filter panel */}
      <FilterPanel fields={filterFields} onFilterChange={handleFilterChange} />

      {/* Logs table */}
      <DataTable
        title="System Audit Trail"
        filename="system_audit_trail"
        columns={columns}
        data={filteredLogs}
        emptyMessage="No audit logs recorded for this registry scope."
      />
    </Box>
  );
};

export default AuditLogs;
