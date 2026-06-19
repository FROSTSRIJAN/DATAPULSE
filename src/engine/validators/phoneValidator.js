// Phone number validator
import { DEFAULT_COUNTRY_RULES } from '../../constants/countryRules';

const DIGIT_ONLY_RE = /\D/g;

/**
 * Strip country dial code and formatting from a phone number.
 * Returns the digit-only local number.
 */
function extractDigits(phone) {
  if (!phone) return '';
  let str = String(phone).trim();
  // Remove common separators
  str = str.replace(/[\s\-\(\)\.]/g, '');
  // Remove leading + and dial code (up to 3 digits)
  if (str.startsWith('+')) {
    str = str.substring(1);
    // Try to strip known dial codes
    for (const rule of Object.values(DEFAULT_COUNTRY_RULES)) {
      const dc = rule.dialCode.replace('+', '');
      if (str.startsWith(dc)) {
        str = str.substring(dc.length);
        break;
      }
    }
  } else if (str.startsWith('00')) {
    str = str.substring(2);
    for (const rule of Object.values(DEFAULT_COUNTRY_RULES)) {
      const dc = rule.dialCode.replace('+', '');
      if (str.startsWith(dc)) {
        str = str.substring(dc.length);
        break;
      }
    }
  }
  return str.replace(DIGIT_ONLY_RE, '');
}

/**
 * Validate a phone number against a specific country rule.
 * @param {string} phone
 * @param {string} countryCode - e.g. 'IN', 'US'
 * @param {Object} customRules - override DEFAULT_COUNTRY_RULES
 */
export function validatePhone(phone, countryCode, customRules = {}) {
  const rules = { ...DEFAULT_COUNTRY_RULES, ...customRules };

  if (!phone || String(phone).trim() === '') {
    return { valid: false, reason: 'empty_phone' };
  }

  const digits = extractDigits(phone);

  if (digits.length === 0) {
    return { valid: false, reason: 'no_digits' };
  }

  // If country code is provided and we have a rule for it
  if (countryCode && rules[countryCode.toUpperCase()]) {
    const rule = rules[countryCode.toUpperCase()];
    const allowedDigits = Array.isArray(rule.digits) ? rule.digits : [rule.digits];

    if (!allowedDigits.includes(digits.length)) {
      return {
        valid: false,
        reason: 'wrong_length',
        detail: `Expected ${allowedDigits.join(' or ')} digits for ${rule.name}, got ${digits.length}`,
      };
    }

    if (rule.pattern && !rule.pattern.test(digits)) {
      return {
        valid: false,
        reason: 'invalid_format',
        detail: `Does not match ${rule.name} pattern (${rule.patternDescription})`,
      };
    }

    return { valid: true };
  }

  // Generic check: must be 7-15 digits (ITU-T E.164)
  if (digits.length < 7 || digits.length > 15) {
    return {
      valid: false,
      reason: 'invalid_length',
      detail: `Phone must be 7-15 digits, got ${digits.length}`,
    };
  }

  return { valid: true };
}
