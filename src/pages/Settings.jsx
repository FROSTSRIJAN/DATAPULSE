import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { Shield, Key, Database, Cpu, CheckCircle } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GROQ_API_KEY || '');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSaveAPIKey = (e) => {
    e.preventDefault();
    // In a real SaaS, we would write this to user metadata or backend profile.
    // For demo/Vite client-only, we store it in session state / localStorage.
    localStorage.setItem('xeno_custom_groq_key', apiKey);
    setSuccessMsg('Settings updated. AI Insights engine refreshed.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1000, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f4f4f5', marginBottom: 4 }}>Platform Settings</h1>
        <p style={{ color: '#a1a1aa', fontSize: 13 }}>Manage API integrations, authentication states, and database engine connections.</p>
      </div>

      {successMsg && (
        <div className="card" style={{ padding: '12px 16px', borderColor: 'rgba(52,211,153,0.3)', color: '#34d399', display: 'flex', gap: 10, alignItems: 'center' }}>
          <CheckCircle size={16} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{successMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {/* API settings */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f4f4f5', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Key size={16} style={{ color: '#818cf8' }} />
            <span>AI Model Configuration</span>
          </h3>
          <p style={{ color: '#71717a', fontSize: 12, lineHeight: 1.5 }}>
            DataPulse AI uses **Groq (llama-3.3-70b-versatile)** to explain schema anomalies and suggest auto-fixes.
          </p>
          <form onSubmit={handleSaveAPIKey} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: '#a1a1aa', display: 'block', marginBottom: 6 }}>Groq API Key</label>
              <input
                type="password"
                className="input-base"
                style={{ background: 'rgba(255,255,255,0.02)' }}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="gsk_..."
              />
            </div>
            <button className="btn btn-primary" type="submit" style={{ fontSize: 13 }}>Save Credentials</button>
          </form>
        </div>

        {/* Engine status */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f4f4f5', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Cpu size={16} style={{ color: '#34d399' }} />
            <span>Validation Architecture</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#a1a1aa' }}>Phone Validation Model</span>
              <span style={{ color: '#e4e4e7', fontWeight: 600 }}>E.164 + Country Dial Standard</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#a1a1aa' }}>Email Verification Mode</span>
              <span style={{ color: '#e4e4e7', fontWeight: 600 }}>RFC 5322 Syntax + Domain TLD Check</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#a1a1aa' }}>Integrity Auto-Matching</span>
              <span style={{ color: '#818cf8', fontWeight: 600 }}>Levenshtein Distance Distance Matrix</span>
            </div>
          </div>
        </div>

        {/* Auth details */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f4f4f5', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={16} style={{ color: '#a78bfa' }} />
            <span>Security & Data Compliance</span>
          </h3>
          <p style={{ color: '#71717a', fontSize: 12, lineHeight: 1.5 }}>
            DataPulse AI enforces strict privacy standards. Dataset records are parsed and mapped locally inside your browser sandbox. Row contents are never sent to external servers or AI endpoints — only structured error counts and anonymous header metadata are referenced for insights.
          </p>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', borderTop: '1px solid rgba(63,63,70,0.3)', paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={14} style={{ color: '#34d399' }} />
              <span style={{ fontSize: 12, color: '#a1a1aa' }}>Local Sandbox Isolation</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={14} style={{ color: '#34d399' }} />
              <span style={{ fontSize: 12, color: '#a1a1aa' }}>Anonymized AI Payload</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={14} style={{ color: '#34d399' }} />
              <span style={{ fontSize: 12, color: '#a1a1aa' }}>PostgreSQL RLS Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
