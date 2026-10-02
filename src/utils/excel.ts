import * as XLSX from 'xlsx';
import { ComputedTargetRegister, TargetRegister, TrimRow } from '../types/trim';
import { cleanHexInput, createBlankRows } from './bitwise';

export interface ExcelRowFormat {
  'Target Address': string;
  'Stage (#)': number;
  'Incoming Value (HEX)': string;
  'Incoming Value (Binary)': string;
  'Mask Value (HEX)': string;
  'Mask Value (Binary)': string;
  'Validate Value (HEX)': string;
  'Validate Value (Binary)': string;
  'Result Value (HEX)': string;
  'Result Value (Binary)': string;
  'Result Value (Decimal)': number;
  'Notes': string;
}

/**
 * Builds and downloads an Excel (.xlsx) file containing all target addresses
 * and their occurrence rows filled with HEX Result values.
 */
export function exportRegistersToExcel(
  computedRegisters: ComputedTargetRegister[],
  filename = 'Manual_Trim_Validation_Results.xlsx'
) {
  const detailedRows: ExcelRowFormat[] = [];
  const summaryRows: Record<string, any>[] = [];

  computedRegisters.forEach((reg) => {
    // Summary row
    summaryRows.push({
      'Target Address / Register ID': reg.addressLabel,
      'Total Occurrences': reg.occurrences,
      'Initial Incoming (HEX)': `0x${reg.initialHex}`,
      'Initial Incoming (Binary)': reg.initialBin,
      'Final Result (HEX)': `0x${reg.finalHex}`,
      'Final Result (Binary)': reg.finalBin,
      'Final Result (Decimal)': reg.finalDec,
    });

    // Detailed rows for this address
    reg.pipeline.forEach((stage, idx) => {
      detailedRows.push({
        'Target Address': reg.addressLabel,
        'Stage (#)': idx + 1,
        'Incoming Value (HEX)': `0x${stage.incomingHexFormatted}`,
        'Incoming Value (Binary)': stage.incomingBinFormatted,
        'Mask Value (HEX)': `0x${stage.maskHexFormatted}`,
        'Mask Value (Binary)': stage.maskBinFormatted,
        'Validate Value (HEX)': `0x${stage.validateHexFormatted}`,
        'Validate Value (Binary)': stage.validateBinFormatted,
        'Result Value (HEX)': `0x${stage.resultHexFormatted}`,
        'Result Value (Binary)': stage.resultBinFormatted,
        'Result Value (Decimal)': stage.resultVal,
        'Notes': stage.row.notes || '',
      });
    });
  });

  const workbook = XLSX.utils.book_new();

  // Sheet 1: Detailed Rows with HEX result values
  const detailedSheet = XLSX.utils.json_to_sheet(detailedRows);
  // Auto-fit column widths
  detailedSheet['!cols'] = [
    { wch: 18 }, // Target Address
    { wch: 10 }, // Stage
    { wch: 22 }, // Incoming HEX
    { wch: 24 }, // Incoming BIN
    { wch: 18 }, // Mask HEX
    { wch: 22 }, // Mask BIN
    { wch: 22 }, // Validate HEX
    { wch: 24 }, // Validate BIN
    { wch: 20 }, // Result HEX
    { wch: 22 }, // Result BIN
    { wch: 20 }, // Result DEC
    { wch: 24 }, // Notes
  ];
  XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Trim Validation Rows');

  // Sheet 2: Summary of all target addresses
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet['!cols'] = [
    { wch: 26 },
    { wch: 18 },
    { wch: 22 },
    { wch: 24 },
    { wch: 20 },
    { wch: 22 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Registers Summary');

  // Trigger browser download
  XLSX.writeFile(workbook, filename);
}

/**
 * Generates and downloads an Excel template for users to fill in
 */
export function downloadExcelTemplate(filename = 'Trim_Validation_Template.xlsx') {
  const sampleRows = [
    {
      'Target Address': '0x10',
      'Stage (#)': 1,
      'Incoming Value (HEX)': '00',
      'Mask Value (HEX)': 'F0',
      'Validate Value (HEX)': '30',
      'Notes': 'Coarse trim',
    },
    {
      'Target Address': '0x10',
      'Stage (#)': 2,
      'Incoming Value (HEX)': '', // auto-chained
      'Mask Value (HEX)': '0E',
      'Validate Value (HEX)': '08',
      'Notes': 'Fine trim',
    },
    {
      'Target Address': '0x24',
      'Stage (#)': 1,
      'Incoming Value (HEX)': 'AA',
      'Mask Value (HEX)': '55',
      'Validate Value (HEX)': '00',
      'Notes': 'Offset zero',
    },
  ];

  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(sampleRows);
  sheet['!cols'] = [
    { wch: 18 },
    { wch: 10 },
    { wch: 22 },
    { wch: 18 },
    { wch: 20 },
    { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(workbook, sheet, 'Input_Template');
  XLSX.writeFile(workbook, filename);
}

/**
 * Parses an uploaded Excel file (.xlsx, .xls, .csv) into TargetRegister structures
 */
export function parseExcelFile(file: File): Promise<TargetRegister[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonRows || jsonRows.length === 0) {
          throw new Error('The uploaded spreadsheet contains no rows.');
        }

        // Group rows by Target Address
        const addressGroups = new Map<string, any[]>();
        jsonRows.forEach((row) => {
          const addr = (
            row['Target Address'] ||
            row['Target Address / Register ID'] ||
            row['Address'] ||
            row['Register'] ||
            '0x00'
          ).toString().trim();

          if (!addressGroups.has(addr)) {
            addressGroups.set(addr, []);
          }
          addressGroups.get(addr)!.push(row);
        });

        const targetRegisters: TargetRegister[] = [];

        addressGroups.forEach((rowsForAddr, addr) => {
          const occurrences = Math.min(10, Math.max(1, rowsForAddr.length));
          const blankRows = createBlankRows();

          rowsForAddr.slice(0, 10).forEach((rawRow, idx) => {
            const inc = cleanHexInput(
              (
                rawRow['Incoming Value (HEX)'] ||
                rawRow['Incoming Value'] ||
                rawRow['Incoming'] ||
                ''
              ).toString()
            );

            const msk = cleanHexInput(
              (
                rawRow['Mask Value (HEX)'] ||
                rawRow['Mask Value'] ||
                rawRow['Mask'] ||
                ''
              ).toString()
            );

            const val = cleanHexInput(
              (
                rawRow['Validate Value (HEX)'] ||
                rawRow['Validate Value'] ||
                rawRow['Validate'] ||
                ''
              ).toString()
            );

            const note = (rawRow['Notes'] || rawRow['Note'] || '').toString();

            blankRows[idx] = {
              id: `imported-${addr}-${idx}-${Date.now()}`,
              occurrenceIndex: idx,
              incomingHex: inc,
              maskHex: msk,
              validateHex: val,
              notes: note,
            };
          });

          targetRegisters.push({
            id: `reg-${addr}-${Date.now()}-${Math.random()}`,
            addressLabel: addr,
            occurrences,
            rows: blankRows,
          });
        });

        resolve(targetRegisters);
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the file.'));
    };

    reader.readAsArrayBuffer(file);
  });
}
