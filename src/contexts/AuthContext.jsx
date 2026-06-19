import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, getSession, signOut as sbSignOut } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    const initAuth = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase.auth.getSession();
          setUser(data?.session?.user ?? null);
        } else {
          // Demo mode — check localStorage
          const stored = localStorage.getItem('xeno_demo_user');
          setUser(stored ? JSON.parse(stored) : null);
        }
      } catch { setUser(null); }
      setLoading(false);
    };

    initAuth();

    // Subscribe to auth changes (Supabase only)
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      return () => subscription?.unsubscribe();
    }
  }, []);

  const logout = async () => {
    await sbSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
