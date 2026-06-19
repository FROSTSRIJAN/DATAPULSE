import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore, { STEPS } from '../../store/useAppStore';
import { UNIVERSAL_FIELDS, DATASET_TEMPLATES, getFieldsForTemplate, getRequiredFieldsForTemplate, typeToTemplateId } from '../../constants/fieldMappings';
import { autoMapColumns } from '../../engine/columnAutoMapper';
import DataPreviewTable from '../upload/DataPreviewTable';
import { CheckCircle, AlertCircle, ArrowRight, ChevronDown, Sparkles, Shield, Zap, Edit3 } from 'lucide-react';

export default function ColumnMapper() {
  const {
    headers, rawData, fileInfo, datasetDetection,
    columnMappings, setColumnMappings, updateColumnMapping,
    activeTemplate, setActiveTemplate,
    countryRules, goToStep, goPrevStep,
  } = useAppStore();

  const [editMode, setEditMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // ── Derive template from detection ──
  const detectedTemplateId = datasetDetection ? typeToTemplateId(datasetDetection.type) : 'custom';
  const effectiveTemplate = activeTemplate || detectedTemplateId;
  const templateConfig = DATASET_TEMPLATES[effectiveTemplate] || DATASET_TEMPLATES.custom;
  const templateFields = useMemo(() => getFieldsForTemplate(effectiveTemplate), [effectiveTemplate]);
  const requiredFieldIds = useMemo(() => getRequiredFieldsForTemplate(effectiveTemplate), [effectiveTemplate]);
  const confidence = datasetDetection?.confidence || 0;

  // ── Auto-select template on high confidence ──
  useEffect(() => {
    if (confidence >= 80 && !activeTemplate && detectedTemplateId !== 'custom') {
      setActiveTemplate(detectedTemplateId);
    }
  }, [confidence, detectedTemplateId, activeTemplate, setActiveTemplate]);

  // ── Auto-map on template change ──
  useEffect(() => {
    if (effectiveTemplate && headers.length > 0) {
      const { mappings } = autoMapColumns(headers, effectiveTemplate, datasetDetection?.columnAnalysis || null);
      setColumnMappings(mappings);
    }
  }, [effectiveTemplate, headers, datasetDetection]);

  // ── Computed stats ──
  const mappedCount = Object.values(columnMappings).filter(Boolean).length;
  const totalFields = templateFields.length;
  const requiredMapped = requiredFieldIds.every((f) => !!columnMappings[f]);
  const mappingQuality = totalFields > 0 ? Math.round((mappedCount / totalFields) * 100) : 0;
  const isReadyToValidate = requiredMapped || (confidence >= 95 && mappedCount >= 3);
  const isOneClick = confidence >= 95 && requiredMapped && mappedCount >= 3;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>

      {/* ── Dataset Intelligence Panel ── */}
      {datasetDetection && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="card card-glow" style={{ padding: 24, marginBottom: 24 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Left: Detection info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Sparkles size={18} style={{ color: '#818cf8' }} />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f4f4f5' }}>Dataset Intelligence</h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <span style={{ fontSize: 32 }}>{datasetDetection.icon}</span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#f4f4f5' }}>{datasetDetection.type}</div>
                  <div style={{ fontSize: 12, color: '#71717a' }}>{datasetDetection.description}</div>
                </div>
              </div>

              {/* Confidence bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#a1a1aa' }}>Detection Confidence</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: confidence >= 90 ? '#4ade80' : confidence >= 70 ? '#fbbf24' : '#fb7185' }}>
                    {confidence}%
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(63,63,70,0.3)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                      height: '100%', borderRadius: 3,
                      background: confidence >= 90 ? 'linear-gradient(90deg, #22c55e, #4ade80)' :
                        confidence >= 70 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' :
                          'linear-gradient(90deg, #ef4444, #fb7185)',
                    }}
                  />
                </div>
              </div>

              {/* Detected attributes */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(templateConfig.detectedAttributes || []).map((attr) => (
                  <span key={attr} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
                    borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#4ade80',
                  }}>
                    <CheckCircle size={10} /> {attr}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Recommended Validation Rules */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#a1a1aa', marginBottom: 12 }}>Recommended Validation Rules</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(templateConfig.validationRules || []).map((rule) => (
                  <div key={rule} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', borderRadius: 8,
                    background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                  }}>
                    <Shield size={14} style={{ color: '#818cf8', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#d4d4d8' }}>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── One-Click Ready Banner ── */}
      {isOneClick && !editMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: '20px 24px', marginBottom: 24, borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(99,102,241,0.08))',
            border: '1px solid rgba(52,211,153,0.25)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Zap size={20} style={{ color: '#4ade80' }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#4ade80' }}>
                🚀 Everything looks good. Ready to validate.
              </div>
              <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>
                Auto-mapped {mappedCount}/{totalFields} fields · All required fields matched · Confidence {confidence}%
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setEditMode(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <Edit3 size={14} /> Edit Mappings
            </button>
            <button className="btn btn-primary" onClick={() => goToStep(STEPS.VALIDATION)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Run Validation <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Template Selector (collapsed when high confidence) ── */}
      {(confidence < 80 || editMode) && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#71717a', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Dataset Template {confidence >= 80 ? '(auto-selected)' : '— Select One'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.values(DATASET_TEMPLATES).map((t) => {
              const isActive = effectiveTemplate === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTemplate(t.id)}
                  style={{
                    background: isActive ? 'rgba(99,102,241,0.15)' : 'rgba(24,24,27,0.8)',
                    border: isActive ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(63,63,70,0.5)',
                    borderRadius: 10, padding: '10px 16px', cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{t.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? '#a5b4fc' : '#d4d4d8' }}>{t.type.replace(' Dataset', '')}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Data Preview (collapsible) ── */}
      <div className="card" style={{ marginBottom: 20, overflow: 'hidden' }}>
        <button
          onClick={() => setShowPreview(!showPreview)}
          style={{
            width: '100%', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'transparent', border: 'none', cursor: 'pointer', color: '#a1a1aa',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600 }}>Data Preview ({fileInfo?.rowCount} rows × {fileInfo?.columnCount} columns)</span>
          <ChevronDown size={16} style={{ transform: showPreview ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
        <AnimatePresence>
          {showPreview && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ padding: '0 20px 16px' }}>
                <DataPreviewTable rows={rawData} headers={headers} maxRows={4} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Main Layout: Field Mapping + Readiness Sidebar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* ── Field Mapping Cards ── */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f4f4f5', marginBottom: 4 }}>Field Mapping</h2>
              <p style={{ fontSize: 12, color: '#71717a' }}>
                {isOneClick && !editMode ? 'All fields auto-mapped.' : 'Map your dataset columns to validation fields.'}
              </p>
            </div>
            {mappedCount > 0 && (
              <span style={{
                fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20,
                background: 'rgba(52,211,153,0.1)', color: '#4ade80', border: '1px solid rgba(52,211,153,0.2)',
              }}>
                ✓ Auto-mapped {mappedCount}/{totalFields}
              </span>
            )}
          </div>

          {/* Mapping rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {templateFields.map((field) => {
              const mapped = columnMappings[field.id];
              const isRequired = requiredFieldIds.includes(field.id);

              return (
                <div
                  key={field.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '180px 1fr 90px', gap: 12, alignItems: 'center',
                    padding: '12px 14px', borderRadius: 8,
                    background: mapped ? 'rgba(52,211,153,0.03)' : 'transparent',
                    border: `1px solid ${mapped ? 'rgba(52,211,153,0.1)' : 'rgba(63,63,70,0.2)'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  {/* Field label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: isRequired ? '#6366f1' : 'rgba(63,63,70,0.6)',
                    }} />
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#e4e4e7' }}>
                        {field.label}
                        {isRequired && <span style={{ color: '#f87171', marginLeft: 3 }}>*</span>}
                      </span>
                    </div>
                  </div>

                  {/* Source column selector */}
                  {(editMode || !isOneClick) ? (
                    <select
                      className="input-base"
                      value={mapped || ''}
                      onChange={(e) => updateColumnMapping(field.id, e.target.value || null)}
                      style={{ fontSize: 13, background: 'rgba(9,9,11,0.6)' }}
                    >
                      <option value="">— Not mapped —</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  ) : (
                    <div style={{
                      fontSize: 13, color: mapped ? '#d4d4d8' : '#52525b',
                      fontFamily: mapped ? 'monospace' : 'inherit', padding: '6px 10px',
                      background: 'rgba(9,9,11,0.4)', borderRadius: 6, border: '1px solid rgba(63,63,70,0.2)',
                    }}>
                      {mapped || '—'}
                    </div>
                  )}

                  {/* Status badge */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {mapped ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)',
                        borderRadius: 5, padding: '3px 8px', fontSize: 11, color: '#4ade80', fontWeight: 500,
                      }}>
                        <CheckCircle size={10} /> Mapped
                      </span>
                    ) : isRequired ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 5, padding: '3px 8px', fontSize: 11, color: '#f87171', fontWeight: 500,
                      }}>
                        <AlertCircle size={10} /> Required
                      </span>
                    ) : (
                      <span style={{
                        background: 'rgba(39,39,42,0.4)', border: '1px solid rgba(63,63,70,0.3)',
                        borderRadius: 5, padding: '3px 8px', fontSize: 11, color: '#52525b',
                      }}>
                        Optional
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          {(!isOneClick || editMode) && (
            <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={goPrevStep}>← Back</button>
              <button
                className="btn btn-primary"
                onClick={() => goToStep(STEPS.VALIDATION)}
                disabled={!isReadyToValidate}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                Run Validation <ArrowRight size={16} />
              </button>
            </div>
          )}

          {!isReadyToValidate && (
            <p style={{ fontSize: 12, color: '#f87171', marginTop: 10, textAlign: 'center' }}>
              Map all required fields (*) to proceed.
            </p>
          )}
        </div>

        {/* ── Readiness Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Validation Readiness Score */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#d4d4d8', marginBottom: 16 }}>Validation Readiness</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#a1a1aa' }}>Mapping Quality</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: mappingQuality >= 80 ? '#4ade80' : '#fbbf24' }}>{mappingQuality}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(63,63,70,0.3)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${mappingQuality}%`, borderRadius: 2, transition: 'width 0.5s',
                  background: mappingQuality >= 80 ? 'linear-gradient(90deg,#22c55e,#4ade80)' : 'linear-gradient(90deg,#f59e0b,#fbbf24)',
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#a1a1aa' }}>Required Fields</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: requiredMapped ? '#4ade80' : '#f87171' }}>
                  {requiredMapped ? 'Complete' : 'Incomplete'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#a1a1aa' }}>Validation Ready</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: isReadyToValidate ? '#4ade80' : '#f87171' }}>
                  {isReadyToValidate ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Mapping Status */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Mapping Status
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {templateFields.slice(0, 12).map((f) => {
                const mapped = columnMappings[f.id];
                const isReq = requiredFieldIds.includes(f.id);
                return (
                  <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#71717a' }}>{f.label}</span>
                    {mapped ? (
                      <span style={{ fontSize: 10, color: '#4ade80', fontFamily: 'monospace', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        ✓ {mapped}
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, color: isReq ? '#f87171' : '#3f3f46' }}>
                        {isReq ? '✗ Required' : '—'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
