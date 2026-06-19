import React, { useState } from 'react';
import useAppStore from '../../store/useAppStore';
import {
  downloadCleanCSV,
  downloadErrorReport,
  downloadChunkedZip,
  downloadValidationReport,
} from '../../services/downloadService';

const CHUNK_OPTIONS = [500, 1000, 5000];

export default function DownloadPanel() {
  const { validationResult, trustScore, datasetDetection, fileInfo } = useAppStore();
  const [chunkSize, setChunkSize] = useState(1000);
  const [downloading, setDownloading] = useState(null);

  if (!validationResult) return null;

  const { cleanRows, errors, totalRows, cleanCount, errorCount } = validationResult;
  const baseName = fileInfo?.fileName?.replace(/\.[^.]+$/, '') || 'dataset';

  const handle = async (key, fn) => {
    setDownloading(key);
    await new Promise((r) => setTimeout(r, 30));
    try {
      await fn();
    } finally {
      setDownloading(null);
    }
  };

  const downloads = [
    {
      key: 'clean',
      icon: '✅',
      title: 'Clean Data CSV',
      description: `${cleanCount.toLocaleString()} valid rows ready for import`,
      subtitle: `${Math.round((cleanCount / totalRows) * 100)}% of total dataset`,
      color: '#22c55e',
      action: () => downloadCleanCSV(cleanRows, baseName),
      disabled: cleanCount === 0,
    },
    {
      key: 'errors',
      icon: '⚠️',
      title: 'Error Report CSV',
      description: `${errorCount.toLocaleString()} issues with field-level details`,
      subtitle: 'Row, Field, Error Type, Severity, Description',
      color: '#f59e0b',
      action: () => downloadErrorReport(errors, baseName),
      disabled: errorCount === 0,
    },
    {
      key: 'zip',
      icon: '📦',
      title: 'Chunked ZIP Archive',
      description: `Split into ${Math.ceil(cleanCount / chunkSize)} files of ${chunkSize} rows`,
      subtitle: 'Includes README with chunk index',
      color: '#6366f1',
      action: () => downloadChunkedZip(cleanRows, chunkSize, baseName),
      disabled: cleanCount === 0,
      hasOptions: true,
    },
    {
      key: 'report',
      icon: '📋',
      title: 'Validation Report JSON',
      description: 'Full validation metadata and statistics',
      subtitle: 'For technical review and audit trail',
      color: '#3b82f6',
      action: () => downloadValidationReport(validationResult, trustScore, datasetDetection, baseName),
      disabled: false,
    },
  ];

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f4f4f5', marginBottom: 4 }}>
          Export & Downloads
        </h3>
        <p style={{ fontSize: 12, color: '#71717a' }}>
          All files generated client-side — no data leaves your browser
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {downloads.map((dl) => (
          <div key={dl.key} style={{
            borderRadius: 10, padding: 16,
            background: dl.disabled ? 'rgba(18,18,21,0.4)' : 'rgba(18,18,21,0.7)',
            border: `1px solid ${dl.disabled ? 'rgba(39,39,42,0.4)' : `${dl.color}30`}`,
            opacity: dl.disabled ? 0.5 : 1,
            transition: 'all 0.15s',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{dl.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7', marginBottom: 3 }}>{dl.title}</div>
                <div style={{ fontSize: 12, color: '#71717a', lineHeight: 1.4 }}>{dl.description}</div>
                <div style={{ fontSize: 11, color: '#52525b', marginTop: 3 }}>{dl.subtitle}</div>
              </div>
            </div>

            {/* Chunk size selector for ZIP */}
            {dl.hasOptions && !dl.disabled && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {CHUNK_OPTIONS.map((size) => (
                  <button
                    key={size}
                    onClick={() => setChunkSize(size)}
                    style={{
                      flex: 1, padding: '4px 0', borderRadius: 5,
                      background: chunkSize === size ? 'rgba(99,102,241,0.2)' : 'rgba(39,39,42,0.5)',
                      border: `1px solid ${chunkSize === size ? 'rgba(99,102,241,0.4)' : 'rgba(63,63,70,0.4)'}`,
                      color: chunkSize === size ? '#a5b4fc' : '#71717a',
                      fontSize: 11, fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    {size.toLocaleString()}
                  </button>
                ))}
              </div>
            )}

            <button
              className="btn-primary"
              onClick={() => handle(dl.key, dl.action)}
              disabled={dl.disabled || downloading === dl.key}
              style={{
                width: '100%', justifyContent: 'center',
                background: dl.disabled ? 'rgba(39,39,42,0.5)' : undefined,
                fontSize: 13,
              }}
            >
              {downloading === dl.key ? (
                <>
                  <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  Generating…
                </>
              ) : (
                `↓ Download`
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Stats footer */}
      <div style={{
        marginTop: 16, padding: '10px 16px', borderRadius: 8,
        background: 'rgba(9,9,11,0.5)', border: '1px solid rgba(39,39,42,0.4)',
        display: 'flex', gap: 24, flexWrap: 'wrap',
      }}>
        {[
          { label: 'Total Rows', value: totalRows.toLocaleString(), color: '#d4d4d8' },
          { label: 'Clean Rows', value: cleanCount.toLocaleString(), color: '#4ade80' },
          { label: 'Error Rows', value: (totalRows - cleanCount).toLocaleString(), color: '#f87171' },
          { label: 'Total Issues', value: errorCount.toLocaleString(), color: '#fbbf24' },
        ].map((s) => (
          <div key={s.label}>
            <div style={{ fontSize: 10, color: '#52525b', marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
