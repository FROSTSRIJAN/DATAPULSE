/**
 * Main Validation Engine — Universal Schema Support
 * Orchestrates all validators across ALL dataset types dynamically.
 * Works on Customer, Transaction, Product, Employee, Financial, Inventory,
 * and completely Unknown datasets.
 */
import { validatePhone } from './validators/phoneValidator';
import { validateEmail } from './validators/emailValidator';
import { validateDate, validateTime, detectDateFormat } from './validators/dateValidator';
import {
  isEmpty,
  validateAmount,
  validateQuantity,
  validatePaymentMethod,
  validateStatus,
  findDuplicates,
  findDuplicateRows,
} from './validators/integrityValidator';
import { REQUIRED_FIELDS, getRequiredFieldsForTemplate } from '../constants/fieldMappings';

/**
 * Create an error object.
 */
function makeError(rowIndex, field, errorType, description, severity = 'LOW') {
  return {
    id: `${rowIndex}-${field}-${errorType}`,
    row: rowIndex + 1,
    rowIndex,
    field,
    errorType,
    description,
    severity,
  };
}

/**
 * Dynamic Severity Classifier
 * Computes severity based on field importance and actual error frequency.
 */
export function calculateDynamicSeverities(errors, totalRows, columnMappings) {
  if (totalRows === 0) return errors;

  const fieldErrorCounts = {};
  const errorTypeCounts = {};

  for (const err of errors) {
    fieldErrorCounts[err.field] = (fieldErrorCounts[err.field] || 0) + 1;
    errorTypeCounts[err.errorType] = (errorTypeCounts[err.errorType] || 0) + 1;
  }

  return errors.map(err => {
    const { field, errorType } = err;
    const fieldCount = fieldErrorCounts[field] || 0;
    const fieldRate = fieldCount / totalRows;
    const typeCount = errorTypeCounts[errorType] || 0;
    const typeRate = typeCount / totalRows;

    // CRITICAL: Missing primary identifier fields or duplicate primary identifiers
    const isIdentifier = ['order_id', 'customer_id', 'product_id', 'employee_id'].includes(field);
    if (isIdentifier && (errorType === 'missing_required' || errorType.startsWith('duplicate'))) {
      return { ...err, severity: 'CRITICAL' };
    }

    // HIGH: Invalid contact information or high duplicate rate
    const isContact = ['email', 'phone'].includes(field);
    const isDuplicate = errorType.startsWith('duplicate');
    if (isContact && errorType.startsWith('invalid')) {
      return { ...err, severity: 'HIGH' };
    }
    if (isDuplicate && typeRate > 0.10) {
      return { ...err, severity: 'HIGH' };
    }

    // MEDIUM: Date/time/format inconsistencies
    const isDateOrTime = ['order_date', 'signup_date', 'hire_date', 'dob', 'order_time'].includes(field);
    const isFormatting = errorType.startsWith('invalid_phone') ||
                         errorType.startsWith('invalid_email') ||
                         errorType.startsWith('invalid_date') ||
                         errorType.startsWith('invalid_time');
    if (isDateOrTime || isFormatting) {
      return { ...err, severity: 'MEDIUM' };
    }

    // LOW: Minor optional field issues with low frequency
    const isOptional = ['payment_method', 'transaction_status', 'quantity', 'order_amount', 'unit_price', 'salary', 'stock', 'age'].includes(field);
    if (isOptional && fieldRate < 0.05) {
      return { ...err, severity: 'LOW' };
    }

    // Frequency-based fallback
    if (fieldRate > 0.20) return { ...err, severity: 'HIGH' };
    if (fieldRate > 0.05) return { ...err, severity: 'MEDIUM' };
    return { ...err, severity: 'LOW' };
  });
}

/**
 * Run full validation on parsed dataset.
 * Dynamically validates ALL mapped fields based on their validatorType.
 */
export function runValidation(rows, columnMappings, options = {}) {
  const { countryRules = {}, defaultCountry = null, templateId = null } = options;
  let rawErrors = [];

  // Dynamic required fields based on template
  const dynamicRequired = templateId
    ? getRequiredFieldsForTemplate(templateId)
    : REQUIRED_FIELDS;

  // Helper to get value from a row for a canonical field
  const getValue = (row, fieldId) => {
    const col = columnMappings[fieldId];
    if (!col) return undefined;
    return row[col];
  };

  // --- Pre-pass: detect predominant date format across ALL date fields ---
  let preferredDateFormat = null;
  // Check all possible date fields in order of preference
  const allDateFieldIds = ['order_date', 'signup_date', 'hire_date', 'dob'];
  let activeDateFieldId = null;
  for (const dfId of allDateFieldIds) {
    if (columnMappings[dfId]) { activeDateFieldId = dfId; break; }
  }
  if (activeDateFieldId) {
    const dateValues = rows.map((r) => getValue(r, activeDateFieldId)).filter(Boolean);
    preferredDateFormat = detectDateFormat(dateValues);
  }

  // --- Pre-pass: detect duplicate IDs ---
  // Check all identifier fields
  const idFields = ['order_id', 'customer_id', 'product_id', 'employee_id'];
  const idFieldId = idFields.find(f => columnMappings[f]) || null;
  const idValues = idFieldId ? rows.map((r) => getValue(r, idFieldId)) : [];
  const duplicateIds = findDuplicates(idValues);

  // --- Pre-pass: detect duplicate rows ---
  const duplicateRowIndices = findDuplicateRows(rows);

  // --- Per-row validation ---
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // 1. Required fields (template-aware)
    for (const fieldId of dynamicRequired) {
      if (!columnMappings[fieldId]) continue;
      const value = getValue(row, fieldId);
      if (isEmpty(value)) {
        rawErrors.push(
          makeError(i, fieldId, 'missing_required', `Required field "${fieldId.replace(/_/g, ' ')}" is empty`)
        );
      }
    }

    // 2. Duplicate ID detection
    if (idFieldId) {
      const idVal = getValue(row, idFieldId);
      if (idVal && duplicateIds.has(String(idVal).trim())) {
        rawErrors.push(
          makeError(i, idFieldId, 'duplicate_order_id', `Duplicate ID: "${idVal}"`)
        );
      }
    }

    // 3. Duplicate row
    if (duplicateRowIndices.has(i)) {
      rawErrors.push(
        makeError(i, 'row', 'duplicate_row', 'Exact duplicate of another row')
      );
    }

    // 4. Phone validation
    const phone = getValue(row, 'phone');
    if (phone !== undefined && !isEmpty(phone)) {
      const country = getValue(row, 'country') || defaultCountry;
      const phoneResult = validatePhone(phone, country, countryRules);
      if (!phoneResult.valid) {
        rawErrors.push(
          makeError(
            i,
            'phone',
            `invalid_phone_${phoneResult.reason}`,
            phoneResult.detail || `Invalid phone number: "${phone}"`
          )
        );
      }
    }

    // 5. Email validation
    const email = getValue(row, 'email');
    if (email !== undefined && !isEmpty(email)) {
      const emailResult = validateEmail(email);
      if (!emailResult.valid) {
        rawErrors.push(
          makeError(
            i,
            'email',
            `invalid_email_${emailResult.reason}`,
            emailResult.detail || `Invalid email: "${email}"`
          )
        );
      }
    }

    // 6. Date validations — ALL mapped date fields
    const dateFieldsToValidate = [
      { fieldId: 'order_date', label: 'order_date' },
      { fieldId: 'signup_date', label: 'signup_date' },
      { fieldId: 'hire_date', label: 'hire_date' },
      { fieldId: 'dob', label: 'dob' },
    ];
    for (const { fieldId } of dateFieldsToValidate) {
      const dateVal = getValue(row, fieldId);
      if (dateVal !== undefined && !isEmpty(dateVal)) {
        const dateResult = validateDate(dateVal, preferredDateFormat);
        if (!dateResult.valid) {
          rawErrors.push(
            makeError(
              i,
              fieldId,
              `invalid_date_${dateResult.reason}`,
              dateResult.detail || `Invalid date in ${fieldId}: "${dateVal}"`
            )
          );
        }
      }
    }

    // 7. Time validation
    const orderTime = getValue(row, 'order_time');
    if (orderTime !== undefined && !isEmpty(orderTime)) {
      const timeResult = validateTime(orderTime);
      if (!timeResult.valid) {
        rawErrors.push(
          makeError(
            i,
            'order_time',
            `invalid_time_${timeResult.reason}`,
            timeResult.detail || `Invalid time: "${orderTime}"`
          )
        );
      }
    }

    // 8. Amount validations — all financial fields
    const amountFields = [
      { fieldId: 'order_amount', label: 'order amount' },
      { fieldId: 'unit_price', label: 'unit price' },
      { fieldId: 'salary', label: 'salary' },
    ];
    for (const { fieldId, label } of amountFields) {
      const val = getValue(row, fieldId);
      if (val !== undefined && !isEmpty(val)) {
        const amountResult = validateAmount(val);
        if (!amountResult.valid) {
          rawErrors.push(
            makeError(
              i,
              fieldId,
              `invalid_amount_${amountResult.reason}`,
              amountResult.detail || `Invalid ${label}: "${val}"`
            )
          );
        }
      }
    }

    // 9. Quantity validations — quantity and stock fields
    const quantityFields = [
      { fieldId: 'quantity', label: 'quantity' },
      { fieldId: 'stock', label: 'stock level' },
      { fieldId: 'age', label: 'age' },
    ];
    for (const { fieldId, label } of quantityFields) {
      const val = getValue(row, fieldId);
      if (val !== undefined && !isEmpty(val)) {
        const qtyResult = validateQuantity(val);
        if (!qtyResult.valid) {
          rawErrors.push(
            makeError(
              i,
              fieldId,
              `invalid_quantity_${qtyResult.reason}`,
              qtyResult.detail || `Invalid ${label}: "${val}"`
            )
          );
        }
      }
    }

    // 10. Payment method validation
    const paymentMethod = getValue(row, 'payment_method');
    if (paymentMethod !== undefined && !isEmpty(paymentMethod)) {
      const pmResult = validatePaymentMethod(paymentMethod);
      if (!pmResult.valid) {
        rawErrors.push(
          makeError(
            i,
            'payment_method',
            `invalid_payment_${pmResult.reason}`,
            pmResult.detail || `Invalid payment method: "${paymentMethod}"`
          )
        );
      }
    }

    // 11. Status validation
    const status = getValue(row, 'transaction_status');
    if (status !== undefined && !isEmpty(status)) {
      const statusResult = validateStatus(status);
      if (!statusResult.valid) {
        rawErrors.push(
          makeError(
            i,
            'transaction_status',
            `invalid_status_${statusResult.reason}`,
            statusResult.detail || `Invalid status: "${status}"`
          )
        );
      }
    }
  }

  // --- Run Dynamic Severity Engine ---
  const errors = calculateDynamicSeverities(rawErrors, rows.length, columnMappings);

  // --- Build error index by row ---
  const errorsByRow = new Map();
  for (const err of errors) {
    if (!errorsByRow.has(err.rowIndex)) errorsByRow.set(err.rowIndex, []);
    errorsByRow.get(err.rowIndex).push(err);
  }

  // --- Identify clean rows ---
  const cleanRows = rows.filter((_, i) => !errorsByRow.has(i));
  const invalidRows = rows.filter((_, i) => errorsByRow.has(i));

  // --- Build stats ---
  const stats = buildStats(rows, errors, columnMappings, cleanRows.length);

  return {
    errors,
    cleanRows,
    invalidRows,
    errorsByRow,
    stats,
    preferredDateFormat,
    duplicateOrderIds: [...duplicateIds],
    totalRows: rows.length,
    cleanCount: cleanRows.length,
    errorCount: errors.length,
  };
}

function buildStats(rows, errors, columnMappings, cleanCount) {
  const total = rows.length;

  const errorTypeCounts = {};
  const errorFieldCounts = {};
  const errorSeverityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };

  for (const err of errors) {
    const cat = normalizeErrorCategory(err.errorType);
    errorTypeCounts[cat] = (errorTypeCounts[cat] || 0) + 1;
    errorFieldCounts[err.field] = (errorFieldCounts[err.field] || 0) + 1;
    errorSeverityCounts[err.severity] = (errorSeverityCounts[err.severity] || 0) + 1;
  }

  const rowsWithPhoneError = new Set(errors.filter(e => e.field === 'phone').map(e => e.rowIndex)).size;
  // Aggregate all date fields
  const rowsWithDateError = new Set(
    errors.filter(e => ['order_date', 'signup_date', 'hire_date', 'dob'].includes(e.field)).map(e => e.rowIndex)
  ).size;
  const rowsWithEmailError = new Set(errors.filter(e => e.field === 'email').map(e => e.rowIndex)).size;
  const rowsWithPaymentError = new Set(errors.filter(e => e.field === 'payment_method').map(e => e.rowIndex)).size;
  const rowsWithDuplicate = new Set(errors.filter(e => e.errorType.startsWith('duplicate')).map(e => e.rowIndex)).size;
  const rowsWithAmountError = new Set(
    errors.filter(e => ['order_amount', 'unit_price', 'salary'].includes(e.field)).map(e => e.rowIndex)
  ).size;
  const rowsWithQuantityError = new Set(
    errors.filter(e => ['quantity', 'stock', 'age'].includes(e.field)).map(e => e.rowIndex)
  ).size;

  // Resolve which date field is active (for stats display)
  const activeDateField = columnMappings.order_date ? 'order_date'
    : columnMappings.signup_date ? 'signup_date'
    : columnMappings.hire_date ? 'hire_date'
    : columnMappings.dob ? 'dob'
    : null;

  return {
    total,
    cleanCount,
    errorCount: errors.length,
    affectedRows: total - cleanCount,
    affectedRowsPct: total > 0 ? Math.round(((total - cleanCount) / total) * 100) : 0,
    errorTypeCounts,
    errorFieldCounts,
    errorSeverityCounts,
    dimensions: {
      phone: {
        total: columnMappings.phone ? total : 0,
        invalid: rowsWithPhoneError,
        valid: columnMappings.phone ? total - rowsWithPhoneError : 0,
      },
      date: {
        total: activeDateField ? total : 0,
        invalid: rowsWithDateError,
        valid: activeDateField ? total - rowsWithDateError : 0,
      },
      email: {
        total: columnMappings.email ? total : 0,
        invalid: rowsWithEmailError,
        valid: columnMappings.email ? total - rowsWithEmailError : 0,
      },
      payment: {
        total: columnMappings.payment_method ? total : 0,
        invalid: rowsWithPaymentError,
        valid: columnMappings.payment_method ? total - rowsWithPaymentError : 0,
      },
      amount: {
        total: (columnMappings.order_amount || columnMappings.unit_price || columnMappings.salary) ? total : 0,
        invalid: rowsWithAmountError,
        valid: (columnMappings.order_amount || columnMappings.unit_price || columnMappings.salary) ? total - rowsWithAmountError : 0,
      },
      quantity: {
        total: (columnMappings.quantity || columnMappings.stock || columnMappings.age) ? total : 0,
        invalid: rowsWithQuantityError,
        valid: (columnMappings.quantity || columnMappings.stock || columnMappings.age) ? total - rowsWithQuantityError : 0,
      },
      integrity: {
        total,
        duplicates: rowsWithDuplicate,
        clean: cleanCount,
      },
    },
  };
}

function normalizeErrorCategory(errorType) {
  if (errorType.includes('phone')) return 'invalid_phone';
  if (errorType.includes('email')) return 'invalid_email';
  if (errorType.includes('date')) return 'invalid_date';
  if (errorType.includes('time')) return 'invalid_time';
  if (errorType.includes('duplicate_order_id')) return 'duplicate_order_id';
  if (errorType.includes('duplicate_row')) return 'duplicate_row';
  if (errorType.includes('amount') || errorType.includes('price')) return 'invalid_amount';
  if (errorType.includes('quantity')) return 'invalid_quantity';
  if (errorType.includes('payment')) return 'invalid_payment_method';
  if (errorType.includes('status')) return 'invalid_status';
  if (errorType.includes('missing')) return 'missing_required';
  return errorType;
}
