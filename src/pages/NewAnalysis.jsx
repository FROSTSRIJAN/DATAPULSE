import React from 'react';
import useAppStore, { STEPS } from '../store/useAppStore';
import StepProgress from '../components/layout/StepProgress';
import UploadZone from '../components/upload/UploadZone';
import ColumnMapper from '../components/mapping/ColumnMapper';
import ValidationRunner from '../components/validation/ValidationRunner';
import ValidationSummary from '../components/dashboard/ValidationSummary';

export default function NewAnalysis() {
  const { currentStep } = useAppStore();

  const renderStep = () => {
    switch (currentStep) {
      case STEPS.UPLOAD: return <UploadZone />;
      case STEPS.MAPPING: return <ColumnMapper />;
      case STEPS.VALIDATION: return <ValidationRunner />;
      case STEPS.RESULTS: return <ValidationSummary />;
      default: return <UploadZone />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px 32px', maxWidth: 1200, margin: '0 auto', width: '100%', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f4f4f5', marginBottom: 4 }}>Dataset Processing Engine</h1>
        <p style={{ color: '#a1a1aa', fontSize: 13 }}>Follow the sequence below to parse, map, validate and optimize your dataset.</p>
      </div>

      {currentStep > STEPS.UPLOAD && (
        <StepProgress currentStep={currentStep} />
      )}

      <div style={{ flex: 1 }}>
        {renderStep()}
      </div>
    </div>
  );
}
