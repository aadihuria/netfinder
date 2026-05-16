import React from 'react';

const MILES = [1, 3, 5, 10, 25, 99];

export default function FilterPanel({ filters, onChange }) {
  function set(key, val) { onChange({ ...filters, [key]: val }); }

  function Pill({ label, value, field, colorClass }) {
    const active = filters[field] === value;
    return (
      <button
        className={`pill${active ? ` active${colorClass ? ' ' + colorClass : ''}` : ''}`}
        onClick={() => set(field, active ? 'all' : value)}
      >{label}</button>
    );
  }

  return (
    <div className="filter-panel">
      <div>
        <div className="filter-section-label">Court Type</div>
        <div className="filter-row">
          <Pill label="Tennis" value="tennis" field="type" />
          <Pill label="Pickleball" value="pickleball" field="type" />
          <Pill label="Both" value="both" field="type" />
        </div>
      </div>

      <div>
        <div className="filter-section-label">Cost</div>
        <div className="filter-row">
          <button
            className={`pill${filters.free === 'true' ? ' active green' : ''}`}
            onClick={() => set('free', filters.free === 'true' ? 'all' : 'true')}
          >✓ Free</button>
          <button
            className={`pill${filters.free === 'false' ? ' active amber' : ''}`}
            onClick={() => set('free', filters.free === 'false' ? 'all' : 'false')}
          >$ Pay to Play</button>
        </div>
      </div>

      <div>
        <div className="filter-section-label">Surface</div>
        <div className="filter-row">
          <Pill label="Hard" value="hard" field="surface" />
          <Pill label="Clay" value="clay" field="surface" />
          <Pill label="Grass" value="grass" field="surface" />
        </div>
      </div>

      <div>
        <div className="filter-section-label">Facility</div>
        <div className="filter-row">
          <Pill label="⚡ Lights" value="yes" field="lights" />
          <Pill label="Indoor" value="indoor" field="indoor" />
          <Pill label="Outdoor" value="outdoor" field="indoor" />
        </div>
      </div>

      <div>
        <div className="filter-section-label">Availability</div>
        <div className="filter-row">
          <Pill label="Open" value="open" field="availability" colorClass="green" />
          <Pill label="Busy" value="busy" field="availability" colorClass="amber" />
          <Pill label="Full" value="full" field="availability" colorClass="red" />
        </div>
      </div>

      <div>
        <div className="filter-section-label">
          Distance: {filters.maxMiles >= 99 ? 'Any' : `≤ ${filters.maxMiles} mi`}
        </div>
        <div className="range-row">
          <input
            type="range" min={0} max={MILES.length - 1}
            value={MILES.indexOf(filters.maxMiles) === -1 ? MILES.length - 1 : MILES.indexOf(filters.maxMiles)}
            onChange={e => set('maxMiles', MILES[+e.target.value])}
          />
          <span className="range-val">{filters.maxMiles >= 99 ? '∞' : `${filters.maxMiles}mi`}</span>
        </div>
      </div>

      <div>
        <div className="filter-section-label">Sort By</div>
        <div className="filter-row">
          {['distance', 'availability', 'name'].map(s => (
            <Pill key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} value={s} field="sort" />
          ))}
        </div>
      </div>
    </div>
  );
}
