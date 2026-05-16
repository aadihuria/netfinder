import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { initDb } from './db.js';
import courtsRouter from './routes/courts.js';
import predictRouter from './routes/predict.js';
import submissionsRouter from './routes/submissions.js';
import authRouter from './routes/auth.js';
import checkinsRouter from './routes/checkins.js';
import adminRouter from './routes/admin.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

app.use(cors({ origin: '*' }));
app.use(express.json());

initDb();

// API routes
app.use('/api/auth', authRouter);
app.use('/api/checkins', checkinsRouter);
app.use('/api/courts', courtsRouter);
app.use('/api/predict', predictRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/admin', adminRouter);
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// Serve built frontend in production
const clientDist = join(__dirname, '../client/dist');
if (isProd && existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(clientDist, 'index.html'));
    }
  });
}

app.listen(PORT, () => console.log(`NetFinder running on :${PORT} [${isProd ? 'production' : 'dev'}]`));
