import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAnalyses, deleteAnalysis } from '../lib/supabase';
import { Calendar, Trash2, Database, AlertCircle, Award, TrendingUp, BarChart3, Layers, CheckCircle2, XCircle, ArrowUpDown } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, Legend } from 'recharts';

export default function AnalysisHistory() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState([]);
  const [error, setError] = useState('');
  
  // Selection state for comparison
  const [selectedIds, setSelectedIds] = useState([]);
  const [compareResult, setCompareResult] = useState(null);
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'analytics'

  const loadData = async () => {
    try {
      setLoading(false);
      const userId = user?.id || 'demo-user';
      const data = await getAnalyses(userId);
      setAnalyses(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve audit history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this log?')) return;
    try {
      await deleteAnalysis(id);
      setAnalyses(analyses.filter(a => a.id !== id));
      setSelectedIds(selectedIds.filter(x => x !== id));
      if (compareResult && (compareResult.datasetA.id === id || compareResult.datasetB.id === id)) {
        setCompareResult(null);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete log.');
    }
  };

  // --- Dynamic Historical Stats ---
  const totalRuns = analyses.length;
  const avgTrustScore = totalRuns > 0
    ? Math.round(analyses.reduce((acc, curr) => acc + (curr.trust_score || 0), 0) / totalRuns)
    : 0;
  const avgReadiness = totalRuns > 0
    ? Math.round(analyses.reduce((acc, curr) => acc + (curr.crm_readiness || 0), 0) / totalRuns)
    : 0;
  const totalRowsAudited = analyses.reduce((acc, curr) => acc + (curr.total_rows || 0), 0);

  // Common errors aggregation
  const errorAgg = {};
  analyses.forEach(item => {
    const counts = item.error_breakdown?.errorTypeCounts || {};
    Object.entries(counts).forEach(([errType, count]) => {
      errorAgg[errType] = (errorAgg[errType] || 0) + count;
    });
  });
  const commonErrors = Object.entries(errorAgg)
    .map(([type, count]) => ({ type: type.replace(/_/g, ' '), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Dataset Types Processing
  const typeCounts = {};
  analyses.forEach(item => {
    const t = item.dataset_type || 'Unknown';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  // Chart data: chronological order (oldest first)
  const chartData = [...analyses]
    .reverse()
    .map((item, idx) => ({
      name: new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      trustScore: item.trust_score || 0,
      readiness: item.crm_readiness || 0,
      rows: item.total_rows || 0,
    }));

  // --- Handle Comparison ---
  const handleCheckboxChange = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      if (selectedIds.length >= 2) {
        // Swap out the first one
        setSelectedIds([selectedIds[1], id]);
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  useEffect(() => {
    if (selectedIds.length === 2) {
      const datasetA = analyses.find(a => a.id === selectedIds[0]);
      const datasetB = analyses.find(a => a.id === selectedIds[1]);

      if (datasetA && datasetB) {
        // Sort chronologically so datasetA is the baseline (older) and datasetB is current (newer)
        const dateA = new Date(datasetA.created_at);
        const dateB = new Date(datasetB.created_at);
        const [older, newer] = dateA <= dateB ? [datasetA, datasetB] : [datasetB, datasetA];

        const rowsA = older.total_rows || 0;
        const rowsB = newer.total_rows || 0;
        const colsA = Object.keys(older.column_mappings || {}).length;
        const colsB = Object.keys(newer.column_mappings || {}).length;

        const trustA = older.trust_score || 0;
        const trustB = newer.trust_score || 0;
        const readA = older.crm_readiness || 0;
        const readB = newer.crm_readiness || 0;

        const riskA = older.error_breakdown?.riskLevel || older.analysis_reports?.[0]?.risk_level || 'Low';
        const riskB = newer.error_breakdown?.riskLevel || newer.analysis_reports?.[0]?.risk_level || 'Low';
        const riskLevels = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        const riskDelta = (riskLevels[riskB] || 1) - (riskLevels[riskA] || 1);

        const improved = [];
        const regressed = [];
        const actions = [];

        // Trust score delta
        if (trustB > trustA) {
          improved.push(`Overall Trust Score increased by +${trustB - trustA}% (from ${trustA}% to ${trustB}%).`);
        } else if (trustB < trustA) {
          regressed.push(`Overall Trust Score decreased by ${trustA - trustB}% (from ${trustA}% to ${trustB}%).`);
        }

        // Readiness score delta
        if (readB > readA) {
          improved.push(`Business Readiness improved by +${readB - readA}% (from ${readA}% to ${readB}%).`);
        } else if (readB < readA) {
          regressed.push(`Business Readiness regressed by ${readA - readB}% (from ${readA}% to ${readB}%).`);
        }

        // Row difference
        const rowDiff = rowsB - rowsA;
        
        // Error count difference
        const errorsA = older.total_issues || 0;
        const errorsB = newer.total_issues || 0;
        if (errorsB < errorsA) {
          improved.push(`Total quality issues reduced by ${errorsA - errorsB} (${errorsB} errors down from ${errorsA}).`);
        } else if (errorsB > errorsA) {
          regressed.push(`Total quality issues increased by ${errorsB - errorsA} (from ${errorsA} to ${errorsB}).`);
        }

        // Dynamic Recommendations
        if (trustB < 90) {
          actions.push('Establish validation constraints in your ETL parser to reject invalid phone numbers and email formats.');
        }
        if (errorsB > errorsA) {
          actions.push('Analyze the new errors introduced in this run to locate registration form defects.');
        }
        if (rowDiff > 1000) {
          actions.push('Given the large batch size increase, perform index-level duplicates validation.');
        }
        if (actions.length === 0) {
          actions.push('Dataset metrics show consistent progress. No immediate engineering actions required.');
        }

        setCompareResult({
          datasetA: older,
          datasetB: newer,
          rowsDelta: rowDiff,
          colsDelta: colsB - colsA,
          trustDelta: trustB - trustA,
          readinessDelta: readB - readA,
          riskDeltaLabel: riskDelta > 0 ? 'Increased' : riskDelta < 0 ? 'Decreased' : 'Unchanged',
          improved,
          regressed,
          recommendations: actions,
        });
      }
    } else {
      setCompareResult(null);
    }
  }, [selectedIds, analyses]);

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f4f4f5', marginBottom: 4 }}>System Command Center</h1>
          <p style={{ color: '#a1a1aa', fontSize: 13 }}>Enterprise historical quality analysis, cohort comparison, and audit trace.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, background: 'rgba(9,9,11,0.5)', padding: 4, borderRadius: 8, border: '1px solid rgba(39,39,42,0.6)' }}>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: activeTab === 'history' ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: activeTab === 'history' ? '#ffffff' : '#71717a'
            }}
          >
            Audit History & Compare
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: activeTab === 'analytics' ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: activeTab === 'analytics' ? '#ffffff' : '#71717a'
            }}
          >
            Historical Analytics
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: 16, borderColor: 'rgba(239,68,68,0.3)', color: '#f87171', display: 'flex', gap: 10, alignItems: 'center' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ color: '#71717a', fontSize: 14, textAlign: 'center', padding: '60px 0' }}>Loading Command Center...</div>
      ) : analyses.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', borderStyle: 'dashed', borderColor: 'rgba(63,63,70,0.4)' }}>
          <Database size={32} style={{ color: '#52525b', marginBottom: 12, margin: '0 auto' }} />
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e4e4e7', marginBottom: 4 }}>No History Logged</h3>
          <p style={{ color: '#71717a', fontSize: 13, maxWidth: 400, margin: '0 auto 16px' }}>Upload a new dataset to inspect quality metrics and populate logs.</p>
        </div>
      ) : activeTab === 'history' ? (
        /* History & Comparison View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Comparison results card (visible when exactly 2 are selected) */}
          {compareResult && (
            <div className="glass-card card-glow" style={{ padding: 24, border: '1px solid rgba(99,102,241,0.3)', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(39,39,42,0.6)', paddingBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>📊</span>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f4f4f5' }}>Dataset Cohort Comparison</h3>
                    <p style={{ fontSize: 11, color: '#71717a', marginTop: 1 }}>
                      Comparing baseline <strong>{compareResult.datasetA.filename}</strong> vs current <strong>{compareResult.datasetB.filename}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIds([])}
                  style={{ background: 'transparent', border: 'none', color: '#71717a', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Clear Selection
                </button>
              </div>

              {/* Head-to-Head delta grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                {[
                  { label: 'Trust Delta', val: `${compareResult.trustDelta > 0 ? '+' : ''}${compareResult.trustDelta}%`, color: compareResult.trustDelta > 0 ? '#4ade80' : compareResult.trustDelta < 0 ? '#f87171' : '#a1a1aa' },
                  { label: 'Readiness Delta', val: `${compareResult.readinessDelta > 0 ? '+' : ''}${compareResult.readinessDelta}%`, color: compareResult.readinessDelta > 0 ? '#22d3ee' : compareResult.readinessDelta < 0 ? '#f87171' : '#a1a1aa' },
                  { label: 'Rows Change', val: `${compareResult.rowsDelta > 0 ? '+' : ''}${compareResult.rowsDelta.toLocaleString()}`, color: compareResult.rowsDelta > 0 ? '#4ade80' : compareResult.rowsDelta < 0 ? '#f87171' : '#a1a1aa' },
                  { label: 'Columns Change', val: `${compareResult.colsDelta > 0 ? '+' : ''}${compareResult.colsDelta}`, color: compareResult.colsDelta !== 0 ? '#a78bfa' : '#a1a1aa' },
                  { label: 'Risk Shift', val: compareResult.riskDeltaLabel, color: compareResult.riskDeltaLabel === 'Increased' ? '#f87171' : compareResult.riskDeltaLabel === 'Decreased' ? '#4ade80' : '#a1a1aa' },
                ].map((d, i) => (
                  <div key={i} style={{ padding: 14, borderRadius: 8, background: 'rgba(9,9,11,0.5)', border: '1px solid rgba(39,39,42,0.4)', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: d.color, marginTop: 4 }}>{d.val}</div>
                  </div>
                ))}
              </div>

              {/* Comparison Narratives */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {/* Improvements */}
                <div style={{ padding: 16, borderRadius: 8, background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <CheckCircle2 size={14} /> Identified Improvements
                  </h4>
                  {compareResult.improved.length === 0 ? (
                    <div style={{ fontSize: 12, color: '#71717a', fontStyle: 'italic' }}>No quality improvements detected in newer run.</div>
                  ) : (
                    <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12, color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {compareResult.improved.map((fact, idx) => <li key={idx}>{fact}</li>)}
                    </ul>
                  )}
                </div>

                {/* Regressions */}
                <div style={{ padding: 16, borderRadius: 8, background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <XCircle size={14} /> Identified Regressions
                  </h4>
                  {compareResult.regressed.length === 0 ? (
                    <div style={{ fontSize: 12, color: '#71717a', fontStyle: 'italic' }}>No regressions observed. Clean transfer.</div>
                  ) : (
                    <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12, color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {compareResult.regressed.map((fact, idx) => <li key={idx}>{fact}</li>)}
                    </ul>
                  )}
                </div>
              </div>

              {/* Action Plan */}
              <div style={{ padding: 16, borderRadius: 8, background: 'rgba(168,85,247,0.03)', border: '1px solid rgba(168,85,247,0.15)' }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', marginBottom: 8 }}>Cohort Action Plan</h4>
                <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12, color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {compareResult.recommendations.map((act, idx) => <li key={idx}>{act}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* Selector Info Banner */}
          {selectedIds.length < 2 && (
            <div style={{ display: 'flex', gap: 10, padding: 12, borderRadius: 8, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', fontSize: 12, color: '#a5b4fc', alignItems: 'center' }}>
              <span>💡</span>
              <span><strong>Comparison Tip:</strong> Check the box on any two logs below to dynamically compare their parameters side-by-side.</span>
            </div>
          )}

          {/* Audit Logs List */}
          <div style={{ display: 'grid', gap: 12 }}>
            {analyses.map((item) => {
              const report = item.analysis_reports?.[0] || {};
              const isChecked = selectedIds.includes(item.id);
              const risk = item.error_breakdown?.riskLevel || report.risk_level || 'Low';

              return (
                <div key={item.id} className="card" style={{
                  padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                  border: isChecked ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(63,63,70,0.2)',
                  background: isChecked ? 'rgba(99,102,241,0.02)' : 'rgba(255,255,255,0.01)',
                  transition: 'all 0.15s'
                }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    {/* Comparison Selector Checkbox */}
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxChange(item.id)}
                      style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#6366f1' }}
                      title="Select for comparison"
                    />

                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontSize: 16 }}>
                      📄
                    </div>
                    <div>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f4f4f5', marginBottom: 2 }}>{item.dataset_name}</h3>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 11, color: '#71717a' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={11} /> {new Date(item.created_at).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>Rows: {item.total_rows?.toLocaleString()}</span>
                        <span>•</span>
                        <span>Type: {item.dataset_type || 'Customer'}</span>
                        <span>•</span>
                        <span style={{
                          color: risk === 'Critical' ? '#ef4444' : risk === 'High' ? '#fb923c' : risk === 'Medium' ? '#fbbf24' : '#4ade80',
                          fontWeight: 600
                        }}>
                          Risk: {risk}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                      <div style={{ fontSize: 9, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Trust Score</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: item.trust_score >= 90 ? '#4ade80' : item.trust_score >= 75 ? '#22d3ee' : '#f87171', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Award size={12} /> {item.trust_score}%
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                      <div style={{ fontSize: 9, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Readiness</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: item.crm_readiness >= 90 ? '#4ade80' : item.crm_readiness >= 75 ? '#22d3ee' : '#f87171' }}>
                        {item.crm_readiness}%
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => handleDelete(item.id)} className="btn btn-ghost" style={{ padding: 6, color: '#f87171' }} title="Delete log">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Analytics View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Top summary strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { label: 'Total Analyses', val: totalRuns, sub: 'Log volume', color: '#f4f4f5', icon: <Layers size={18} /> },
              { label: 'Avg Trust Score', val: `${avgTrustScore}%`, sub: 'Quality threshold', color: '#4ade80', icon: <Award size={18} /> },
              { label: 'Avg Business Readiness', val: `${avgReadiness}%`, sub: 'Migration readiness', color: '#22d3ee', icon: <TrendingUp size={18} /> },
              { label: 'Total Rows Processed', val: totalRowsAudited.toLocaleString(), sub: 'Row throughput', color: '#a78bfa', icon: <Database size={18} /> },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: 18, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.03)', color: s.color }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 11, color: '#71717a' }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color, marginTop: 2 }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: '#52525b', marginTop: 1 }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {/* Trend chart */}
            <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e4e4e7' }}>Quality Trend Over Time</div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTrust" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.15)" />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={10} />
                    <YAxis stroke="#71717a" fontSize={10} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: 'rgba(9,9,11,0.95)', border: '1px solid rgba(63,63,70,0.5)', fontSize: 11 }} />
                    <Area type="monotone" dataKey="trustScore" name="Trust Score" stroke="#4ade80" fillOpacity={1} fill="url(#colorTrust)" strokeWidth={2} />
                    <Area type="monotone" dataKey="readiness" name="Readiness" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReadiness)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Error distribution chart */}
            <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e4e4e7' }}>Distribution of Error Types</div>
              {commonErrors.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#52525b', fontStyle: 'italic' }}>
                  No error distributions to visualize.
                </div>
              ) : (
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={commonErrors} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.15)" />
                      <XAxis dataKey="type" stroke="#71717a" fontSize={9} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={10} />
                      <Tooltip contentStyle={{ background: 'rgba(9,9,11,0.95)', border: '1px solid rgba(63,63,70,0.5)', fontSize: 11 }} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                      <Bar dataKey="count" name="Issues Found" fill="#f87171" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Dataset Types & Common Errors Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flexWrap: 'wrap' }}>
            {/* common errors table */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e4e4e7', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <BarChart3 size={15} style={{ color: '#fb923c' }} /> Top Common Validation Flaws
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {commonErrors.map((err, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(63,63,70,0.15)', borderRadius: 6 }}>
                    <span style={{ fontSize: 12, color: '#a1a1aa', textTransform: 'capitalize' }}>{err.type}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 5 }}>
                      {err.count} instances
                    </span>
                  </div>
                ))}
                {commonErrors.length === 0 && (
                  <div style={{ color: '#52525b', fontSize: 12, fontStyle: 'italic' }}>No logged issues found.</div>
                )}
              </div>
            </div>

            {/* dataset types card */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e4e4e7', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers size={15} style={{ color: '#a78bfa' }} /> Processed Cohort Typology
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(typeCounts).map(([type, count], idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(63,63,70,0.15)', borderRadius: 6 }}>
                    <span style={{ fontSize: 12, color: '#a1a1aa', textTransform: 'capitalize' }}>{type} Dataset</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', background: 'rgba(139,92,246,0.1)', padding: '2px 8px', borderRadius: 5 }}>
                      {count} files
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
