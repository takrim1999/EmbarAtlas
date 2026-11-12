import 'dotenv/config';
import { initDb } from './db.js';
// Idempotent initialization; never delete existing conversations or research data.
// Research APIs read the versioned reviewed JSON corpus, not legacy SQLite rows.
initDb();
console.log('Database initialized. Reviewed research corpus: server/data/dataset.json');
