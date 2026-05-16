import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ email: '', name: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setError(''); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
        await register(form.email, form.name, form.password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, zIndex: 1000,
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'linear-gradient(var(--blue) 1px, transparent 1px), linear-gradient(90deg, var(--blue) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontFamily: 'Bebas Neue, sans-serif', fontSize: '3.5rem',
            letterSpacing: 4, color: 'var(--green)',
            textShadow: '0 0 40px rgba(0,255,136,0.4)',
            lineHeight: 1,
          }}>
            NET<span style={{ color: 'var(--blue)' }}>FINDER</span>
          </div>
          <div style={{
            fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.75rem',
            color: 'var(--text2)', letterSpacing: 2, marginTop: 8,
          }}>
            SE MICHIGAN COURTS
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 32,
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}>
          {/* Mode toggle */}
          <div style={{
            display: 'flex', background: 'var(--bg3)', borderRadius: 10,
            padding: 3, marginBottom: 28, border: '1px solid var(--border)',
          }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '9px 0', border: 'none', borderRadius: 8,
                  fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.95rem',
                  fontWeight: 700, letterSpacing: 1, cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: mode === m ? 'var(--blue)' : 'transparent',
                  color: mode === m ? '#fff' : 'var(--text2)',
                }}>
                {m === 'login' ? 'LOG IN' : 'SIGN UP'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <Field label="YOUR NAME" type="text" value={form.name}
                onChange={v => set('name', v)} placeholder="e.g. Alex Johnson" />
            )}
            <Field label="EMAIL" type="email" value={form.email}
              onChange={v => set('email', v)} placeholder="you@example.com" />
            <Field label="PASSWORD" type="password" value={form.password}
              onChange={v => set('password', v)}
              placeholder={mode === 'register' ? 'Min 6 characters' : 'Your password'} />

            {error && (
              <div style={{
                background: 'rgba(255,59,92,0.1)', border: '1px solid rgba(255,59,92,0.3)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                color: 'var(--red)', fontSize: '0.85rem',
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px 0', borderRadius: 10, border: 'none',
              background: loading ? 'var(--bg3)' : 'var(--green)',
              color: loading ? 'var(--text2)' : 'var(--bg)',
              fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.2rem',
              letterSpacing: 2, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 0 20px rgba(0,255,136,0.3)',
            }}>
              {loading ? 'PLEASE WAIT…' : mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
            </button>
          </form>
        </div>

        <div style={{
          textAlign: 'center', marginTop: 20,
          fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.7rem', color: 'var(--text2)',
        }}>
          Real-time court availability · 115 courts · SE Michigan
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.65rem',
        color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6,
      }}>{label}</div>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} required
        style={{
          width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '12px 14px', color: 'var(--text)',
          fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1rem',
          outline: 'none', transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--blue)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  );
}
