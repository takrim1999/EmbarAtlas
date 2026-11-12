import fs from 'node:fs';

// The reviewed, versioned corpus is authoritative. Legacy SQLite seed rows are
// deliberately excluded, including on deployments with an existing database.
export const catalog = JSON.parse(fs.readFileSync(new URL('./data/dataset.json', import.meta.url), 'utf8'));
export const investigations = catalog.investigations;
export const measurements = catalog.experimental_data;
export const findInvestigation = id => investigations.find(inv => inv.id === id);
export const dataFor = id => measurements.filter(row => row.investigation_id === id);
export function searchInvestigations({ topic, fuel, search, sort } = {}) {
  const terms = String(search || '').toLowerCase().split(/\s+/).filter(Boolean);
  return investigations.filter(inv => {
    const text = [inv.id, inv.name, inv.title, inv.summary, inv.objectives, inv.hardware, inv.conditions, ...inv.tags].join(' ').toLowerCase();
    return (!topic || topic === 'all' || inv.topic === topic) &&
      (!fuel || fuel === 'all' || inv.fuel_type.toLowerCase().includes(fuel.toLowerCase())) &&
      terms.every(term => text.includes(term));
  }).sort((a, b) => (sort === 'relevance' ? b.safety_relevance_score - a.safety_relevance_score :
    sort === 'year' ? (b.year_start || 0) - (a.year_start || 0) : 0) || a.name.localeCompare(b.name));
}
export function groupBy(field) {
  const counts = new Map();
  for (const inv of investigations) if (inv[field]) counts.set(inv[field], (counts.get(inv[field]) || 0) + 1);
  return [...counts].map(([value, count]) => ({ [field]: value, count }));
}
