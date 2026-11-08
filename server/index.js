import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import app from './app.js';
import { initDb } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

// Initialize database
initDb();

// SPA catch-all fallback for client-side routing
app.use((req, res) => {
  res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🔥 Ember Atlas server running on port ${PORT}`);
});
