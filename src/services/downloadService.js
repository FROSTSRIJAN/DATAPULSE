/**
 * Download Service
 * Generates clean CSV, error report CSV, and chunked ZIP downloads.
 */
import Papa from 'papaparse';
import JSZip from 'jszip';

/**
 * Download a string as a file.
 */
function downloadString(content, filename, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Download clean rows as CSV.
 */
export function downloadCleanCSV(cleanRows, fileName = 'clean_data') {
  if (!cleanRows || cleanRows.length === 0) return;
  const csv = Papa.unparse(cleanRows);
  const baseName = fileName.replace(/\.[^.]+$/, '');
  downloadString(csv, `${baseName}_clean.csv`);
}

/**
 * Download error report as CSV.
 */
export function downloadErrorReport(errors, fileName = 'error_report') {
  if (!errors || errors.length === 0) return;

  const reportRows = errors.map((e) => ({
    row_number: e.row,
    field: e.field,
    error_type: e.errorType,
    severity: e.severity,
    description: e.description,
  }));

  const csv = Papa.unparse(reportRows);
  const baseName = fileName.replace(/\.[^.]+$/, '');
  downloadString(csv, `${baseName}_error_report.csv`);
}

/**
 * Download clean rows as chunked ZIP.
 * @param {Object[]} cleanRows
 * @param {number} chunkSize - rows per file
 * @param {string} fileName
 */
export async function downloadChunkedZip(cleanRows, chunkSize = 1000, fileName = 'clean_data') {
  if (!cleanRows || cleanRows.length === 0) return;

  const zip = new JSZip();
  const baseName = fileName.replace(/\.[^.]+$/, '');
  const totalChunks = Math.ceil(cleanRows.length / chunkSize);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, cleanRows.length);
    const chunk = cleanRows.slice(start, end);
    const csv = Papa.unparse(chunk);
    const paddedNum = String(i + 1).padStart(3, '0');
    zip.file(`${baseName}_part${paddedNum}.csv`, csv);
  }

  // Add summary file
  const summaryLines = [
    `XENO DataPulse AI — Chunked Export`,
    `Generated: ${new Date().toISOString()}`,
    `Total Clean Rows: ${cleanRows.length}`,
    `Chunk Size: ${chunkSize} rows`,
    `Total Parts: ${totalChunks}`,
    '',
    'Files:',
    ...Array.from({ length: totalChunks }, (_, i) => {
      const start = i * chunkSize + 1;
      const end = Math.min((i + 1) * chunkSize, cleanRows.length);
      const paddedNum = String(i + 1).padStart(3, '0');
      return `  ${baseName}_part${paddedNum}.csv  (rows ${start}-${end})`;
    }),
  ];
  zip.file('README.txt', summaryLines.join('\n'));

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}_chunked_${chunkSize}rows.zip`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Download full validation report as JSON.
 */
export function downloadValidationReport(validationResult, trustScore, datasetInfo, fileName = 'validation_report') {
  const report = {
    generated_at: new Date().toISOString(),
    tool: 'XENO DataPulse AI',
    dataset: {
      type: datasetInfo?.type,
      total_rows: validationResult.totalRows,
      clean_rows: validationResult.cleanCount,
      error_count: validationResult.errorCount,
    },
    trust_score: trustScore,
    stats: validationResult.stats,
    top_errors: validationResult.errors.slice(0, 100),
  };

  const json = JSON.stringify(report, null, 2);
  downloadString(json, `${fileName}.json`, 'application/json');
}
