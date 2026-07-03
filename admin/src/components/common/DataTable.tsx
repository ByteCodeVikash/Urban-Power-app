import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Typography,
} from '@mui/material';
import Loader from './Loader';
import EmptyState from './EmptyState';
import ExportButton from './ExportButton';

export interface ColumnConfig<T> {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: ColumnConfig<T>[];
  data: T[];
  isLoading?: boolean;
  title: string;
  filename: string;
  emptyMessage?: string;
  exportReady?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  title,
  filename,
  emptyMessage = 'No matching entries found in current registry scope.',
  exportReady = true,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return <Loader message={`Fetching ${title} records...`} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState description={emptyMessage} />;
  }

  // Paginate items
  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Prepare data for Export utilities
  const exportData = data.map((item) => {
    const rowObj: Record<string, any> = {};
    columns.forEach((col) => {
      // Avoid exporting custom React renders directly, fallback to primitive field text if available
      rowObj[col.label] = item[col.id] !== undefined ? String(item[col.id]) : '';
    });
    return rowObj;
  });

  const pdfHeaders = columns.map((col) => col.label);
  const pdfRows = data.map((item) =>
    columns.map((col) => (item[col.id] !== undefined ? String(item[col.id]) : ''))
  );

  return (
    <Box>
      {exportReady && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <ExportButton
            data={exportData}
            headers={pdfHeaders}
            pdfHeaders={pdfHeaders}
            pdfRows={pdfRows}
            title={title}
            filename={filename}
          />
        </Box>
      )}

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
        <Table sx={{ minWidth: 650 }} aria-label={title}>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || 'left'}
                  sx={{
                    fontWeight: 700,
                    color: '#4A5568',
                    textTransform: 'uppercase',
                    fontSize: '0.72rem',
                    letterSpacing: 0.8,
                    py: 2,
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={row.id || index} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align || 'left'}
                    sx={{ py: 1.8, fontSize: '0.88rem', color: '#2D3748' }}
                  >
                    {col.render ? col.render(row, page * rowsPerPage + index) : row[col.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: '1px solid #E2E8F0' }}
        />
      </TableContainer>
    </Box>
  );
}

export default DataTable;
