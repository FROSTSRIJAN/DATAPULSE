// Email validator
const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  '10minutemail.com', 'trashmail.com', 'maildrop.cc',
]);

/**
 * Validate an email address.
 * @param {string} email
 * @returns {{ valid: boolean, reason?: string, detail?: string }}
 */
export function validateEmail(email) {
  if (!email || String(email).trim() === '') {
    return { valid: false, reason: 'empty_email' };
  }

  const trimmed = String(email).trim();

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, reason: 'invalid_format', detail: 'Email format is invalid' };
  }

  const domain = trimmed.split('@')[1]?.toLowerCase();

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: 'disposable_email', detail: `Disposable email domain: ${domain}` };
  }

  // Check for double dots or leading/trailing dots in local part
  const localPart = trimmed.split('@')[0];
  if (localPart.includes('..') || localPart.startsWith('.') || localPart.endsWith('.')) {
    return { valid: false, reason: 'invalid_format', detail: 'Invalid local part of email' };
  }

  return { valid: true };
}
