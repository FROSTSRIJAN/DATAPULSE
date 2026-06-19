/**
 * Local Intelligence & Summary Engine — Universal, Schema-Agnostic
 * Generates dynamic executive summaries, risk levels, recommendations,
 * and business impact descriptions based entirely on actual dataset analysis.
 * Works for Customer, Transaction, Product, Employee, Financial, Inventory,
 * and completely Unknown/Custom datasets.
 */

// Dataset type labels for human-readable output
const DATASET_TYPE_LABELS = {
  customer: 'Customer',
  transaction: 'Transaction',
  product: 'Product',
  employee: 'Employee',
  financial: 'Financial',
  inventory: 'Inventory',
  custom: 'Custom',
};

// Per-template business context for relevant error descriptions
const TEMPLATE_BUSINESS_CONTEXT = {
  customer: {
    entityName: 'customer records',
    idField: 'customer_id',
    primaryImpact: 'CRM quality, marketing deliverability, and customer segmentation',
    duplicateImpact: 'Duplicate customer records inflate CRM segments and cause redundant outreach.',
    missingImpact: 'Missing customer IDs create orphan records that cannot be linked to order history.',
    contactImpact: 'Invalid emails/phones reduce campaign deliverability and SMS success rates.',
  },
  transaction: {
    entityName: 'transaction records',
    idField: 'order_id',
    primaryImpact: 'revenue reporting accuracy, financial reconciliation, and analytics dashboards',
    duplicateImpact: 'Duplicate order IDs inflate GMV, order counts, and lead to double-counted revenue.',
    missingImpact: 'Missing order IDs break downstream joins and prevent proper order tracking.',
    contactImpact: 'Invalid contact data prevents customer communication for order updates.',
  },
  product: {
    entityName: 'product catalog records',
    idField: 'product_id',
    primaryImpact: 'catalog accuracy, pricing consistency, and inventory management',
    duplicateImpact: 'Duplicate product SKUs create inventory count conflicts and catalog display errors.',
    missingImpact: 'Missing product IDs break catalog lookups and order fulfillment workflows.',
    contactImpact: 'No contact data fields applicable for this dataset type.',
  },
  employee: {
    entityName: 'employee records',
    idField: 'employee_id',
    primaryImpact: 'HR system accuracy, payroll processing, and workforce analytics',
    duplicateImpact: 'Duplicate employee IDs cause payroll conflicts and HRIS synchronization failures.',
    missingImpact: 'Missing employee IDs prevent linking to benefits, payroll, and access control systems.',
    contactImpact: 'Invalid contact data limits HR communication and emergency notification capabilities.',
  },
  financial: {
    entityName: 'financial records',
    idField: 'order_id',
    primaryImpact: 'financial reporting accuracy, audit compliance, and reconciliation',
    duplicateImpact: 'Duplicate financial entries overstate revenue or expenses, causing audit failures.',
    missingImpact: 'Missing transaction IDs break audit trails and prevent proper GL reconciliation.',
    contactImpact: 'Contact fields not typically required for financial ledger data.',
  },
  inventory: {
    entityName: 'inventory records',
    idField: 'product_id',
    primaryImpact: 'stock accuracy, supply chain decisions, and reorder planning',
    duplicateImpact: 'Duplicate SKUs cause incorrect stock counts leading to over/under ordering.',
    missingImpact: 'Missing product IDs prevent proper warehouse location tracking.',
    contactImpact: 'Contact fields not applicable for inventory data.',
  },
  custom: {
    entityName: 'records',
    idField: null,
    primaryImpact: 'data integrity, system reliability, and analytical accuracy',
    duplicateImpact: 'Duplicate records inflate counts and skew analytical results.',
    missingImpact: 'Missing values create incomplete records that break downstream workflows.',
    contactImpact: 'Invalid contact data reduces communication reliability.',
  },
};

export function generateLocalIntelligence(stats, columnMappings, trustScore, activeTemplate) {
  const total = stats.total || 0;
  const cleanCount = stats.cleanCount || 0;
  const affected = total - cleanCount;

  // Get context for the active template
  const templateKey = activeTemplate || 'custom';
  const ctx = TEMPLATE_BUSINESS_CONTEXT[templateKey] || TEMPLATE_BUSINESS_CONTEXT.custom;
  const typeLabel = DATASET_TYPE_LABELS[templateKey] || 'Unknown';

  // Extract error counts
  const missingCount = stats.errorTypeCounts?.['missing_required'] || 0;
  const dupRowCount = stats.errorTypeCounts?.['duplicate_row'] || 0;
  const dupIdCount = stats.errorTypeCounts?.['duplicate_order_id'] || 0;
  const dups = Math.max(dupRowCount, dupIdCount);

  // Email / phone stats
  let phoneInvalid = 0, phoneTotal = 0;
  if (columnMappings.phone && stats.dimensions.phone) {
    phoneInvalid = stats.dimensions.phone.invalid;
    phoneTotal = stats.dimensions.phone.total;
  }
  let emailInvalid = 0, emailTotal = 0;
  if (columnMappings.email && stats.dimensions.email) {
    emailInvalid = stats.dimensions.email.invalid;
    emailTotal = stats.dimensions.email.total;
  }

  // Date / amount / quantity stats
  const dateInvalid = stats.dimensions.date?.invalid || 0;
  const dateTotal = stats.dimensions.date?.total || 0;
  const amountInvalid = stats.dimensions.amount?.invalid || 0;
  const quantityInvalid = stats.dimensions.quantity?.invalid || 0;

  const contactInvalid = phoneInvalid + emailInvalid;
  const contactTotal = phoneTotal + emailTotal;
  const contactInvalidRate = contactTotal > 0 ? contactInvalid / contactTotal : 0;

  const missingRate = total > 0 ? missingCount / total : 0;
  const duplicateRate = total > 0 ? dups / total : 0;
  const dateInvalidRate = dateTotal > 0 ? dateInvalid / dateTotal : 0;
  const affectedPct = total > 0 ? ((affected / total) * 100).toFixed(1) : 0;

  // ─── 1. DYNAMIC EXECUTIVE SUMMARY ─────────────────────────────────────────
  const summaryParts = [];

  // Open with clean record count
  if (affected === 0) {
    summaryParts.push(`All ${total.toLocaleString()} ${ctx.entityName} passed validation with zero issues detected.`);
  } else {
    summaryParts.push(`Analyzed ${total.toLocaleString()} ${ctx.entityName}: ${cleanCount.toLocaleString()} passed validation (${(100 - parseFloat(affectedPct)).toFixed(1)}% clean) while ${affected.toLocaleString()} records (${affectedPct}%) had at least one issue.`);
  }

  // Key issue summary
  if (missingCount > 0) {
    const missingPct = ((missingCount / total) * 100).toFixed(1);
    summaryParts.push(`Missing required values were found in ${missingCount} instances (${missingPct}% rate).`);
  }
  if (dups > 0) {
    summaryParts.push(`Duplicate identifiers were detected in ${dups} rows (${(duplicateRate * 100).toFixed(1)}% of total).`);
  }
  if (contactInvalid > 0 && contactTotal > 0) {
    const emailValidPct = emailTotal > 0 ? ((1 - emailInvalid / emailTotal) * 100).toFixed(1) : null;
    const phoneValidPct = phoneTotal > 0 ? ((1 - phoneInvalid / phoneTotal) * 100).toFixed(1) : null;
    if (emailValidPct && phoneValidPct) {
      summaryParts.push(`Email validity is at ${emailValidPct}% and phone validity at ${phoneValidPct}%.`);
    } else if (emailValidPct) {
      summaryParts.push(`Email validation passed for ${emailValidPct}% of records.`);
    } else if (phoneValidPct) {
      summaryParts.push(`Phone validation passed for ${phoneValidPct}% of records.`);
    }
  }
  if (dateInvalid > 0 && dateTotal > 0) {
    summaryParts.push(`Date formatting anomalies were found in ${dateInvalid} rows (${(dateInvalidRate * 100).toFixed(1)}% error rate).`);
  }
  if (amountInvalid > 0) {
    summaryParts.push(`${amountInvalid} financial value entries failed numeric validation checks.`);
  }

  // Close with quality classification
  summaryParts.push(`Overall ${typeLabel} dataset quality is rated as "${trustScore.label}" with Trust Score ${trustScore.overall}/100 and Business Readiness ${trustScore.businessReadiness}/100.`);

  const executive_summary = summaryParts.join(' ');

  // ─── 2. DYNAMIC RISK ANALYSIS ──────────────────────────────────────────────
  const risks = [];

  // Missing values risk (universal)
  if (missingRate > 0.20) {
    risks.push({
      type: 'Completeness',
      level: 'Critical',
      title: 'Critical Completeness Gap',
      description: `Over 20% of ${ctx.entityName} (${(missingRate * 100).toFixed(1)}% rate) have missing required fields. ${ctx.missingImpact}`,
      icon: 'database-zap'
    });
  } else if (missingRate > 0.05) {
    risks.push({
      type: 'Completeness',
      level: 'Medium',
      title: 'Moderate Completeness Risk',
      description: `${(missingRate * 100).toFixed(1)}% of records contain missing required values, which may cause gaps in ${ctx.primaryImpact}.`,
      icon: 'database'
    });
  }

  // Duplicate risk (universal)
  if (duplicateRate > 0.10) {
    risks.push({
      type: 'Duplicate',
      level: 'Critical',
      title: 'High Duplicate Record Rate',
      description: `${(duplicateRate * 100).toFixed(1)}% duplicate rate detected — exceeds safe threshold. ${ctx.duplicateImpact}`,
      icon: 'copy'
    });
  } else if (duplicateRate > 0.02) {
    risks.push({
      type: 'Duplicate',
      level: 'High',
      title: 'Duplicate Records Detected',
      description: `${dups} duplicate records found (${(duplicateRate * 100).toFixed(1)}% rate). ${ctx.duplicateImpact}`,
      icon: 'copy-x'
    });
  }

  // Contact risk (only if relevant columns are mapped)
  if (contactTotal > 0 && contactInvalidRate > 0.15) {
    risks.push({
      type: 'Contact',
      level: 'High',
      title: 'Communication Reliability Risk',
      description: `${(contactInvalidRate * 100).toFixed(1)}% of contact endpoints fail validation. ${ctx.contactImpact}`,
      icon: 'mail-warning'
    });
  } else if (contactTotal > 0 && contactInvalidRate > 0.05) {
    risks.push({
      type: 'Contact',
      level: 'Medium',
      title: 'Moderate Contact Deliverability Risk',
      description: `${(contactInvalidRate * 100).toFixed(1)}% of contact data (emails/phones) has formatting errors.`,
      icon: 'mail'
    });
  }

  // Date / temporal risk
  if (dateTotal > 0 && dateInvalidRate > 0.15) {
    risks.push({
      type: 'Temporal',
      level: 'High',
      title: 'Date Format Inconsistency Risk',
      description: `${(dateInvalidRate * 100).toFixed(1)}% of date entries fail format validation. This breaks chronological ordering, time-series analytics, and cohort analysis.`,
      icon: 'calendar-x'
    });
  } else if (dateTotal > 0 && dateInvalidRate > 0.05) {
    risks.push({
      type: 'Temporal',
      level: 'Medium',
      title: 'Moderate Date Quality Issue',
      description: `Some date fields (${dateInvalid} rows, ${(dateInvalidRate * 100).toFixed(1)}% rate) use inconsistent formats that may break date-based filtering.`,
      icon: 'calendar'
    });
  }

  // Financial amount risk (for transaction/financial/product datasets)
  if (amountInvalid > 0) {
    const amtRate = total > 0 ? (amountInvalid / total) * 100 : 0;
    risks.push({
      type: 'Financial',
      level: amtRate > 10 ? 'Critical' : 'Medium',
      title: 'Financial Value Validation Failures',
      description: `${amountInvalid} financial entries have non-numeric, negative, or malformed values, which will corrupt revenue calculations and financial reports.`,
      icon: 'trending-down'
    });
  }

  // Low risk fallback (only if no issues found)
  if (risks.length === 0) {
    risks.push({
      type: 'Integrity',
      level: 'Low',
      title: 'Dataset Passes All Integrity Checks',
      description: `No significant issues detected across ${total.toLocaleString()} ${ctx.entityName}. Dataset is structurally sound for ${ctx.primaryImpact}.`,
      icon: 'shield-check'
    });
  }

  // Determine Overall Risk Level
  const riskLevels = risks.map(r => r.level);
  let overallRisk = 'Low';
  if (riskLevels.includes('Critical')) overallRisk = 'Critical';
  else if (riskLevels.includes('High')) overallRisk = 'High';
  else if (riskLevels.includes('Medium')) overallRisk = 'Medium';

  // ─── 3. DYNAMIC RECOMMENDATIONS (sorted by severity) ──────────────────────
  const recommendations = [];

  if (dups > 0) {
    recommendations.push(`Deduplicate ${dups} records — apply primary key deduplication, keeping the most recent entry and removing earlier duplicates.`);
  }
  if (missingCount > 0) {
    recommendations.push(`Resolve ${missingCount} missing required field instances — either backfill from source systems or remove orphan records that cannot be traced.`);
  }
  if (emailInvalid > 0) {
    recommendations.push(`Fix ${emailInvalid} invalid email addresses — revalidate syntax, remove special character corruption, and correct common typos (e.g., missing '@' or TLD).`);
  }
  if (phoneInvalid > 0) {
    recommendations.push(`Reformat ${phoneInvalid} phone numbers to E.164 international standard — apply country code prefixes using the active country rules configuration.`);
  }
  if (dateInvalid > 0) {
    recommendations.push(`Normalize ${dateInvalid} date fields to a single consistent format — the detected predominant format should be used as the target standard.`);
  }
  if (amountInvalid > 0) {
    recommendations.push(`Repair ${amountInvalid} financial value entries — remove currency symbols, correct negative values, and ensure numeric-only format.`);
  }
  if (quantityInvalid > 0) {
    recommendations.push(`Fix ${quantityInvalid} quantity/stock field entries — remove non-numeric characters and correct any negative values.`);
  }
  if (recommendations.length === 0) {
    recommendations.push(`No corrective actions required — dataset is ready for enterprise migration to ${ctx.primaryImpact} systems.`);
  }

  // ─── 4. BUSINESS IMPACTS & ROOT CAUSES ────────────────────────────────────
  const businessImpacts = [];
  const rootCauses = [];

  if (contactInvalid > 0) {
    businessImpacts.push({
      title: 'Outreach & Communication Failures',
      description: `${contactInvalid} invalid contact endpoints directly reduce ${ctx.primaryImpact}. Marketing campaigns, SMS OTPs, and support workflows cannot reach these contacts.`
    });
    rootCauses.push({
      title: 'Weak Input Validation at Data Source',
      description: 'Likely caused by missing regex checks or field masks on registration forms, allowing malformed email/phone data to pass through without correction.'
    });
  }

  if (dups > 0) {
    businessImpacts.push({
      title: 'Data Integrity & Analytics Distortion',
      description: `${dups} duplicate ${ctx.entityName} inflate key metrics, causing inaccurate counts, revenue double-counting, and misleading KPI dashboards in ${ctx.primaryImpact}.`
    });
    rootCauses.push({
      title: 'ETL Pipeline Idempotency Failures',
      description: 'Duplicates commonly arise from retry mechanisms triggering duplicate inserts, missing UNIQUE constraints in the target database, or merging multiple data exports without deduplication.'
    });
  }

  if (missingCount > 0) {
    businessImpacts.push({
      title: 'Referential Integrity Breakdown',
      description: `${missingCount} records with missing required fields create orphan rows that cannot be joined to related tables, breaking ${ctx.primaryImpact} workflows.`
    });
    rootCauses.push({
      title: 'Schema Mismatch Between Source & Target',
      description: 'Occurs when optional fields in source APIs are mapped to NOT NULL columns in target schemas, or when partial data migrations are imported without field completeness checks.'
    });
  }

  if (dateInvalid > 0) {
    businessImpacts.push({
      title: 'Temporal Analytics Failures',
      description: `${dateInvalid} records with invalid dates will be excluded from time-series analysis, cohort calculations, and trend reporting in ${ctx.primaryImpact}.`
    });
    rootCauses.push({
      title: 'Multi-Source Date Format Inconsistency',
      description: 'Common when data is aggregated from multiple regional systems using different date standards (DD/MM/YYYY vs MM/DD/YYYY vs YYYY-MM-DD), without a normalization step.'
    });
  }

  if (amountInvalid > 0) {
    businessImpacts.push({
      title: 'Financial Calculation Corruption',
      description: `${amountInvalid} malformed financial values will cause SUM() aggregations to fail or produce incorrect results, impacting revenue calculations and financial reconciliation.`
    });
    rootCauses.push({
      title: 'Currency Symbol Contamination',
      description: 'Financial fields often retain currency symbols (€, $, ₹) or use comma-based number formatting that breaks numeric parsing in SQL and analytics engines.'
    });
  }

  return {
    executive_summary,
    risk_level: overallRisk,
    risks,
    recommended_actions: recommendations,
    business_impacts: businessImpacts,
    root_causes: rootCauses,
  };
}
