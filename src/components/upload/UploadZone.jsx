import React, { useCallback, useState } from 'react';
import useAppStore from '../../store/useAppStore';
import { parseFile, formatFileSize } from '../../services/fileParser';
import { detectDatasetType } from '../../engine/datasetTypeDetector';
import { autoMapColumns } from '../../engine/columnAutoMapper';
import { typeToTemplateId } from '../../constants/fieldMappings';
import { STEPS } from '../../store/useAppStore';

const ACCEPTED_TYPES = ['.csv', '.xlsx', '.xls'];
const MAX_SIZE_MB = 50;

export default function UploadZone() {
  const { setFileData, setDatasetDetection, setColumnMappings, setActiveTemplate, goToStep } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const processFile = useCallback(async (file) => {
    setError(null);
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setError(`Unsupported file type: .${ext}. Please upload a CSV or XLSX file.`);
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    setIsLoading(true);
    try {
      const parsed = await parseFile(file);
      const detection = detectDatasetType(parsed.headers, parsed.rows.slice(0, 30));
      const templateId = typeToTemplateId(detection.type);

      // Auto-map using detected template and column value analysis
      const { mappings } = autoMapColumns(parsed.headers, templateId, detection.columnAnalysis || null);

      setFileData(
        {
          fileName: parsed.fileName,
          fileSize: parsed.fileSize,
          rowCount: parsed.rowCount,
          columnCount: parsed.columnCount,
          sheetName: parsed.sheetName,
          parseErrors: parsed.parseErrors,
        },
        parsed.rows,
        parsed.headers
      );
      setDatasetDetection(detection);
      setColumnMappings(mappings);

      // Auto-select template for high confidence
      if (detection.confidence >= 80) {
        setActiveTemplate(templateId);
      }

      goToStep(STEPS.MAPPING);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [setFileData, setDatasetDetection, setColumnMappings, setActiveTemplate, goToStep]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
      {/* Hero text */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 20, padding: '4px 14px', marginBottom: 20,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
          <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 500, letterSpacing: '0.04em' }}>
            AI-Powered Data Intelligence
          </span>
        </div>
        <h1 style={{
          fontSize: 36, fontWeight: 800, lineHeight: 1.2,
          background: 'linear-gradient(135deg,#e4e4e7 0%,#a1a1aa 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 12, letterSpacing: '-0.03em',
        }}>
          Upload Your Dataset
        </h1>
        <p style={{ color: '#71717a', fontSize: 15, lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
          Upload any CSV or XLSX file. Our Schema Intelligence Engine will auto-detect dataset type, map fields, and recommend validation rules.
        </p>
      </div>

      {/* Drop Zone */}
      <label
        htmlFor="file-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          display: 'block',
          border: `2px dashed ${isDragging ? '#6366f1' : 'rgba(63,63,70,0.7)'}`,
          borderRadius: 16,
          padding: '48px 32px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragging ? 'rgba(99,102,241,0.06)' : 'rgba(18,18,21,0.5)',
          transition: 'all 0.2s',
          position: 'relative',
          outline: 'none',
        }}
      >
        <input
          id="file-upload"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileInput}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
          disabled={isLoading}
        />

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '3px solid rgba(99,102,241,0.2)',
              borderTopColor: '#6366f1',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ color: '#818cf8', fontWeight: 500 }}>Analyzing dataset schema…</p>
          </div>
        ) : (
          <>
            {/* Upload icon */}
            <div style={{
              width: 64, height: 64, borderRadius: 16, margin: '0 auto 20px',
              background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>

            <p style={{ fontSize: 16, fontWeight: 600, color: '#e4e4e7', marginBottom: 8 }}>
              {isDragging ? 'Drop file here' : 'Drag & drop your file'}
            </p>
            <p style={{ color: '#52525b', fontSize: 14, marginBottom: 20 }}>
              or <span style={{ color: '#818cf8', fontWeight: 500 }}>browse to upload</span>
            </p>

            {/* Format badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {['CSV', 'XLSX', 'XLS'].map((fmt) => (
                <span key={fmt} style={{
                  background: 'rgba(39,39,42,0.8)', border: '1px solid rgba(63,63,70,0.6)',
                  borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600,
                  color: '#71717a', letterSpacing: '0.05em',
                }}>
                  {fmt}
                </span>
              ))}
              <span style={{
                background: 'rgba(39,39,42,0.4)', borderRadius: 6,
                padding: '3px 10px', fontSize: 11, color: '#52525b',
              }}>
                Max {MAX_SIZE_MB}MB
              </span>
            </div>
          </>
        )}
      </label>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 16, padding: '12px 16px', borderRadius: 8,
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{ fontSize: 13, color: '#f87171' }}>{error}</span>
        </div>
      )}

      {/* Feature highlights */}
      <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { icon: '🧠', title: 'Schema Intelligence', desc: 'Auto-detects Customer, Transaction, Product, Employee, Financial, and Inventory datasets' },
          { icon: '🗺️', title: 'Universal Mapping', desc: 'Fuzzy + Levenshtein matching works with any column naming convention' },
          { icon: '✅', title: 'Dynamic Validation', desc: 'Required fields and rules change per dataset type automatically' },
          { icon: '📊', title: 'Business Impact', desc: 'Links data quality to CRM business outcomes and readiness scores' },
        ].map((f) => (
          <div key={f.title} style={{
            padding: '16px', borderRadius: 10,
            background: 'rgba(18,18,21,0.6)', border: '1px solid rgba(39,39,42,0.6)',
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#d4d4d8', marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: '#52525b', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
