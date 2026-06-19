import React from 'react';
import useAppStore from '../../store/useAppStore';
import TrustScoreDashboard from './TrustScoreDashboard';
import BusinessImpactDashboard from './BusinessImpactDashboard';
import ErrorExplorer from '../validation/ErrorExplorer';
import AIInsightsPanel from '../ai/AIInsightsPanel';
import DownloadPanel from '../downloads/DownloadPanel';
import DatasetDetectionCard from '../upload/DatasetDetectionCard';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from 'recharts';

export default function ValidationSummary() {
  const { validationResult, trustScore, businessImpact, datasetDetection, fileInfo, goPrevStep } = useAppStore();
  if (!validationResult || !trustScore) return null;

  const { totalRows, cleanCount, errorCount, stats } = validationResult;
  const affectedRows = totalRows - cleanCount;
  const cleanPct = Math.round((cleanCount / totalRows) * 100);
  const sev = stats.errorSeverityCounts || {};

  // --- Chart Data 1: Radar Chart for 5 Quality Dimensions ---
  const radarData = [
    { subject: 'Completeness', value: trustScore.dimensions.completeness, fullMark: 100 },
    { subject: 'Validity', value: trustScore.dimensions.validity, fullMark: 100 },
    { subject: 'Uniqueness', value: trustScore.dimensions.uniqueness, fullMark: 100 },
    { subject: 'Consistency', value: trustScore.dimensions.consistency, fullMark: 100 },
    { subject: 'Schema Conf.', value: trustScore.dimensions.schemaConfidence, fullMark: 100 },
  ];

  // --- Chart Data 2: Severity Distribution Bar Chart ---
  const severityData = [
    { name: 'Critical', count: sev.CRITICAL || 0, color: '#ef4444' },
    { name: 'High', count: sev.HIGH || 0, color: '#f97316' },
    { name: 'Medium', count: sev.MEDIUM || 0, color: '#f59e0b' },
    { name: 'Low', count: sev.LOW || 0, color: '#3b82f6' },
  ].filter(d => d.count > 0);

  // --- Chart Data 3: Top 5 Error Breakdown ---
  const errorBreakdownData = Object.entries(stats.errorTypeCounts || {})
    .map(([type, count]) => ({
      name: type.replace(/_/g, ' '),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // --- Heatmap Data: Columns Quality ---
  const columnsList = Object.values(trustScore.columnQuality || {});

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* ENTERPRISE COMMAND CENTER HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontSize: 11, background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '3px 8px', borderRadius: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            DataPulse Command Center
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#f4f4f5', marginTop: 6, letterSpacing: '-0.02em' }}>
            Validation Diagnostics Report
          </h1>
          <p style={{ fontSize: 13, color: '#71717a', marginTop: 2 }}>
            Run metrics for dataset: <strong>{fileInfo?.fileName || 'dataset.csv'}</strong>
          </p>
        </div>

        <button className="btn-secondary" onClick={goPrevStep} style={{ fontSize: 12, height: 38 }}>
          ← Re-Map Columns
        </button>
      </div>

      {/* TOP KPI GRID */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 14,
      }}>
        {[
          { label: 'Data Trust Score', value: `${trustScore.overall}%`, color: trustScore.overall >= 90 ? '#4ade80' : trustScore.overall >= 75 ? '#22d3ee' : '#f87171', sub: trustScore.label },
          { label: 'Business Readiness', value: `${trustScore.businessReadiness}%`, color: '#3b82f6', sub: trustScore.businessReadiness >= 90 ? 'Production Ready' : 'Cleanup Recommended' },
          { label: 'Validation Confidence', value: `${trustScore.validationConfidence}%`, color: '#a855f7', sub: 'Rule coverage score' },
          { label: 'Rows Processed', value: totalRows.toLocaleString(), color: '#f4f4f5', sub: `${cleanCount.toLocaleString()} Clean Rows` },
          { label: 'Errors Found', value: errorCount.toLocaleString(), color: errorCount > 0 ? '#f87171' : '#71717a', sub: `${affectedRows.toLocaleString()} rows affected` },
          { label: 'Dataset Type', value: datasetDetection?.type || 'Custom', color: '#a5b4fc', sub: `Confidence: ${datasetDetection?.confidence || 85}%` },
        ].map((kpi, idx) => (
          <div key={idx} style={{
            padding: 16, borderRadius: 10,
            background: 'rgba(18,18,21,0.6)', border: '1px solid rgba(39,39,42,0.6)',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <span style={{ fontSize: 11, color: '#71717a', fontWeight: 500 }}>{kpi.label}</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: kpi.color, letterSpacing: '-0.01em', lineHeight: 1 }}>
              {kpi.value}
            </span>
            <span style={{ fontSize: 10, color: '#52525b' }}>{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* CHARTS CONTAINER (RADAR + RISK + ERROR BREAKDOWN) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Radar Chart */}
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#e4e4e7' }}>Quality Radar Coordinates</h4>
            <p style={{ fontSize: 11, color: '#52525b', marginTop: 2 }}>Dimensional alignment across quality vectors</p>
          </div>
          <div style={{ height: 220, display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(63,63,70,0.2)" />
                <PolarAngleAxis dataKey="subject" stroke="#71717a" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Quality" dataKey="value" stroke="#818cf8" fill="#818cf8" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#e4e4e7' }}>Severity Risk Distribution</h4>
            <p style={{ fontSize: 11, color: '#52525b', marginTop: 2 }}>Identified errors classified by dynamic severity</p>
          </div>
          {severityData.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#52525b', fontStyle: 'italic' }}>
              No issues detected to distribute.
            </div>
          ) : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.15)" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} />
                  <YAxis stroke="#71717a" fontSize={10} />
                  <Tooltip contentStyle={{ background: 'rgba(9,9,11,0.95)', border: '1px solid rgba(63,63,70,0.5)', fontSize: 11 }} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Error Breakdown */}
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#e4e4e7' }}>Error Breakdown Taxonomy</h4>
            <p style={{ fontSize: 11, color: '#52525b', marginTop: 2 }}>Top 5 most frequent validation failures</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', flex: 1 }}>
            {errorBreakdownData.map((err, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: '#a1a1aa', textTransform: 'capitalize' }}>{err.name}</span>
                  <span style={{ color: '#f4f4f5', fontWeight: 600 }}>{err.count} instances</span>
                </div>
                <div className="progress-bar" style={{ height: 6, background: 'rgba(39,39,42,0.3)' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, (err.count / totalRows) * 100)}%`,
                    background: 'linear-gradient(90deg, #f97316, #ef4444)',
                    borderRadius: 3
                  }} />
                </div>
              </div>
            ))}
            {errorBreakdownData.length === 0 && (
              <div style={{ fontSize: 12, color: '#52525b', fontStyle: 'italic', textAlign: 'center' }}>
                No flaws found in the dataset.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COLUMN QUALITY HEATMAP GRID */}
      {columnsList.length > 0 && (
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#e4e4e7' }}>Column Quality Heatmap</h4>
            <p style={{ fontSize: 11, color: '#52525b', marginTop: 2 }}>Visual matrix of column quality index scores</p>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
          }}>
            {columnsList.map((col) => {
              const score = col.score;
              const isWeak = score < 75;
              const isExcellent = score >= 90;
              const isGood = score >= 75 && score < 90;
              
              let bg = 'rgba(239,68,68,0.06)';
              let border = 'rgba(239,68,68,0.2)';
              let text = '#f87171';
              
              if (isExcellent) {
                bg = 'rgba(34,197,94,0.06)';
                border = 'rgba(34,197,94,0.2)';
                text = '#4ade80';
              } else if (isGood) {
                bg = 'rgba(6,182,212,0.06)';
                border = 'rgba(6,182,212,0.2)';
                text = '#22d3ee';
              }

              return (
                <div key={col.fieldName} style={{
                  padding: 12, borderRadius: 8,
                  background: bg, border: `1px solid ${border}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#e4e4e7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {col.fieldName.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: 10, color: '#71717a', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {col.sourceColumn}
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: text, marginLeft: 8 }}>
                    {score}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CORE DETAIL BLOCKS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Row 1: Trust Score breakdown (rings & self explain details) */}
        <TrustScoreDashboard trustScore={trustScore} />

        {/* Row 2: Business Impact */}
        <BusinessImpactDashboard impact={businessImpact} />

        {/* Row 3: Error Explorer */}
        <ErrorExplorer errors={validationResult.errors} />

        {/* Row 4: AI Insights Panel */}
        <AIInsightsPanel />

        {/* Row 5: Downloads */}
        <DownloadPanel />
      </div>
    </div>
  );
}
