import React from 'react';
import { STEPS } from '../../store/useAppStore';

const STEP_DEFS = [
  { id: STEPS.UPLOAD, label: 'Upload', icon: '↑' },
  { id: STEPS.MAPPING, label: 'Map Columns', icon: '⇄' },
  { id: STEPS.VALIDATION, label: 'Validate', icon: '✓' },
  { id: STEPS.RESULTS, label: 'Insights', icon: '◎' },
];

export default function StepProgress({ currentStep }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      padding: '12px 24px',
      borderBottom: '1px solid rgba(39,39,42,0.5)',
      background: 'rgba(15,15,18,0.6)',
    }}>
      {STEP_DEFS.map((step, idx) => {
        const isActive = currentStep === step.id;
        const isDone = currentStep > step.id;
        return (
          <React.Fragment key={step.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isDone ? 13 : 12,
                fontWeight: 600,
                background: isDone
                  ? 'rgba(99,102,241,0.3)'
                  : isActive
                  ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                  : 'rgba(39,39,42,0.8)',
                color: isDone ? '#818cf8' : isActive ? 'white' : '#52525b',
                border: isActive ? 'none' : isDone ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(63,63,70,0.6)',
                transition: 'all 0.3s',
                flexShrink: 0,
              }}>
                {isDone ? '✓' : step.id + 1}
              </div>
              <span style={{
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#e4e4e7' : isDone ? '#818cf8' : '#52525b',
                whiteSpace: 'nowrap',
              }}>
                {step.label}
              </span>
            </div>
            {idx < STEP_DEFS.length - 1 && (
              <div style={{
                height: 1, flex: 1, margin: '0 12px',
                background: isDone ? 'rgba(99,102,241,0.4)' : 'rgba(39,39,42,0.8)',
                transition: 'background 0.3s',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
