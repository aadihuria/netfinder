import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

function timeAgo(ts) {
  const d = Math.floor(Date.now() / 1000 - ts);
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function ProfilePage({ onClose }) {
  const { user, authFetch, logout } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/api/checkins/history')
      .then(r => r.json())
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalTime = history.reduce((s, c) => s + (c.duration_minutes || 0), 0);
  const totalSessions = history.length;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '16px 20px',
        borderBottom: '1px solid var(--border)', background: 'var(--bg2)',
        flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          background: 'none', border: '1px solid var(--border)', color: 'var(--text)',
          borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
          fontFamily: 'Barlow Condensed', fontSize: '0.9rem', marginRight: 16,
        }}>← Back</button>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', letterSpacing: 1 }}>MY PROFILE</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          {/* Avatar + info */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 20,
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 20, marginBottom: 20,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--blue), var(--green))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Bebas Neue', fontSize: '1.6rem', color: 'var(--bg)',
              flexShrink: 0,
            }}>{initials(user?.name)}</div>
            <div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', letterSpacing: 1 }}>{user?.name}</div>
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.75rem', color: 'var(--text2)' }}>{user?.email}</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <StatBox val={totalSessions} label="Total Sessions" color="var(--blue)" />
            <StatBox val={`${Math.floor(totalTime / 60)}h ${totalTime % 60}m`} label="Time on Court" color="var(--green)" />
          </div>

          {/* History */}
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.65rem', color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
            Check-In History
          </div>
          {loading ? (
            <div style={{ color: 'var(--text2)', textAlign: 'center', padding: 20 }}>Loading…</div>
          ) : history.length === 0 ? (
            <div style={{
              background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
              padding: 24, textAlign: 'center', color: 'var(--text2)',
            }}>
              No check-ins yet. Find a court and check in!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.map(ci => (
                <div key={ci.id} style={{
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '12px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{ci.court_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: 2, fontFamily: 'IBM Plex Mono' }}>
                      {timeAgo(ci.start_time)} · {ci.duration_minutes} min
                    </div>
                  </div>
                  <div style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                    background: ci.active ? 'rgba(0,255,136,0.15)' : 'var(--bg3)',
                    color: ci.active ? 'var(--green)' : 'var(--text2)',
                    border: `1px solid ${ci.active ? 'rgba(0,255,136,0.3)' : 'var(--border)'}`,
                  }}>
                    {ci.active ? '⬤ Active' : 'Completed'}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={logout} style={{
            width: '100%', marginTop: 24, padding: '12px 0',
            background: 'transparent', border: '1px solid rgba(255,59,92,0.4)',
            borderRadius: 10, color: 'var(--red)', cursor: 'pointer',
            fontFamily: 'Barlow Condensed', fontSize: '1rem', fontWeight: 700, letterSpacing: 1,
          }}>LOG OUT</button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ val, label, color }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16,
    }}>
      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '1.6rem', color, fontWeight: 500 }}>{val}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginTop: 4 }}>{label}</div>
    </div>
  );
}
