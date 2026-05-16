import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const DURATIONS = [
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hrs', value: 90 },
  { label: '2 hours', value: 120 },
];

export default function CheckInModal({ court, currentCheckin, onClose, onCheckedIn, onCheckedOut }) {
  const { authFetch } = useAuth();
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAlreadyHere = currentCheckin?.court_id === court.id;

  async function handleCheckIn() {
    setLoading(true); setError('');
    try {
      const res = await authFetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ court_id: court.id, duration_minutes: duration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Check-in failed');
      onCheckedIn(data);
      onClose();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleCheckOut() {
    setLoading(true);
    try {
      await authFetch('/api/checkins/mine', { method: 'DELETE' });
      onCheckedOut();
      onClose();
    } catch { setError('Could not check out. Try again.'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(10,14,26,0.9)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 28, width: '100%', maxWidth: 400,
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.5rem',
            letterSpacing: 1, color: 'var(--green)', marginBottom: 4,
          }}>
            {isAlreadyHere ? "YOU'RE HERE" : 'CHECK IN'}
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: 600 }}>{court.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginTop: 2 }}>{court.address}</div>
        </div>

        {isAlreadyHere ? (
          <>
            <div style={{
              background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)',
              borderRadius: 10, padding: 16, marginBottom: 20, textAlign: 'center',
            }}>
              <div style={{ color: 'var(--green)', fontFamily: 'IBM Plex Mono', fontSize: '1.4rem', fontWeight: 500 }}>
                {currentCheckin.minutes_remaining} min
              </div>
              <div style={{ color: 'var(--text2)', fontSize: '0.8rem', marginTop: 4 }}>remaining in your session</div>
            </div>
            <button onClick={handleCheckOut} disabled={loading} className="btn btn-primary"
              style={{ width: '100%', background: 'var(--red)', borderColor: 'var(--red)', color: '#fff' }}>
              {loading ? 'Checking out…' : 'Check Out Early'}
            </button>
          </>
        ) : (
          <>
            {currentCheckin && (
              <div style={{
                background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)',
                borderRadius: 8, padding: 12, marginBottom: 16, fontSize: '0.82rem', color: 'var(--amber)',
              }}>
                ⚠ You're checked in at <strong>{currentCheckin.court_name}</strong>. Checking in here will end that session.
              </div>
            )}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontFamily: 'IBM Plex Mono', fontSize: '0.65rem',
                color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10,
              }}>How long will you play?</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {DURATIONS.map(d => (
                  <button key={d.value} onClick={() => setDuration(d.value)}
                    style={{
                      padding: '14px 8px', borderRadius: 10, border: '2px solid',
                      borderColor: duration === d.value ? 'var(--green)' : 'var(--border)',
                      background: duration === d.value ? 'rgba(0,255,136,0.1)' : 'var(--bg3)',
                      color: duration === d.value ? 'var(--green)' : 'var(--text)',
                      fontFamily: 'Barlow Condensed', fontSize: '1rem', fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            {error && (
              <div style={{ color: 'var(--red)', fontSize: '0.82rem', marginBottom: 14 }}>{error}</div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCheckIn} disabled={loading} style={{ flex: 2 }}>
                {loading ? 'Checking in…' : `Check In · ${duration} min`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
