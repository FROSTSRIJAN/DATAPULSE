import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { updatePassword } from '../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setError(''); setMessage(''); setLoading(true);
    try {
      await updatePassword(password);
      setMessage('Password updated successfully! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#060608', padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', width: 400, height: 400, top: -100, left: -100, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 420, position: 'relative' }}
      >
        <div className="glass-card" style={{ padding: '32px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', marginBottom: 6, textAlign: 'center' }}>Set new password</h1>
          <p style={{ fontSize: 13, color: '#71717a', textAlign: 'center', marginBottom: 28 }}>Please enter your new security password</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: '#a1a1aa', display: 'block', marginBottom: 6, fontWeight: 500 }}>New Password</label>
              <input
                className="input"
                type="password" placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: '#a1a1aa', display: 'block', marginBottom: 6, fontWeight: 500 }}>Confirm New Password</label>
              <input
                className="input"
                type="password" placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#f87171' }}>{error}</p>
              </div>
            )}

            {message && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.25)', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#4ade80' }}>{message}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 14 }}>
              {loading ? 'Updating password...' : 'Update password →'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
