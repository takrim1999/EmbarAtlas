import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

let Database;
try {
  Database = (await import('better-sqlite3')).default;
} catch (e) {
  Database = null;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'ember-atlas.db');
const DATASET_PATH = join(__dirname, 'data', 'dataset.json');

let db = null;
let isFallback = false;
let fallbackData = null;

function loadFallbackData() {
  if (!fallbackData) {
    try {
      const raw = fs.readFileSync(DATASET_PATH, 'utf-8');
      fallbackData = JSON.parse(raw);
    } catch (err) {
      console.warn('⚠️ Could not load dataset.json, initializing empty dataset');
      fallbackData = { investigations: [], experimental_data: [], ai_conversations: [] };
    }
  }
  return fallbackData;
}

// Lightweight in-memory database mock for serverless environments (Vercel)
function createFallbackDb() {
  const data = loadFallbackData();
  if (!data.ai_conversations) data.ai_conversations = [];

  return {
    pragma: () => {},
    exec: () => {},
    prepare: (sql) => {
      const lower = sql.toLowerCase().trim();
      return {
        all: (...params) => {
          if (lower.includes('from investigations')) {
            let res = [...data.investigations];
            // Filter by topic
            if (lower.includes('topic = ?')) {
              const topic = params[0];
              res = res.filter(i => i.topic === topic);
            }
            // Filter by fuel
            if (lower.includes('lower(fuel_type) like ?')) {
              const param = params[params.length - 1];
              const term = String(param).replace(/%/g, '').toLowerCase();
              res = res.filter(i => (i.fuel_type || '').toLowerCase().includes(term));
            }
            // ID in placeholders
            if (lower.includes('id in (')) {
              res = res.filter(i => params.includes(i.id));
            }
            // Single ID
            if (lower.includes('where id = ?')) {
              res = res.filter(i => i.id === params[0]);
            }
            // Search matching
            if (lower.includes('like ?') && params.length >= 5) {
              const term = String(params[0]).replace(/%/g, '').toLowerCase();
              res = res.filter(i => 
                (i.name || '').toLowerCase().includes(term) ||
                (i.title || '').toLowerCase().includes(term) ||
                (i.summary || '').toLowerCase().includes(term) ||
                (i.objectives || '').toLowerCase().includes(term) ||
                (JSON.stringify(i.tags || '')).toLowerCase().includes(term)
              );
            }
            // Topic grouping for stats
            if (lower.includes('group by topic')) {
              const counts = {};
              data.investigations.forEach(i => { counts[i.topic] = (counts[i.topic] || 0) + 1; });
              return Object.entries(counts).map(([topic, count]) => ({ topic, count }));
            }
            // Fuel grouping for stats
            if (lower.includes('group by fuel_type')) {
              const counts = {};
              data.investigations.forEach(i => { counts[i.fuel_type] = (counts[i.fuel_type] || 0) + 1; });
              return Object.entries(counts).map(([fuel_type, count]) => ({ fuel_type, count }));
            }
            // Gravity grouping for stats
            if (lower.includes('group by gravity_regime')) {
              const counts = {};
              data.investigations.forEach(i => { counts[i.gravity_regime] = (counts[i.gravity_regime] || 0) + 1; });
              return Object.entries(counts).map(([gravity_regime, count]) => ({ gravity_regime, count }));
            }
            // Hardware grouping for stats
            if (lower.includes('group by hardware')) {
              const counts = {};
              data.investigations.filter(i => i.hardware).forEach(i => { counts[i.hardware] = (counts[i.hardware] || 0) + 1; });
              return Object.entries(counts).map(([hardware, count]) => ({ hardware, count }));
            }
            return res;
          }

          if (lower.includes('from experimental_data')) {
            let res = [...data.experimental_data];
            if (lower.includes('investigation_id = ?')) {
              res = res.filter(d => d.investigation_id === params[0]);
            }
            return res;
          }

          if (lower.includes('from ai_conversations')) {
            let res = [...data.ai_conversations];
            if (lower.includes('session_id = ?')) {
              res = res.filter(c => c.session_id === params[0]);
            }
            return res;
          }

          return [];
        },
        get: (...params) => {
          if (lower.includes('count(*) as count from investigations')) {
            return { count: data.investigations.length };
          }
          if (lower.includes('count(*) as count from experimental_data')) {
            return { count: data.experimental_data.length };
          }
          if (lower.includes('from investigations where id = ?')) {
            return data.investigations.find(i => i.id === params[0]) || null;
          }
          if (lower.includes('select id from investigations where id = ?')) {
            const found = data.investigations.find(i => i.id === params[0]);
            return found ? { id: found.id } : null;
          }
          return null;
        },
        run: (...params) => {
          if (lower.includes('insert into ai_conversations')) {
            const [session_id, role, content, sources] = params;
            data.ai_conversations.push({
              id: data.ai_conversations.length + 1,
              session_id,
              role,
              content,
              sources,
              created_at: new Date().toISOString()
            });
            return { changes: 1 };
          }
          return { changes: 0 };
        }
      };
    }
  };
}

export function getDb() {
  if (!db) {
    if (Database) {
      try {
        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
      } catch (err) {
        console.warn('⚡ Using zero-dependency in-memory dataset adapter (serverless/read-only mode)');
        db = createFallbackDb();
        isFallback = true;
      }
    } else {
      console.warn('⚡ Using zero-dependency in-memory dataset adapter (better-sqlite3 not available)');
      db = createFallbackDb();
      isFallback = true;
    }
  }
  return db;
}

// Top-level initialization with graceful try-catch
export function initDb() {
  try {
    const database = getDb();
    if (!isFallback) {
      database.exec(`
        CREATE TABLE IF NOT EXISTS investigations (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          title TEXT NOT NULL,
          topic TEXT NOT NULL CHECK(topic IN ('prevention','detection','suppression','combustion_science')),
          fuel_type TEXT NOT NULL,
          summary TEXT NOT NULL,
          objectives TEXT,
          approach TEXT,
          relevance TEXT,
          conditions TEXT,
          measurements TEXT,
          limitations TEXT,
          hardware TEXT,
          facility TEXT,
          url TEXT,
          doi TEXT,
          source_section TEXT,
          license TEXT DEFAULT 'CC0-1.0',
          year_start INTEGER,
          year_end INTEGER,
          gravity_regime TEXT DEFAULT 'microgravity',
          safety_relevance_score REAL DEFAULT 0,
          tags TEXT,
          related_investigations TEXT,
          earthApplications TEXT
        );

        CREATE TABLE IF NOT EXISTS experimental_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          investigation_id TEXT NOT NULL REFERENCES investigations(id),
          test_id TEXT,
          fuel TEXT,
          pressure_mmhg REAL,
          oxygen_mole_fraction REAL,
          initial_diameter_mm REAL,
          extinction_diameter_mm REAL,
          burn_time_s REAL,
          flame_spread_rate REAL,
          flow_velocity REAL,
          sample_material TEXT,
          sample_geometry TEXT,
          temperature_c REAL,
          test_end TEXT,
          notes TEXT
        );

        CREATE TABLE IF NOT EXISTS ai_conversations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('user','assistant')),
          content TEXT NOT NULL,
          sources TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_investigations_topic ON investigations(topic);
        CREATE INDEX IF NOT EXISTS idx_investigations_fuel ON investigations(fuel_type);
        CREATE INDEX IF NOT EXISTS idx_experimental_data_investigation ON experimental_data(investigation_id);
        CREATE INDEX IF NOT EXISTS idx_ai_conversations_session ON ai_conversations(session_id);
      `);
      console.log('📦 SQLite database initialized');
    } else {
      console.log('📦 In-memory dataset initialized');
    }
  } catch (err) {
    console.warn('⚠️ Fallback to in-memory dataset due to initialization error:', err.message);
    db = createFallbackDb();
    isFallback = true;
  }
}
