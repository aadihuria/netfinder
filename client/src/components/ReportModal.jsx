import React, { useState } from 'react';

export default function ReportModal({ court, onClose, onSubmit }) {
  const [status, setStatus] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!status) return;
    setLoading(true);
    try {
      await fetch(`/api/courts/${court.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reporter_name: name || 'Anonymous' }),
      });
      onSubmit(status);
      onClose();
    } catch {
      alert('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Report Availability</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: 14 }}>
          {court.name}
        </div>
        <div className="modal-options">
          {['open', 'busy', 'full'].map(s => (
            <div
              key={s}
              className={`modal-opt${status === s ? ` sel-${s}` : ''}`}
              onClick={() => setStatus(s)}
            >
              {s === 'open' ? '✓ Open' : s === 'busy' ? '⚡ Busy' : '✗ Full'}
            </div>
          ))}
        </div>
        <input
          className="modal-input"
          placeholder="Your name (optional)"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={40}
        />
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!status || loading}
          >
            {loading ? 'Submitting…' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
