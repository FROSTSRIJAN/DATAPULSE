import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { resetPasswordForEmail } from '../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required.'); return; }
    setError(''); setMessage(''); setLoading(true);
    try {
      await resetPasswordForEmail(email);
      setMessage('Password reset link sent! Please check your email inbox.');
    } catch (err) {
      setError(err.message || 'Failed to send reset link.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#060608', padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', width: 400, height: 400, top: -100, left: -100, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 420, position: 'relative' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>⚡</div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#f4f4f5', letterSpacing: '-0.02em' }}>XENO <span style={{ color: '#818cf8' }}>DataPulse</span></span>
          </Link>
        </div>

        <div className="glass-card" style={{ padding: '32px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', marginBottom: 6, textAlign: 'center' }}>Reset password</h1>
          <p style={{ fontSize: 13, color: '#71717a', textAlign: 'center', marginBottom: 28 }}>We will email you a password recovery link</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: '#a1a1aa', display: 'block', marginBottom: 6, fontWeight: 500 }}>Email Address</label>
              <input
                className="input"
                type="email" placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
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
              {loading ? 'Sending link...' : 'Send reset link →'}
            </button>
          </form>

          <p style={{ fontSize: 13, color: '#71717a', textAlign: 'center', marginTop: 20 }}>
            <Link to="/login" style={{ color: '#818cf8', fontWeight: 500, textDecoration: 'none' }}>
              Back to Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
