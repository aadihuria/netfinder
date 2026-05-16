import React, { useState, useEffect } from 'react';
import BusynessChart from './BusynessChart.jsx';
import ReportModal from './ReportModal.jsx';
import CheckInModal from './CheckInModal.jsx';
import { getBestTimes } from '../utils/distance.js';
import { useAuth } from '../context/AuthContext.jsx';
const API_BASE = import.meta.env.VITE_API_URL || '';

const AVAIL_LABEL = { open: 'Courts Available', busy: 'Getting Busy', full: 'Courts Full' };

export default function CourtDetail({ court, onClose, onAvailUpdate, isMobile, currentCheckin, onCheckedIn, onCheckedOut }) {
  const { user } = useAuth();
  const [showReport, setShowReport] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const bestTimes = court.peak_prediction ? getBestTimes(court.peak_prediction) : [];
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(court.address)}`;
  const isCheckedIn = currentCheckin?.court_id === court.id;

  useEffect(() => {
    fetch(`${API_BASE}/api/checkins/court/${court.id}`)
      .then(r => r.json())
      .then(setActiveUsers)
      .catch(() => {});
  }, [court.id, currentCheckin]);

  const panelStyle = isMobile ? {
    position: 'fixed', left: 0, right: 0, bottom: 36, top: 'auto',
    width: '100%', height: '90vh', zIndex: 50,
    background: 'var(--bg2)', backdropFilter: 'blur(16px)',
    borderTop: '1px solid var(--border)', borderRadius: '16px 16px 0 0',
    display: 'flex', flexDirection: 'column', overflowY: 'auto',
  } : {
    position: 'absolute', right: 0, top: 'var(--header-h)', bottom: 0,
    width: 'var(--detail-w)', zIndex: 15,
    background: 'var(--bg2)', backdropFilter: 'blur(12px)',
    borderLeft: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', overflowY: 'auto',
  };

  return (
    <>
      {isMobile && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 49, background: 'rgba(10,14,26,0.5)' }}
          onClick={onClose} />
      )}
      <div style={panelStyle}>
        {/* Header */}
        <div className="detail-header" style={{ position: 'sticky', top: 0, background: 'var(--bg2)', zIndex: 2 }}>
          <button className="detail-close" onClick={onClose}>✕</button>
          <div className="detail-name">{court.name}</div>
          <div className="detail-address">{court.address}</div>
          <div className="detail-badges">
            <span className={`badge ${court.type}`}>{court.type}</span>
            <span className={`badge ${court.surface}`}>{court.surface}</span>
            {court.indoor && <span className="badge indoor">Indoor</span>}
            {court.lights && <span className="badge lights">⚡ Lights</span>}
            {court.reservable && <span className="badge" style={{ background: 'rgba(77,166,255,0.1)', color: 'var(--blue)' }}>Reservable</span>}
            <span style={{
              padding: '1px 8px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 700,
              background: court.free ? 'rgba(0,255,136,0.12)' : 'rgba(255,184,0,0.12)',
              color: court.free ? 'var(--green)' : 'var(--amber)',
              border: `1px solid ${court.free ? 'rgba(0,255,136,0.25)' : 'rgba(255,184,0,0.25)'}`,
            }}>
              {court.free ? '✓ FREE' : '$ PAID'}
            </span>
          </div>
        </div>

        {/* Availability */}
        <div className={`avail-indicator ${court.availability}`} style={{ margin: '12px 16px 0' }}>
          <div className={`avail-pulse ${court.availability}`} />
          <div>
            <div className={`avail-text ${court.availability}`}>{AVAIL_LABEL[court.availability]}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text2)', marginTop: 2 }}>Community reported status</div>
          </div>
        </div>

        <div className="detail-body">
          {/* Court stats */}
          <div className="detail-section">
            <div className="detail-section-title">Court Info</div>
            <div className="detail-stats">
              <div className="stat-box">
                <div className="stat-box-val">{court.num_courts}</div>
                <div className="stat-box-label">Total Courts</div>
              </div>
              <div className="stat-box">
                <div className="stat-box-val" style={{ textTransform: 'capitalize' }}>{court.type}</div>
                <div className="stat-box-label">Sport</div>
              </div>
              <div className="stat-box">
                <div className="stat-box-val" style={{ textTransform: 'capitalize' }}>{court.surface}</div>
                <div className="stat-box-label">Surface</div>
              </div>
              <div className="stat-box">
                <div className="stat-box-val" style={{ color: court.free ? 'var(--green)' : 'var(--amber)' }}>
                  {court.free ? 'Free' : 'Paid'}
                </div>
                <div className="stat-box-label">Cost</div>
              </div>
            </div>
          </div>

          {/* Who's here now */}
          <div className="detail-section">
            <div className="detail-section-title">
              Who's Here Now
              {activeUsers.length > 0 && (
                <span style={{ color: 'var(--green)', marginLeft: 8, fontFamily: 'IBM Plex Mono' }}>
                  {activeUsers.length} player{activeUsers.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {activeUsers.length === 0 ? (
              <div style={{
                background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
                padding: '12px 14px', fontSize: '0.82rem', color: 'var(--text2)',
              }}>
                No one checked in yet — be the first!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {activeUsers.map(u => (
                  <div key={u.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '8px 12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--blue), var(--green))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Bebas Neue', fontSize: '0.75rem', color: 'var(--bg)', flexShrink: 0,
                      }}>
                        {(u.user_name || '?')[0].toUpperCase()}
                      </div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{u.user_name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--green)', fontFamily: 'IBM Plex Mono' }}>
                        {u.minutes_remaining} min left
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text2)', marginTop: 1 }}>
                        {u.minutes_elapsed}m elapsed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Busyness chart */}
          {court.peak_prediction && (
            <div className="detail-section">
              <div className="detail-section-title">Today's Predicted Busyness</div>
              <BusynessChart predictions={court.peak_prediction} />
            </div>
          )}

          {/* Best times */}
          {bestTimes.length > 0 && (
            <div className="detail-section">
              <div className="detail-section-title">Best Times to Play</div>
              <div className="best-times">
                {bestTimes.map(t => <span key={t} className="time-chip">{t}</span>)}
              </div>
            </div>
          )}

          {/* Notes */}
          {court.notes && (
            <div className="detail-section">
              <div className="detail-section-title">Notes</div>
              <div className="notes-box">{court.notes}</div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            {user ? (
              <button
                className="btn btn-primary"
                onClick={() => setShowCheckIn(true)}
                style={isCheckedIn ? { background: 'var(--red)', borderColor: 'var(--red)', color: '#fff' } : {}}
              >
                {isCheckedIn ? '✓ You\'re Here · Check Out' : '📍 Check In Here'}
              </button>
            ) : (
              <div style={{
                background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
                padding: '10px 14px', fontSize: '0.82rem', color: 'var(--text2)', textAlign: 'center',
              }}>
                Log in to check in and see who's playing
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowReport(true)}>
                Report Status
              </button>
              <a className="btn btn-secondary" href={mapsUrl} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
                Directions ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      {showReport && (
        <ReportModal court={court} onClose={() => setShowReport(false)}
          onSubmit={(s) => { onAvailUpdate(court.id, s); setShowReport(false); }} />
      )}
      {showCheckIn && (
        <CheckInModal court={court} currentCheckin={currentCheckin}
          onClose={() => setShowCheckIn(false)}
          onCheckedIn={onCheckedIn} onCheckedOut={onCheckedOut} />
      )}
    </>
  );
}
