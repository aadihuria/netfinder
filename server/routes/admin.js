import { Router } from 'express';
import { getCourts, getActiveCheckins, getRecentSubmissions, getAllUsers, getAllCheckins } from '../db.js';

const router = Router();
export const ADMIN_KEY = process.env.ADMIN_KEY || 'netfinder-admin-2026';

function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.key;
  if (key !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

router.use(requireAdmin);

router.get('/stats', (req, res) => {
  const now = Math.floor(Date.now() / 1000);
  const users = getAllUsers();
  const checkins = getAllCheckins();
  const courts = getCourts();
  const activeCheckins = getActiveCheckins();

  res.json({
    total_users: users.length,
    active_checkins: activeCheckins.length,
    total_checkins_ever: checkins.length,
    total_courts: courts.length,
    open_courts: courts.filter(c => c.availability === 'open').length,
    signups_last_24h: users.filter(u => u.created_at > now - 86400).length,
    checkins_last_24h: checkins.filter(c => c.start_time > now - 86400).length,
  });
});

router.get('/users', (req, res) => {
  const users = getAllUsers()
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, 100)
    .map(({ password_hash, salt, ...u }) => u);
  res.json(users);
});

router.get('/checkins', (req, res) => {
  const courts = new Map(getCourts().map(c => [c.id, c.name]));
  const now = Math.floor(Date.now() / 1000);
  const checkins = getAllCheckins()
    .sort((a, b) => b.start_time - a.start_time)
    .slice(0, 200)
    .map(c => ({
      ...c,
      court_name: courts.get(c.court_id) ?? 'Unknown',
      is_active: c.active && (c.start_time + c.duration_minutes * 60) > now,
      minutes_remaining: Math.max(0, Math.floor((c.start_time + c.duration_minutes * 60 - now) / 60)),
    }));
  res.json(checkins);
});

router.get('/submissions', (req, res) => {
  res.json(getRecentSubmissions(50));
});

export default router;
