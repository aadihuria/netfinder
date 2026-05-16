import React from 'react';
import { haversine } from '../utils/distance.js';

const TYPE_ACCENT = { tennis: 'var(--blue)', pickleball: 'var(--green)', both: 'var(--amber)' };
const AVAIL_DOT = { open: 'var(--green)', busy: 'var(--amber)', full: 'var(--red)' };

export default function CourtCard({ court, selected, onClick, userLocation, currentCheckin }) {
  const dist = userLocation
    ? haversine(userLocation.lat, userLocation.lng, court.lat, court.lng).toFixed(1)
    : null;
  const isCheckedIn = currentCheckin?.court_id === court.id;
  const accentColor = TYPE_ACCENT[court.type] || 'var(--blue)';

  return (
    <div
      className={`court-card${selected ? ' selected' : ''}${isCheckedIn ? ' checked-in' : ''}`}
      onClick={onClick}
      style={{ borderLeft: `3px solid ${isCheckedIn ? 'var(--green)' : selected ? 'var(--blue)' : accentColor}` }}
    >
      <div className="court-card-inner">
        <div className="court-card-top">
          <div className="court-card-name">{court.name}</div>
          <div className="court-avail-dot" style={{ background: AVAIL_DOT[court.availability] }} />
        </div>

        <div className="court-card-sub">
          {dist && <span className="court-dist">{dist} mi</span>}
          <span>{court.num_courts} court{court.num_courts !== 1 ? 's' : ''}</span>
          {court.active_checkins > 0 && (
            <span className="court-live">⬤ {court.active_checkins} here</span>
          )}
          {isCheckedIn && <span className="court-here-badge">YOU'RE HERE</span>}
        </div>

        <div className="court-card-tags">
          <span className={`tag tag-${court.type}`}>{court.type === 'both' ? 'Tennis + Pickle' : court.type}</span>
          {court.indoor && <span className="tag tag-indoor">Indoor</span>}
          {court.lights && <span className="tag tag-lights">⚡ Lit</span>}
          <span className={`tag ${court.free ? 'tag-free' : 'tag-paid'}`}>{court.free ? 'Free' : 'Paid'}</span>
        </div>
      </div>
    </div>
  );
}
