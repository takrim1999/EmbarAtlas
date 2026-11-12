import { Router } from 'express';
import { catalog, dataFor, findInvestigation } from '../catalog.js';
const router = Router();
// Public research data is intentionally read-only. Future imports require a
// separate authenticated review workflow, units validation, and provenance.
router.post('/import', (req, res) => res.status(403).json({ error: 'The reviewed research catalog is read-only. Public imports are disabled.' }));
export function csvCell(value) {
  let text = value == null ? '' : String(value);
  if (typeof value === 'string' && /^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
router.get('/export/:id/json', (req, res) => {
  const inv = findInvestigation(req.params.id);
  if (!inv) return res.status(404).json({ error: 'Investigation not found.' });
  res.setHeader('Content-Disposition', `attachment; filename=${inv.id}-evidence.json`);
  res.json({ investigation: inv, data: dataFor(inv.id), catalogVersion: catalog.version,
    source: 'Ember Atlas: curated NASA metadata and a five-row source-checked FLEX sample', exportedAt: new Date().toISOString() });
});
router.get('/export/:id', (req, res) => {
  if (!findInvestigation(req.params.id)) return res.status(404).json({ error: 'Investigation not found.' });
  const data = dataFor(req.params.id);
  if (!data.length) return res.status(404).json({ error: 'No source-checked measurements imported for this investigation.' });
  const fields = Object.keys(data[0]);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=${req.params.id}-data.csv`);
  res.send([fields.map(csvCell).join(','), ...data.map(row => fields.map(field => csvCell(row[field])).join(','))].join('\r\n'));
});
export default router;
