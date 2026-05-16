export function haversine(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getBestTimes(predictions) {
  const threshold = 0.65;
  const good = predictions.filter(p => p.predicted_busyness < threshold && p.hour >= 6);
  const groups = [];
  let start = null;
  for (let i = 0; i < good.length; i++) {
    const h = good[i].hour;
    if (start === null) { start = h; }
    else if (good[i - 1] && h !== good[i - 1].hour + 1) {
      groups.push([start, good[i - 1].hour]);
      start = h;
    }
  }
  if (start !== null && good.length) groups.push([start, good[good.length - 1].hour]);
  return groups.slice(0, 3).map(([s, e]) => `${fmt(s)}–${fmt(e + 1)}`);
}

function fmt(h) {
  if (h === 0 || h === 24) return '12am';
  if (h === 12) return '12pm';
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}
