import React, { useState, useMemo } from 'react';
import useAppStore from '../../store/useAppStore';

const SEVERITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
const SEVERITY_COLORS = {
  CRITICAL: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  HIGH: { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', text: '#fb923c' },
  MEDIUM: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24' },
  LOW: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#60a5fa' },
};

export default function ErrorExplorer({ errors = [] }) {
  const { errorFilter, setErrorFilter } = useAppStore();
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  // Derived unique fields for filter
  const uniqueFields = useMemo(() => {
    const s = new Set(errors.map((e) => e.field));
    return ['all', ...Array.from(s).sort()];
  }, [errors]);

  // Filter
  const filtered = useMemo(() => {
    return errors
      .filter((e) => {
        if (errorFilter.severity !== 'all' && e.severity !== errorFilter.severity) return false;
        if (errorFilter.field !== 'all' && e.field !== errorFilter.field) return false;
        if (errorFilter.search) {
          const q = errorFilter.search.toLowerCase();
          return (
            e.description.toLowerCase().includes(q) ||
            e.errorType.toLowerCase().includes(q) ||
            String(e.row).includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  }, [errors, errorFilter]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleFilter = (key, val) => {
    setErrorFilter({ [key]: val });
    setPage(0);
  };

  // Error type breakdown
  const typeCounts = useMemo(() => {
    const m = {};
    for (const e of errors) {
      const base = e.severity;
      m[base] = (m[base] || 0) + 1;
    }
    return m;
  }, [errors]);

  return (
    <div className="glass-card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid rgba(39,39,42,0.6)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f4f4f5', marginBottom: 4 }}>
            Error Explorer
          </h3>
          <p style={{ fontSize: 12, color: '#71717a' }}>
            {errors.length} total issues · {filtered.length} shown after filter
          </p>
        </div>
        {/* Severity summary */}
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(typeCounts).map(([sev, count]) => {
            const c = SEVERITY_COLORS[sev] || {};
            return (
              <button
                key={sev}
                onClick={() => handleFilter('severity', errorFilter.severity === sev ? 'all' : sev)}
                style={{
                  background: errorFilter.severity === sev ? c.bg : 'rgba(24,24,27,0.6)',
                  border: `1px solid ${errorFilter.severity === sev ? c.border : 'rgba(63,63,70,0.4)'}`,
                  borderRadius: 6, padding: '4px 10px', cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <span style={{ fontSize: 12, color: c.text, fontWeight: 600 }}>{count}</span>
                <span style={{ fontSize: 11, color: '#71717a' }}>{sev}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div style={{
        padding: '12px 20px', borderBottom: '1px solid rgba(39,39,42,0.4)',
        display: 'flex', gap: 10, flexWrap: 'wrap',
      }}>
        <input
          className="input-base"
          placeholder="Search errors…"
          value={errorFilter.search}
          onChange={(e) => handleFilter('search', e.target.value)}
          style={{ maxWidth: 220, fontSize: 13 }}
        />
        <select
          className="input-base"
          value={errorFilter.severity}
          onChange={(e) => handleFilter('severity', e.target.value)}
          style={{ maxWidth: 140, fontSize: 13 }}
        >
          <option value="all">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select
          className="input-base"
          value={errorFilter.field}
          onChange={(e) => handleFilter('field', e.target.value)}
          style={{ maxWidth: 180, fontSize: 13 }}
        >
          {uniqueFields.map((f) => (
            <option key={f} value={f}>{f === 'all' ? 'All Fields' : f}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#52525b' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>No errors match the current filter</div>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', maxHeight: 420, overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Row</th>
                  <th style={{ width: 120 }}>Field</th>
                  <th style={{ width: 100 }}>Severity</th>
                  <th>Description</th>
                  <th style={{ width: 180, fontSize: 10 }}>Error Type</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((err) => {
                  const c = SEVERITY_COLORS[err.severity] || {};
                  return (
                    <tr key={err.id}>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#71717a' }}>
                        {err.row}
                      </td>
                      <td>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#a5b4fc' }}>
                          {err.field}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          background: c.bg, border: `1px solid ${c.border}`,
                          borderRadius: 5, padding: '2px 7px', fontSize: 11,
                          color: c.text, fontWeight: 600,
                        }}>
                          {err.severity}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: '#d4d4d8', lineHeight: 1.4 }}>
                        {err.description}
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#52525b' }}>
                        {err.errorType}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              padding: '10px 20px', borderTop: '1px solid rgba(39,39,42,0.4)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 12, color: '#71717a' }}>
                Page {page + 1} of {totalPages} · {filtered.length} results
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn-ghost" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ fontSize: 12 }}>
                  ← Prev
                </button>
                <button className="btn-ghost" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ fontSize: 12 }}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
