import React from 'react';
import { RISK_COLORS } from '../../engine/businessImpact';

const ICON_SVG = {
  'mail-x': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 8l-9 6-9-6"/>
      <path d="M3 8l9 6 9-6"/>
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <line x1="16" y1="17" x2="22" y2="17"/>
      <line x1="19" y1="14" x2="19" y2="20"/>
    </svg>
  ),
  'phone-off': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07"/>
      <path d="M6.13 6.13A19.86 19.86 0 0 0 3.07 14.5 2 2 0 0 0 5 16.68l3 .02a2 2 0 0 0 2-1.72 12.84 12.84 0 0 1 .7-2.81 2 2 0 0 0-.45-2.11L9 8.79"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  copy: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  'calendar-x': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <line x1="10" y1="14" x2="14" y2="18"/>
      <line x1="14" y1="14" x2="10" y2="18"/>
    </svg>
  ),
  'credit-card-x': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
      <line x1="15" y1="15" x2="19" y2="19"/>
      <line x1="19" y1="15" x2="15" y2="19"/>
    </svg>
  ),
  'trending-down': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
      <polyline points="17 18 23 18 23 12"/>
    </svg>
  ),
  'package-x': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16.5 9.4 7.55 4.24"/>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
      <line x1="10" y1="14" x2="14" y2="18"/>
      <line x1="14" y1="14" x2="10" y2="18"/>
    </svg>
  ),
};

export default function BusinessImpactDashboard({ impact }) {
  if (!impact) return null;
  const { metrics, summary } = impact;

  const readinessColor =
    summary.cleanPct >= 90 ? '#4ade80' :
    summary.cleanPct >= 75 ? '#22d3ee' :
    summary.cleanPct >= 50 ? '#fbbf24' :
    '#f87171';

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f4f4f5', marginBottom: 4 }}>
          Business Impact Analysis
        </h3>
        <p style={{ fontSize: 12, color: '#71717a' }}>
          Data quality issues translated into measurable operational and financial risks
        </p>
      </div>

      {/* Summary strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: 12, marginBottom: 20, padding: '14px 16px',
        background: 'rgba(9,9,11,0.5)', borderRadius: 10,
        border: '1px solid rgba(39,39,42,0.5)',
      }}>
        {[
          { label: 'Total Rows', value: summary.totalRows?.toLocaleString(), color: '#d4d4d8' },
          { label: 'Clean Rows', value: summary.cleanRows?.toLocaleString(), color: '#4ade80' },
          { label: 'Affected Rows', value: summary.affectedRows?.toLocaleString(), color: '#f87171' },
          { label: 'Data Readiness', value: summary.readiness, color: readinessColor },
          { label: 'Est. Fix Time', value: summary.estimatedFixTime, color: '#fbbf24' },
        ].map((m) => (
          <div key={m.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#71717a', marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: m.color, lineHeight: 1.2 }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Metric cards */}
      {metrics.length === 0 ? (
        <div style={{
          padding: 24, textAlign: 'center',
          background: 'rgba(34,197,94,0.05)', borderRadius: 10,
          border: '1px solid rgba(34,197,94,0.2)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#4ade80' }}>No significant business risks detected</div>
          <div style={{ fontSize: 12, color: '#52525b', marginTop: 4 }}>Your dataset is ready for production use</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {metrics.map((metric) => {
            const rc = RISK_COLORS[metric.risk];
            const icon = ICON_SVG[metric.icon];
            return (
              <div key={metric.id} style={{
                borderRadius: 10, padding: 16,
                background: rc.bg, border: `1px solid ${rc.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ color: rc.text }}>{icon}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#d4d4d8' }}>{metric.title}</div>
                      <div style={{ fontSize: 11, color: '#71717a', marginTop: 1 }}>{metric.domain}</div>
                    </div>
                  </div>
                  <span style={{
                    background: 'rgba(0,0,0,0.3)', border: `1px solid ${rc.border}`,
                    borderRadius: 5, padding: '2px 8px', fontSize: 11,
                    color: rc.text, fontWeight: 600, flexShrink: 0,
                  }}>
                    {rc.label} Risk
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: rc.text, lineHeight: 1 }}>
                      {metric.value.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, color: '#71717a', marginTop: 4 }}>{metric.subtitle}</div>
                  </div>
                  {metric.impact && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#d4d4d8' }}>{metric.impact}</div>
                    </div>
                  )}
                </div>
                {metric.description && (
                  <p style={{ fontSize: 11, color: '#52525b', marginTop: 10, lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8 }}>
                    {metric.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
