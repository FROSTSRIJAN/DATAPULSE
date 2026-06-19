import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '◈', end: true },
  { to: '/dashboard/new', label: 'New Analysis', icon: '↑' },
  { to: '/dashboard/history', label: 'Analysis History', icon: '⏱' },
  { to: '/dashboard/reports', label: 'Saved Reports', icon: '📋' },
  { to: '/dashboard/country-rules', label: 'Country Rules', icon: '🌐' },
  { to: '/dashboard/settings', label: 'Settings', icon: '⚙' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const displayName = user?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initial = displayName[0]?.toUpperCase() || 'U';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface-950)' }}>
      {/* ── SIDEBAR ───────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 60 : 220 }}
        transition={{ duration: 0.22 }}
        style={{
          flexShrink: 0, display: 'flex', flexDirection: 'column',
          background: 'rgba(11,11,15,0.98)',
          borderRight: '1px solid rgba(28,28,38,0.9)',
          position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div style={{ padding: '16px 14px', borderBottom: '1px solid rgba(28,28,38,0.8)', display: 'flex', alignItems: 'center', gap: 10, minHeight: 60 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, boxShadow: '0 0 10px rgba(99,102,241,0.35)' }}>
            ⚡
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}
                style={{ fontSize: 14, fontWeight: 800, color: '#f4f4f5', whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>
                DataPulse <span style={{ color: '#818cf8' }}>AI</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '10px' : '9px 14px' }}
              data-tip={collapsed ? item.label : undefined}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} style={{ whiteSpace: 'nowrap' }}>
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div style={{ padding: '8px', borderTop: '1px solid rgba(28,28,38,.8)' }}>
          <button onClick={() => setCollapsed(!collapsed)} className="sidebar-link" style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <span style={{ fontSize: 14, transition: 'transform 0.2s', transform: collapsed ? 'scaleX(-1)' : 'none' }}>◁</span>
            {!collapsed && <span style={{ fontSize: 12 }}>Collapse</span>}
          </button>
        </div>

        {/* User */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(28,28,38,.8)', position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '8px' : '8px 10px',
              borderRadius: 9, background: 'transparent', border: 'none', cursor: 'pointer',
              transition: 'background 0.15s', justifyContent: collapsed ? 'center' : 'flex-start',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
              {initial}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'left', overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
                  <div style={{ fontSize: 10, color: '#52525b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                style={{
                  position: 'absolute', bottom: '100%', left: 8, right: 8, marginBottom: 4,
                  background: 'rgba(17,17,22,.98)', border: '1px solid rgba(42,42,56,.8)',
                  borderRadius: 10, padding: 6, boxShadow: '0 -12px 32px rgba(0,0,0,.4)', zIndex: 200,
                }}>
                <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', fontSize: 13, color: '#f87171', gap: 8 }}>
                  ↪ Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  );
}
