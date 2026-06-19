import React from 'react';
import { formatFileSize } from '../../services/fileParser';

export default function DatasetDetectionCard({ detection, fileInfo }) {
  if (!detection) return null;

  const { type, confidence, detectedFields, description, icon, color } = detection;

  const confColor =
    confidence >= 85 ? '#4ade80' :
    confidence >= 65 ? '#fbbf24' :
    '#f87171';

  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(63,63,70,0.6)',
      background: 'rgba(18,18,21,0.8)',
      animation: 'fadeUp 0.4s ease',
    }}>
      {/* Header bar */}
      <div style={{
        padding: '14px 20px',
        background: `linear-gradient(135deg, ${color}18, ${color}08)`,
        borderBottom: `1px solid ${color}30`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{icon}</span>
          <div>
            <div style={{ fontSize: 11, color: '#71717a', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>
              Detected Dataset Type
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#f4f4f5' }}>
              {type}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#71717a', marginBottom: 4 }}>Confidence</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: confColor, lineHeight: 1 }}>
            {confidence}%
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Detected fields */}
        <div>
          <div style={{ fontSize: 11, color: '#71717a', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Detected Fields
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {detectedFields.map((f) => (
              <span key={f} style={{
                background: `${color}15`, border: `1px solid ${color}30`,
                borderRadius: 5, padding: '2px 8px', fontSize: 12,
                color: '#d4d4d8', fontFamily: 'JetBrains Mono, monospace',
              }}>
                {f}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#52525b', marginTop: 10, lineHeight: 1.5 }}>
            {description}
          </p>
        </div>

        {/* File metadata */}
        {fileInfo && (
          <div>
            <div style={{ fontSize: 11, color: '#71717a', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              File Metadata
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'File Name', value: fileInfo.fileName },
                { label: 'File Size', value: formatFileSize(fileInfo.fileSize) },
                { label: 'Total Rows', value: fileInfo.rowCount.toLocaleString() },
                { label: 'Columns', value: fileInfo.columnCount },
                fileInfo.sheetName && { label: 'Sheet', value: fileInfo.sheetName },
              ].filter(Boolean).map((m) => (
                <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#71717a' }}>{m.label}</span>
                  <span style={{ fontSize: 12, color: '#d4d4d8', fontWeight: 500, fontFamily: 'JetBrains Mono, monospace', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
