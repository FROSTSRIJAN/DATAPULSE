// Valid payment methods
export const VALID_PAYMENT_METHODS = [
  'credit card',
  'debit card',
  'upi',
  'net banking',
  'netbanking',
  'bank transfer',
  'cash',
  'cash on delivery',
  'cod',
  'paypal',
  'stripe',
  'wallet',
  'paytm',
  'gpay',
  'google pay',
  'apple pay',
  'amazon pay',
  'razorpay',
  'visa',
  'mastercard',
  'amex',
  'american express',
  'cheque',
  'check',
  'wire transfer',
  'crypto',
  'bitcoin',
  'emi',
  'klarna',
  'afterpay',
  'bnpl',
  'buy now pay later',
];

// Valid transaction statuses
export const VALID_STATUSES = [
  'success',
  'successful',
  'completed',
  'complete',
  'confirmed',
  'paid',
  'failed',
  'failure',
  'declined',
  'rejected',
  'pending',
  'processing',
  'in progress',
  'cancelled',
  'canceled',
  'refunded',
  'reversed',
  'partial',
  'partially paid',
  'on hold',
  'hold',
];

export const normalizePaymentMethod = (value) => {
  if (!value) return '';
  return String(value).toLowerCase().trim();
};

export const isValidPaymentMethod = (value) => {
  if (!value) return false;
  return VALID_PAYMENT_METHODS.includes(normalizePaymentMethod(value));
};
