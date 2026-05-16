import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COURTS_SRC = join(__dirname, '../data/courts.json');
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let state = { courts: [], submissions: [], users: [], checkins: [] };

// ── Upstash Redis helpers ──
async function redisGet(key) {
  if (!REDIS_URL) return null;
  try {
    const r = await fetch(`${REDIS_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    });
    const j = await r.json();
    return j.result ?? null;
  } catch { return null; }
}

async function redisSet(key, value) {
  if (!REDIS_URL) return;
  try {
    await fetch(`${REDIS_URL}/set/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(value),
    });
  } catch {}
}

// Fire-and-forget — routes stay synchronous, no await needed anywhere
function save() {
  const persisted = {
    users: state.users,
    checkins: state.checkins,
    submissions: state.submissions,
    availability: Object.fromEntries(state.courts.map(c => [c.id, c.availability])),
  };
  redisSet('nf-db', JSON.stringify(persisted)).catch(() => {});
}

function computeFree(court) {
  const notes = (court.notes || '').toLowerCase();
  const paidKeywords = ['membership', 'private club', 'day pass', 'fee', 'pass required',
    'membership-based', 'member-focused', 'one-time fee', 'drop-in fee', 'donation'];
  if (paidKeywords.some(k => notes.includes(k))) return false;
  if (court.reservable && court.indoor) return false;
  return true;
}

// ── initDb is async — called once with await in index.js ──
export async function initDb() {
  // Always load court definitions fresh from courts.json
  const raw = JSON.parse(readFileSync(COURTS_SRC, 'utf8'));
  state.courts = raw.map(c => ({ ...c, free: computeFree(c) }));

  // Restore user data from Upstash
  const saved = await redisGet('nf-db');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state.users = parsed.users || [];
      state.checkins = parsed.checkins || [];
      state.submissions = parsed.submissions || [];
      // Restore availability overrides without overwriting court definitions
      if (parsed.availability) {
        state.courts = state.courts.map(c => ({
          ...c,
          availability: parsed.availability[c.id] ?? c.availability,
        }));
      }
      console.log(`DB loaded from Redis: ${state.users.length} users, ${state.checkins.length} checkins`);
    } catch {
      console.log('DB: Redis data corrupt, starting fresh');
    }
  } else {
    console.log(`DB seeded fresh: ${state.courts.length} courts`);
  }
}

// ── Courts ──
export function getCourts() { return state.courts; }
export function getCourt(id) { return state.courts.find(c => c.id === +id) ?? null; }
export function updateAvailability(id, status) {
  const court = state.courts.find(c => c.id === +id);
  if (court) { court.availability = status; save(); }
  return court;
}

// ── Users ──
export function createUser(user) {
  const record = { id: Date.now(), ...user, created_at: Math.floor(Date.now() / 1000) };
  state.users.push(record);
  save();
  return record;
}
export function findUserByEmail(email) {
  return state.users.find(u => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}
export function findUserById(id) {
  return state.users.find(u => u.id === +id) ?? null;
}

// ── Check-ins ──
export function createCheckin(checkin) {
  endUserCheckins(checkin.user_id);
  const record = {
    id: Date.now(),
    ...checkin,
    start_time: Math.floor(Date.now() / 1000),
    active: true,
  };
  state.checkins.push(record);
  if (state.checkins.length > 2000) state.checkins = state.checkins.slice(-2000);
  save();
  return record;
}
export function endUserCheckins(userId) {
  state.checkins = state.checkins.map(c =>
    c.user_id === userId && c.active ? { ...c, active: false } : c
  );
  save();
}
export function endCheckin(checkinId, userId) {
  const ci = state.checkins.find(c => c.id === +checkinId && c.user_id === userId);
  if (ci) { ci.active = false; save(); }
  return ci;
}
export function getActiveCheckins() {
  const now = Math.floor(Date.now() / 1000);
  return state.checkins.filter(c =>
    c.active && (c.start_time + c.duration_minutes * 60) > now
  );
}
export function getCourtActiveCheckins(courtId) {
  const now = Math.floor(Date.now() / 1000);
  return state.checkins.filter(c =>
    c.court_id === +courtId &&
    c.active &&
    (c.start_time + c.duration_minutes * 60) > now
  );
}
export function getUserActiveCheckin(userId) {
  const now = Math.floor(Date.now() / 1000);
  return state.checkins.find(c =>
    c.user_id === userId && c.active && (c.start_time + c.duration_minutes * 60) > now
  ) ?? null;
}
export function getUserCheckinHistory(userId, limit = 20) {
  return state.checkins
    .filter(c => c.user_id === userId)
    .slice(-limit)
    .reverse();
}

// ── Admin helpers ──
export function getAllUsers() { return state.users; }
export function getAllCheckins() { return state.checkins; }

// ── Submissions ──
export function addSubmission(sub) {
  const record = { id: Date.now(), ...sub, created_at: Math.floor(Date.now() / 1000) };
  state.submissions.unshift(record);
  if (state.submissions.length > 200) state.submissions = state.submissions.slice(0, 200);
  save();
  return record;
}
export function getRecentSubmissions(limit = 20) {
  const courtsMap = new Map(state.courts.map(c => [c.id, c.name]));
  return state.submissions.slice(0, limit).map(s => ({
    ...s,
    court_name: courtsMap.get(s.court_id) ?? 'Unknown Court',
  }));
}
