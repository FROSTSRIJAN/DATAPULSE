import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [status, setStatus] = useState('Completing security authentication...');

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      navigate('/');
      return;
    }

    const handleCallback = async () => {
      try {
        // Exchange session tokens if available
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data?.session) {
          setUser(data.session.user);
          
          // Check url for recovery type
          const hash = window.location.hash || '';
          const search = window.location.search || '';
          if (hash.includes('type=recovery') || search.includes('type=recovery')) {
            navigate('/reset-password');
          } else {
            navigate('/dashboard');
          }
        } else {
          // Listen to changes (e.g. async token processing)
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
              setUser(session.user);
              if (event === 'PASSWORD_RECOVERY') {
                navigate('/reset-password');
              } else {
                navigate('/dashboard');
              }
            }
          });

          // Timeout fallback
          const timer = setTimeout(() => {
            subscription?.unsubscribe();
            navigate('/login');
          }, 3000);

          return () => {
            clearTimeout(timer);
            subscription?.unsubscribe();
          };
        }
      } catch (err) {
        console.error('Auth Callback Error:', err);
        setStatus('Authentication failed. Redirecting...');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleCallback();
  }, [navigate, setUser]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: '#060608', color: '#a1a1aa', fontFamily: 'sans-serif'
    }}>
      <span className="animate-spin" style={{
        width: 32, height: 32, border: '3px solid rgba(236,168,214,.1)',
        borderTopColor: '#eca8d6', borderRadius: '50%', display: 'inline-block', marginBottom: 16
      }} />
      <p style={{ fontSize: 14 }}>{status}</p>
    </div>
  );
}
