import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signUp, signInWithGoogle, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validate = () => {
    if (!form.fullName.trim()) return 'Full name is required.';
    if (!form.email) return 'Email is required.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(''); setLoading(true);
    try {
      const data = await signUp({ email: form.email, password: form.password, fullName: form.fullName });
      if (!isSupabaseConfigured) {
        setUser(data.user);
        navigate('/dashboard');
      } else {
        setSuccess(true); // Supabase sends confirmation email
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608', padding: 24 }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ padding: 48, maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f4f4f5', marginBottom: 10 }}>Check your email</h2>
          <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.7 }}>
            We sent a confirmation link to <strong style={{ color: '#d4d4d8' }}>{form.email}</strong>. Click the link to activate your account.
          </p>
          <Link to="/login"><button className="btn btn-outline" style={{ marginTop: 24 }}>Back to Sign In</button></Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#060608', padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', width: 400, height: 400, top: -100, right: -100, borderRadius: '50%', background: 'rgba(139,92,246,0.12)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, bottom: -50, left: -50, borderRadius: '50%', background: 'rgba(99,102,241,0.08)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>⚡</div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#f4f4f5', letterSpacing: '-0.02em' }}>XENO <span style={{ color: '#818cf8' }}>DataPulse</span></span>
          </Link>
        </div>

        <div className="glass-card" style={{ padding: '32px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', marginBottom: 6, textAlign: 'center' }}>Create account</h1>
          <p style={{ fontSize: 13, color: '#71717a', textAlign: 'center', marginBottom: 28 }}>Start validating your data today</p>

          <button onClick={() => signInWithGoogle()} disabled={loading} className="btn btn-outline" style={{ width: '100%', gap: 10, marginBottom: 20, justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Sign up with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(42,42,56,.8)' }} />
            <span style={{ fontSize: 12, color: '#52525b' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(42,42,56,.8)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            {[
              { key: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Arjun Sharma', auto: 'name' },
              { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@company.com', auto: 'email' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', auto: 'new-password' },
              { key: 'confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••', auto: 'new-password' },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: '#a1a1aa', display: 'block', marginBottom: 6, fontWeight: 500 }}>{f.label}</label>
                <input className="input" type={f.type} placeholder={f.placeholder} autoComplete={f.auto}
                  value={form[f.key]} onChange={(e) => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
              </div>
            ))}

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', marginBottom: 14 }}>
                <p style={{ fontSize: 13, color: '#f87171' }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4, fontSize: 14 }}>
              {loading ? (
                <><span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} /> Creating account…</>
              ) : 'Create Account →'}
            </button>
          </form>

          <p style={{ fontSize: 13, color: '#71717a', textAlign: 'center', marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#818cf8', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)' }}>
            <p style={{ fontSize: 12, color: '#fbbf24', textAlign: 'center' }}>
              ⚠ Demo Mode — data stored locally
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
