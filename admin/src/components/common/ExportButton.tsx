import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  Description as CsvIcon,
  TableChart as ExcelIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  printTable,
} from '../../utils/exportUtils';

interface ExportButtonProps {
  data: any[];
  headers: string[];
  pdfHeaders: string[];
  pdfRows: any[][];
  title: string;
  filename: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  headers,
  pdfHeaders,
  pdfRows,
  title,
  filename,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExportCSV = () => {
    exportToCSV(data, filename);
    handleClose();
  };

  const handleExportExcel = () => {
    exportToExcel(data, filename);
    handleClose();
  };

  const handleExportPDF = () => {
    exportToPDF(title, pdfHeaders, pdfRows, filename);
    handleClose();
  };

  const handlePrint = () => {
    printTable(title, pdfHeaders, pdfRows);
    handleClose();
  };

  return (
    <div>
      <Button
        id="export-button"
        aria-controls={open ? 'export-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="outlined"
        color="secondary"
        startIcon={<ExportIcon />}
        onClick={handleClick}
        sx={{ fontWeight: 600, borderRadius: 2.5 }}
      >
        Export
      </Button>
      <Menu
        id="export-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': 'export-button',
          },
          paper: {
            sx: {
              borderRadius: 2.5,
              mt: 0.5,
              boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
            },
          },
        }}
      >
        <MenuItem onClick={handleExportCSV} sx={{ py: 1 }}>
          <ListItemIcon>
            <CsvIcon fontSize="small" sx={{ color: '#4A5568' }} />
          </ListItemIcon>
          <ListItemText primary="Export as CSV" />
        </MenuItem>
        <MenuItem onClick={handleExportExcel} sx={{ py: 1 }}>
          <ListItemIcon>
            <ExcelIcon fontSize="small" sx={{ color: '#3182CE' }} />
          </ListItemIcon>
          <ListItemText primary="Export as Excel" />
        </MenuItem>
        <MenuItem onClick={handleExportPDF} sx={{ py: 1 }}>
          <ListItemIcon>
            <PdfIcon fontSize="small" sx={{ color: '#E53E3E' }} />
          </ListItemIcon>
          <ListItemText primary="Save as PDF" />
        </MenuItem>
        <MenuItem onClick={handlePrint} sx={{ py: 1 }}>
          <ListItemIcon>
            <PrintIcon fontSize="small" sx={{ color: '#48BB78' }} />
          </ListItemIcon>
          <ListItemText primary="Print Table" />
        </MenuItem>
      </Menu>
    </div>
  );
};

export default ExportButton;
