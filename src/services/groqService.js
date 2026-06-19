/**
 * Groq AI Service — Enhancement Layer Only
 * Receives deterministic metrics and generates stakeholder narratives.
 * Never invents or generates quality scores itself.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

function getApiKey() {
  return import.meta.env.VITE_GROQ_API_KEY || null;
}

function buildCacheKey(errorCategories, datasetType) {
  const sorted = Object.keys(errorCategories).sort();
  return `${datasetType}|${sorted.map((k) => `${k}:${errorCategories[k]}`).join(',')}`;
}

function buildErrorSummary(validationResult, trustScore) {
  const { stats, totalRows, cleanCount } = validationResult;
  const errorCategories = {};

  for (const [type, count] of Object.entries(stats.errorTypeCounts || {})) {
    errorCategories[type] = count;
  }

  return {
    total_rows: totalRows,
    clean_rows: cleanCount,
    affected_rows: totalRows - cleanCount,
    trust_score: trustScore.overall,
    business_readiness: trustScore.businessReadiness,
    validation_confidence: trustScore.validationConfidence,
    error_categories: errorCategories,
    severity_breakdown: stats.errorSeverityCounts,
    risk_level: trustScore.risks?.[0]?.level || 'Low',
    data_readiness: trustScore.businessReadiness >= 90 ? 'Production Ready' : 'Needs Cleanup',
  };
}

async function callGroq(messages, signal) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    signal,
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Generate AI Stakeholder Explanations based on deterministic metrics.
 */
export async function generateAIInsights(
  validationResult,
  trustScore,
  datasetInfo,
  cache = {},
  signal = null
) {
  const summary = buildErrorSummary(validationResult, trustScore);
  const datasetType = datasetInfo?.type || 'Unknown';
  const cacheKey = buildCacheKey(summary.error_categories, datasetType);

  if (cache[cacheKey]) {
    return { ...cache[cacheKey], cached: true };
  }

  const summaryJson = JSON.stringify(summary, null, 2);

  const messages = [
    {
      role: 'system',
      content: `You are an expert data analyst. You translate technical data validation logs into high-level business stakeholder narratives.
You MUST NOT invent, calculate, or alter any numerical scores or risk categories.
You must ONLY write text descriptions using the pre-computed metrics provided.
Respond in valid JSON only. No markdown fences. No extra text.`,
    },
    {
      role: 'user',
      content: `Please analyze this dataset quality report and enhance the explanations and action plan.
Respond in exactly this JSON structure:
{
  "executive_summary": "2-3 sentence overview for a business stakeholder summarizing the findings",
  "business_explanation": "A non-technical explanation of how these quality issues impact business operations and CRM performance",
  "stakeholder_friendly_insights": [
    "Stakeholder insight 1 based on actual error ratios",
    "Stakeholder insight 2 based on actual error ratios",
    "Stakeholder insight 3 based on actual error ratios"
  ],
  "root_cause_narrative": "Detailed narrative describing how these errors likely originated (e.g. form fields, batch imports, API integrations)",
  "action_plan": [
    "Step 1 to fix the dataset",
    "Step 2 to fix the dataset",
    "Step 3 to fix the dataset"
  ]
}

Calculated metrics to respect:
- Trust Score: ${summary.trust_score}/100
- Business Readiness Score: ${summary.business_readiness}/100
- Validation Confidence Score: ${summary.validation_confidence}/100
- Operational Risk Level: ${summary.risk_level}
- Current Status: ${summary.data_readiness}

Validation Report:
${summaryJson}`,
    },
  ];

  const raw = await callGroq(messages, signal);

  let parsed;
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('AI returned invalid JSON response. Please retry.');
  }

  const result = {
    ...parsed,
    summary,
    cacheKey,
    cached: false,
    // Keep computed scores
    trustScore: summary.trust_score,
    businessReadiness: summary.business_readiness,
    validationConfidence: summary.validation_confidence,
    riskLevel: summary.risk_level,
    dataReadiness: summary.data_readiness
  };
  return result;
}
