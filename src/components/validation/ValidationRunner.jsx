import React, { useEffect, useRef } from 'react';
import useAppStore, { STEPS } from '../../store/useAppStore';
import { runValidation } from '../../engine/validationEngine';
import { computeTrustScore } from '../../engine/trustScore';
import { computeBusinessImpact } from '../../engine/businessImpact';
import { computeValidationCoverage } from '../../engine/validationCoverage';
import { generateLocalIntelligence } from '../../engine/localSummaryEngine';
import { saveAnalysis } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function ValidationRunner() {
  const {
    rawData, headers, columnMappings, countryRules, defaultCountry,
    activeTemplate, datasetDetection,
    isValidating, validationResult,
    setValidating, setValidationResult, goToStep, goPrevStep,
  } = useAppStore();

  const { user } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current || isValidating || validationResult) return;
    hasRun.current = true;
    runValidationNow();
  }, []);

  const runValidationNow = async () => {
    setValidating(true);
    await new Promise((r) => setTimeout(r, 60));

    try {
      const result = runValidation(rawData, columnMappings, {
        countryRules,
        defaultCountry,
        templateId: activeTemplate || null,
      });
      
      const trust = computeTrustScore(rawData, result.errors, columnMappings, datasetDetection, activeTemplate);
      const localIntel = generateLocalIntelligence(result.stats, columnMappings, trust, activeTemplate);
      
      // Inject local intelligence into the trust score object
      trust.executiveSummary = localIntel.executive_summary;
      trust.riskLevel = localIntel.risk_level;
      trust.risks = localIntel.risks;
      trust.recommendations = localIntel.recommended_actions;
      trust.businessImpacts = localIntel.business_impacts;
      trust.rootCauses = localIntel.root_causes;

      const impact = computeBusinessImpact(result.stats, columnMappings, trust);
      const coverage = computeValidationCoverage(columnMappings, countryRules, activeTemplate || null);

      // --- Database Fingerprinting ---
      const analysisRecord = {
        user_id: user?.id || 'demo-user',
        dataset_name: useAppStore.getState().fileInfo?.fileName || 'dataset.csv',
        dataset_type: activeTemplate || 'custom',
        detection_confidence: datasetDetection?.confidence || 85,
        trust_score: trust.overall,
        crm_readiness: trust.businessReadiness,
        marketing_readiness: trust.validationConfidence,
        analytics_readiness: trust.overall,
        operations_readiness: trust.businessReadiness,
        total_rows: result.totalRows,
        clean_rows: result.cleanCount,
        total_issues: result.errorCount,
        error_breakdown: {
          errorSeverityCounts: result.stats.errorSeverityCounts,
          errorTypeCounts: result.stats.errorTypeCounts,
          validationConfidence: trust.validationConfidence,
          columnQuality: trust.columnQuality,
          positiveFactors: trust.positiveFactors,
          negativeFactors: trust.negativeFactors,
          penalties: trust.penalties,
          headers,
          columnTypes: headers.map(h => {
            const sample = rawData[0]?.[h];
            if (typeof sample === 'number') return 'number';
            if (sample && !isNaN(Date.parse(sample))) return 'date';
            return 'string';
          }),
        },
        column_mappings: columnMappings
      };

      const reportRecord = {
        executive_summary: trust.executiveSummary,
        key_findings: trust.positiveFactors,
        business_risks: trust.risks,
        recommendations: trust.recommendations,
        risk_level: trust.riskLevel,
        data_readiness: trust.businessReadiness >= 90 ? 'Production Ready' : 'Needs Cleanup',
      };

      await saveAnalysis(analysisRecord, reportRecord);

      setValidationResult(result, trust, impact, coverage);
      goToStep(STEPS.RESULTS);
    } catch (err) {
      console.error('Validation error:', err);
      setValidating(false);
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 400, gap: 24, padding: 40,
    }}>
      {/* Animated validator */}
      <div style={{ position: 'relative', width: 96, height: 96 }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '3px solid rgba(99,102,241,0.15)',
          borderTopColor: '#6366f1',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{
          position: 'absolute', inset: 8, borderRadius: '50%',
          border: '2px solid rgba(139,92,246,0.15)',
          borderTopColor: '#8b5cf6',
          animation: 'spin 1.4s linear infinite reverse',
        }} />
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
        }}>
          🔍
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f4f4f5', marginBottom: 8 }}>
          Running Validation Engine
        </h2>
        <p style={{ fontSize: 14, color: '#71717a', maxWidth: 400, lineHeight: 1.6 }}>
          Checking {rawData.length.toLocaleString()} rows across all validation rules…
        </p>
      </div>

      {/* Rule checklist (animated) */}
      <div style={{
        background: 'rgba(18,18,21,0.8)', border: '1px solid rgba(39,39,42,0.6)',
        borderRadius: 12, padding: 20, minWidth: 320,
      }}>
        {[
          { label: 'Checking required fields', delay: 0 },
          { label: 'Detecting duplicate records', delay: 200 },
          { label: 'Validating phone numbers', delay: 400 },
          { label: 'Validating email addresses', delay: 600 },
          { label: 'Validating date formats', delay: 800 },
          { label: 'Checking data integrity', delay: 1000 },
          { label: 'Computing trust score', delay: 1200 },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 0',
            borderBottom: i < 6 ? '1px solid rgba(39,39,42,0.3)' : 'none',
            opacity: 0,
            animation: `fadeIn 0.3s ease ${item.delay}ms forwards`,
          }}>
            <style>{`@keyframes fadeIn{to{opacity:1}}`}</style>
            <span style={{ color: '#4ade80', fontSize: 13 }}>✓</span>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>{item.label}</span>
          </div>
        ))}
      </div>

      <button className="btn-ghost" onClick={goPrevStep} style={{ fontSize: 13 }}>
        ← Back to Mapping
      </button>
    </div>
  );
}
