/**
 * Validation Coverage Calculator — Template Aware
 * Computes coverage based on the active dataset template's fields.
 */

import { getFieldsForTemplate, getRequiredFieldsForTemplate } from '../constants/fieldMappings';

/**
 * @param {Object} columnMappings - { canonical_field_id: source_column }
 * @param {Object} countryRules - active country phone rules
 * @param {string} templateId - active template ID
 * @returns {Object} Coverage report
 */
export function computeValidationCoverage(columnMappings, countryRules = {}, templateId = null) {
  const fields = getFieldsForTemplate(templateId);
  const requiredFields = getRequiredFieldsForTemplate(templateId);

  const mappedCount = fields.filter((f) => !!columnMappings[f.id]).length;
  const totalFields = fields.length;
  const requiredMapped = requiredFields.filter((fid) => !!columnMappings[fid]).length;
  const totalRequired = requiredFields.length;

  // Rule coverage per dimension
  const rules = [
    {
      id: 'phone',
      label: 'Phone Rules',
      active: !!columnMappings.phone,
      detail: `${Object.keys(countryRules).length || 8} countries`,
      coverage: 100,
    },
    {
      id: 'date',
      label: 'Date Rules',
      active: !!(columnMappings.order_date || columnMappings.signup_date || columnMappings.hire_date || columnMappings.dob),
      detail: '7 formats + auto-detection',
      coverage: 100,
    },
    {
      id: 'email',
      label: 'Email Rules',
      active: !!columnMappings.email,
      detail: 'Format + disposable check',
      coverage: 100,
    },
    {
      id: 'payment',
      label: 'Payment Rules',
      active: !!columnMappings.payment_method,
      detail: '30+ payment methods',
      coverage: 100,
    },
    {
      id: 'integrity',
      label: 'Integrity Rules',
      active: true,
      detail: 'Nulls, duplicates, ranges',
      coverage: 100,
    },
    {
      id: 'amount',
      label: 'Amount Rules',
      active: !!(columnMappings.order_amount || columnMappings.unit_price || columnMappings.salary),
      detail: 'Negative & non-numeric',
      coverage: 100,
    },
  ];

  const activeRules = rules.filter((r) => r.active).length;
  const totalRules = rules.length;
  const ruleCoverage = Math.round((activeRules / totalRules) * 100);

  const mappingCoverage = totalFields > 0 ? Math.round((mappedCount / totalFields) * 100) : 0;
  const requiredCoverage = totalRequired > 0 ? Math.round((requiredMapped / totalRequired) * 100) : 100;

  const confidenceScore = Math.round(
    ruleCoverage * 0.3 + mappingCoverage * 0.3 + requiredCoverage * 0.4
  );

  return {
    rules,
    activeRules,
    totalRules,
    ruleCoverage,
    mappedColumns: mappedCount,
    totalColumns: totalFields,
    mappingCoverage,
    requiredMapped,
    totalRequired,
    requiredCoverage,
    confidenceScore,
  };
}
