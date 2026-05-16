import React, { useState, useEffect, useCallback } from 'react';

const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || 'netfinder-admin-2026';

function timeAgo(ts) {
  const d = Math.floor(Date.now() / 1000 - ts);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

function adminFetch(path) {
  return fetch(`/api/admin${path}`, { headers: { 'x-admin-key': ADMIN_KEY } }).then(r => r.json());
}

export default function AdminDashboard({ onClose }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = useCallback(async () => {
    try {
      const [s, u, c, sub] = await Promise.all([
        adminFetch('/stats'),
        adminFetch('/users'),
        adminFetch('/checkins'),
        adminFetch('/submissions'),
      ]);
      setStats(s);
      setUsers(u);
      setCheckins(c);
      setSubmissions(sub);
      setLastRefresh(new Date());
    } catch (e) {
      console.error('Admin load failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  const activeCheckins = checkins.filter(c => c.is_active);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'var(--bg)', display: 'flex', flexDirection: 'column',
      fontFamily: 'Barlow Condensed, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 20px',
        height: 56, background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        flexShrink: 0, gap: 16,
      }}>
        <button onClick={onClose} style={{
          background: 'none', border: '1px solid var(--border)', color: 'var(--text)',
          borderRadius: 8, padding: '5px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem',
        }}>← Back</button>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', letterSpacing: 2, color: 'var(--green)' }}>
          ADMIN DASHBOARD
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastRefresh && (
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.65rem', color: 'var(--text2)' }}>
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)', animation: 'marker-pulse-g 2s infinite' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--green)', fontFamily: 'IBM Plex Mono' }}>LIVE</span>
          <button onClick={load} style={{
            background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)',
            borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem',
          }}>↻ Refresh</button>
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
          Loading admin data…
        </div>
      ) : (
        <>
          {/* Stats bar */}
          {stats && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 1, background: 'var(--border)', borderBottom: '1px solid var(--border)', flexShrink: 0,
            }}>
              {[
                { label: 'Total Users', val: stats.total_users, color: 'var(--blue)' },
                { label: 'New (24h)', val: stats.signups_last_24h, color: 'var(--green)' },
                { label: 'Active Now', val: stats.active_checkins, color: 'var(--green)' },
                { label: 'Check-ins (24h)', val: stats.checkins_last_24h, color: 'var(--blue)' },
                { label: 'All Check-ins', val: stats.total_checkins_ever, color: 'var(--text2)' },
                { label: 'Courts Tracked', val: stats.total_courts, color: 'var(--blue)' },
                { label: 'Courts Open', val: stats.open_courts, color: 'var(--green)' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{
                  background: 'var(--bg2)', padding: '14px 20px',
                }}>
                  <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '1.5rem', color, fontWeight: 500 }}>{val}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text2)', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 0, borderBottom: '1px solid var(--border)',
            background: 'var(--bg2)', flexShrink: 0,
          }}>
            {[
              { id: 'overview', label: `Active Sessions (${activeCheckins.length})` },
              { id: 'users', label: `All Users (${users.length})` },
              { id: 'checkins', label: `Check-in Log (${checkins.length})` },
              { id: 'reports', label: `Reports (${submissions.length})` },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '11px 20px', border: 'none', borderBottom: tab === t.id ? '2px solid var(--blue)' : '2px solid transparent',
                background: 'none', color: tab === t.id ? 'var(--text)' : 'var(--text2)',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 700,
                letterSpacing: 0.5, transition: 'color 0.15s',
              }}>{t.label}</button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {tab === 'overview' && (
              <TableView
                rows={activeCheckins}
                empty="No active check-ins right now"
                columns={[
                  { key: 'user_name', label: 'Player', render: v => <strong>{v}</strong> },
                  { key: 'court_name', label: 'Court', render: v => <span style={{ color: 'var(--blue)' }}>{v}</span> },
                  { key: 'minutes_remaining', label: 'Time Left', render: v => <span style={{ color: 'var(--green)', fontFamily: 'IBM Plex Mono' }}>{v} min</span> },
                  { key: 'duration_minutes', label: 'Session', render: v => `${v} min` },
                  { key: 'start_time', label: 'Started', render: v => timeAgo(v) },
                ]}
              />
            )}
            {tab === 'users' && (
              <TableView
                rows={users}
                empty="No users yet"
                columns={[
                  { key: 'name', label: 'Name', render: v => <strong>{v}</strong> },
                  { key: 'email', label: 'Email', render: v => <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.8rem', color: 'var(--text2)' }}>{v}</span> },
                  { key: 'created_at', label: 'Joined', render: v => timeAgo(v) },
                  { key: 'id', label: 'User ID', render: v => <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.72rem', color: 'var(--text2)' }}>{v}</span> },
                ]}
              />
            )}
            {tab === 'checkins' && (
              <TableView
                rows={checkins}
                empty="No check-ins yet"
                columns={[
                  { key: 'user_name', label: 'Player', render: v => <strong>{v}</strong> },
                  { key: 'court_name', label: 'Court', render: v => <span style={{ color: 'var(--blue)' }}>{v}</span> },
                  { key: 'is_active', label: 'Status', render: v => (
                    <span style={{
                      padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
                      background: v ? 'rgba(0,255,136,0.15)' : 'var(--bg3)',
                      color: v ? 'var(--green)' : 'var(--text2)',
                      border: `1px solid ${v ? 'rgba(0,255,136,0.3)' : 'var(--border)'}`,
                    }}>{v ? '⬤ Active' : 'Done'}</span>
                  )},
                  { key: 'duration_minutes', label: 'Duration', render: v => `${v} min` },
                  { key: 'start_time', label: 'When', render: v => timeAgo(v) },
                ]}
              />
            )}
            {tab === 'reports' && (
              <TableView
                rows={submissions}
                empty="No availability reports yet"
                columns={[
                  { key: 'reporter_name', label: 'Reporter', render: v => <strong>{v}</strong> },
                  { key: 'court_name', label: 'Court', render: v => <span style={{ color: 'var(--blue)' }}>{v}</span> },
                  { key: 'status', label: 'Status', render: v => (
                    <span style={{
                      padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
                      background: v === 'open' ? 'rgba(0,255,136,0.15)' : v === 'busy' ? 'rgba(255,184,0,0.15)' : 'rgba(255,59,92,0.15)',
                      color: v === 'open' ? 'var(--green)' : v === 'busy' ? 'var(--amber)' : 'var(--red)',
                    }}>{v.toUpperCase()}</span>
                  )},
                  { key: 'created_at', label: 'Reported', render: v => timeAgo(v) },
                ]}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TableView({ rows, columns, empty }) {
  if (rows.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>{empty}</div>;
  }
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
      <thead>
        <tr style={{ background: 'var(--bg3)', position: 'sticky', top: 0, zIndex: 1 }}>
          {columns.map(c => (
            <th key={c.key} style={{
              padding: '10px 20px', textAlign: 'left', fontFamily: 'IBM Plex Mono',
              fontSize: '0.65rem', color: 'var(--text2)', letterSpacing: 1,
              textTransform: 'uppercase', borderBottom: '1px solid var(--border)', fontWeight: 500,
            }}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.id ?? i} style={{ borderBottom: '1px solid var(--border)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {columns.map(c => (
              <td key={c.key} style={{ padding: '11px 20px', color: 'var(--text)' }}>
                {c.render ? c.render(row[c.key]) : row[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
