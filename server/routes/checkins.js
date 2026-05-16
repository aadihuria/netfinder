import { Router } from 'express';
import {
  createCheckin, endUserCheckins, endCheckin,
  getActiveCheckins, getCourtActiveCheckins,
  getUserActiveCheckin, getUserCheckinHistory,
  getCourt, findUserById
} from '../db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

function enrichCheckin(ci) {
  const now = Math.floor(Date.now() / 1000);
  const elapsed = now - ci.start_time;
  const remaining = ci.duration_minutes * 60 - elapsed;
  const user = findUserById(ci.user_id);
  return {
    ...ci,
    user_name: user?.name ?? 'Someone',
    minutes_remaining: Math.max(0, Math.floor(remaining / 60)),
    minutes_elapsed: Math.floor(elapsed / 60),
    is_expired: remaining <= 0,
  };
}

// All active check-ins across all courts
router.get('/active', (req, res) => {
  res.json(getActiveCheckins().map(enrichCheckin));
});

// My current check-in
router.get('/mine', requireAuth, (req, res) => {
  const ci = getUserActiveCheckin(req.user.id);
  if (!ci) return res.json(null);
  const court = getCourt(ci.court_id);
  res.json({ ...enrichCheckin(ci), court_name: court?.name, court_address: court?.address });
});

// My check-in history
router.get('/history', requireAuth, (req, res) => {
  const history = getUserCheckinHistory(req.user.id).map(ci => {
    const court = getCourt(ci.court_id);
    return { ...enrichCheckin(ci), court_name: court?.name ?? 'Unknown' };
  });
  res.json(history);
});

// Check in to a court
router.post('/', requireAuth, (req, res) => {
  const { court_id, duration_minutes } = req.body;
  if (!court_id || !duration_minutes)
    return res.status(400).json({ error: 'court_id and duration_minutes required' });
  const duration = Math.min(Math.max(+duration_minutes, 15), 240);
  const court = getCourt(court_id);
  if (!court) return res.status(404).json({ error: 'Court not found' });

  const ci = createCheckin({ court_id: +court_id, user_id: req.user.id, duration_minutes: duration });
  res.status(201).json({ ...enrichCheckin(ci), court_name: court.name });
});

// Check out (end current check-in)
router.delete('/mine', requireAuth, (req, res) => {
  endUserCheckins(req.user.id);
  res.json({ success: true });
});

// Active check-ins at a specific court
router.get('/court/:courtId', optionalAuth, (req, res) => {
  const cis = getCourtActiveCheckins(req.params.courtId).map(enrichCheckin);
  res.json(cis);
});

export default router;
