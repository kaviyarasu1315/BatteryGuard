import axios from 'axios'

const API = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Battery endpoints ─────────────────────────────────────────────────────
export const fetchBatteries = () =>
  API.get('/batteries').then(r => r.data.batteries)

export const fetchBatterySummary = (id) =>
  API.get(`/battery/${id}/summary`).then(r => r.data)

export const fetchBatteryCycles = (id, full = false) =>
  API.get(`/battery/${id}/cycles`, { params: { full } }).then(r => r.data)

export const fetchChargeCurves = (id, cycle = null) =>
  API.get(`/battery/${id}/charge-curves`, { params: cycle ? { cycle } : {} }).then(r => r.data)

// ── Analysis endpoints ────────────────────────────────────────────────────
export const analyzeBattery = (battery_id) =>
  API.post('/analyze', { battery_id }).then(r => r.data)

export const fetchTrends = (id) =>
  API.get(`/battery/${id}/trends`).then(r => r.data)

// ── Anomaly endpoints ─────────────────────────────────────────────────────
export const fetchAnomalies = (id, params = {}) =>
  API.get(`/battery/${id}/anomalies`, { params }).then(r => r.data)

export const fetchAnomalyTimeline = (id) =>
  API.get(`/battery/${id}/anomalies/timeline`).then(r => r.data)

// ── RAG / AI endpoints ────────────────────────────────────────────────────
export const fetchKnowledgeStatus = () =>
  API.get('/knowledge/status').then(r => r.data)

export const ingestKnowledge = () =>
  API.post('/ingest-knowledge').then(r => r.data)

export const getRecommendation = (battery_id, query) =>
  API.post('/recommend', { battery_id, query }).then(r => r.data)

// ── Health check ──────────────────────────────────────────────────────────
export const healthCheck = () =>
  API.get('/health').then(r => r.data)

export default API
