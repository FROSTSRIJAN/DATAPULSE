import React, { useState } from 'react';

export default function DataPreviewTable({ rows, headers, maxRows = 5 }) {
  const [showAll, setShowAll] = useState(false);
  const displayRows = showAll ? rows.slice(0, 20) : rows.slice(0, maxRows);

  if (!rows || rows.length === 0) return null;

  return (
    <div style={{ borderRadius: 10, border: '1px solid rgba(39,39,42,0.6)', overflow: 'hidden' }}>
      <div style={{
        padding: '10px 16px',
        background: 'rgba(15,15,18,0.8)',
        borderBottom: '1px solid rgba(39,39,42,0.6)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: '#71717a', fontWeight: 500 }}>
          Dataset Preview — showing {displayRows.length} of {rows.length.toLocaleString()} rows
        </span>
        {rows.length > maxRows && (
          <button className="btn-ghost" style={{ fontSize: 12, padding: '3px 8px' }} onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show less' : `Show more`}
          </button>
        )}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ minWidth: headers.length * 120 }}>
          <thead>
            <tr>
              <th style={{ width: 40, color: '#3f3f46' }}>#</th>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, i) => (
              <tr key={i}>
                <td style={{ color: '#3f3f46', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
                  {i + 1}
                </td>
                {headers.map((h) => {
                  const val = row[h];
                  const isEmpty = val === null || val === undefined || val === '';
                  return (
                    <td key={h} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                      {isEmpty ? (
                        <span style={{ color: '#3f3f46', fontStyle: 'italic' }}>—</span>
                      ) : (
                        <span style={{ color: '#d4d4d8' }}>{String(val)}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
