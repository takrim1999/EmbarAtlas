const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function fetchJson(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getInvestigations: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    const qs = query.toString();
    return fetchJson(`/investigations${qs ? '?' + qs : ''}`);
  },

  getInvestigation: (id) => fetchJson(`/investigations/${id}`),
};

  getDataStats: () => fetchJson('/data/stats'),
  getTestData: (invId) => fetchJson(`/data/tests/${invId}`),
  exportCsv: (invId) => `${API_BASE}/data/export/${invId}`,
  exportJson: (invId) => `${API_BASE}/data/export-json/${invId}`,

  askAI: (message, sessionId = 'default') =>
    fetchJson('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId }),
    }),
