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

// API routes
app.use('/api/investigations', investigationsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/data', dataRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Ember Atlas API', version: '2.0.0' });
});

// Serve static files in production if dist exists
const distPath = join(__dirname, '..', 'dist');
app.use(express.static(distPath));

export default app;
