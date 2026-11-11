import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/export/:investigationId', (req, res) => {
  const db = getDb();
  try {
    const data = db.prepare(
      'SELECT * FROM experimental_data WHERE investigation_id = ?'
    ).all(req.params.investigationId);
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'No data found for this investigation' });
    }
    
    const fields = Object.keys(data[0]);
    const csvRows = [
      fields.join(','),
      ...data.map(row =>
        fields.map(f => {
          const val = row[f];
          if (val == null) return '';
          return typeof val === 'string' && (val.includes(',') || val.includes('"'))
            ? `"${val.replace(/"/g, '""')}"`
            : val;
        }).join(',')
      ),
    ];
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${req.params.investigationId}-data.csv`);
    res.send(csvRows.join('\r\n'));
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

router.get('/export/:investigationId/json', (req, res) => {
  const db = getDb();
  try {
    const investigation = db.prepare(
      'SELECT * FROM investigations WHERE id = ?'
    ).get(req.params.investigationId);
    const data = db.prepare(
      'SELECT * FROM experimental_data WHERE investigation_id = ?'
    ).all(req.params.investigationId);
    
    res.json({
      investigation: investigation || null,
      data,
      exportedAt: new Date().toISOString(),
      source: 'Ember Atlas — NASA PSI Research Dashboard',
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

router.post('/import', (req, res) => {
  const db = getDb();
  try {
    const { investigationId, csvText } = req.body;
    
    if (!investigationId || !csvText) {
      return res.status(400).json({ error: 'investigationId and csvText are required' });
    }

    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      return res.status(400).json({ error: 'CSV must contain at least a header and one data row' });
    }

    // Parse CSV headers
    const parseLine = (text) => {
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"') {
          inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
          result.push(cur.trim().replace(/^"|"$/g, ''));
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.toLowerCase());
    const findIndex = (...names) => {
      for (const name of names) {
        const idx = headers.findIndex(h => h.includes(name.toLowerCase()));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const idIdx = findIndex('test', 'run', 'sample id', 'id');
    const fuelIdx = findIndex('fuel', 'material');
    const pressIdx = findIndex('pressure', 'press', 'mmhg', 'atm');
    const o2Idx = findIndex('o2', 'oxygen', 'mole fraction', 'concentration');
    const initDiamIdx = findIndex('initial diameter', 'init diam', 'd0', 'initial');
    const extDiamIdx = findIndex('extinction diameter', 'ext diam', 'd_ext', 'extinction');
    const burnTimeIdx = findIndex('burn time', 'duration', 'time', 'burntime');
    const spreadRateIdx = findIndex('spread', 'flame spread', 'rate');
    const flowIdx = findIndex('flow', 'velocity');
    const endIdx = findIndex('test end', 'ending', 'result', 'status');
    const notesIdx = findIndex('note', 'comment', 'observation');

    const insertStmt = db.prepare(`
      INSERT INTO experimental_data (
        investigation_id, test_id, fuel, pressure_mmhg, oxygen_mole_fraction,
        initial_diameter_mm, extinction_diameter_mm, burn_time_s, flame_spread_rate,
        flow_velocity, test_end, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let importedCount = 0;
    for (let i = 1; i < lines.length; i++) {
      const row = parseLine(lines[i]);
      if (row.length === 0 || (row.length === 1 && !row[0])) continue;

      const toNum = (val) => {
        if (!val || val === '—' || val === '-') return null;
        const n = parseFloat(val);
        return isNaN(n) ? null : n;
      };

      insertStmt.run(
        investigationId,
        idIdx !== -1 ? row[idIdx] : `TEST-${i}`,
        fuelIdx !== -1 ? row[fuelIdx] : null,
        pressIdx !== -1 ? toNum(row[pressIdx]) : null,
        o2Idx !== -1 ? toNum(row[o2Idx]) : null,
        initDiamIdx !== -1 ? toNum(row[initDiamIdx]) : null,
        extDiamIdx !== -1 ? toNum(row[extDiamIdx]) : null,
        burnTimeIdx !== -1 ? toNum(row[burnTimeIdx]) : null,
        spreadRateIdx !== -1 ? toNum(row[spreadRateIdx]) : null,
        flowIdx !== -1 ? toNum(row[flowIdx]) : null,
        endIdx !== -1 ? row[endIdx] : 'Completed',
        notesIdx !== -1 ? row[notesIdx] : 'Imported from user PSI dataset'
      );
      importedCount++;
    }

    res.json({
      success: true,
      importedCount,
      investigationId,
      message: `Successfully imported ${importedCount} records for ${investigationId}`
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import data: ' + error.message });
  }
});

export default router;

// Ingestion endpoint validation: verified CSV header streams
