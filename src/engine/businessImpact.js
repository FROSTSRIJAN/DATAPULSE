/**
 * Business Impact Calculator — Universal, Schema-Agnostic
 * Converts validation findings into deterministic business metrics.
 * Works across Customer, Transaction, Product, Employee, Financial, Inventory datasets.
 */

/**
 * Compute business impact from validation stats and column mappings.
 * @param {Object} stats - from validationEngine
 * @param {Object} columnMappings
 * @param {Object} trustScore
 */
export function computeBusinessImpact(stats, columnMappings, trustScore) {
  const { dimensions, total } = stats;
  if (!total) return null;

  const metrics = [];

  // --- Email / CRM Reach ---
  if (columnMappings.email && dimensions.email?.total > 0) {
    const invalidEmails = dimensions.email.invalid;
    const reachLoss = total > 0 ? ((invalidEmails / total) * 100).toFixed(1) : 0;

    metrics.push({
      id: 'email_reach',
      title: 'Invalid / Missing Emails',
      value: invalidEmails,
      subtitle: `CRM Reach Loss Risk`,
      impact: `${reachLoss}%`,
      risk: getRisk(parseFloat(reachLoss), [5, 15, 30]),
      icon: 'mail-x',
      domain: 'CRM & Campaign',
      description: 'Email campaigns cannot reach customers with invalid addresses. This reduces deliverability, campaign ROI, and increases hard-bounce rates.',
    });
  }

  // --- Phone / Communication Risk ---
  if (columnMappings.phone && dimensions.phone?.total > 0) {
    const invalidPhones = dimensions.phone.invalid;
    const commRiskPct = total > 0 ? (invalidPhones / total) * 100 : 0;

    metrics.push({
      id: 'phone_reach',
      title: 'Invalid Phone Numbers',
      value: invalidPhones,
      subtitle: 'Customer Communication Risk',
      impact: getRiskLabel(commRiskPct, [10, 25, 40]),
      risk: getRisk(commRiskPct, [10, 25, 40]),
      icon: 'phone-off',
      domain: 'Customer Outreach',
      description: 'SMS campaigns, OTPs, and phone support will fail for customers with invalid numbers.',
    });
  }

  // --- Duplicate Records / Reporting Accuracy ---
  const duplicateOrderErrors = (stats.errorTypeCounts?.['duplicate_order_id'] || 0);
  const duplicateRows = (stats.errorTypeCounts?.['duplicate_row'] || 0);
  const totalDuplicates = Math.max(duplicateOrderErrors, duplicateRows);

  if (totalDuplicates > 0) {
    const dupRevenue = estimateDuplicateRevenue(stats, columnMappings, totalDuplicates, total);
    metrics.push({
      id: 'duplicate_orders',
      title: 'Duplicate Records Detected',
      value: totalDuplicates,
      subtitle: 'Reporting Accuracy Risk',
      impact: getRiskLabel((totalDuplicates / total) * 100, [2, 5, 10]),
      risk: getRisk((totalDuplicates / total) * 100, [2, 5, 10]),
      icon: 'copy',
      domain: 'Analytics & Reporting',
      description: 'Duplicate records inflate metrics like GMV, order counts, employee counts, and product inventory, leading to incorrect business decisions.',
      extra: dupRevenue ? `~${dupRevenue} potential double-counted amount` : null,
    });
  }

  // --- Date Issues / Analytics Reliability ---
  if (dimensions.date?.total > 0 && dimensions.date?.invalid > 0) {
    const invalidDates = dimensions.date.invalid;
    const datePct = total > 0 ? (invalidDates / total) * 100 : 0;

    // Find the active date field label
    const activeDateFieldLabel = columnMappings.order_date ? 'Order Date'
      : columnMappings.signup_date ? 'Signup Date'
      : columnMappings.hire_date ? 'Hire Date'
      : columnMappings.dob ? 'Date of Birth'
      : 'Date';

    metrics.push({
      id: 'date_quality',
      title: `Invalid ${activeDateFieldLabel} Entries`,
      value: invalidDates,
      subtitle: 'Analytics Reliability',
      impact: datePct > 15 ? 'Significantly Reduced' : datePct > 5 ? 'Reduced' : 'Minimal Impact',
      risk: getRisk(datePct, [5, 15, 25]),
      icon: 'calendar-x',
      domain: 'Time-Series Analytics',
      description: `Invalid date entries break cohort analysis, time-series reports, trend calculations, and date-based filtering.`,
    });
  }

  // --- Payment Method Issues ---
  if (columnMappings.payment_method && dimensions.payment?.total > 0 && dimensions.payment?.invalid > 0) {
    const invalidPayments = dimensions.payment.invalid;
    metrics.push({
      id: 'payment_quality',
      title: 'Unrecognized Payment Methods',
      value: invalidPayments,
      subtitle: 'Revenue Attribution Risk',
      impact: getRiskLabel((invalidPayments / total) * 100, [3, 8, 15]),
      risk: getRisk((invalidPayments / total) * 100, [3, 8, 15]),
      icon: 'credit-card-x',
      domain: 'Finance & Revenue',
      description: 'Unrecognized payment methods cannot be reconciled, causing gaps in revenue attribution and financial reporting.',
    });
  }

  // --- Financial Amount Validation Issues ---
  if (dimensions.amount?.total > 0 && dimensions.amount?.invalid > 0) {
    const invalidAmounts = dimensions.amount.invalid;
    const amtPct = total > 0 ? (invalidAmounts / total) * 100 : 0;
    const amountFieldLabel = columnMappings.order_amount ? 'Order Amount'
      : columnMappings.unit_price ? 'Unit Price'
      : columnMappings.salary ? 'Salary'
      : 'Amount';

    metrics.push({
      id: 'amount_quality',
      title: `Invalid ${amountFieldLabel} Values`,
      value: invalidAmounts,
      subtitle: 'Revenue Calculation Risk',
      impact: getRiskLabel(amtPct, [5, 10, 20]),
      risk: getRisk(amtPct, [5, 10, 20]),
      icon: 'trending-down',
      domain: 'Finance & Analytics',
      description: `Malformed financial values (negative, non-numeric, or symbol-contaminated) will corrupt SUM/AVG calculations and break financial reports.`,
    });
  }

  // --- Quantity / Stock Validation Issues ---
  if (dimensions.quantity?.total > 0 && dimensions.quantity?.invalid > 0) {
    const invalidQty = dimensions.quantity.invalid;
    const qtyPct = total > 0 ? (invalidQty / total) * 100 : 0;
    const qtyFieldLabel = columnMappings.stock ? 'Stock Level'
      : columnMappings.quantity ? 'Quantity'
      : 'Quantity';

    metrics.push({
      id: 'quantity_quality',
      title: `Invalid ${qtyFieldLabel} Entries`,
      value: invalidQty,
      subtitle: 'Inventory / Count Accuracy',
      impact: getRiskLabel(qtyPct, [3, 10, 20]),
      risk: getRisk(qtyPct, [3, 10, 20]),
      icon: 'package-x',
      domain: 'Inventory Management',
      description: `Invalid quantity/stock entries will cause incorrect inventory counts, reorder miscalculations, and fulfillment errors.`,
    });
  }

  // --- Overall Data Readiness Summary ---
  const cleanPct = total > 0 ? Math.round((stats.cleanCount / total) * 100) : 0;
  const readiness = cleanPct >= 90 ? 'Production Ready'
    : cleanPct >= 75 ? 'Needs Minor Cleanup'
    : cleanPct >= 50 ? 'Needs Significant Cleanup'
    : 'Not Production Ready';

  const summary = {
    totalRows: total,
    cleanRows: stats.cleanCount,
    affectedRows: total - stats.cleanCount,
    cleanPct,
    readiness,
    estimatedFixTime: estimateFixTime(stats),
    totalIssues: stats.errorCount,
  };

  return { metrics, summary };
}

function getRisk(pct, [low, medium, high]) {
  if (pct >= high) return 'critical';
  if (pct >= medium) return 'high';
  if (pct >= low) return 'medium';
  return 'low';
}

function getRiskLabel(pct, thresholds) {
  const risk = getRisk(pct, thresholds);
  const labels = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
  return labels[risk];
}

/**
 * Estimate potential revenue double-count from duplicates.
 * Uses actual avg amount if available, falls back to null.
 */
function estimateDuplicateRevenue(stats, columnMappings, duplicateCount, total) {
  // Only applies to financial/transaction data with amount fields
  if (!columnMappings.order_amount && !columnMappings.unit_price) return null;
  // We don't have raw amounts here, just error counts — return null (honest, not invented)
  return null;
}

function estimateFixTime(stats) {
  const issues = stats.errorCount;
  if (issues === 0) return 'No cleanup needed';
  if (issues < 10) return '< 30 minutes';
  if (issues < 50) return '< 1 hour';
  if (issues < 200) return '2–4 hours';
  if (issues < 500) return '1–2 days';
  return '3+ days';
}

export const RISK_COLORS = {
  low: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#4ade80', label: 'Low' },
  medium: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24', label: 'Medium' },
  high: { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', text: '#fb923c', label: 'High' },
  critical: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171', label: 'Critical' },
};
