import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const { topic, fuel, search, sort } = req.query;
  
  let query = 'SELECT * FROM investigations WHERE 1=1';
  const params = [];
  
  if (topic && topic !== 'all') {
    query += ' AND topic = ?';
    params.push(topic);
  }
  
  if (fuel && fuel !== 'all') {
    query += ' AND LOWER(fuel_type) LIKE ?';
    params.push(`%${fuel.toLowerCase()}%`);
  }
  
  if (search) {
    const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
    terms.forEach(term => {
      query += ' AND (LOWER(name) LIKE ? OR LOWER(title) LIKE ? OR LOWER(summary) LIKE ? OR LOWER(objectives) LIKE ? OR LOWER(tags) LIKE ?)';
      const like = `%${term}%`;
      params.push(like, like, like, like, like);
    });
  }
  
  if (sort === 'relevance') {
    query += ' ORDER BY safety_relevance_score DESC, name ASC';
  } else if (sort === 'year') {
    query += ' ORDER BY year_start DESC, name ASC';
  } else {
    query += ' ORDER BY name ASC';
  }
  
  try {
    const investigations = db.prepare(query).all(...params);
    // Parse JSON fields
    const parsed = investigations.map(inv => ({
      ...inv,
      tags: inv.tags ? JSON.parse(inv.tags) : [],
      related_investigations: inv.related_investigations ? JSON.parse(inv.related_investigations) : [],
    }));
    res.json({ investigations: parsed, total: parsed.length });
  } catch (error) {
    console.error('Error fetching investigations:', error);
    res.status(500).json({ error: 'Failed to fetch investigations' });
  }
});

router.get('/stats', (req, res) => {
  const db = getDb();
  try {
    const byTopic = db.prepare('SELECT topic, COUNT(*) as count FROM investigations GROUP BY topic').all();
    const byFuel = db.prepare('SELECT fuel_type, COUNT(*) as count FROM investigations GROUP BY fuel_type').all();
    const byGravity = db.prepare('SELECT gravity_regime, COUNT(*) as count FROM investigations GROUP BY gravity_regime').all();
    const byHardware = db.prepare('SELECT hardware, COUNT(*) as count FROM investigations WHERE hardware IS NOT NULL GROUP BY hardware').all();
    const total = db.prepare('SELECT COUNT(*) as count FROM investigations').get();
    const dataPoints = db.prepare('SELECT COUNT(*) as count FROM experimental_data').get();
    
    res.json({
      total: total.count,
      dataPoints: dataPoints.count,
      byTopic,
      byFuel,
      byGravity,
      byHardware,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/compare', (req, res) => {
  const db = getDb();
  const ids = req.query.ids?.split(',').slice(0, 3) || [];
  
  if (ids.length < 2) {
    return res.status(400).json({ error: 'Provide at least 2 investigation IDs' });
  }
  
  try {
    const placeholders = ids.map(() => '?').join(',');
    const investigations = db.prepare(
      `SELECT * FROM investigations WHERE id IN (${placeholders})`
    ).all(...ids);
    
    const parsed = investigations.map(inv => ({
      ...inv,
      tags: inv.tags ? JSON.parse(inv.tags) : [],
      related_investigations: inv.related_investigations ? JSON.parse(inv.related_investigations) : [],
    }));
    
    // Build comparison matrix
    const fields = ['topic', 'fuel_type', 'hardware', 'facility', 'gravity_regime', 'conditions', 'measurements', 'limitations'];
    const comparison = fields.map(field => ({
      field,
      label: field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      values: parsed.map(inv => ({ id: inv.id, name: inv.name, value: inv[field] || 'N/A' })),
      allSame: new Set(parsed.map(inv => inv[field])).size === 1,
    }));
    
    res.json({ investigations: parsed, comparison });
  } catch (error) {
    console.error('Error comparing investigations:', error);
    res.status(500).json({ error: 'Failed to compare investigations' });
  }
});

router.get('/:id', (req, res) => {
  const db = getDb();
  try {
    const investigation = db.prepare('SELECT * FROM investigations WHERE id = ?').get(req.params.id);
    if (!investigation) {
      return res.status(404).json({ error: 'Investigation not found' });
    }
    
    const data = db.prepare('SELECT * FROM experimental_data WHERE investigation_id = ?').all(req.params.id);
    
    res.json({
      ...investigation,
      tags: investigation.tags ? JSON.parse(investigation.tags) : [],
      related_investigations: investigation.related_investigations ? JSON.parse(investigation.related_investigations) : [],
      experimentalData: data,
    });
  } catch (error) {
    console.error('Error fetching investigation:', error);
    res.status(500).json({ error: 'Failed to fetch investigation' });
  }
});

router.get('/:id/data', (req, res) => {
  const db = getDb();
  try {
    const data = db.prepare('SELECT * FROM experimental_data WHERE investigation_id = ?').all(req.params.id);
    res.json({ data, total: data.length });
  } catch (error) {
    console.error('Error fetching experimental data:', error);
    res.status(500).json({ error: 'Failed to fetch experimental data' });
  }
});

export default router;
