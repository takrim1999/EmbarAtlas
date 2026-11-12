import { Router } from 'express';
import { catalog, investigations, measurements, searchInvestigations, groupBy, findInvestigation, dataFor } from '../catalog.js';
const router = Router();
router.get('/', (req, res) => {
  if (Object.values(req.query).some(value => typeof value !== 'string')) return res.status(400).json({ error: 'Filters must be strings.' });
  const results = searchInvestigations(req.query).map(inv => ({
    ...inv,
    experimentalRunCount: dataFor(inv.id).length
  }));
  res.json({ investigations: results, total: results.length, catalogVersion: catalog.version });
});
router.get('/stats', (req, res) => res.json({
  total: investigations.length, dataPoints: measurements.length,
  byTopic: groupBy('topic'), byFuel: groupBy('fuel_type'), byGravity: groupBy('gravity_regime'), byHardware: groupBy('hardware'),
  catalogVersion: catalog.version, scope: catalog.scope,
}));
router.get('/compare', (req, res) => {
  const ids = typeof req.query.ids === 'string' ? [...new Set(req.query.ids.split(',').filter(Boolean))] : [];
  if (ids.length < 2 || ids.length > 3) return res.status(400).json({ error: 'Provide 2 or 3 distinct investigation IDs.' });
  const selected = ids.map(findInvestigation);
  if (selected.some(inv => !inv)) return res.status(404).json({ error: 'Investigation not found.' });
  const fields = ['topic', 'fuel_type', 'hardware', 'facility', 'gravity_regime', 'conditions', 'measurements', 'limitations', 'evidence_status', 'source_section'];
  const comparison = fields.map(field => ({ field, label: field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    values: selected.map(inv => ({ id: inv.id, name: inv.name, value: inv[field] || 'Not reviewed' })),
    allSame: new Set(selected.map(inv => inv[field])).size === 1,
  }));
  res.json({ investigations: selected, comparison });
});
router.get('/:id/data', (req, res) => {
  if (!findInvestigation(req.params.id)) return res.status(404).json({ error: 'Investigation not found.' });
  const data = dataFor(req.params.id);
  res.json({ data, total: data.length });
});
router.get('/:id', (req, res) => {
  const inv = findInvestigation(req.params.id);
  if (!inv) return res.status(404).json({ error: 'Investigation not found.' });
  res.json({ ...inv, experimentalData: dataFor(inv.id) });
});
export default router;
