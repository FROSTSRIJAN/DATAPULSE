import React, { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { DEFAULT_COUNTRY_RULES } from '../constants/countryRules';
import { Trash2, Edit2, Plus, RotateCcw } from 'lucide-react';

export default function CountryRules() {
  const { countryRules, setCountryRules, updateCountryRule, deleteCountryRule } = useAppStore();
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', dialCode: '', digits: '', example: '' });
  const [error, setError] = useState('');

  const handleEdit = (code, rule) => {
    setEditing(code);
    setForm({
      code,
      name: rule.name,
      dialCode: rule.dialCode,
      digits: Array.isArray(rule.digits) ? rule.digits.join(',') : String(rule.digits),
      example: rule.example || '',
    });
    setError('');
  };

  const handleSave = () => {
    if (!form.code || !form.name || !form.digits) {
      setError('Code, Name, and Digits are required.');
      return;
    }
    const digits = form.digits.split(',').map((d) => parseInt(d.trim(), 10)).filter((d) => !isNaN(d));
    if (digits.length === 0) {
      setError('Enter valid digit counts (e.g. 10 or 9,10).');
      return;
    }

    updateCountryRule(form.code.toUpperCase(), {
      name: form.name,
      code: form.code.toUpperCase(),
      dialCode: form.dialCode,
      digits,
      pattern: null,
      patternDescription: `${digits.join(' or ')} digits`,
      example: form.example,
    });
    setEditing(null);
    setAdding(false);
    setForm({ code: '', name: '', dialCode: '', digits: '', example: '' });
    setError('');
  };

  const handleAdd = () => {
    setAdding(true);
    setEditing(null);
    setForm({ code: '', name: '', dialCode: '+', digits: '', example: '' });
    setError('');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all country rules to default?')) {
      setCountryRules({ ...DEFAULT_COUNTRY_RULES });
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f4f4f5', marginBottom: 4 }}>Country Validation Rules</h1>
          <p style={{ color: '#a1a1aa', fontSize: 13 }}>Configure telephone number length constraints and prefixes per country.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RotateCcw size={14} />
            <span>Reset to Defaults</span>
          </button>
          <button className="btn btn-primary" onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={14} />
            <span>Add Country</span>
          </button>
        </div>
      </div>

      {/* Editor card if editing or adding */}
      {(adding || editing) && (
        <div className="card card-glow" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#818cf8' }}>
            {adding ? 'Register New Country Validation Specification' : `Edit Validation Specification for ${editing}`}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: '#a1a1aa', display: 'block', marginBottom: 6 }}>Country Code (ISO 2) *</label>
              <input className="input-base" style={{ background: 'rgba(255,255,255,0.03)' }} value={form.code} placeholder="e.g. DE"
                onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase().slice(0, 2) }))}
                disabled={!!editing} maxLength={2}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#a1a1aa', display: 'block', marginBottom: 6 }}>Country Name *</label>
              <input className="input-base" style={{ background: 'rgba(255,255,255,0.03)' }} value={form.name} placeholder="e.g. Germany"
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#a1a1aa', display: 'block', marginBottom: 6 }}>Dial Code Prefix</label>
              <input className="input-base" style={{ background: 'rgba(255,255,255,0.03)' }} value={form.dialCode} placeholder="+49"
                onChange={(e) => setForm(f => ({ ...f, dialCode: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#a1a1aa', display: 'block', marginBottom: 6 }}>Allowed Digits *</label>
              <input className="input-base" style={{ background: 'rgba(255,255,255,0.03)' }} value={form.digits} placeholder="10 or 11 or 9,10"
                onChange={(e) => setForm(f => ({ ...f, digits: e.target.value }))} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: 12, color: '#a1a1aa', display: 'block', marginBottom: 6 }}>Example Phone Number</label>
              <input className="input-base" style={{ background: 'rgba(255,255,255,0.03)' }} value={form.example} placeholder="1701234567"
                onChange={(e) => setForm(f => ({ ...f, example: e.target.value }))} />
            </div>
          </div>
          {error && <div style={{ color: '#fb7185', fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" onClick={handleSave}>Save Specification</button>
            <button className="btn btn-ghost" onClick={() => { setAdding(false); setEditing(null); setError(''); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Rules list */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(63,63,70,0.3)' }}>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, color: '#a1a1aa' }}>Code</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, color: '#a1a1aa' }}>Country</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, color: '#a1a1aa' }}>Dial Code</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, color: '#a1a1aa' }}>Valid Digits</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, color: '#a1a1aa' }}>Example Number</th>
              <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: 12, color: '#a1a1aa', width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(countryRules).map(([code, rule]) => (
              <tr key={code} style={{ borderBottom: '1px solid rgba(63,63,70,0.2)' }}>
                <td style={{ padding: '14px 20px', fontFamily: 'monospace', color: '#818cf8', fontWeight: 600 }}>{code}</td>
                <td style={{ padding: '14px 20px', color: '#e4e4e7', fontSize: 13 }}>{rule.name}</td>
                <td style={{ padding: '14px 20px', color: '#71717a', fontSize: 13 }}>{rule.dialCode}</td>
                <td style={{ padding: '14px 20px', color: '#e4e4e7', fontSize: 13 }}>
                  {Array.isArray(rule.digits) ? rule.digits.join(' or ') : rule.digits}
                </td>
                <td style={{ padding: '14px 20px', color: '#71717a', fontSize: 13 }}>{rule.example || '—'}</td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => handleEdit(code, rule)} className="btn btn-ghost" style={{ padding: 6 }} title="Edit rule">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => deleteCountryRule(code)} className="btn btn-ghost" style={{ padding: 6, color: '#fb7185' }} title="Delete rule">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
