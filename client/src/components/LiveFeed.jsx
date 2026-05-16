import React, { useState, useEffect } from 'react';

function timeAgo(ts) {
  const diff = Math.floor(Date.now() / 1000 - ts);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

const SEED_FEED = [
  { id: -1, court_name: 'Bash Pickleball Club - Warren', status: 'open', reporter_name: 'Mike', created_at: Math.floor(Date.now() / 1000) - 120 },
  { id: -2, court_name: 'Whittier Park Pickleball - Royal Oak', status: 'busy', reporter_name: 'Sarah', created_at: Math.floor(Date.now() / 1000) - 480 },
  { id: -3, court_name: 'Wolverine Pickleball', status: 'open', reporter_name: 'Jordan', created_at: Math.floor(Date.now() / 1000) - 720 },
  { id: -4, court_name: 'Borden Park Pickleball - Rochester Hills', status: 'full', reporter_name: 'Alex', created_at: Math.floor(Date.now() / 1000) - 900 },
  { id: -5, court_name: 'Leslie Park Pickleball Courts', status: 'open', reporter_name: 'Taylor', created_at: Math.floor(Date.now() / 1000) - 1200 },
];

export default function LiveFeed() {
  const [items, setItems] = useState(SEED_FEED);

  useEffect(() => {
    async function load() {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      try {
        const res = await fetch(`${API_BASE}/api/submissions/recent`);
        const data = await res.json();
        if (data.length) setItems([...data, ...SEED_FEED].slice(0, 20));
      } catch {}
    }
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  const doubled = [...items, ...items];

  return (
    <div className="live-feed">
      <div className="live-feed-label">⬤ LIVE</div>
      <div className="live-feed-track">
        {doubled.map((item, i) => (
          <span key={`${item.id}-${i}`} className="feed-item">
            <span style={{ color: 'var(--text)' }}>{item.reporter_name}</span>
            {' reported '}
            <span style={{ color: 'var(--blue)' }}>{item.court_name}</span>
            {' as '}
            <span className={`feed-status ${item.status}`}>{item.status.toUpperCase()}</span>
            {' · '}
            <span style={{ color: 'var(--text2)' }}>{timeAgo(item.created_at)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
