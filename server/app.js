import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import investigationsRouter from './routes/investigations.js';
import aiRouter from './routes/ai.js';
import dataRouter from './routes/data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

// API routes (support both /nasa/api and root /api)
app.use(['/nasa/api/investigations', '/api/investigations'], investigationsRouter);
app.use(['/nasa/api/ai', '/api/ai'], aiRouter);
app.use(['/nasa/api/data', '/api/data'], dataRouter);

// Health check endpoint
app.get(['/nasa/api/health', '/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', service: 'Ember Atlas API', version: '2.0.0', base: '/nasa' });
});

// Serve static files in production if dist exists
const distPath = join(__dirname, '..', 'dist');
app.use('/nasa', express.static(distPath));
app.use(express.static(distPath));

export default app;
