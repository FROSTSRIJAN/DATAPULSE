// Default phone validation rules per country
export const DEFAULT_COUNTRY_RULES = {
  IN: {
    name: 'India',
    code: 'IN',
    dialCode: '+91',
    digits: [10],
    pattern: /^[6-9]\d{9}$/,
    patternDescription: '10 digits, starts with 6-9',
    example: '9876543210',
  },
  SG: {
    name: 'Singapore',
    code: 'SG',
    dialCode: '+65',
    digits: [8],
    pattern: /^[689]\d{7}$/,
    patternDescription: '8 digits, starts with 6, 8, or 9',
    example: '91234567',
  },
  US: {
    name: 'United States',
    code: 'US',
    dialCode: '+1',
    digits: [10],
    pattern: /^[2-9]\d{2}[2-9]\d{6}$/,
    patternDescription: '10 digits, area code 200-999',
    example: '2125551234',
  },
  AE: {
    name: 'United Arab Emirates',
    code: 'AE',
    dialCode: '+971',
    digits: [9],
    pattern: /^5\d{8}$/,
    patternDescription: '9 digits, starts with 5',
    example: '501234567',
  },
  GB: {
    name: 'United Kingdom',
    code: 'GB',
    dialCode: '+44',
    digits: [10, 11],
    pattern: /^(07\d{9}|0[1-9]\d{8,9})$/,
    patternDescription: '10-11 digits, starts with 07 or 01/02',
    example: '07700900123',
  },
  MY: {
    name: 'Malaysia',
    code: 'MY',
    dialCode: '+60',
    digits: [9, 10],
    pattern: /^(01[0-9]\d{7,8}|0[3-9]\d{7})$/,
    patternDescription: '9-10 digits, starts with 01x or 03-09',
    example: '0123456789',
  },
  AU: {
    name: 'Australia',
    code: 'AU',
    dialCode: '+61',
    digits: [9],
    pattern: /^0[4-5]\d{8}$/,
    patternDescription: '10 digits starting with 04 or 05',
    example: '0412345678',
  },
  CA: {
    name: 'Canada',
    code: 'CA',
    dialCode: '+1',
    digits: [10],
    pattern: /^[2-9]\d{9}$/,
    patternDescription: '10 digits',
    example: '4161234567',
  },
};

export const COUNTRY_NAMES = Object.fromEntries(
  Object.entries(DEFAULT_COUNTRY_RULES).map(([code, rule]) => [code, rule.name])
);
