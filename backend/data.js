// ============================================================
//  SEEVORA — Data Store (Real API Shape)
//  Matches the contract in calls_api_documentation.md
// ============================================================

import crypto from 'crypto';

const SALT = process.env.PASSWORD_SALT || 'seevora_secret_salt_2026';

export function hashPassword(password) {
  return crypto.scryptSync(password, SALT, 64).toString('hex');
}

// ── Users ───────────────────────────────────────────────────
export const USERS = [
  { id: 'u1', email: 'admin@test.com',    passwordHash: hashPassword('admin123'),  name: 'Alex Morgan',   role: 'Admin',  initials: 'AM', businessName: 'Seevora AI' },
  { id: 'u2', email: 'viewer@seevora.ai', passwordHash: hashPassword('Viewer123!'), name: 'Sam Rivera',    role: 'Viewer', initials: 'SR', businessName: 'Seevora AI' },
  { id: 'u3', email: 'client@test.com',   passwordHash: hashPassword('client123'), name: 'Rahul Sharma', role: 'Client', initials: 'RS', businessName: 'Sharma Real Estate', walletBalance: 500, plan: 'Self-Serve Starter' },
];

// ── Agents (with real UUID-style IDs) ──────────────────────
export const AGENTS = [
  { id: 'c5f590a2-25de-4d7a-8f4b-cf1042cb412e', name: 'Sales Agent — Tier 1',      script: 'Standard Sales Pitch',  rate_rs: 1.20 },
  { id: 'd7a821b3-36ef-5e8b-9g5c-dg2153dc523f', name: 'Support Agent — General',    script: 'Customer Support Flow', rate_rs: 1.00 },
  { id: 'e8b932c4-47fg-6f9c-0h6d-eh3264ed634g', name: 'Appointment Setter',         script: 'Appointment Booking',   rate_rs: 1.10 },
  { id: 'f9c043d5-58gh-7g0d-1i7e-fi4375fe745h', name: 'Re-engagement Agent',        script: 'Win-Back Campaign',     rate_rs: 1.30 },
  { id: 'g0d154e6-69hi-8h1e-2j8f-gj5486gf856i', name: 'Survey Agent',               script: 'Post-Service Survey',   rate_rs: 0.90 },
];

// ── Sample data pools ───────────────────────────────────────
const PHONE_NUMBERS = [
  '+919876543210', '+919812345678', '+918800112233', '+917700998877',
  '+916600445566', '+915500334455', '+914400223344', '+913300112233',
  '+912200001122', '+911100990011', '+447911123456', '+14155550142',
  '+16465550198', '+13125550167', '+12135550134',
];

const FIRST_NAMES = ['Rahul', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Deepa', 'Arjun', 'Kavita', 'Rohan', 'Meera', 'James', 'Sarah', 'Mike', 'Jessica', 'David'];
const LAST_NAMES  = ['Sharma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Mehta', 'Joshi', 'Verma', 'Agarwal', 'Rao', 'Johnson', 'Williams', 'Smith', 'Brown', 'Davis'];

const COURSES = ['Class 6 Admission', 'MBA Program 2026', 'Engineering Foundation', 'Digital Marketing', 'Data Science Bootcamp'];
const FEES    = ['Rs 12,000', 'Rs 15,000', 'Rs 18,500', 'Rs 25,000', 'Rs 8,999'];

const SUMMARIES = [
  'Agent introduced product and secured a follow-up meeting scheduled for next Tuesday.',
  'Customer had questions about pricing. Agent provided tier breakdown. Customer requested a callback.',
  'Lead expressed interest in premium plan. Objection on contract length. Agent handled with trial offer.',
  'No answer after 4 rings. Voicemail left with callback number.',
  'Customer confirmed appointment for Aug 20 at 2:00 PM IST.',
  'Customer not interested. Added to do-not-call list.',
  'Successful upsell to enterprise tier. Revenue opportunity flagged for CRM.',
  'Technical issue on call — dropped after 45 seconds. Marked for retry.',
  'Survey completed — score: 4.5/5. Customer very satisfied with service.',
  'Agent collected delivery preference and updated account details.',
];

// Real API shape: role is 'agent' or 'user' (not 'caller')
const TRANSCRIPTS = [
  [
    { role: 'agent', text: 'Hello Rahul, this is Aria from Seevora! Am I speaking with you?' },
    { role: 'user',  text: 'Yes, this is Rahul. What is this regarding?' },
    { role: 'agent', text: 'Hi Rahul! I\'m calling about the Class 6 Admission program. I wanted to share details on the fee structure and enrollment process.' },
    { role: 'user',  text: 'Oh sure, I was looking into that. What is the fee?' },
    { role: 'agent', text: 'The total fee for Class 6 Admission is Rs 15,000 for the full year, which includes all materials and assessments. Would you like to proceed?' },
    { role: 'user',  text: 'That sounds reasonable. Can I enroll online?' },
    { role: 'agent', text: 'Absolutely! I\'ll send you the enrollment link to your registered number. The process takes under 5 minutes. Thank you, Rahul, have a great day!' },
  ],
  [
    { role: 'agent', text: 'Good afternoon! This is Seevora Support, how can I help you today?' },
    { role: 'user',  text: 'Hi, I\'ve been having trouble logging into my account since yesterday.' },
    { role: 'agent', text: 'I\'m sorry to hear that. Can you please confirm the email address on your account?' },
    { role: 'user',  text: 'Sure, it\'s priya.patel@example.com' },
    { role: 'agent', text: 'Thank you Priya. I can see your account. There was a security lock triggered. I\'m sending a reset link to your email now.' },
    { role: 'user',  text: 'Got it, thank you so much!' },
    { role: 'agent', text: 'You\'re welcome! Is there anything else I can help you with today?' },
    { role: 'user',  text: 'No that\'s all, thanks!' },
  ],
  [
    { role: 'agent', text: 'Hi! I\'m calling to confirm your appointment scheduled for this Friday.' },
    { role: 'user',  text: 'Oh yes, what time was that again?' },
    { role: 'agent', text: 'Your appointment is confirmed for Friday at 10:30 AM IST. Will that still work for you?' },
    { role: 'user',  text: 'Actually, could we move it to 11 AM instead?' },
    { role: 'agent', text: 'Of course! I\'ve updated your appointment to 11:00 AM on Friday. You\'ll receive a confirmation shortly.' },
    { role: 'user',  text: 'Great, thank you!' },
  ],
  [
    { role: 'agent', text: 'Hello! I\'m reaching out about your recent inquiry for the MBA Program 2026.' },
    { role: 'user',  text: 'Yes, I was interested. Can you tell me more about the curriculum?' },
    { role: 'agent', text: 'The MBA Program covers Finance, Operations, Strategy and Leadership over 18 months. The fee is Rs 25,000 for the complete program.' },
    { role: 'user',  text: 'That\'s within my budget. What\'s the next step?' },
    { role: 'agent', text: 'I\'ll schedule a counseling session with our admissions team for you. Are you available this week?' },
    { role: 'user',  text: 'Yes, Thursday works for me.' },
    { role: 'agent', text: 'Perfect! Thursday it is. You\'ll receive a calendar invite shortly. Thank you for your interest!' },
  ],
];

// ── UUID Generator ──────────────────────────────────────────
function uuid() {
  return crypto.randomUUID();
}

// ── Helpers ─────────────────────────────────────────────────
function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomDurationS(minSec, maxSec) { return parseFloat((Math.random() * (maxSec - minSec) + minSec).toFixed(1)); }

function randomDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(0, daysBack));
  d.setHours(randomInt(8, 20), randomInt(0, 59), randomInt(0, 59), 0);
  return d;
}

function futureDate() {
  const d = new Date();
  d.setDate(d.getDate() + randomInt(1, 7));
  d.setHours(randomInt(9, 17), 0, 0, 0);
  return d;
}

function calcCostRs(durationS, rateRs, platformFee = 0.20) {
  const minutes   = durationS / 60;
  const callCost  = parseFloat((minutes * rateRs).toFixed(2));
  const total     = parseFloat((callCost + platformFee).toFixed(2));
  return { minuteRate: rateRs, minutes: parseFloat(minutes.toFixed(2)), callCost, platformFee, total };
}

// ── Generate a single call in the real API shape ────────────
function makeCall(direction, i) {
  const agent     = randomFrom(AGENTS);
  const firstName = randomFrom(FIRST_NAMES);
  const lastName  = randomFrom(LAST_NAMES);
  const phone     = randomFrom(PHONE_NUMBERS);

  // Status pools matching API docs
  const outStatuses = ['completed', 'completed', 'completed', 'failed', 'calling', 'missed'];
  const inStatuses  = ['completed', 'completed', 'completed', 'missed', 'failed'];
  const status      = randomFrom(direction === 'outbound' ? outStatuses : inStatuses);

  const isActive    = status === 'calling';
  const isScheduled = false; // scheduled handled separately
  const hasCall     = status === 'completed';

  const duration_s  = hasCall ? randomDurationS(45, 480)
                    : isActive ? randomDurationS(10, 120)
                    : status === 'failed' ? randomDurationS(0, 30)
                    : 0.0;

  const created_at  = randomDate(30);
  const started_at  = (hasCall || isActive) ? new Date(created_at.getTime() + randomInt(5, 20) * 1000) : null;
  const ended_at    = hasCall ? new Date((started_at?.getTime() || 0) + duration_s * 1000) : null;

  const costData    = hasCall ? calcCostRs(duration_s, agent.rate_rs) : null;
  const transIdx    = randomInt(0, TRANSCRIPTS.length - 1);

  // contact_meta (rich metadata like the API example)
  const contact_meta = {
    firstName,
    lastName,
    course: randomFrom(COURSES),
    fee:    randomFrom(FEES),
  };

  const outcomes    = ['Issue resolved', 'Appointment booked', 'Follow-up required', 'Transferred to human', 'Survey completed'];
  const inboundOutcome = direction === 'inbound' && hasCall ? randomFrom(outcomes) : null;

  return {
    // ── Core (matches /calls API response exactly) ──────────
    id:             uuid(),
    agent_id:       agent.id,
    room_name:      `call-${crypto.randomBytes(6).toString('hex')}`,
    phone_number:   phone,
    contact_name:   firstName,
    contact_meta,
    direction,
    status,
    duration_s,
    total_cost_rs:  costData ? costData.total : 0.0,
    transcript:     hasCall ? TRANSCRIPTS[transIdx] : [],
    started_at:     started_at ? started_at.toISOString() : null,
    ended_at:       ended_at   ? ended_at.toISOString()   : null,
    created_at:     created_at.toISOString(),

    // ── Extended (display helpers used by dashboard) ────────
    agent_name:     agent.name,
    summary:        hasCall ? randomFrom(SUMMARIES) : status === 'failed' ? 'Call failed to connect.' : status === 'missed' ? 'No answer. Voicemail not available.' : null,
    cost_breakdown: costData,
    outcome:        inboundOutcome,
    recording:      hasCall,
    caller_name:    direction === 'inbound' && Math.random() > 0.4 ? `${firstName} ${lastName}` : null,
    captured_data:  direction === 'inbound' && hasCall ? {
      'Customer ID':    `CX-${randomInt(10000, 99999)}`,
      'Reason for Call': randomFrom(['Billing inquiry', 'Product support', 'New service inquiry', 'Complaint', 'General question']),
      'Sentiment':       randomFrom(['Positive', 'Neutral', 'Negative', 'Very Positive']),
      'Next Action':     randomFrom(['Send follow-up email', 'Schedule callback', 'Escalate to team', 'No action needed']),
    } : null,
  };
}

// ── Singleton store ─────────────────────────────────────────
let _calls = null;

function ensureCalls() {
  if (_calls) return _calls;
  const outbound = Array.from({ length: 50 }, (_, i) => makeCall('outbound', i));
  const inbound  = Array.from({ length: 30 }, (_, i) => makeCall('inbound', i));
  _calls = [...outbound, ...inbound].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return _calls;
}

// ── Public accessors (matching API docs contracts) ──────────
export function getAllCalls({ agent_id, direction, skip = 0, limit = 50 } = {}) {
  let calls = ensureCalls();
  if (agent_id)  calls = calls.filter(c => c.agent_id === agent_id);
  if (direction) calls = calls.filter(c => c.direction === direction);
  return calls.slice(skip, skip + limit);
}

export function getCallById(id) {
  return ensureCalls().find(c => c.id === id) || null;
}

// Backwards compat helpers used by existing Express routes
export function getOutboundCalls() { return getAllCalls({ direction: 'outbound' }); }
export function getInboundCalls()  { return getAllCalls({ direction: 'inbound'  }); }

export function addCall(call) {
  const calls = ensureCalls();
  calls.unshift(call);
}

export function getPricingSummary(calls) {
  const total        = calls.reduce((acc, c) => acc + (c.total_cost_rs || 0), 0);
  const totalMinutes = calls.reduce((acc, c) => acc + (c.duration_s || 0), 0) / 60;
  return {
    totalCalls:      calls.length,
    totalMinutes:    parseFloat(totalMinutes.toFixed(1)),
    totalCostRs:     parseFloat(total.toFixed(2)),
    avgCostPerCall:  calls.length ? parseFloat((total / calls.length).toFixed(2)) : 0,
  };
}

export function getDailySpend(calls, days = 30) {
  const buckets = {};
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    buckets[key] = 0;
  }
  calls.forEach(c => {
    if (!c.total_cost_rs) return;
    const d   = new Date(c.created_at);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    if (key in buckets) buckets[key] += c.total_cost_rs;
  });
  const labels = Object.keys(buckets).reverse();
  const values = labels.map(k => parseFloat(buckets[k].toFixed(2)));
  return { labels, values };
}

// ── Users Store (mutable — supports signup) ─────────────────
export const USERS_STORE = [...USERS];

export function addUser(user) {
  USERS_STORE.push(user);
  USERS.push(user); // keep USERS array in sync for login checks
}

// ── Onboarding Store ────────────────────────────────────────
const _onboarding = {};   // { userId: onboardingData }

export function saveOnboarding(userId, data) {
  _onboarding[userId] = data;
}

export function getOnboarding(userId) {
  return _onboarding[userId] || null;
}

// ── Training Recordings Store ───────────────────────────────
const _trainingRecordings = {};   // { agentId: [recording, ...] }

export function saveTrainingRecording(agentId, recordings) {
  if (!_trainingRecordings[agentId]) _trainingRecordings[agentId] = [];
  _trainingRecordings[agentId].push(...recordings);
}

export function getTrainingRecordings(agentId) {
  return _trainingRecordings[agentId] || [];
}
