import React, { useState } from 'react';
import useAppStore from '../../store/useAppStore';
import { DEFAULT_COUNTRY_RULES } from '../../constants/countryRules';

export default function CountryRulesManager({ onClose }) {
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
      pattern: null, // simplified — no custom regex in UI
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
    setCountryRules({ ...DEFAULT_COUNTRY_RULES });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 640, maxHeight: '85vh',
        background: 'var(--color-surface-900)',
        border: '1px solid rgba(63,63,70,0.8)',
        borderRadius: 16, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {/* Modal header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid rgba(39,39,42,0.6)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f4f4f5' }}>Country Phone Rules</h2>
            <p style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>
              {Object.keys(countryRules).length} countries configured
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" onClick={handleReset} style={{ fontSize: 12 }}>Reset to Defaults</button>
            <button className="btn-ghost" onClick={handleAdd} style={{ fontSize: 12, color: '#818cf8' }}>+ Add Country</button>
            <button className="btn-ghost" onClick={onClose} style={{ fontSize: 18, padding: '4px 8px' }}>×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {/* Add form */}
          {(adding || editing) && (
            <div style={{
              marginBottom: 16, padding: 16, borderRadius: 10,
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#818cf8', marginBottom: 12 }}>
                {adding ? 'Add New Country' : `Edit ${editing}`}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#71717a', display: 'block', marginBottom: 4 }}>Country Code *</label>
                  <input className="input-base" style={{ fontSize: 13 }} value={form.code} placeholder="e.g. JP"
                    onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase().slice(0, 2) }))}
                    disabled={!!editing} maxLength={2}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#71717a', display: 'block', marginBottom: 4 }}>Country Name *</label>
                  <input className="input-base" style={{ fontSize: 13 }} value={form.name} placeholder="e.g. Japan"
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#71717a', display: 'block', marginBottom: 4 }}>Dial Code</label>
                  <input className="input-base" style={{ fontSize: 13 }} value={form.dialCode} placeholder="+81"
                    onChange={(e) => setForm(f => ({ ...f, dialCode: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#71717a', display: 'block', marginBottom: 4 }}>Digit Count(s) *</label>
                  <input className="input-base" style={{ fontSize: 13 }} value={form.digits} placeholder="10 or 9,10"
                    onChange={(e) => setForm(f => ({ ...f, digits: e.target.value }))} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: 11, color: '#71717a', display: 'block', marginBottom: 4 }}>Example Number</label>
                  <input className="input-base" style={{ fontSize: 13 }} value={form.example} placeholder="0312345678"
                    onChange={(e) => setForm(f => ({ ...f, example: e.target.value }))} />
                </div>
              </div>
              {error && <p style={{ fontSize: 12, color: '#f87171', marginBottom: 10 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary" onClick={handleSave} style={{ fontSize: 13 }}>Save</button>
                <button className="btn-ghost" onClick={() => { setAdding(false); setEditing(null); setError(''); }} style={{ fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Rules table */}
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Country</th>
                <th>Dial Code</th>
                <th>Digits</th>
                <th>Example</th>
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(countryRules).map(([code, rule]) => (
                <tr key={code}>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#818cf8' }}>{code}</td>
                  <td style={{ fontSize: 13, color: '#d4d4d8' }}>{rule.name}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#71717a' }}>{rule.dialCode}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#d4d4d8' }}>
                    {Array.isArray(rule.digits) ? rule.digits.join('/') : rule.digits}
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#71717a' }}>
                    {rule.example || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-ghost" style={{ padding: '3px 6px', fontSize: 11 }} onClick={() => handleEdit(code, rule)}>
                        Edit
                      </button>
                      <button className="btn-danger" style={{ padding: '3px 6px', fontSize: 11 }} onClick={() => deleteCountryRule(code)}>
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
