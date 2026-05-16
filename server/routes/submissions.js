import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getRecentSubmissions } from '../db.js';

const router = Router();

const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
router.use(limiter);

router.get('/recent', (req, res) => {
  res.json(getRecentSubmissions(20));
});

export default router;
