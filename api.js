// ============================================================
//  SEEVORA — API Client
// ============================================================

const API_BASE = '/api';

export const AGENTS = [
  { id: 'a1', name: 'Sales Agent — Tier 1', script: 'Standard Sales Pitch', rate: 0.12 },
  { id: 'a2', name: 'Support Agent — General', script: 'Customer Support Flow', rate: 0.10 },
  { id: 'a3', name: 'Appointment Setter', script: 'Appointment Booking', rate: 0.11 },
  { id: 'a4', name: 'Re-engagement Agent', script: 'Win-Back Campaign', rate: 0.13 },
  { id: 'a5', name: 'Survey Agent', script: 'Post-Service Survey', rate: 0.09 },
];

function getAuthHeaders() {
  const session = JSON.parse(localStorage.getItem('seevora_session') || '{}');
  const token = session.token;
  if (!token) return {};
  return { 'Authorization': `Bearer ${token}` };
}

async function fetchAPI(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers
  };
  
  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Auto logout if token is invalid/expired
      localStorage.removeItem('seevora_session');
      window.location.reload();
      return; // Stop execution
    }
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `API Error: ${response.status}`);
  }
  
  const data = await response.json();
  if (Array.isArray(data)) {
    return data.map(c => ({ ...c, date: new Date(c.date) }));
  }
  return data;
}

export async function login(email, password) {
  return fetchAPI('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function getOutboundCalls() {
  return fetchAPI('/calls/outbound');
}

export async function getInboundCalls() {
  return fetchAPI('/calls/inbound');
}

export async function getAllCalls() {
  return fetchAPI('/calls/unified');
}

export async function initiateOutboundCall(callData) {
  return fetchAPI('/calls/outbound', {
    method: 'POST',
    body: JSON.stringify(callData)
  });
}

export async function fetchPricing() {
  return fetchAPI('/pricing');
}

// Helper to find a call by ID across all calls
export async function getCallById(id) {
  const calls = await getAllCalls();
  return calls.find(c => c.id === id) || null;
}
