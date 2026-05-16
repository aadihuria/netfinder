import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Map from './components/Map.jsx';
import FilterPanel from './components/FilterPanel.jsx';
import CourtCard from './components/CourtCard.jsx';
import CourtDetail from './components/CourtDetail.jsx';
import LiveFeed from './components/LiveFeed.jsx';
import StatCounter from './components/StatCounter.jsx';
import LoginPage from './components/LoginPage.jsx';
import UserMenu from './components/UserMenu.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import { useCourts, filterAndSort } from './hooks/useCourts.js';
import { useGeolocation } from './hooks/useGeolocation.js';
import { useAuth } from './context/AuthContext.jsx';

const DEFAULT_FILTERS = {
  type: 'all', surface: 'all', lights: 'any', indoor: 'any',
  availability: 'all', free: 'all', maxMiles: 99, sort: 'name', search: '',
};

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { allCourts, loading, error, refetch } = useCourts();
  const { location, loading: locLoading, locate } = useGeolocation();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [sheetCollapsed, setSheetCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [currentCheckin, setCurrentCheckin] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef(null);
  const { authFetch } = useAuth();

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  useEffect(() => {
    if (allCourts.length) setCourts(allCourts);
  }, [allCourts]);

  // Poll for user's active check-in
  useEffect(() => {
    if (!user) { setCurrentCheckin(null); return; }
    const load = () => authFetch('/api/checkins/mine').then(r => r.json()).then(setCurrentCheckin).catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [user]);

  const filtered = useMemo(() => filterAndSort(courts, filters, location), [courts, filters, location]);
  const openCount = useMemo(() => courts.filter(c => c.availability === 'open').length, [courts]);
  const totalCourts = useMemo(() => courts.reduce((s, c) => s + c.num_courts, 0), [courts]);

  const handleSelectCourt = useCallback((court) => {
    setSelectedCourt(court);
    setSheetCollapsed(false);
  }, []);

  const handleAvailUpdate = useCallback((courtId, newStatus) => {
    setCourts(prev => prev.map(c => c.id === courtId ? { ...c, availability: newStatus } : c));
    setSelectedCourt(prev => prev?.id === courtId ? { ...prev, availability: newStatus } : prev);
  }, []);

  const handleCheckedIn = useCallback((checkin) => {
    setCurrentCheckin(checkin);
    setCourts(prev => prev.map(c =>
      c.id === checkin.court_id ? { ...c, active_checkins: (c.active_checkins || 0) + 1 } : c
    ));
  }, []);

  const handleCheckedOut = useCallback(() => {
    if (currentCheckin) {
      setCourts(prev => prev.map(c =>
        c.id === currentCheckin.court_id
          ? { ...c, active_checkins: Math.max(0, (c.active_checkins || 1) - 1) }
          : c
      ));
    }
    setCurrentCheckin(null);
  }, [currentCheckin]);

  function handleLogoClick() {
    logoClickCount.current++;
    clearTimeout(logoClickTimer.current);
    if (logoClickCount.current >= 3) {
      logoClickCount.current = 0;
      setHeatmapMode(m => !m);
    } else {
      logoClickTimer.current = setTimeout(() => { logoClickCount.current = 0; }, 800);
    }
  }

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: 'var(--green)', letterSpacing: 3 }}>NETFINDER</div>
        <div style={{ color: 'var(--text2)', fontFamily: 'IBM Plex Mono', fontSize: '0.75rem' }}>Loading…</div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <div className="app">
      <Map courts={filtered} selectedCourt={selectedCourt} onSelectCourt={handleSelectCourt}
        userLocation={location} heatmapMode={heatmapMode} />

      {/* ── Header ── */}
      <header className="header">
        <div className="logo" onClick={handleLogoClick} title="Click 3x for heatmap">
          NET<span>FINDER</span>
        </div>
        {!loading && courts.length > 0 && (
          <div className="header-stats">
            <StatCounter target={courts.length} label="courts" colorClass="blue" duration={900} />
            <StatCounter target={openCount} label="open" colorClass="green" duration={1100} />
            <StatCounter target={totalCourts} label="total" duration={1000} />
            <StatCounter target={79} label="ML acc" colorClass="amber" suffix="%" duration={800} />
          </div>
        )}
        <div className="header-search">
          <span style={{ color: 'var(--text2)' }}>🔍</span>
          <input placeholder="Search courts…" value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
          {filters.search && (
            <button onClick={() => setFilters(f => ({ ...f, search: '' }))}
              style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>✕</button>
          )}
        </div>
        <UserMenu currentCheckin={currentCheckin} onViewProfile={() => setShowProfile(true)} onViewAdmin={() => setShowAdmin(true)} />
      </header>

      {/* ── Left Sidebar ── */}
      <div className={`sidebar${isMobile && sheetCollapsed ? ' sheet-collapsed' : ''}`}>
        {isMobile && (
          <div className="mobile-sheet-handle" onClick={() => setSheetCollapsed(c => !c)}>
            <div className="handle-bar" />
          </div>
        )}
        {isMobile && (
          <div className="mobile-filter-row">
            {['tennis', 'pickleball', 'both'].map(t => (
              <button key={t} className={`pill${filters.type === t ? ' active' : ''}`}
                onClick={() => setFilters(f => ({ ...f, type: f.type === t ? 'all' : t }))}>{t}</button>
            ))}
            <div style={{ width: 1, background: 'var(--border)', flexShrink: 0 }} />
            <button className={`pill${filters.free === 'true' ? ' active green' : ''}`}
              onClick={() => setFilters(f => ({ ...f, free: f.free === 'true' ? 'all' : 'true' }))}>Free</button>
            <button className={`pill${filters.free === 'false' ? ' active amber' : ''}`}
              onClick={() => setFilters(f => ({ ...f, free: f.free === 'false' ? 'all' : 'false' }))}>Paid</button>
            <div style={{ width: 1, background: 'var(--border)', flexShrink: 0 }} />
            {[{ v: 'open', c: 'green' }, { v: 'busy', c: 'amber' }, { v: 'full', c: 'red' }].map(({ v, c }) => (
              <button key={v} className={`pill${filters.availability === v ? ` active ${c}` : ''}`}
                onClick={() => setFilters(f => ({ ...f, availability: f.availability === v ? 'all' : v }))}>{v}</button>
            ))}
          </div>
        )}
        {!isMobile && <FilterPanel filters={filters} onChange={setFilters} />}

        {/* Check-in banner */}
        {currentCheckin && (
          <div style={{
            margin: '8px 12px 0', padding: '10px 14px',
            background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)',
            borderRadius: 10, flexShrink: 0,
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--green)', fontFamily: 'IBM Plex Mono', letterSpacing: 1 }}>⬤ YOU'RE CHECKED IN</div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginTop: 3 }}>{currentCheckin.court_name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: 1 }}>
              {currentCheckin.minutes_remaining} min remaining
            </div>
          </div>
        )}

        <div className="court-list">
          {error ? (
            <div className="no-results">
              <div style={{ color: 'var(--red)', marginBottom: 8 }}>⚠ {error}</div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={refetch}>Retry</button>
            </div>
          ) : loading ? (
            <div style={{ padding: 14 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{
                  height: 70, marginBottom: 8, borderRadius: 8, background: 'var(--bg3)',
                  opacity: Math.max(0.1, 0.6 - i * 0.07), animation: 'shimmer 1.2s ease infinite alternate',
                }} />
              ))}
            </div>
          ) : (
            <>
              <div className="court-count">
                {filtered.length} court{filtered.length !== 1 ? 's' : ''}
                {filters.search && <span style={{ color: 'var(--blue)' }}> · "{filters.search}"</span>}
              </div>
              {filtered.length === 0 && (
                <div className="no-results">
                  No courts match your filters.
                  <button className="btn btn-secondary" style={{ marginTop: 12, width: '100%' }}
                    onClick={() => setFilters(DEFAULT_FILTERS)}>Clear filters</button>
                </div>
              )}
              {filtered.map(court => (
                <CourtCard key={court.id} court={court}
                  selected={selectedCourt?.id === court.id}
                  onClick={() => handleSelectCourt(court)}
                  userLocation={location}
                  currentCheckin={currentCheckin}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── Map Controls ── */}
      <div className={`map-controls${selectedCourt && isMobile ? ' detail-open' : ''}`}>
        <button className="map-btn" title="My Location" onClick={locate}
          style={locLoading ? { borderColor: 'var(--blue)', color: 'var(--blue)' } : {}}>
          {locLoading ? '⌛' : '📍'}
        </button>
        <button className="map-btn" title="Heatmap mode" onClick={() => setHeatmapMode(m => !m)}
          style={heatmapMode ? { borderColor: 'var(--amber)', color: 'var(--amber)' } : {}}>🔥</button>
      </div>

      {/* ── Court Detail ── */}
      {selectedCourt && (
        <CourtDetail court={selectedCourt} onClose={() => setSelectedCourt(null)}
          onAvailUpdate={handleAvailUpdate} isMobile={isMobile}
          currentCheckin={currentCheckin}
          onCheckedIn={handleCheckedIn} onCheckedOut={handleCheckedOut} />
      )}

      <LiveFeed />

      {showProfile && <ProfilePage onClose={() => setShowProfile(false)} />}
      {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
    </div>
  );
}
