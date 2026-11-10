import app from '../server/app.js';
import { initDb } from '../server/db.js';

// Initialize database (or in-memory fallback on Vercel)
initDb();

export default app;
