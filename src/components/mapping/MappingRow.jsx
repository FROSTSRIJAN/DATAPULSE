import React from 'react';
import { CANONICAL_FIELDS } from '../../constants/fieldMappings';

export default function MappingRow({ field, headers, currentMapping, onChange }) {
  const isMapped = !!currentMapping;
  const isRequired = field.required;

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '200px 1fr 80px', gap: 12, alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid rgba(39,39,42,0.4)',
    }}>
      {/* Field label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
          background: isRequired ? '#6366f1' : 'rgba(63,63,70,0.8)',
        }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#e4e4e7' }}>
            {field.label}
            {isRequired && <span style={{ color: '#f87171', marginLeft: 3 }}>*</span>}
          </div>
          <div style={{ fontSize: 11, color: '#52525b', marginTop: 1 }}>{field.description}</div>
        </div>
      </div>

      {/* Source column selector */}
      <select
        className="input-base"
        value={currentMapping || ''}
        onChange={(e) => onChange(field.id, e.target.value || null)}
        style={{ fontSize: 13 }}
      >
        <option value="">— Not mapped —</option>
        {headers.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>

      {/* Status */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {isMapped ? (
          <span style={{
            background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 5, padding: '2px 8px', fontSize: 11, color: '#4ade80', fontWeight: 500,
          }}>
            Mapped
          </span>
        ) : isRequired ? (
          <span style={{
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 5, padding: '2px 8px', fontSize: 11, color: '#f87171', fontWeight: 500,
          }}>
            Required
          </span>
        ) : (
          <span style={{
            background: 'rgba(39,39,42,0.5)', border: '1px solid rgba(63,63,70,0.4)',
            borderRadius: 5, padding: '2px 8px', fontSize: 11, color: '#52525b',
          }}>
            Optional
          </span>
        )}
      </div>
    </div>
  );
}
