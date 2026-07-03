/**
 * Reusable Export System Utilities
 * Provides formatting and export capabilities for enterprise lists and tables
 */

// Helper to sanitize data for CSV/Excel formatting
const cleanValue = (val: any): string => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  // Escape quotes
  return `"${str.replace(/"/g, '""')}"`;
};

/**
 * Exports JSON data to a CSV file
 */
export const exportToCSV = (data: any[], filename: string): void => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // Header row
    ...data.map((row) =>
      headers.map((fieldName) => cleanValue(row[fieldName])).join(',')
    ),
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exports JSON data to an Excel-compatible CSV file (with BOM for Excel auto-encoding)
 */
export const exportToExcel = (data: any[], filename: string): void => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((fieldName) => cleanValue(row[fieldName])).join(',')
    ),
  ];

  const csvString = '\uFEFF' + csvRows.join('\n'); // Add UTF-8 BOM for Excel
  const blob = new Blob([csvString], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Formats table content and opens browser print layout (acts as Print/PDF fallback)
 */
export const exportToPDF = (
  title: string,
  headers: string[],
  rows: any[][],
  filename: string
): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Popup blocker prevented PDF generation. Please allow popups.');
    return;
  }

  const html = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Outfit', 'Inter', sans-serif; color: #1A202C; padding: 24px; }
          h1 { font-size: 24px; margin-bottom: 8px; font-weight: 800; }
          .meta { font-size: 12px; color: #718096; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th { background-color: #F7FAFC; color: #4A5568; font-weight: 700; font-size: 11px; text-transform: uppercase; text-align: left; border-bottom: 2px solid #E2E8F0; padding: 12px 8px; }
          td { border-bottom: 1px solid #E2E8F0; padding: 12px 8px; font-size: 13px; color: #2D3748; }
          tr:nth-child(even) { background-color: #F8FAFC; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h1>${title}</h1>
          <button class="no-print" onclick="window.print()" style="background-color: #FAD02C; color: #1A202C; border: none; padding: 8px 16px; font-weight: bold; border-radius: 4px; cursor: pointer;">Print / Save as PDF</button>
        </div>
        <div class="meta">Generated on: ${new Date().toLocaleString()} | Urban Power Administrative Panel</div>
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
              <tr>
                ${row.map((cell) => `<td>${cell !== null && cell !== undefined ? cell : ''}</td>`).join('')}
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <script>
          // Auto trigger printing dialog in new window, closes after print
          window.onload = function() {
            // Uncomment to auto-trigger print window.print();
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

/**
 * Triggers document printing on a target data list
 */
export const printTable = (title: string, headers: string[], rows: any[][]): void => {
  exportToPDF(title, headers, rows, 'print_export');
};
