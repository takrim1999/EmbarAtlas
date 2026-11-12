import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import investigationsRouter from './routes/investigations.js';
import aiRouter from './routes/ai.js';
import { catalog } from './catalog.js';
import dataRouter from './routes/data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.use((req, res, next) => { res.setHeader('X-Content-Type-Options', 'nosniff'); next(); });

// API routes (support both /nasa/api and root /api)
app.use(['/nasa/api/investigations', '/api/investigations'], investigationsRouter);
app.use(['/nasa/api/ai', '/api/ai'], aiRouter);
app.use(['/nasa/api/data', '/api/data'], dataRouter);

// Health check endpoint
app.get(['/nasa/api/health', '/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', service: 'Ember Atlas API', version: '2.1.0', catalogVersion: catalog.version, base: '/nasa' });
});

// Serve static files in production if dist exists
const distPath = join(__dirname, '..', 'dist');
app.use('/nasa', express.static(distPath));
app.use(express.static(distPath));

app.use(['/nasa/api', '/api'], (req, res) => res.status(404).json({ error: 'API route not found.' }));
app.use((err, req, res, next) => {
  res.status(err.type === 'entity.too.large' ? 413 : 400).json({ error: 'Invalid or oversized request.' });
});

export default app;
