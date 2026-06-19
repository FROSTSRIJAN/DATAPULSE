import React, { useState } from 'react';
import useAppStore from '../../store/useAppStore';
import { generateAIInsights } from '../../services/groqService';

const RISK_COLORS = {
  Low: { stroke: '#22c55e', text: '#4ade80', bg: 'rgba(34,197,94,0.1)' },
  Medium: { stroke: '#f59e0b', text: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
  High: { stroke: '#f97316', text: '#fb923c', bg: 'rgba(249,115,22,0.1)' },
  Critical: { stroke: '#ef4444', text: '#f87171', bg: 'rgba(239,68,68,0.1)' },
};

export default function AIInsightsPanel() {
  const {
    validationResult, trustScore, datasetDetection,
    aiInsights, aiCache, isLoadingAI, aiError,
    setAIInsights, setAILoading, setAIError, addToAICache,
  } = useAppStore();

  const [controller, setController] = useState(null);
  const hasApiKey = !!import.meta.env.VITE_GROQ_API_KEY;

  if (!validationResult || !trustScore) return null;

  const handleGenerate = async () => {
    if (isLoadingAI) return;
    const ac = new AbortController();
    setController(ac);
    setAILoading(true);
    setAIError(null);

    try {
      const result = await generateAIInsights(
        validationResult,
        trustScore,
        datasetDetection,
        aiCache,
        ac.signal
      );

      if (result.cacheKey && !result.cached) {
        addToAICache(result.cacheKey, result);
      }
      setAIInsights(result);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setAIError(err.message);
      }
    } finally {
      setAILoading(false);
      setController(null);
    }
  };

  const handleCancel = () => {
    controller?.abort();
    setAILoading(false);
  };

  // Extract metrics from either Groq or local deterministic engine
  const isEnhanced = !!aiInsights;
  const executiveSummary = isEnhanced ? aiInsights.executive_summary : trustScore.executiveSummary;
  const riskLevel = isEnhanced ? aiInsights.riskLevel : trustScore.riskLevel;
  const actions = isEnhanced ? aiInsights.action_plan : trustScore.recommendations;
  const rcColor = RISK_COLORS[riskLevel] || RISK_COLORS.Low;

  return (
    <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
            border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>
            🤖
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f4f4f5' }}>Data Intelligence Summary</h3>
            <p style={{ fontSize: 12, color: '#71717a' }}>
              {isEnhanced ? 'Groq Llama-3.3 Enhanced Narrative' : 'Deterministic Local Intelligence Engine'}
              {isEnhanced && aiInsights.cached && <span style={{ color: '#4ade80', marginLeft: 8 }}>✓ Cached</span>}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {hasApiKey ? (
          !isEnhanced ? (
            <button
              className="btn-primary"
              onClick={handleGenerate}
              disabled={isLoadingAI}
              style={{ minWidth: 180 }}
            >
              {isLoadingAI ? (
                <>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }} />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  Enhancing...
                </>
              ) : (
                <>✨ Enhance with Groq AI</>
              )}
            </button>
          ) : (
            <button className="btn-secondary" onClick={() => setAIInsights(null)}>
              ↺ Reset to Local
            </button>
          )
        ) : (
          <span style={{ fontSize: 11, color: '#52525b', background: 'rgba(39,39,42,0.4)', padding: '4px 10px', borderRadius: 6 }}>
            Groq API key not set (Local mode active)
          </span>
        )}
      </div>

      {/* Loading & Error States */}
      {isLoadingAI && (
        <div style={{
          padding: 20, textAlign: 'center',
          background: 'rgba(99,102,241,0.05)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.15)',
        }}>
          <div style={{ color: '#71717a', fontSize: 12, marginBottom: 8 }}>
            Generating cognitive stakeholder explanation (no PII sent)…
          </div>
          <button className="btn-ghost" onClick={handleCancel} style={{ fontSize: 12 }}>
            Cancel
          </button>
        </div>
      )}

      {aiError && !isLoadingAI && (
        <div style={{
          padding: 14, borderRadius: 10,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
        }}>
          <p style={{ fontSize: 12, color: '#f87171' }}>⚠ Groq Error: {aiError}</p>
          <button className="btn-ghost" onClick={handleGenerate} style={{ fontSize: 12, marginTop: 6 }}>
            Retry
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {!isLoadingAI && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Executive Summary & Risk Badge */}
          <div style={{
            padding: 16, borderRadius: 10,
            background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)',
            display: 'flex', flexDirection: 'column', gap: 12
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Executive Quality Summary
              </span>
              <span style={{
                background: rcColor.bg, border: `1px solid ${rcColor.stroke}40`,
                borderRadius: 5, padding: '2px 8px', fontSize: 11,
                color: rcColor.text, fontWeight: 600,
              }}>
                Risk Level: {riskLevel}
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#d4d4d8', lineHeight: 1.6, margin: 0 }}>
              {executiveSummary}
            </p>
          </div>

          {/* AI Narratives or Local Analytics Breakdown */}
          {isEnhanced ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Business Explanation */}
              {aiInsights.business_explanation && (
                <div style={{ padding: 16, borderRadius: 10, background: 'rgba(18,18,21,0.5)', border: '1px solid rgba(39,39,42,0.5)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 8 }}>Business Implications</div>
                  <p style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.6, margin: 0 }}>{aiInsights.business_explanation}</p>
                </div>
              )}

              {/* Stakeholder Friendly Insights & Root Cause Narrative */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {aiInsights.stakeholder_friendly_insights?.length > 0 && (
                  <div style={{ padding: 16, borderRadius: 10, background: 'rgba(18,18,21,0.5)', border: '1px solid rgba(39,39,42,0.5)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 10 }}>Stakeholder Insights</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {aiInsights.stakeholder_friendly_insights.map((ins, idx) => (
                        <li key={idx} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#a1a1aa', lineHeight: 1.5 }}>
                          <span style={{ color: '#818cf8', flexShrink: 0 }}>→</span>
                          <span>{ins}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiInsights.root_cause_narrative && (
                  <div style={{ padding: 16, borderRadius: 10, background: 'rgba(18,18,21,0.5)', border: '1px solid rgba(39,39,42,0.5)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 8 }}>Root Cause Narrative</div>
                    <p style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.6, margin: 0 }}>{aiInsights.root_cause_narrative}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Local Intelligence business impact + root causes */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {/* Business Impacts */}
              <div style={{ padding: 16, borderRadius: 10, background: 'rgba(18,18,21,0.5)', border: '1px solid rgba(39,39,42,0.5)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 10 }}>Estimated Business Impact</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {trustScore.businessImpacts?.map((imp, idx) => (
                    <div key={idx}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b' }}>⚠️ {imp.title}</div>
                      <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2, lineHeight: 1.4 }}>{imp.description}</div>
                    </div>
                  ))}
                  {(!trustScore.businessImpacts || trustScore.businessImpacts.length === 0) && (
                    <div style={{ fontSize: 12, color: '#71717a', fontStyle: 'italic' }}>No critical business impacts estimated.</div>
                  )}
                </div>
              </div>

              {/* Root Cause Analysis */}
              <div style={{ padding: 16, borderRadius: 10, background: 'rgba(18,18,21,0.5)', border: '1px solid rgba(39,39,42,0.5)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 10 }}>Technical Root Causes</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {trustScore.rootCauses?.map((rc, idx) => (
                    <div key={idx}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#818cf8' }}>🛠 {rc.title}</div>
                      <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2, lineHeight: 1.4 }}>{rc.description}</div>
                    </div>
                  ))}
                  {(!trustScore.rootCauses || trustScore.rootCauses.length === 0) && (
                    <div style={{ fontSize: 12, color: '#71717a', fontStyle: 'italic' }}>No structural anomalies found.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Plan / Recommended Actions */}
          <div style={{ padding: 16, borderRadius: 10, background: 'rgba(18,18,21,0.5)', border: '1px solid rgba(39,39,42,0.5)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 10 }}>
              {isEnhanced ? 'AI Suggested Action Plan' : 'Corrective Recommendations'}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {actions?.map((act, idx) => (
                <li key={idx} style={{ display: 'flex', gap: 10, fontSize: 12, color: '#a1a1aa', lineHeight: 1.5 }}>
                  <span style={{ color: '#22c55e', fontWeight: 700, flexShrink: 0 }}>{idx + 1}.</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
