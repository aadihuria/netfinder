import { Router } from 'express';
import { createHash, randomBytes, pbkdf2Sync } from 'crypto';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, findUserById } from '../db.js';
import { JWT_SECRET, requireAuth } from '../middleware/auth.js';

const router = Router();

function hashPassword(password, salt) {
  return pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function safeUser(u) {
  const { password_hash, salt, ...safe } = u;
  return safe;
}

router.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password)
    return res.status(400).json({ error: 'Email, name, and password are required' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (findUserByEmail(email))
    return res.status(409).json({ error: 'An account with that email already exists' });

  const salt = randomBytes(32).toString('hex');
  const password_hash = hashPassword(password, salt);
  const user = createUser({ email: email.toLowerCase().trim(), name: name.trim(), password_hash, salt });

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
  res.status(201).json({ token, user: safeUser(user) });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  const user = findUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'No account found with that email' });

  const hash = hashPassword(password, user.salt);
  if (hash !== user.password_hash)
    return res.status(401).json({ error: 'Incorrect password' });

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: safeUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(safeUser(user));
});

export default router;
