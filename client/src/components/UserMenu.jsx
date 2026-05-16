import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function UserMenu({ currentCheckin, onViewProfile, onViewAdmin }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', marginLeft: 'auto' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: open ? 'var(--bg3)' : 'transparent',
        border: '1px solid', borderColor: open ? 'var(--blue)' : 'var(--border)',
        borderRadius: 24, padding: '5px 12px 5px 6px',
        cursor: 'pointer', transition: 'all 0.15s', color: 'var(--text)',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--blue), var(--green))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Bebas Neue', fontSize: '0.85rem', color: 'var(--bg)', fontWeight: 700,
          flexShrink: 0,
        }}>{initials(user?.name)}</div>
        <span style={{ fontFamily: 'Barlow Condensed', fontSize: '0.9rem', fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.name?.split(' ')[0]}
        </span>
        {currentCheckin && (
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)', flexShrink: 0 }} />
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 12, width: 220, boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden', zIndex: 100,
        }}>
          {/* User info */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user?.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: 2, fontFamily: 'IBM Plex Mono' }}>{user?.email}</div>
          </div>

          {/* Active check-in status */}
          {currentCheckin && (
            <div style={{
              padding: '10px 16px', borderBottom: '1px solid var(--border)',
              background: 'rgba(0,255,136,0.05)',
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--green)', fontFamily: 'IBM Plex Mono', letterSpacing: 1, textTransform: 'uppercase' }}>⬤ Checked In</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text)', marginTop: 3 }}>{currentCheckin.court_name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: 1 }}>{currentCheckin.minutes_remaining} min remaining</div>
            </div>
          )}

          {/* Menu items */}
          <MenuItem icon="👤" label="My Profile" onClick={() => { onViewProfile(); setOpen(false); }} />
          <MenuItem icon="⚡ " label="Admin Dashboard" onClick={() => { onViewAdmin(); setOpen(false); }} />
          <MenuItem icon="🔓" label="Log Out" onClick={() => { logout(); setOpen(false); }} danger />
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '11px 16px', background: 'none', border: 'none',
      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
      color: danger ? 'var(--red)' : 'var(--text)', fontSize: '0.9rem',
      transition: 'background 0.12s', textAlign: 'left',
      fontFamily: 'Barlow Condensed',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      <span>{icon}</span><span>{label}</span>
    </button>
  );
}
