import ExcelJS from 'exceljs';
import { maskAadhaar, maskPan, maskPhone } from './auth';

export interface ExportRow {
  permanentId: string;
  fullName: string;
  mobile: string;
  dob?: string;
  cadre: string;
  joiningDate?: string;
  promotionDate?: string;
  reportingTo?: string;
  edName?: string;
  gmName?: string;
  managerName?: string;
  kycStatus: string;
  status: string;
  aadhaar?: string;
  pan?: string;
}

export interface ExportExcelOptions {
  title: string;
  filtersApplied?: string;
  rows: ExportRow[];
  unmaskSensitive?: boolean;
}

export async function generateExcelReport(options: ExportExcelOptions): Promise<Buffer> {
  const { title, filtersApplied = 'None', rows, unmaskSensitive = false } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'JB Infra Executive Management System';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('People Directory', {
    views: [{ showGridLines: true }],
  });

  // 1. Report Title Banner
  worksheet.mergeCells('A1:L1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `JB INFRA PROJECTS — ${title.toUpperCase()}`;
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF082849' }, // Navy
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 35;

  // 2. Metadata Rows
  worksheet.mergeCells('A2:L2');
  const metaCell = worksheet.getCell('A2');
  metaCell.value = `Generated on: ${new Date().toLocaleString()} | Applied Filters: ${filtersApplied}`;
  metaCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  metaCell.alignment = { vertical: 'middle', horizontal: 'left' };
  worksheet.getRow(2).height = 20;

  // 3. Table Header
  const headers = [
    'Permanent ID',
    'Full Name',
    'Current Cadre',
    'Mobile',
    'Joining Date',
    'Promotion Date',
    'Reporting To',
    'ED',
    'GM',
    'KYC Status',
    'Account Status',
    'Aadhaar (Masked)',
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF026FC7' }, // JB Blue
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF94A3B8' } },
      left: { style: 'thin', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'medium', color: { argb: 'FF082849' } },
      right: { style: 'thin', color: { argb: 'FF94A3B8' } },
    };
  });

  // 4. Data Rows
  rows.forEach((row, index) => {
    const isEven = index % 2 === 0;
    const dataRow = worksheet.addRow([
      row.permanentId,
      row.fullName,
      row.cadre,
      unmaskSensitive ? row.mobile : maskPhone(row.mobile),
      row.joiningDate || '-',
      row.promotionDate || '-',
      row.reportingTo || '-',
      row.edName || '-',
      row.gmName || '-',
      row.kycStatus,
      row.status,
      unmaskSensitive ? (row.aadhaar || '-') : maskAadhaar(row.aadhaar),
    ]);

    dataRow.height = 20;
    dataRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10 };
      cell.alignment = {
        vertical: 'middle',
        horizontal: colNumber === 1 || colNumber === 3 || colNumber === 10 || colNumber === 11 ? 'center' : 'left',
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  });

  // 5. Auto-fit Column Widths
  worksheet.columns.forEach((column) => {
    let maxLength = 12;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const cellLength = cell.value ? String(cell.value).length : 0;
      if (cellLength > maxLength && Number(cell.row) > 2) {
        maxLength = cellLength;
      }
    });
    column.width = Math.min(maxLength + 4, 35);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
