import React from 'react';

const COLOR = { open: '#00ff88', busy: '#ffb800', full: '#ff3b5c' };
const AVAIL_THRESHOLDS = { open: 0.4, busy: 0.75 };

function barColor(val) {
  if (val < AVAIL_THRESHOLDS.open) return COLOR.open;
  if (val < AVAIL_THRESHOLDS.busy) return COLOR.busy;
  return COLOR.red;
}

const DISPLAY_HOURS = [0, 6, 9, 12, 15, 18, 21, 23];
function fmt(h) {
  if (h === 0) return '12a';
  if (h === 12) return '12p';
  return h < 12 ? `${h}a` : `${h - 12}p`;
}

export default function BusynessChart({ predictions }) {
  if (!predictions?.length) return null;
  const currentHour = new Date().getHours();
  const max = Math.max(...predictions.map(p => p.predicted_busyness), 0.01);

  return (
    <div className="chart-wrap">
      <div className="hour-bars">
        {predictions.map(p => (
          <div key={p.hour} className="hour-bar-col">
            <div
              className={`hour-bar${p.hour === currentHour ? ' current' : ''}`}
              style={{
                height: `${(p.predicted_busyness / max) * 60}px`,
                background: barColor(p.predicted_busyness),
                opacity: p.hour === currentHour ? 1 : 0.65,
              }}
              title={`${fmt(p.hour)}: ${Math.round(p.predicted_busyness * 100)}%`}
            />
          </div>
        ))}
      </div>
      <div className="hour-labels">
        {predictions.map(p => (
          <div key={p.hour} className="hour-label">
            {DISPLAY_HOURS.includes(p.hour) ? fmt(p.hour) : ''}
          </div>
        ))}
      </div>
    </div>
  );
}
