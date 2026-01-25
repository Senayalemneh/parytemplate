import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ExportOptions {
  filename?: string;
  sheetName?: string;
  headers?: string[];
  title?: string;
  theme?: 'striped' | 'grid' | 'plain';
}

/**
 * Export data to CSV file
 * @param data Array of objects to export
 * @param options Export options
 */
export const exportToCsv = (data: any[], options: ExportOptions = {}) => {
  const filename = options.filename || 'export.csv';
  const headers = options.headers || Object.keys(data[0] || [];
  
  // Convert data to CSV
  let csvContent = '';
  
  // Add headers
  csvContent += headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(row => {
    const rowValues = headers.map(header => {
      // Handle nested objects
      const value = header.split('.').reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : '', row);
      
      // Escape quotes and wrap in quotes if contains comma
      let escaped = (value != null ? String(value) : '').replace(/"/g, '""');
      if (escaped.includes(',')) {
        escaped = `"${escaped}"`;
      }
      return escaped;
    });
    csvContent += rowValues.join(',') + '\n';
  });
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data to Excel file (XLSX)
 * @param data Array of objects to export
 * @param options Export options
 */
export const exportToExcel = (data: any[], options: ExportOptions = {}) => {
  const filename = options.filename || 'export.xlsx';
  const sheetName = options.sheetName || 'Sheet1';
  const headers = options.headers || Object.keys(data[0] || []);
  
  // Prepare worksheet
  const wsData = [];
  
  // Add headers
  wsData.push(headers);
  
  // Add data rows
  data.forEach(row => {
    const rowData = headers.map(header => {
      // Handle nested objects
      return header.split('.').reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : '', row);
    });
    wsData.push(rowData);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Export to file
  XLSX.writeFile(wb, filename);
};

/**
 * Export data to PDF file
 * @param data Array of objects to export
 * @param options Export options
 */
export const exportToPdf = (data: any[], options: ExportOptions = {}) => {
  const filename = options.filename || 'export.pdf';
  const title = options.title || 'Export';
  const headers = options.headers || Object.keys(data[0] || []);
  const theme = options.theme || 'striped';
  
  // Prepare data for PDF
  const pdfData = data.map(row => {
    return headers.map(header => {
      // Handle nested objects
      return header.split('.').reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : '', row);
    });
  });
  
  // Create PDF
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 16);
  
  // Add table
  (doc as any).autoTable({
    head: [headers],
    body: pdfData,
    startY: 20,
    theme: theme,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });
  
  // Save PDF
  doc.save(filename);
};

/**
 * Export data to multiple formats
 * @param data Array of objects to export
 * @param format 'csv' | 'excel' | 'pdf'
 * @param options Export options
 */
export const exportData = (data: any[], format: 'csv' | 'excel' | 'pdf', options: ExportOptions = {}) => {
  switch (format) {
    case 'csv':
      exportToCsv(data, options);
      break;
    case 'excel':
      exportToExcel(data, options);
      break;
    case 'pdf':
      exportToPdf(data, options);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

/**
 * Convert array of objects to CSV string
 * @param data Array of objects
 * @returns CSV string
 */
export const convertToCsvString = (data: any[]): string => {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  let csvContent = '';
  
  // Add headers
  csvContent += headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(row => {
    const rowValues = headers.map(header => {
      // Handle nested objects
      const value = header.split('.').reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : '', row);
      
      // Escape quotes and wrap in quotes if contains comma
      let escaped = (value != null ? String(value) : '').replace(/"/g, '""');
      if (escaped.includes(',')) {
        escaped = `"${escaped}"`;
      }
      return escaped;
    });
    csvContent += rowValues.join(',') + '\n';
  });
  
  return csvContent;
};

/**
 * Convert array of objects to Excel workbook
 * @param data Array of objects
 * @param sheetName Optional sheet name
 * @returns XLSX workbook
 */
export const convertToExcelWorkbook = (data: any[], sheetName = 'Sheet1'): XLSX.WorkBook => {
  const headers = Object.keys(data[0] || {});
  
  // Prepare worksheet
  const wsData = [];
  
  // Add headers
  wsData.push(headers);
  
  // Add data rows
  data.forEach(row => {
    const rowData = headers.map(header => {
      // Handle nested objects
      return header.split('.').reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : '', row);
    });
    wsData.push(rowData);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  return wb;
};