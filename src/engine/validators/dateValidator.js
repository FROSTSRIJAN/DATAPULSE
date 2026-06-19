// Date and time validator

// Supported date format patterns
const DATE_FORMATS = [
  {
    id: 'ISO8601',
    label: 'ISO 8601',
    // Matches 2024-01-15T14:30:00Z or 2024-01-15T14:30:00+05:30
    regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?([Z]|[+-]\d{2}:\d{2})?$/,
    parse: (s) => {
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    },
  },
  {
    id: 'YYYY-MM-DD',
    label: 'YYYY-MM-DD',
    regex: /^\d{4}-\d{2}-\d{2}$/,
    parse: (s) => {
      const [y, m, d] = s.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
      return date;
    },
  },
  {
    id: 'DD/MM/YYYY',
    label: 'DD/MM/YYYY',
    regex: /^\d{2}\/\d{2}\/\d{4}$/,
    parse: (s) => {
      const [d, m, y] = s.split('/').map(Number);
      const date = new Date(y, m - 1, d);
      if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
      return date;
    },
  },
  {
    id: 'MM/DD/YYYY',
    label: 'MM/DD/YYYY',
    regex: /^\d{2}\/\d{2}\/\d{4}$/,
    parse: (s) => {
      const [m, d, y] = s.split('/').map(Number);
      const date = new Date(y, m - 1, d);
      if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
      return date;
    },
  },
  {
    id: 'DD-MM-YYYY',
    label: 'DD-MM-YYYY',
    regex: /^\d{2}-\d{2}-\d{4}$/,
    parse: (s) => {
      const [d, m, y] = s.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
      return date;
    },
  },
  {
    id: 'MM-DD-YYYY',
    label: 'MM-DD-YYYY',
    regex: /^\d{2}-\d{2}-\d{4}$/,
    parse: (s) => {
      const [m, d, y] = s.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
      return date;
    },
  },
  {
    id: 'YYYY/MM/DD',
    label: 'YYYY/MM/DD',
    regex: /^\d{4}\/\d{2}\/\d{2}$/,
    parse: (s) => {
      const [y, m, d] = s.split('/').map(Number);
      const date = new Date(y, m - 1, d);
      if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
      return date;
    },
  },
];

/**
 * Attempt to detect the predominant date format in an array of date strings.
 * Returns format id with highest match count.
 */
export function detectDateFormat(dateStrings) {
  const counts = {};
  for (const fmt of DATE_FORMATS) {
    counts[fmt.id] = 0;
  }

  for (const s of dateStrings) {
    if (!s) continue;
    for (const fmt of DATE_FORMATS) {
      if (fmt.regex.test(s) && fmt.parse(s) !== null) {
        counts[fmt.id]++;
        break;
      }
    }
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || null;
}

/**
 * Validate a single date string.
 * @param {string} value
 * @param {string|null} preferredFormat - if specified, check against this first
 * @returns {{ valid: boolean, format?: string, date?: Date, reason?: string }}
 */
export function validateDate(value, preferredFormat = null) {
  if (!value || String(value).trim() === '') {
    return { valid: false, reason: 'empty_date' };
  }

  const s = String(value).trim();

  // Try preferred format first
  if (preferredFormat) {
    const fmt = DATE_FORMATS.find((f) => f.id === preferredFormat);
    if (fmt && fmt.regex.test(s)) {
      const date = fmt.parse(s);
      if (date) {
        return { valid: true, format: fmt.id, date };
      }
    }
  }

  // Try all formats
  for (const fmt of DATE_FORMATS) {
    if (fmt.regex.test(s)) {
      const date = fmt.parse(s);
      if (date) {
        // Warn if different from preferred
        const formatMismatch = preferredFormat && fmt.id !== preferredFormat;
        return {
          valid: !formatMismatch,
          format: fmt.id,
          date,
          reason: formatMismatch ? 'format_mismatch' : undefined,
          detail: formatMismatch
            ? `Expected ${preferredFormat}, got ${fmt.id}`
            : undefined,
        };
      } else {
        return { valid: false, reason: 'invalid_date_value', detail: 'Date values out of range' };
      }
    }
  }

  return {
    valid: false,
    reason: 'unrecognized_format',
    detail: `Unrecognized date format: "${s}"`,
  };
}

// Time format patterns
const TIME_FORMATS = [
  {
    id: 'HH:mm:ss',
    regex: /^\d{2}:\d{2}:\d{2}$/,
    validate: (s) => {
      const [h, m, sec] = s.split(':').map(Number);
      return h >= 0 && h <= 23 && m >= 0 && m <= 59 && sec >= 0 && sec <= 59;
    },
  },
  {
    id: 'HH:mm',
    regex: /^\d{2}:\d{2}$/,
    validate: (s) => {
      const [h, m] = s.split(':').map(Number);
      return h >= 0 && h <= 23 && m >= 0 && m <= 59;
    },
  },
  {
    id: 'HH:mm:ss.SSS',
    regex: /^\d{2}:\d{2}:\d{2}\.\d+$/,
    validate: (s) => {
      const [h, m, rest] = s.split(':');
      const sec = parseFloat(rest);
      return Number(h) >= 0 && Number(h) <= 23 && Number(m) >= 0 && Number(m) <= 59 && sec >= 0 && sec < 60;
    },
  },
];

/**
 * Validate a time string.
 */
export function validateTime(value) {
  if (!value || String(value).trim() === '') {
    return { valid: false, reason: 'empty_time' };
  }

  const s = String(value).trim();

  for (const fmt of TIME_FORMATS) {
    if (fmt.regex.test(s)) {
      if (fmt.validate(s)) {
        return { valid: true, format: fmt.id };
      }
      return { valid: false, reason: 'invalid_time_value', detail: `Time values out of range in "${s}"` };
    }
  }

  return {
    valid: false,
    reason: 'unrecognized_time_format',
    detail: `Unrecognized time format: "${s}"`,
  };
}
