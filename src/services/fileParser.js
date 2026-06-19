/**
 * File Parser Service
 * Handles CSV (PapaParse) and XLSX (SheetJS) parsing.
 * Converts Excel serial dates to readable strings.
 */
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Convert Excel serial date number to ISO date string.
 * Excel dates are days since 1900-01-01 (with the 1900 leap year bug).
 */
function excelSerialToDateString(serial) {
  if (typeof serial !== 'number' || serial <= 0) return serial;
  // Excel serial: 1 = Jan 1, 1900
  const utcDays = Math.floor(serial - 25569); // 25569 = days from 1900-01-01 to 1970-01-01
  const utcValue = utcDays * 86400 * 1000;
  const dateObj = new Date(utcValue);
  if (isNaN(dateObj.getTime())) return String(serial);

  const y = dateObj.getUTCFullYear();
  const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Detect if a column likely contains Excel serial dates.
 * Heuristic: number in range 20000–60000 (roughly 1954–2064).
 */
function isExcelSerialLikelyDate(values) {
  const nums = values.filter((v) => typeof v === 'number');
  if (nums.length === 0) return false;
  const inRange = nums.filter((v) => v > 20000 && v < 70000);
  return inRange.length / nums.length > 0.8;
}

/**
 * Post-process XLSX rows to fix Excel serial dates.
 */
function fixExcelDates(rows, headers) {
  // Find which columns might be date serials
  const dateCols = [];
  for (const header of headers) {
    const values = rows.map((r) => r[header]);
    if (isExcelSerialLikelyDate(values)) {
      dateCols.push(header);
    }
  }

  if (dateCols.length === 0) return rows;

  return rows.map((row) => {
    const fixed = { ...row };
    for (const col of dateCols) {
      if (typeof fixed[col] === 'number') {
        fixed[col] = excelSerialToDateString(fixed[col]);
      }
    }
    return fixed;
  });
}

/**
 * Parse a File object (CSV or XLSX).
 * @param {File} file
 * @returns {Promise<{ rows: Object[], headers: string[], fileName: string, rowCount: number, columnCount: number }>}
 */
export function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'csv') {
    return parseCSV(file);
  } else if (ext === 'xlsx' || ext === 'xls') {
    return parseXLSX(file);
  } else {
    return Promise.reject(new Error(`Unsupported file type: .${ext}`));
  }
}

function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          reject(new Error('Failed to parse CSV: ' + results.errors[0].message));
          return;
        }
        const headers = results.meta.fields || [];
        const rows = results.data;
        resolve({
          rows,
          headers,
          fileName: file.name,
          fileSize: file.size,
          rowCount: rows.length,
          columnCount: headers.length,
          parseErrors: results.errors,
        });
      },
      error: (err) => reject(new Error('CSV parse error: ' + err.message)),
    });
  });
}

function parseXLSX(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: false });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON with raw values (keeps serial dates as numbers)
        const rawRows = XLSX.utils.sheet_to_json(worksheet, {
          defval: null,
          raw: true,
        });

        if (rawRows.length === 0) {
          reject(new Error('The spreadsheet appears to be empty.'));
          return;
        }

        const headers = Object.keys(rawRows[0]).map((h) => String(h).trim());

        // Normalize headers across rows
        const normalizedRows = rawRows.map((row) => {
          const normalized = {};
          for (const [k, v] of Object.entries(row)) {
            normalized[String(k).trim()] = v;
          }
          return normalized;
        });

        // Fix Excel serial dates
        const fixedRows = fixExcelDates(normalizedRows, headers);

        // Convert any remaining numbers that look like phones (large integers) to strings
        const processedRows = fixedRows.map((row) => {
          const out = {};
          for (const [k, v] of Object.entries(row)) {
            if (typeof v === 'number' && v > 1000000000 && v < 99999999999) {
              // Likely a phone number stored as number
              out[k] = String(v);
            } else if (v === null || v === undefined) {
              out[k] = '';
            } else {
              out[k] = v;
            }
          }
          return out;
        });

        resolve({
          rows: processedRows,
          headers,
          fileName: file.name,
          fileSize: file.size,
          rowCount: processedRows.length,
          columnCount: headers.length,
          sheetName,
          parseErrors: [],
        });
      } catch (err) {
        reject(new Error('XLSX parse error: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Format file size for display.
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
