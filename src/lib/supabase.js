import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// ─── Auth helpers ──────────────────────────────────────────────────────────

export async function signUp({ email, password, fullName }) {
  if (!supabase) return mockSignUp({ email, fullName });
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  if (!supabase) return mockSignIn({ email });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  if (!supabase) return mockSignIn({ email: 'demo@xeno.ai' });
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/dashboard` },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) { localStorage.removeItem('xeno_demo_user'); return; }
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase) {
    const u = localStorage.getItem('xeno_demo_user');
    return u ? { user: JSON.parse(u) } : null;
  }
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ─── Analysis helpers ──────────────────────────────────────────────────────

export async function saveAnalysis(analysis, report) {
  if (!supabase) return saveAnalysisLocal({ ...analysis, report });
  
  // Insert main analysis row
  const { data, error } = await supabase
    .from('analyses')
    .insert(analysis)
    .select()
    .single();
  if (error) throw error;

  // Insert linked report row if provided
  if (report) {
    const { error: reportError } = await supabase
      .from('analysis_reports')
      .insert({
        ...report,
        analysis_id: data.id
      });
    if (reportError) {
      console.error('Error inserting linked report:', reportError);
    }
  }

  return data;
}

export async function getAnalyses(userId) {
  if (!supabase) return getAnalysesLocal();
  const { data, error } = await supabase
    .from('analyses')
    .select('*, analysis_reports(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function deleteAnalysis(id) {
  if (!supabase) return deleteAnalysisLocal(id);
  const { error } = await supabase.from('analyses').delete().eq('id', id);
  if (error) throw error;
}

export async function getCountryRules(userId) {
  if (!supabase) return null;
  const { data } = await supabase
    .from('country_rules')
    .select('*')
    .eq('user_id', userId);
  return data || [];
}

// ─── LocalStorage fallbacks (demo mode) ───────────────────────────────────

function mockSignUp({ email, fullName }) {
  const user = { id: 'demo-' + Date.now(), email, full_name: fullName, created_at: new Date().toISOString() };
  localStorage.setItem('xeno_demo_user', JSON.stringify(user));
  return { user };
}

function mockSignIn({ email }) {
  const user = { id: 'demo-user', email, full_name: email.split('@')[0], created_at: new Date().toISOString() };
  localStorage.setItem('xeno_demo_user', JSON.stringify(user));
  return { user };
}

function saveAnalysisLocal(analysis) {
  const analyses = getAnalysesLocal();
  const { report, ...mainAnalysis } = analysis;
  const analysisId = 'local-' + Date.now();
  const reportRecord = report
    ? { ...report, id: 'local-rep-' + Date.now(), analysis_id: analysisId, created_at: new Date().toISOString() }
    : null;
  const record = {
    ...mainAnalysis,
    id: analysisId,
    created_at: new Date().toISOString(),
    analysis_reports: reportRecord ? [reportRecord] : []
  };
  analyses.unshift(record);
  localStorage.setItem('xeno_analyses', JSON.stringify(analyses.slice(0, 50)));
  return record;
}

function getAnalysesLocal() {
  try {
    const data = localStorage.getItem('xeno_analyses');
    if (!data) {
      const seeded = seedDemoAnalyses();
      localStorage.setItem('xeno_analyses', JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(data);
  }
  catch { return []; }
}

function seedDemoAnalyses() {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();

  const mockCols = {
    customer_id: 'ID',
    full_name: 'Name',
    email: 'Email Addr',
    phone: 'Tel',
    country: 'Region'
  };

  return [
    {
      id: 'local-run-3',
      user_id: 'demo-user',
      dataset_name: 'customer_final_v3.csv',
      dataset_type: 'customer',
      detection_confidence: 98,
      trust_score: 98,
      crm_readiness: 97,
      marketing_readiness: 96,
      analytics_readiness: 98,
      operations_readiness: 97,
      total_rows: 475,
      clean_rows: 472,
      total_issues: 3,
      created_at: oneDayAgo,
      column_mappings: mockCols,
      error_breakdown: {
        errorSeverityCounts: { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 0 },
        errorTypeCounts: { invalid_email: 3 },
        validationConfidence: 96,
        columnQuality: {
          customer_id: { fieldName: 'customer_id', sourceColumn: 'ID', score: 100, completeness: 100, uniqueness: 100, validity: 100, consistency: 100 },
          full_name: { fieldName: 'full_name', sourceColumn: 'Name', score: 100, completeness: 100, uniqueness: 100, validity: 100, consistency: 100 },
          email: { fieldName: 'email', sourceColumn: 'Email Addr', score: 92, completeness: 100, uniqueness: 100, validity: 92, consistency: 92 },
          phone: { fieldName: 'phone', sourceColumn: 'Tel', score: 100, completeness: 100, uniqueness: 100, validity: 100, consistency: 100 }
        },
        positiveFactors: ['High completeness (100% fields populated)', 'Strong uniqueness (100% unique records)', 'Excellent validity (99% values pass validation)'],
        negativeFactors: [],
        penalties: [],
        riskLevel: 'Low'
      },
      analysis_reports: [
        {
          id: 'rep-3',
          analysis_id: 'local-run-3',
          executive_summary: 'Analyzed customer_final_v3.csv containing 475 rows. The dataset is in pristine condition with 99.4% of records fully clean. Trust Score is rated as Excellent (98/100) and Business Readiness is 97/100.',
          risk_level: 'Low',
          data_readiness: 'Production Ready',
          key_findings: ['High completeness (100%)', 'Strong uniqueness (100%)'],
          recommendations: ['Import dataset into Production CRM systems.', 'Archive raw file.']
        }
      ]
    },
    {
      id: 'local-run-2',
      user_id: 'demo-user',
      dataset_name: 'customer_cleaned_v2.csv',
      dataset_type: 'customer',
      detection_confidence: 98,
      trust_score: 87,
      crm_readiness: 84,
      marketing_readiness: 91,
      analytics_readiness: 87,
      operations_readiness: 84,
      total_rows: 480,
      clean_rows: 440,
      total_issues: 45,
      created_at: twoDaysAgo,
      column_mappings: mockCols,
      error_breakdown: {
        errorSeverityCounts: { CRITICAL: 5, HIGH: 20, MEDIUM: 15, LOW: 5 },
        errorTypeCounts: { missing_required: 5, invalid_phone: 20, invalid_email: 10, duplicate_order_id: 10 },
        validationConfidence: 91,
        columnQuality: {
          customer_id: { fieldName: 'customer_id', sourceColumn: 'ID', score: 95, completeness: 99, uniqueness: 98, validity: 98, consistency: 98 },
          full_name: { fieldName: 'full_name', sourceColumn: 'Name', score: 100, completeness: 100, uniqueness: 100, validity: 100, consistency: 100 },
          email: { fieldName: 'email', sourceColumn: 'Email Addr', score: 86, completeness: 100, uniqueness: 100, validity: 90, consistency: 90 },
          phone: { fieldName: 'phone', sourceColumn: 'Tel', score: 78, completeness: 100, uniqueness: 100, validity: 82, consistency: 82 }
        },
        positiveFactors: ['High completeness (98% fields populated)', 'Strong uniqueness (97% unique records)'],
        negativeFactors: ['Phone formatting errors (18% invalid phone formats)'],
        penalties: [{ name: 'Duplicates', penalty: -3 }, { name: 'Consistency Failures', penalty: -6 }],
        riskLevel: 'Medium'
      },
      analysis_reports: [
        {
          id: 'rep-2',
          analysis_id: 'local-run-2',
          executive_summary: 'Analyzed customer_cleaned_v2.csv containing 480 rows. Overall data trust is rated as Good (87/100). Contact info format errors are present in 20 phone rows.',
          risk_level: 'Medium',
          data_readiness: 'Needs Minor Cleanup',
          key_findings: ['High completeness (98%)', 'Strong uniqueness (97%)'],
          recommendations: ['Correct phone formatting failures.', 'Investigate 5 missing IDs.']
        }
      ]
    },
    {
      id: 'local-run-1',
      user_id: 'demo-user',
      dataset_name: 'customer_dirty_v1.csv',
      dataset_type: 'customer',
      detection_confidence: 98,
      trust_score: 64,
      crm_readiness: 58,
      marketing_readiness: 82,
      analytics_readiness: 64,
      operations_readiness: 58,
      total_rows: 500,
      clean_rows: 320,
      total_issues: 240,
      created_at: threeDaysAgo,
      column_mappings: mockCols,
      error_breakdown: {
        errorSeverityCounts: { CRITICAL: 40, HIGH: 120, MEDIUM: 60, LOW: 20 },
        errorTypeCounts: { missing_required: 40, invalid_phone: 80, invalid_email: 40, duplicate_order_id: 80 },
        validationConfidence: 82,
        columnQuality: {
          customer_id: { fieldName: 'customer_id', sourceColumn: 'ID', score: 68, completeness: 92, uniqueness: 84, validity: 84, consistency: 84 },
          full_name: { fieldName: 'full_name', sourceColumn: 'Name', score: 100, completeness: 100, uniqueness: 100, validity: 100, consistency: 100 },
          email: { fieldName: 'email', sourceColumn: 'Email Addr', score: 72, completeness: 100, uniqueness: 100, validity: 80, consistency: 80 },
          phone: { fieldName: 'phone', sourceColumn: 'Tel', score: 54, completeness: 100, uniqueness: 100, validity: 60, consistency: 60 }
        },
        positiveFactors: ['High completeness (92% fields populated)'],
        negativeFactors: ['Duplicate identifiers (16% duplicate rate)', 'Phone formatting errors (40% invalid)'],
        penalties: [{ name: 'Duplicates', penalty: -16 }, { name: 'Consistency Failures', penalty: -14 }, { name: 'Missing Values', penalty: -6 }],
        riskLevel: 'High'
      },
      analysis_reports: [
        {
          id: 'rep-1',
          analysis_id: 'local-run-1',
          executive_summary: 'Analyzed customer_dirty_v1.csv containing 500 rows. Overall trust is rated as Fair (64/100). High duplicate counts (80 rows) and phone formatting errors (80 rows) skew CRM reporting.',
          risk_level: 'High',
          data_readiness: 'Needs Significant Cleanup',
          key_findings: ['High completeness (92%)'],
          recommendations: ['Format phone numbers using international dial codes.', 'Deduplicate records by primary ID.', 'Scrub invalid email syntax.']
        }
      ]
    }
  ];
}

function deleteAnalysisLocal(id) {
  const analyses = getAnalysesLocal().filter(a => a.id !== id);
  localStorage.setItem('xeno_analyses', JSON.stringify(analyses));
}
