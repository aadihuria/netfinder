import React from 'react';
import { haversine } from '../utils/distance.js';

export default function CourtCard({ court, selected, onClick, userLocation, currentCheckin }) {
  const dist = userLocation
    ? haversine(userLocation.lat, userLocation.lng, court.lat, court.lng).toFixed(1)
    : null;
  const isCheckedIn = currentCheckin?.court_id === court.id;

  return (
    <div
      className={`court-card${selected ? ' selected' : ''}`}
      onClick={onClick}
      style={isCheckedIn ? { borderLeft: '3px solid var(--green)', background: 'rgba(0,255,136,0.05)' } : {}}
    >
      <div className={`court-dot ${court.availability}`} />
      <div className="court-card-info">
        <div className="court-card-name">{court.name}</div>
        <div className="court-card-meta">
          {court.num_courts} court{court.num_courts !== 1 ? 's' : ''}
          {dist ? ` · ${dist} mi` : ''}
          {court.active_checkins > 0 && (
            <span style={{ color: 'var(--green)', marginLeft: 4 }}>
              · {court.active_checkins} here now
            </span>
          )}
        </div>
        <div className="court-card-badges">
          <span className={`badge ${court.type}`}>{court.type}</span>
          <span className={`badge ${court.surface}`}>{court.surface}</span>
          {court.indoor && <span className="badge indoor">Indoor</span>}
          {court.lights && <span className="badge lights">⚡</span>}
          <span className={`badge`} style={{
            background: court.free ? 'rgba(0,255,136,0.12)' : 'rgba(255,184,0,0.12)',
            color: court.free ? 'var(--green)' : 'var(--amber)',
            border: `1px solid ${court.free ? 'rgba(0,255,136,0.25)' : 'rgba(255,184,0,0.25)'}`,
          }}>
            {court.free ? 'FREE' : 'PAID'}
          </span>
          {isCheckedIn && (
            <span style={{
              padding: '1px 6px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 700,
              background: 'rgba(0,255,136,0.2)', color: 'var(--green)',
              border: '1px solid rgba(0,255,136,0.4)',
            }}>YOU'RE HERE</span>
          )}
        </div>
      </div>
    </div>
  );
}
