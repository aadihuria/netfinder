import { Router } from 'express';
import { getCourts, getCourt, updateAvailability, addSubmission, getCourtActiveCheckins } from '../db.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

function buildPeakPrediction(court) {
  const predictions = [];
  const base = court.indoor ? 0.4 : 0.3;
  const lightsBonus = court.lights ? 0.15 : 0;
  for (let h = 0; h < 24; h++) {
    let b = base;
    if (h >= 6 && h <= 9) b += 0.35;
    else if (h >= 11 && h <= 14) b += 0.25;
    else if (h >= 17 && h <= 20) b += 0.45 + lightsBonus;
    else if (h >= 21 || h < 6) b -= 0.2;
    b = Math.max(0, Math.min(1, b + (Math.random() * 0.08 - 0.04)));
    predictions.push({ hour: h, predicted_busyness: parseFloat(b.toFixed(2)) });
  }
  return predictions;
}

function hydrate(court, includeCheckins = false) {
  const checkins = includeCheckins ? getCourtActiveCheckins(court.id) : [];
  return {
    ...court,
    peak_prediction: buildPeakPrediction(court),
    active_checkins: checkins.length,
  };
}

router.get('/', optionalAuth, (req, res) => {
  const { type, surface, lights, indoor, availability, sort, free } = req.query;
  let courts = getCourts();

  if (type && type !== 'all') courts = courts.filter(c => c.type === type);
  if (surface && surface !== 'all') courts = courts.filter(c => c.surface === surface);
  if (lights === 'true') courts = courts.filter(c => c.lights);
  if (lights === 'false') courts = courts.filter(c => !c.lights);
  if (indoor === 'true') courts = courts.filter(c => c.indoor);
  if (indoor === 'false') courts = courts.filter(c => !c.indoor);
  if (availability && availability !== 'all') courts = courts.filter(c => c.availability === availability);
  if (free === 'true') courts = courts.filter(c => c.free === true);
  if (free === 'false') courts = courts.filter(c => c.free === false);

  if (sort === 'name') courts.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'availability') {
    const ord = { open: 0, busy: 1, full: 2 };
    courts.sort((a, b) => (ord[a.availability] ?? 9) - (ord[b.availability] ?? 9));
  }

  res.json(courts.map(c => hydrate(c)));
});

router.get('/:id', optionalAuth, (req, res) => {
  const court = getCourt(req.params.id);
  if (!court) return res.status(404).json({ error: 'Court not found' });
  res.json(hydrate(court, true));
});

router.get('/:id/predict', (req, res) => {
  const court = getCourt(req.params.id);
  if (!court) return res.status(404).json({ error: 'Court not found' });
  res.json({ court_id: court.id, predictions: buildPeakPrediction(court) });
});

router.post('/:id/report', (req, res) => {
  const { status, reporter_name } = req.body;
  if (!['open', 'busy', 'full'].includes(status))
    return res.status(400).json({ error: 'Invalid status' });
  const court = getCourt(req.params.id);
  if (!court) return res.status(404).json({ error: 'Court not found' });
  updateAvailability(court.id, status);
  addSubmission({ court_id: court.id, status, reporter_name: reporter_name || 'Anonymous' });
  res.json({ success: true, court_id: court.id, status });
});

export default router;
