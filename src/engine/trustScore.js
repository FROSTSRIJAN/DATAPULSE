/**
 * Trust Score & Quality Engine
 * Computes multi-dimensional data quality score, business readiness,
 * validation confidence, and column quality breakdown dynamically.
 */

import { SCORING_WEIGHTS } from '../config/scoringWeights';
import { getRequiredFieldsForTemplate } from '../constants/fieldMappings';

export const BAND_COLORS = {
  excellent: { stroke: '#22c55e', fill: 'rgba(34,197,94,0.15)', text: '#4ade80' },
  good: { stroke: '#06b6d4', fill: 'rgba(6,182,212,0.15)', text: '#22d3ee' },
  fair: { stroke: '#f59e0b', fill: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
  poor: { stroke: '#f97316', fill: 'rgba(249,115,22,0.15)', text: '#fb923c' },
  critical: { stroke: '#ef4444', fill: 'rgba(239,68,68,0.15)', text: '#f87171' },
};

export const DIMENSION_LABELS = {
  completeness: 'Completeness',
  validity: 'Validity',
  uniqueness: 'Uniqueness',
  consistency: 'Consistency',
  schemaConfidence: 'Schema Confidence'
};

function getBand(score) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  if (score >= 40) return 'poor';
  return 'critical';
}

function getLabel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
}

/**
 * Main quality calculator
 */
export function computeTrustScore(rows, errors, columnMappings, datasetDetection, activeTemplate) {
  const total = rows.length;
  if (!total || total === 0) {
    return {
      overall: 0,
      businessReadiness: 0,
      validationConfidence: 0,
      dimensions: { completeness: 0, validity: 0, uniqueness: 0, consistency: 0, schemaConfidence: 0 },
      weights: SCORING_WEIGHTS.trustScore,
      band: 'critical',
      label: 'Critical',
      columnQuality: {},
      positiveFactors: [],
      negativeFactors: [],
      penalties: []
    };
  }

  const mappedFieldIds = Object.keys(columnMappings).filter(k => columnMappings[k]);

  // 1. Completeness: percentage of non-null values across mapped columns
  let totalMappedCells = 0;
  let nonNullMappedCells = 0;
  for (const row of rows) {
    for (const fieldId of mappedFieldIds) {
      const colName = columnMappings[fieldId];
      if (colName) {
        totalMappedCells++;
        const val = row[colName];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          nonNullMappedCells++;
        }
      }
    }
  }
  const completeness = totalMappedCells > 0 ? (nonNullMappedCells / totalMappedCells) : 1.0;

  // 2. Validity: percentage of non-null fields that did not trigger validation errors
  // Exclude required checks and duplicates since they belong to completeness and uniqueness
  const validityErrors = errors.filter(e => {
    return e.errorType !== 'missing_required' &&
           !e.errorType.startsWith('duplicate');
  });
  const validity = nonNullMappedCells > 0
    ? Math.max(0, (nonNullMappedCells - validityErrors.length) / nonNullMappedCells)
    : 1.0;

  // 3. Uniqueness: percentage of non-duplicate records
  const duplicateRowsCount = new Set(
    errors.filter(e => e.errorType === 'duplicate_row' || e.errorType === 'duplicate_order_id').map(e => e.rowIndex)
  ).size;
  const uniqueness = Math.max(0, (total - duplicateRowsCount) / total);

  // 4. Consistency: percentage of values matching format checks
  // Covers all date fields, contact fields, and time fields universally
  const formatFields = [
    'phone', 'email',
    'order_date', 'signup_date', 'hire_date', 'dob',  // all date fields
    'order_time',                                        // time fields
    'order_amount', 'unit_price', 'salary',             // financial amounts
    'quantity', 'stock',                                 // quantities
  ];
  const activeFormatFields = mappedFieldIds.filter(f => formatFields.includes(f));
  let totalFormatCells = 0;
  for (const row of rows) {
    for (const fieldId of activeFormatFields) {
      const colName = columnMappings[fieldId];
      const val = row[colName];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        totalFormatCells++;
      }
    }
  }
  const consistencyErrors = errors.filter(e => {
    return e.errorType.startsWith('invalid_phone') ||
           e.errorType.startsWith('invalid_email') ||
           e.errorType.startsWith('invalid_date') ||
           e.errorType.startsWith('invalid_time') ||
           e.errorType.startsWith('invalid_amount') ||
           e.errorType.startsWith('invalid_quantity') ||
           e.errorType.startsWith('invalid_price');
  });
  const consistency = totalFormatCells > 0
    ? Math.max(0, (totalFormatCells - consistencyErrors.length) / totalFormatCells)
    : 1.0;

  // 5. Schema Confidence: confidence from detector
  const schemaConfidence = datasetDetection?.confidence ?? 0.85;

  // Weighted Trust Score Overall
  const tsW = SCORING_WEIGHTS.trustScore;
  const rawTrustScore = (
    completeness * tsW.completeness +
    validity * tsW.validity +
    uniqueness * tsW.uniqueness +
    consistency * tsW.consistency +
    schemaConfidence * tsW.schemaConfidence
  );
  const overall = Math.round(rawTrustScore * 100);

  // ─── Business Readiness Score ──────────────────────────────────────────────
  // Data Quality: overall clean rows ratio
  const cleanCount = total - new Set(errors.map(e => e.rowIndex)).size;
  const dataQuality = cleanCount / total;

  // Contact Completeness
  const contactFields = ['email', 'phone'];
  const activeContactFields = mappedFieldIds.filter(f => contactFields.includes(f));
  let contactNonNull = 0;
  let contactTotal = 0;
  for (const row of rows) {
    for (const fieldId of activeContactFields) {
      contactTotal++;
      const val = row[columnMappings[fieldId]];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        contactNonNull++;
      }
    }
  }
  const contactCompleteness = contactTotal > 0 ? (contactNonNull / contactTotal) : 1.0;

  // Critical Field Coverage
  const criticalFields = activeTemplate ? getRequiredFieldsForTemplate(activeTemplate) : [];
  const activeCriticalFields = mappedFieldIds.filter(f => criticalFields.includes(f));
  let criticalNonNull = 0;
  let criticalTotal = 0;
  for (const row of rows) {
    for (const fieldId of activeCriticalFields) {
      criticalTotal++;
      const val = row[columnMappings[fieldId]];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        criticalNonNull++;
      }
    }
  }
  const criticalFieldCoverage = criticalTotal > 0 ? (criticalNonNull / criticalTotal) : 1.0;

  const brW = SCORING_WEIGHTS.businessReadiness;
  const rawReadiness = (
    dataQuality * brW.dataQuality +
    contactCompleteness * brW.contactCompleteness +
    uniqueness * brW.uniqueness +
    validity * brW.validationSuccess +
    criticalFieldCoverage * brW.criticalFieldCoverage
  );
  const businessReadiness = Math.round(rawReadiness * 100);

  // ─── Validation Confidence Score ───────────────────────────────────────────
  // Measure confidence in the analysis itself
  const fieldMappingCoverage = activeTemplate && criticalFields.length > 0
    ? Math.min(1.0, activeCriticalFields.length / criticalFields.length)
    : 0.8;

  const totalCols = Object.keys(rows[0] || {}).length;
  const unmappedCols = Math.max(0, totalCols - mappedFieldIds.length);
  const schemaUnderstanding = totalCols > 0 ? (mappedFieldIds.length / totalCols) : 1.0;

  // All fields that have actual validation rules — universal across all dataset types
  const validatedFields = [
    'phone', 'email',
    'order_date', 'signup_date', 'hire_date', 'dob', 'order_time',
    'order_amount', 'unit_price', 'salary',
    'quantity', 'stock',
    'payment_method', 'transaction_status',
  ];
  const activeValidatedFields = mappedFieldIds.filter(f => validatedFields.includes(f));
  const validationRuleCoverage = mappedFieldIds.length > 0 ? (activeValidatedFields.length / mappedFieldIds.length) : 1.0;

  const rawConfidence = (
    schemaConfidence * 0.30 +
    fieldMappingCoverage * 0.30 +
    schemaUnderstanding * 0.20 +
    validationRuleCoverage * 0.20
  );
  const validationConfidence = Math.round(rawConfidence * 100);

  // ─── Column Quality Scoring ────────────────────────────────────────────────
  const columnQuality = {};
  for (const fieldId of mappedFieldIds) {
    const colName = columnMappings[fieldId];
    const colVals = rows.map(r => String(r[colName] || '').trim()).filter(Boolean);
    const colCompleteness = total > 0 ? colVals.length / total : 1.0;

    // Col Uniqueness
    const valCounts = {};
    for (const v of colVals) valCounts[v] = (valCounts[v] || 0) + 1;
    let dupCount = 0;
    for (const v of colVals) {
      if (valCounts[v] > 1) dupCount++;
    }
    const colUniqueness = colVals.length > 0 ? (colVals.length - dupCount) / colVals.length : 1.0;

    // Col Validity
    const colValidityErrors = errors.filter(e => e.field === fieldId && e.errorType !== 'missing_required' && !e.errorType.startsWith('duplicate'));
    const colValidity = colVals.length > 0 ? Math.max(0, (colVals.length - colValidityErrors.length) / colVals.length) : 1.0;

    // Col Consistency — covers all format-validated fields
    const colConsistencyErrors = errors.filter(e => e.field === fieldId && (
      e.errorType.startsWith('invalid_phone') ||
      e.errorType.startsWith('invalid_email') ||
      e.errorType.startsWith('invalid_date') ||
      e.errorType.startsWith('invalid_time') ||
      e.errorType.startsWith('invalid_amount') ||
      e.errorType.startsWith('invalid_quantity') ||
      e.errorType.startsWith('invalid_price')
    ));
    const colConsistency = colVals.length > 0 ? Math.max(0, (colVals.length - colConsistencyErrors.length) / colVals.length) : 1.0;

    const colQualityScore = Math.round((
      colCompleteness * 0.35 +
      colValidity * 0.30 +
      colUniqueness * 0.20 +
      colConsistency * 0.15
    ) * 100);

    columnQuality[fieldId] = {
      fieldName: fieldId,
      sourceColumn: colName,
      score: colQualityScore,
      completeness: Math.round(colCompleteness * 100),
      uniqueness: Math.round(colUniqueness * 100),
      validity: Math.round(colValidity * 100),
      consistency: Math.round(colConsistency * 100)
    };
  }

  // ─── Self-Explaining AI Contributors & Penalties ───────────────────────────
  const positiveFactors = [];
  const negativeFactors = [];
  const penalties = [];

  // Duplicates penalty
  const dupPenalty = Math.round((1.0 - uniqueness) * tsW.uniqueness * 100);
  if (dupPenalty > 0) {
    penalties.push({ name: 'Duplicates', penalty: -dupPenalty });
    negativeFactors.push(`Duplicate identifiers / records (${Math.round((1.0 - uniqueness) * 100)}% duplicate rate)`);
  } else {
    positiveFactors.push(`Strong uniqueness (${Math.round(uniqueness * 100)}% unique records)`);
  }

  // Missing Values penalty
  const missingPenalty = Math.round((1.0 - completeness) * tsW.completeness * 100);
  if (missingPenalty > 0) {
    penalties.push({ name: 'Missing Values', penalty: -missingPenalty });
    negativeFactors.push(`Missing values in mapped fields (${Math.round((1.0 - completeness) * 100)}% missing rate)`);
  } else {
    positiveFactors.push(`High completeness (${Math.round(completeness * 100)}% fields populated)`);
  }

  // Validity penalty
  const validityPenalty = Math.round((1.0 - validity) * tsW.validity * 100);
  if (validityPenalty > 0) {
    penalties.push({ name: 'Invalid Values', penalty: -validityPenalty });
    negativeFactors.push(`Validation rule violations (${Math.round((1.0 - validity) * 100)}% invalid data)`);
  } else {
    positiveFactors.push(`Excellent validity (${Math.round(validity * 100)}% values pass validation)`);
  }

  // Consistency penalty
  const consistencyPenalty = Math.round((1.0 - consistency) * tsW.consistency * 100);
  if (consistencyPenalty > 0) {
    penalties.push({ name: 'Consistency Failures', penalty: -consistencyPenalty });
    negativeFactors.push(`Formatting format failures (${Math.round((1.0 - consistency) * 100)}% formatting issues)`);
  } else if (activeFormatFields.length > 0) {
    positiveFactors.push(`High format consistency (${Math.round(consistency * 100)}% correct formats)`);
  }

  // Schema penalty
  const schemaPenalty = Math.round((1.0 - schemaConfidence) * tsW.schemaConfidence * 100);
  if (schemaPenalty > 0) {
    penalties.push({ name: 'Schema Ambiguity', penalty: -schemaPenalty });
  }

  return {
    overall,
    businessReadiness,
    validationConfidence,
    dimensions: {
      completeness: Math.round(completeness * 100),
      validity: Math.round(validity * 100),
      uniqueness: Math.round(uniqueness * 100),
      consistency: Math.round(consistency * 100),
      schemaConfidence: Math.round(schemaConfidence * 100)
    },
    weights: tsW,
    band: getBand(overall),
    label: getLabel(overall),
    columnQuality,
    positiveFactors,
    negativeFactors,
    penalties
  };
}
