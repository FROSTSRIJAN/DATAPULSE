import React, { useState } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { BAND_COLORS } from '../../engine/trustScore';

function ScoreRing({ score, label, color, subLabel }) {
  const data = [{ value: score, fill: color }];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="72%" outerRadius="90%"
            startAngle={90} endAngle={-270}
            data={data}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: 'rgba(39,39,42,0.4)' }}
              dataKey="value"
              angleAxisId={0}
              cornerRadius={6}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#f4f4f5', lineHeight: 1 }}>
            {score}
          </div>
          <div style={{ fontSize: 10, color: '#71717a', marginTop: 2 }}>/ 100</div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>{label}</div>
        <div style={{ fontSize: 11, color: '#52525b', marginTop: 1 }}>{subLabel}</div>
      </div>
    </div>
  );
}

export default function TrustScoreDashboard({ trustScore }) {
  if (!trustScore) return null;
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'columns'

  const {
    overall,
    businessReadiness,
    validationConfidence,
    dimensions,
    band,
    label,
    columnQuality = {},
    positiveFactors = [],
    negativeFactors = [],
    penalties = []
  } = trustScore;

  const bandColor = BAND_COLORS[band] || BAND_COLORS.fair;

  // Find the weakest column
  const colsList = Object.values(columnQuality);
  const sortedCols = [...colsList].sort((a, b) => a.score - b.score);
  const weakestCol = sortedCols[0];

  return (
    <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header with Navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid rgba(39,39,42,0.6)', paddingBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f4f4f5' }}>Data Integrity & Quality Audit</h2>
          <p style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>Fully dynamic, real-time quality and confidence calculation.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, background: 'rgba(9,9,11,0.5)', padding: 4, borderRadius: 8, border: '1px solid rgba(39,39,42,0.6)' }}>
          <button
            onClick={() => setActiveTab('summary')}
            style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: activeTab === 'summary' ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: activeTab === 'summary' ? '#ffffff' : '#71717a'
            }}
          >
            Metrics Overview
          </button>
          <button
            onClick={() => setActiveTab('columns')}
            style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: activeTab === 'columns' ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: activeTab === 'columns' ? '#ffffff' : '#71717a'
            }}
          >
            Column Quality Table {colsList.length > 0 && `(${colsList.length})`}
          </button>
        </div>
      </div>

      {activeTab === 'summary' ? (
        <>
          {/* Three Radial Rings Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24, justifyItems: 'center', padding: '12px 0' }}>
            <ScoreRing
              score={overall}
              label="Trust Score"
              color={bandColor.stroke}
              subLabel={`Classification: ${label}`}
            />
            <ScoreRing
              score={businessReadiness}
              label="Business Readiness"
              color="#3b82f6"
              subLabel="System migration compatibility"
            />
            <ScoreRing
              score={validationConfidence}
              label="Validation Confidence"
              color="#a855f7"
              subLabel="Rule coverage & mapping confidence"
            />
          </div>

          {/* Self-Explaining AI & Penalty Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, borderTop: '1px solid rgba(39,39,42,0.4)', paddingTop: 20 }}>
            {/* Audit Reasons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#e4e4e7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Audit Explanations</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {positiveFactors.map((fact, idx) => (
                  <div key={`pos-${idx}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12 }}>
                    <span style={{ color: '#4ade80', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                    <span style={{ color: '#a1a1aa' }}>{fact}</span>
                  </div>
                ))}

                {negativeFactors.map((fact, idx) => (
                  <div key={`neg-${idx}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12 }}>
                    <span style={{ color: '#f87171', fontWeight: 'bold', flexShrink: 0 }}>✗</span>
                    <span style={{ color: '#a1a1aa' }}>{fact}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Penalties analysis */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#e4e4e7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Penalty Impact Analysis</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {penalties.length === 0 ? (
                  <div style={{ fontSize: 12, color: '#52525b', fontStyle: 'italic' }}>
                    No penalty deductions computed. Dataset is fully clean.
                  </div>
                ) : (
                  penalties.map((pen, idx) => (
                    <div key={`pen-${idx}`} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: '#a1a1aa' }}>{pen.name}</span>
                        <span style={{ color: '#f87171', fontWeight: 600 }}>{pen.penalty}</span>
                      </div>
                      <div className="progress-bar" style={{ height: 4, background: 'rgba(39,39,42,0.3)' }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(100, Math.abs(pen.penalty) * 5)}%`,
                          background: '#ef4444',
                          borderRadius: 2
                        }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Alert for Weakest Column */}
          {weakestCol && weakestCol.score < 90 && (
            <div style={{
              display: 'flex', gap: 12, padding: '12px 16px', borderRadius: 8,
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
              marginTop: 10
            }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <div style={{ fontSize: 12, color: '#f87171', lineHeight: 1.5 }}>
                <strong>Weakest Column:</strong> "{weakestCol.fieldName.replace(/_/g, ' ')}" score is <strong>{weakestCol.score}/100</strong>. 
                {weakestCol.completeness < 90 && ' It is severely incomplete.'}
                {weakestCol.validity < 90 && ' It has high validation error rates.'}
                {weakestCol.uniqueness < 90 && ' It has critical duplicates.'}
                {' Consider checking values in raw source column: "' + weakestCol.sourceColumn + '".'}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Column Quality Intelligence Table */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: '#a1a1aa', fontWeight: 500 }}>
              Ranked mapped column analysis (lowest quality first)
            </div>
            {weakestCol && (
              <span style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 5, padding: '2px 8px', fontSize: 11, color: '#f87171', fontWeight: 600 }}>
                Weakest: {weakestCol.fieldName.replace(/_/g, ' ')} ({weakestCol.score}%)
              </span>
            )}
          </div>

          {colsList.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: '#52525b', fontSize: 13 }}>
              No columns are mapped to calculate quality intelligence.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 500 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(63,63,70,0.4)', textAlign: 'left', color: '#71717a' }}>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>Field Name</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>Source Column</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>Completeness</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>Uniqueness</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>Validity</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>Consistency</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCols.map((col, index) => {
                    const isWeakest = index === 0 && col.score < 90;
                    return (
                      <tr
                        key={col.fieldName}
                        style={{
                          borderBottom: '1px solid rgba(63,63,70,0.2)',
                          background: isWeakest ? 'rgba(239,68,68,0.03)' : 'transparent',
                          transition: 'background 0.15s'
                        }}
                      >
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#f4f4f5' }}>
                          {col.fieldName.replace(/_/g, ' ')}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#71717a', fontFamily: 'monospace' }}>
                          {col.sourceColumn}
                        </td>
                        <td style={{ padding: '10px 12px', color: col.completeness >= 90 ? '#4ade80' : '#fb923c' }}>
                          {col.completeness}%
                        </td>
                        <td style={{ padding: '10px 12px', color: col.uniqueness >= 95 ? '#4ade80' : '#fb923c' }}>
                          {col.uniqueness}%
                        </td>
                        <td style={{ padding: '10px 12px', color: col.validity >= 90 ? '#4ade80' : '#fb923c' }}>
                          {col.validity}%
                        </td>
                        <td style={{ padding: '10px 12px', color: col.consistency >= 90 ? '#4ade80' : '#fb923c' }}>
                          {col.consistency}%
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: col.score >= 90 ? '#4ade80' : col.score >= 75 ? '#22d3ee' : '#f87171' }}>
                          {col.score}/100
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
