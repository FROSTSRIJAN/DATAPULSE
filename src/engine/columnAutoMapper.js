/**
 * Universal Column Auto-Mapper — Schema Agnostic
 *
 * Maps source headers to canonical fields using THREE strategies:
 * 1. Exact alias match (normalized)
 * 2. Partial/substring match with scoring
 * 3. Value-pattern inference (email regex, phone regex, date patterns, numeric)
 *
 * Works with ANY dataset — no hardcoded column names.
 */

import { UNIVERSAL_FIELDS, getFieldsForTemplate } from '../constants/fieldMappings';

const normalize = (str) =>
  String(str)
    .toLowerCase()
    .replace(/[\s_\-\.]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .trim();

/**
 * Levenshtein distance for fuzzy matching.
 */
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0)
      );
  return dp[m][n];
}

/**
 * Score how well a header matches a field's aliases.
 * Returns 0–100 score.
 */
function scoreMatch(normalizedHeader, field) {
  const aliases = field.aliases.map(normalize);

  // Exact match → 100
  if (aliases.includes(normalizedHeader)) return 100;

  let bestScore = 0;

  for (const alias of aliases) {
    // Substring containment
    if (normalizedHeader.includes(alias) || alias.includes(normalizedHeader)) {
      const longer = Math.max(normalizedHeader.length, alias.length);
      const shorter = Math.min(normalizedHeader.length, alias.length);
      bestScore = Math.max(bestScore, Math.round((shorter / longer) * 85));
    }

    // Levenshtein distance for close matches
    const dist = levenshtein(normalizedHeader, alias);
    const maxLen = Math.max(normalizedHeader.length, alias.length);
    if (maxLen > 0) {
      const similarity = Math.round((1 - dist / maxLen) * 70);
      bestScore = Math.max(bestScore, similarity);
    }
  }

  return bestScore;
}

/**
 * Auto-map columns for a specific template.
 * @param {string[]} headers - Source column names
 * @param {string} templateId - Dataset template to use ('customer', 'transaction', etc.)
 * @param {Object} columnAnalysis - Value analysis from detectDatasetType (optional)
 * @returns {{ mappings: Object, scores: Object, autoMappedCount: number, totalFields: number }}
 */
export function autoMapColumns(headers, templateId = null, columnAnalysis = null) {
  const fields = templateId ? getFieldsForTemplate(templateId) : Object.values(UNIVERSAL_FIELDS);
  const mappings = {};
  const scores = {};
  const usedHeaders = new Set();

  // Pass 1: Exact alias matches (highest priority)
  for (const field of fields) {
    const aliases = field.aliases.map(normalize);
    for (const header of headers) {
      if (usedHeaders.has(header)) continue;
      if (aliases.includes(normalize(header))) {
        mappings[field.id] = header;
        scores[field.id] = 100;
        usedHeaders.add(header);
        break;
      }
    }
  }

  // Pass 2: Fuzzy matching for unmapped fields
  for (const field of fields) {
    if (mappings[field.id]) continue;
    let bestHeader = null;
    let bestScore = 0;

    for (const header of headers) {
      if (usedHeaders.has(header)) continue;
      const s = scoreMatch(normalize(header), field);
      if (s > bestScore && s >= 55) {
        bestScore = s;
        bestHeader = header;
      }
    }

    if (bestHeader) {
      mappings[field.id] = bestHeader;
      scores[field.id] = bestScore;
      usedHeaders.add(bestHeader);
    }
  }

  // Pass 3: Value-pattern inference for still-unmapped fields
  if (columnAnalysis) {
    for (const field of fields) {
      if (mappings[field.id]) continue;

      for (const header of headers) {
        if (usedHeaders.has(header)) continue;
        const va = columnAnalysis[header];
        if (!va) continue;

        let inferred = false;
        if (field.validatorType === 'email' && va.isEmail) inferred = true;
        if (field.validatorType === 'phone' && va.isPhone) inferred = true;
        if (field.validatorType === 'date' && va.isDate) inferred = true;
        if (field.validatorType === 'amount' && va.isMonetary) inferred = true;

        if (inferred) {
          mappings[field.id] = header;
          scores[field.id] = 65; // Lower confidence for value-inferred
          usedHeaders.add(header);
          break;
        }
      }
    }
  }

  const autoMappedCount = Object.keys(mappings).length;
  const totalFields = fields.length;

  return { mappings, scores, autoMappedCount, totalFields };
}

/**
 * Suggest best matching canonical fields for a given column header.
 * Used for manual mapping dropdowns.
 */
export function suggestMappings(header, templateId = null) {
  const fields = templateId ? getFieldsForTemplate(templateId) : Object.values(UNIVERSAL_FIELDS);
  const normalizedHeader = normalize(header);

  return fields
    .map((field) => ({
      fieldId: field.id,
      label: field.label,
      score: scoreMatch(normalizedHeader, field),
    }))
    .filter((s) => s.score > 20)
    .sort((a, b) => b.score - a.score);
}
