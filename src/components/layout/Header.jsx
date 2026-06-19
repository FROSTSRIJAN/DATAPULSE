import React, { useState } from 'react';
import useAppStore from '../../store/useAppStore';
import CountryRulesManager from '../settings/CountryRulesManager';

export default function Header() {
  const { fileInfo, reset } = useAppStore();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header style={{
        background: 'rgba(9,9,11,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(39,39,42,0.8)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: 'white',
          }}>X</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', color: 'white' }}>
              XENO <span style={{ background: 'linear-gradient(135deg,#818cf8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DataPulse AI</span>
            </div>
            <div style={{ fontSize: 10, color: '#52525b', letterSpacing: '0.05em', marginTop: -2 }}>
              FROM RAW DATA TO TRUSTED DATA
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {fileInfo && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 6, padding: '4px 10px',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span style={{ fontSize: 12, color: '#a5b4fc', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {fileInfo.fileName}
              </span>
            </div>
          )}

          <button
            className="btn-ghost"
            onClick={() => setShowSettings(true)}
            style={{ fontSize: 13 }}
            title="Country Rules Settings"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
            </svg>
            Settings
          </button>

          {fileInfo && (
            <button
              className="btn-secondary"
              onClick={reset}
              style={{ fontSize: 13, padding: '6px 12px' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
              </svg>
              New Dataset
            </button>
          )}
        </div>
      </header>

      {showSettings && (
        <CountryRulesManager onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
