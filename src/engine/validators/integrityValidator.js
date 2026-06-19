// Data integrity validator
import { isValidPaymentMethod, VALID_STATUSES } from '../../constants/paymentMethods';

/**
 * Check if a value is empty/null/undefined.
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
}

/**
 * Validate numeric amount (order_amount, unit_price).
 */
export function validateAmount(value) {
  if (isEmpty(value)) {
    return { valid: false, reason: 'empty_amount' };
  }
  const num = parseFloat(String(value).replace(/[,$€£¥₹]/g, '').trim());
  if (isNaN(num)) {
    return { valid: false, reason: 'non_numeric_amount', detail: `"${value}" is not a number` };
  }
  if (num < 0) {
    return { valid: false, reason: 'negative_amount', detail: `Amount cannot be negative: ${num}` };
  }
  return { valid: true, value: num };
}

/**
 * Validate quantity / count / stock / age.
 * Allows 0 (e.g., out-of-stock), rejects negatives and non-numerics.
 */
export function validateQuantity(value) {
  if (isEmpty(value)) {
    return { valid: false, reason: 'empty_quantity' };
  }
  const str = String(value).replace(/[,\s]/g, '').trim();
  const num = parseFloat(str);
  if (isNaN(num)) {
    return { valid: false, reason: 'non_numeric_quantity', detail: `"${value}" is not a number` };
  }
  if (num < 0) {
    return { valid: false, reason: 'negative_quantity', detail: `Value cannot be negative: ${num}` };
  }
  return { valid: true, value: num };
}

/**
 * Validate payment method.
 */
export function validatePaymentMethod(value) {
  if (isEmpty(value)) {
    return { valid: false, reason: 'empty_payment_method' };
  }
  if (!isValidPaymentMethod(value)) {
    return {
      valid: false,
      reason: 'invalid_payment_method',
      detail: `Unrecognized payment method: "${value}"`,
    };
  }
  return { valid: true };
}

/**
 * Validate transaction status.
 */
export function validateStatus(value) {
  if (isEmpty(value)) {
    return { valid: false, reason: 'empty_status' };
  }
  const normalized = String(value).toLowerCase().trim();
  if (!VALID_STATUSES.includes(normalized)) {
    return {
      valid: false,
      reason: 'invalid_status',
      detail: `Unrecognized status: "${value}"`,
    };
  }
  return { valid: true };
}

/**
 * Detect duplicate values in an array.
 * Returns a Set of values that appear more than once.
 */
export function findDuplicates(values) {
  const seen = new Map();
  const duplicates = new Set();

  for (let i = 0; i < values.length; i++) {
    const val = String(values[i]).trim();
    if (!val) continue;
    if (seen.has(val)) {
      duplicates.add(val);
    } else {
      seen.set(val, i);
    }
  }

  return duplicates;
}

/**
 * Find exact duplicate rows in dataset.
 * Returns Set of row indices that are duplicates.
 */
export function findDuplicateRows(rows) {
  const seen = new Map();
  const duplicateIndices = new Set();

  for (let i = 0; i < rows.length; i++) {
    const key = JSON.stringify(Object.entries(rows[i]).sort());
    if (seen.has(key)) {
      duplicateIndices.add(i);
      duplicateIndices.add(seen.get(key));
    } else {
      seen.set(key, i);
    }
  }

  return duplicateIndices;
}
