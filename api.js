// ============================================================
//  SEEVORA — API Client v2
//  Matches the contract in calls_api_documentation.md
// ============================================================

// ── Live API base URL ──────────────────────────────────────────────────────
// Always use the real ngrok backend for all API calls.
// Set NGROK_BASE_URL in .env (local) or Vercel env vars (production).
const LIVE_BASE = (window.__SEEVORA_CONFIG__ && window.__SEEVORA_CONFIG__.NGROK_BASE_URL)
  || 'https://griminess-pry-visitor.ngrok-free.dev';
const API_BASE  = `${LIVE_BASE}/api`;

// ── ngrok interstitial bypass header ──────────────────────
const NGROK_HEADER = { 'ngrok-skip-browser-warning': 'true' };

// ── Agents list (fallback — real list fetched from /api/agents) ──
// ✅ Real agent ID confirmed working on developer's live server (Aug 18, 2026)
export let AGENTS = [
  { id: 'f1ae0794-120a-44e2-8a22-967ffcc9d022', name: 'AI Voice Agent', script: 'Default Script', rate_rs: 1.00 },
];

// ── Auth helpers ───────────────────────────────────────────
function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem('seevora_session'));
    if (s && s.token) {
      if (s.name && s.name.length > 20 && s.name.includes('-')) {
        s.name = 'Admin';
        s.initials = 'A';
      }
      return { token: s.token, user: { name: s.name, email: s.email, role: s.role, initials: s.initials } };
    }
  } catch (e) { }
  return null;
}

function getAuthHeaders() {
  try {
    const session = JSON.parse(localStorage.getItem('seevora_session') || '{}');
    const token = session.token || session.access_token;
    if (!token) return { ...NGROK_HEADER };
    return { Authorization: `Bearer ${token}`, ...NGROK_HEADER };
  } catch { return { ...NGROK_HEADER }; }
}

// ── Core fetch wrapper ─────────────────────────────────────
async function fetchAPI(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('seevora_session');
      window.location.reload();
      return;
    }
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `API Error: ${response.status}`);
  }

  return response.json();
}

// Separate fetcher for non-/api routes (e.g. /calls, /auth/login)
// Prepends LIVE_BASE so requests go to the developer's ngrok server
async function fetchDirect(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  // If path is already a full URL, use as-is; otherwise prepend ngrok base
  const url = path.startsWith('http') ? path : `${LIVE_BASE}${path}`;
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('seevora_session');
      window.location.reload();
      return;
    }
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || errData.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// ── Data Normalizer ────────────────────────────────────────
// Maps a real API call record → the shape used by dashboard pages.
// The real shape uses snake_case; some pages still reference camelCase
// legacy fields, so we expose both.
export function normalizeCall(c) {
  if (!c) return null;

  // Duration: convert seconds float → "M:SS" display string
  const durationS   = c.duration_s ?? 0;
  const durMin      = Math.floor(durationS / 60);
  const durSec      = Math.round(durationS % 60);
  const durationFmt = durationS > 0 ? `${durMin}:${String(durSec).padStart(2, '0')}` : '—';

  // Status mapping: 'calling' (API) → 'in-progress' (UI badge key)
  const STATUS_MAP = {
    calling:     'in-progress',
    completed:   'completed',
    failed:      'failed',
    missed:      'missed',
    voicemail:   'voicemail',
    answered:    'completed',
  };
  const uiStatus = STATUS_MAP[c.status] ?? c.status;

  // Agent name
  const agentObj = AGENTS.find(a => a.id === c.agent_id);
  const agentName = c.agent_name || agentObj?.name || c.agent_id || 'Unknown Agent';

  // Date
  const dateObj     = new Date(c.created_at || Date.now());
  const dateFormatted = dateObj.toLocaleString('en-IN', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  // Transcript: normalize role → speaker key legacy pages may use
  const transcript = (c.transcript || []).map(t => ({
    role:    t.role,
    speaker: t.role,     // legacy alias
    text:    t.text,
    time:    t.time || '',
  }));

  return {
    // ── Real API fields (kept as-is) ─────────────────
    id:             c.id,
    agent_id:       c.agent_id,
    room_name:      c.room_name,
    phone_number:   c.phone_number,
    contact_name:   c.contact_name,
    contact_meta:   c.contact_meta || {},
    direction:      c.direction,
    status:         uiStatus,
    duration_s:     durationS,
    total_cost_rs:  c.total_cost_rs ?? 0,
    transcript,
    started_at:     c.started_at,
    ended_at:       c.ended_at,
    created_at:     c.created_at,

    // ── Dashboard display helpers ─────────────────────
    phone:          c.phone_number,          // legacy alias
    agent:          agentName,               // legacy alias
    agentId:        c.agent_id,              // legacy alias
    type:           c.direction,             // legacy alias
    duration:       durationFmt,             // formatted string
    durationSeconds: durationS,
    date:           dateObj,
    dateFormatted,
    summary:        c.summary   || null,
    cost: c.cost_breakdown ? {
      ...c.cost_breakdown,
      total: c.total_cost_rs,
    } : c.total_cost_rs > 0 ? {
      total:       c.total_cost_rs,
      callCost:    c.total_cost_rs,
      platformFee: 0,
      minutes:     parseFloat((durationS / 60).toFixed(2)),
      minuteRate:  agentObj?.rate_rs || 1.0,
    } : null,
    recording:      c.recording ?? (c.status === 'completed'),
    callerName:     c.caller_name || c.contact_name || null,
    capturedData:   c.captured_data || null,
    outcome:        c.outcome || null,
    initiatedBy:    c.initiated_by || 'api',
  };
}

// ── Public API functions ───────────────────────────────────

/**
 * Login — POST /auth/login
 * Returns { access_token, token, user }
 */
export async function login(email, password) {
  const data = await fetchDirect('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return data;
}

/**
 * List all calls — GET /calls
 * Accepts optional filters: agent_id, direction, skip, limit
 */
export async function getCalls({ agent_id, direction, skip = 0, limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (agent_id)  params.set('agent_id',  agent_id);
  if (direction) params.set('direction', direction);
  params.set('skip',  String(skip));
  params.set('limit', String(limit));
  const qs = params.toString();
  const data = await fetchDirect(`/calls?${qs}`);
  return (data || []).map(normalizeCall);
}

/**
 * Get outbound calls (direction=outbound)
 */
export async function getOutboundCalls() {
  const calls = await getCalls({ direction: 'outbound', limit: 50 });
  return (calls || []).filter(c => (c.direction || c.type || '').toLowerCase() === 'outbound');
}

/**
 * Get inbound calls (direction=inbound)
 */
export async function getInboundCalls() {
  const calls = await getCalls({ direction: 'inbound', limit: 50 });
  return (calls || []).filter(c => (c.direction || c.type || '').toLowerCase() === 'inbound');
}

/**
 * Get all calls (no direction filter)
 */
export async function getAllCalls() {
  return getCalls({ limit: 100 });
}

/**
 * Get single call detail + transcript — GET /calls/:id
 */
export async function getCallById(id) {
  const data = await fetchDirect(`/calls/${id}`);
  return normalizeCall(data);
}

/**
 * Dispatch a new outbound call — POST /calls/dispatch
 * @param {string} agent_id   - UUID of the voice agent
 * @param {string} phone_number - E.164 format, e.g. +919876543210
 * @param {object} contact    - { firstName, lastName, course, fee, ... }
 */
export async function dispatchCall(agent_id, phone_number, contact = {}) {
  const data = await fetchDirect('/calls/dispatch', {
    method: 'POST',
    body: JSON.stringify({ agent_id, phone_number, contact }),
  });
  return normalizeCall(data);
}

/**
 * Legacy alias used by outbound.js
 */
export async function initiateOutboundCall(callData) {
  // If called with the new dispatch format
  if (callData.agent_id && callData.phone_number) {
    return dispatchCall(callData.agent_id, callData.phone_number, callData.contact || {});
  }
  // Legacy flat format — store directly
  return fetchAPI('/calls/outbound', {
    method: 'POST',
    body: JSON.stringify(callData),
  });
}

/**
 * Fetch pricing summary
 */
export async function fetchPricing() {
  return fetchAPI('/pricing');
}

/**
 * Fetch agents list (with live API fallback to static)
 */
export async function fetchAgents() {
  try {
    const data = await fetchAPI('/agents');
    if (Array.isArray(data) && data.length) {
      AGENTS = data;
    }
    return AGENTS;
  } catch {
    return AGENTS;
  }
}

/**
 * Check if the API is reachable
 */
export async function checkApiHealth() {
  try {
    const data = await fetchAPI('/health');
    return data?.status === 'ok';
  } catch {
    return false;
  }
}
