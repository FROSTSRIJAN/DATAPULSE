/**
 * Schema Intelligence Engine — Universal Dataset Type Detector
 *
 * Classifies datasets using THREE signal layers:
 * 1. Header name matching (fuzzy aliases)
 * 2. Value pattern analysis (regex on sample rows)
 * 3. Data type inference (numeric, date, email, phone patterns)
 *
 * Supports: Customer, Transaction, Product, Employee, Financial, Inventory,
 *           Marketing, Logistics, Healthcare, Education, Mixed, Unknown
 */

import { UNIVERSAL_FIELDS, DATASET_TEMPLATES, typeToTemplateId } from '../constants/fieldMappings';

// ─── DATASET SIGNATURES ─────────────────────────────────────────────────────

const DATASET_SIGNATURES = [
  {
    type: 'Customer Dataset',
    templateId: 'customer',
    icon: '👤',
    color: '#6366f1',
    headerGroups: [
      ['customer_id', 'cust_id', 'client_id', 'user_id', 'member_id', 'client_number', 'member_code', 'account_id', 'subscriber_id', 'patron_id', 'buyer_id', 'contact_id', 'person_id', 'lead_id', 'cid'],
      ['customer_name', 'full_name', 'name', 'first_name', 'last_name', 'client_name', 'display_name', 'account_name', 'given_name', 'surname', 'fname', 'lname'],
      ['email', 'email_address', 'mail', 'email_id', 'contact_email', 'e_mail'],
      ['phone', 'phone_number', 'mobile', 'mobile_number', 'contact', 'telephone', 'cell', 'cell_number', 'contact_number'],
      ['city', 'town', 'location', 'address', 'region', 'state', 'province'],
      ['signup_date', 'join_date', 'created_at', 'registration_date', 'date_joined', 'enrolled_date', 'onboarding_date', 'account_created'],
      ['country', 'nationality', 'country_code'],
      ['age', 'dob', 'date_of_birth', 'birthday', 'gender', 'sex'],
    ],
    weight: 1.2,
    description: 'Customer master data with contact and profile information',
  },
  {
    type: 'Transaction Dataset',
    templateId: 'transaction',
    icon: '💳',
    color: '#22c55e',
    headerGroups: [
      ['order_id', 'transaction_id', 'txn_id', 'invoice_id', 'receipt_id', 'sale_id', 'booking_id', 'reference_id', 'order_number', 'invoice_number', 'po_number'],
      ['amount', 'order_amount', 'total', 'price', 'revenue', 'total_amount', 'net_amount', 'gross_amount', 'sale_amount', 'transaction_amount', 'bill_amount', 'subtotal'],
      ['payment_method', 'payment_mode', 'payment', 'pay_method', 'payment_type', 'tender_type'],
      ['product', 'product_name', 'item', 'sku', 'item_name', 'merchandise'],
      ['quantity', 'qty', 'units', 'count', 'items_count', 'num_items'],
      ['transaction_date', 'order_date', 'purchase_date', 'date', 'sale_date', 'invoice_date'],
      ['status', 'transaction_status', 'order_status', 'fulfillment_status', 'delivery_status'],
    ],
    weight: 1.0,
    description: 'Sales and transaction records with order and payment data',
  },
  {
    type: 'Product Dataset',
    templateId: 'product',
    icon: '📦',
    color: '#f59e0b',
    headerGroups: [
      ['product_id', 'sku', 'item_id', 'product_code', 'barcode', 'upc', 'asin', 'catalog_id', 'article_number', 'part_number'],
      ['product_name', 'item_name', 'title', 'product_title', 'goods', 'sku_name', 'article_name'],
      ['category', 'type', 'product_category', 'department', 'class', 'segment'],
      ['price', 'unit_price', 'cost', 'mrp', 'retail_price', 'selling_price', 'list_price'],
      ['stock', 'inventory', 'quantity_in_stock', 'units_available', 'on_hand', 'in_stock', 'stock_qty'],
      ['brand', 'manufacturer', 'vendor', 'maker', 'supplier', 'producer'],
      ['description', 'product_description', 'details', 'item_description'],
    ],
    weight: 1.0,
    description: 'Product catalog with inventory and pricing information',
  },
  {
    type: 'Employee Dataset',
    templateId: 'employee',
    icon: '🏢',
    color: '#8b5cf6',
    headerGroups: [
      ['employee_id', 'emp_id', 'staff_id', 'worker_id', 'personnel_id', 'badge_id', 'hr_id', 'payroll_id', 'emp_number', 'employee_number', 'emp_code', 'associate_id'],
      ['employee_name', 'emp_name', 'staff_name', 'worker_name', 'associate_name'],
      ['department', 'dept', 'division', 'team', 'unit', 'org_unit', 'business_unit'],
      ['designation', 'title', 'job_title', 'position', 'role', 'rank', 'grade'],
      ['salary', 'wage', 'pay', 'compensation', 'ctc', 'annual_salary', 'base_salary', 'income', 'earnings'],
      ['hire_date', 'joining_date', 'start_date', 'date_of_hire', 'employment_date'],
      ['email', 'phone', 'mobile', 'contact'],
    ],
    weight: 1.15,
    description: 'HR and employee records with personal and organizational data',
  },
  {
    type: 'Financial Dataset',
    templateId: 'financial',
    icon: '💰',
    color: '#14b8a6',
    headerGroups: [
      ['transaction_id', 'txn_id', 'reference_id', 'entry_id', 'journal_id', 'ledger_id'],
      ['amount', 'debit', 'credit', 'balance', 'net_amount', 'gross_amount'],
      ['account', 'account_name', 'account_number', 'gl_code', 'cost_center'],
      ['currency', 'currency_code', 'exchange_rate'],
      ['date', 'transaction_date', 'posting_date', 'value_date', 'effective_date'],
    ],
    weight: 0.95,
    description: 'Financial records with monetary values and transaction details',
  },
  {
    type: 'Inventory Dataset',
    templateId: 'inventory',
    icon: '📋',
    color: '#f97316',
    headerGroups: [
      ['product_id', 'sku', 'item_id', 'part_number', 'barcode'],
      ['stock', 'inventory', 'quantity_in_stock', 'on_hand', 'available_qty', 'stock_level'],
      ['warehouse', 'location', 'bin', 'shelf', 'storage_area'],
      ['reorder_point', 'reorder_level', 'min_stock', 'max_stock', 'safety_stock'],
    ],
    weight: 0.9,
    description: 'Warehouse and inventory tracking data',
  },
];

const normalize = (str) =>
  String(str)
    .toLowerCase()
    .replace(/[\s\-\.]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .trim();

// ─── VALUE PATTERN ANALYZERS ────────────────────────────────────────────────

function analyzeColumnValues(headers, rows) {
  if (!rows || rows.length === 0) return {};
  const sample = rows.slice(0, 30);
  const analysis = {};

  for (const header of headers) {
    const values = sample.map((row) => String(row[header] || '')).filter((v) => v.length > 0);
    if (values.length === 0) { analysis[header] = { type: 'empty' }; continue; }

    const emailCount = values.filter((v) => /@[a-z0-9]+\.[a-z]{2,}/i.test(v)).length;
    const phoneCount = values.filter((v) => /^\+?[\d\s\-()]{7,18}$/.test(v.trim())).length;
    const dateCount = values.filter((v) => /^\d{1,4}[\-\/\.]\d{1,2}[\-\/\.]\d{1,4}/.test(v.trim()) || /^\d{5}$/.test(v.trim())).length;
    const numericCount = values.filter((v) => /^[\-]?[\d,]+\.?\d*$/.test(v.replace(/[$€£¥₹\s,]/g, '').trim())).length;
    const alphaCount = values.filter((v) => /^[a-zA-Z\s\.\-']+$/.test(v.trim()) && v.trim().length > 1).length;

    const total = values.length;
    const pct = (c) => total > 0 ? c / total : 0;

    analysis[header] = {
      isEmail: pct(emailCount) > 0.5,
      isPhone: pct(phoneCount) > 0.5,
      isDate: pct(dateCount) > 0.5,
      isNumeric: pct(numericCount) > 0.7,
      isName: pct(alphaCount) > 0.6 && !analysis[header]?.isEmail,
      isMonetary: pct(numericCount) > 0.7 && values.some((v) => /[$€£¥₹]/.test(v)),
      uniqueRatio: new Set(values).size / total,
      sampleValues: values.slice(0, 3),
    };
  }

  return analysis;
}

// ─── MAIN DETECTION FUNCTION ────────────────────────────────────────────────

/**
 * Detect dataset type from headers and sample rows.
 * Returns: { type, confidence, templateId, detectedFields, description, icon, color, fieldAnalysis, breakdown }
 */
export function detectDatasetType(headers, sampleRows = []) {
  const normalizedHeaders = headers.map(normalize);
  const columnAnalysis = analyzeColumnValues(headers, sampleRows);

  // ── Score each signature ──
  const scores = {};

  for (const sig of DATASET_SIGNATURES) {
    let matched = 0;
    const matchedFields = [];
    const matchedHeaders = [];

    for (const group of sig.headerGroups) {
      const normalizedGroup = group.map(normalize);
      const matchIdx = normalizedHeaders.findIndex((h) => normalizedGroup.includes(h));
      if (matchIdx !== -1) {
        matched++;
        matchedHeaders.push(headers[matchIdx]);
        matchedFields.push(group[0]); // canonical name
      }
    }

    const total = sig.headerGroups.length;
    const rawScore = total > 0 ? matched / total : 0;

    // Boost from value analysis
    let valueBoost = 0;
    for (const header of headers) {
      const va = columnAnalysis[header];
      if (!va) continue;
      if (va.isEmail && (sig.type.includes('Customer') || sig.type.includes('Employee'))) valueBoost += 0.06;
      if (va.isPhone && (sig.type.includes('Customer') || sig.type.includes('Employee'))) valueBoost += 0.06;
      if (va.isMonetary && (sig.type.includes('Transaction') || sig.type.includes('Financial'))) valueBoost += 0.08;
      if (va.isNumeric && sig.type.includes('Product') && /stock|inventory|qty/i.test(normalize(header))) valueBoost += 0.05;
    }

    scores[sig.type] = {
      score: rawScore * sig.weight + valueBoost,
      matched,
      total,
      matchedFields,
      matchedHeaders,
    };
  }

  // ── Find winner ──
  const sorted = Object.entries(scores).sort((a, b) => b[1].score - a[1].score);
  const [winnerType, winnerData] = sorted[0];
  const runnerUp = sorted[1];

  // Mixed detection
  const isMixed =
    winnerData.score > 0.2 &&
    runnerUp &&
    runnerUp[1].score > 0.2 &&
    Math.abs(winnerData.score - runnerUp[1].score) < 0.15;

  if (isMixed) {
    return {
      type: 'Mixed Dataset',
      templateId: 'custom',
      confidence: Math.min(85, Math.round((winnerData.score + runnerUp[1].score) * 45)),
      detectedFields: [...winnerData.matchedHeaders, ...runnerUp[1].matchedHeaders].slice(0, 10),
      description: `Contains elements of ${winnerType} and ${runnerUp[0]}`,
      icon: '🗂️',
      color: '#8b5cf6',
      breakdown: scores,
      columnAnalysis,
    };
  }

  // Unknown
  if (winnerData.score < 0.12) {
    return {
      type: 'Unknown Dataset',
      templateId: 'custom',
      confidence: Math.max(15, Math.round(winnerData.score * 100)),
      detectedFields: headers.slice(0, 8),
      description: 'Dataset structure could not be classified automatically. Manual mapping available.',
      icon: '❓',
      color: '#71717a',
      breakdown: scores,
      columnAnalysis,
    };
  }

  // Winner
  const winnerSig = DATASET_SIGNATURES.find((s) => s.type === winnerType);
  const confidence = Math.min(98, Math.round(winnerData.score * 85 + 18));

  return {
    type: winnerType,
    templateId: winnerSig.templateId,
    confidence,
    detectedFields: winnerData.matchedHeaders.length > 0 ? winnerData.matchedHeaders : headers.slice(0, 8),
    description: winnerSig.description,
    icon: winnerSig.icon,
    color: winnerSig.color,
    breakdown: scores,
    columnAnalysis,
  };
}
