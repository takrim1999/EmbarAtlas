const API_BASE = (typeof window !== 'undefined' && window.location.pathname.startsWith('/nasa'))
  ? '/nasa/api'
  : (import.meta.env.VITE_API_URL || '/api');

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Investigations
  getInvestigations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/investigations${query ? `?${query}` : ''}`);
  },
  getInvestigation: (id) => request(`/investigations/${id}`),
  getStats: () => request('/investigations/stats'),
  compareInvestigations: (ids) => request(`/investigations/compare?ids=${ids.join(',')}`),
  
  // Super Intelligence (SI) Engine
  chat: (message, sessionId, investigationIds) =>
    request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId, investigationIds }),
    }),
  summarize: (investigationIds) =>
    request('/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ investigationIds }),
    }),
  getInsights: (focus) =>
    request('/ai/insights', {
      method: 'POST',
      body: JSON.stringify({ focus }),
    }),
  
  // Data
  exportCsv: (investigationId) => `${API_BASE}/data/export/${investigationId}`,
  exportJson: (investigationId) => `${API_BASE}/data/export/${investigationId}/json`,
  importCsv: (investigationId, csvText) =>
    request('/data/import', {
      method: 'POST',
      body: JSON.stringify({ investigationId, csvText }),
    }),
};
