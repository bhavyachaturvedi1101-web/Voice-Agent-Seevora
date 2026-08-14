// ============================================================
//  SEEVORA — Mock Data Store
// ============================================================

import crypto from 'crypto';

const SALT = 'seevora_secret_salt_2026';

export function hashPassword(password) {
  return crypto.scryptSync(password, SALT, 64).toString('hex');
}

export const USERS = [
  { id: 'u1', email: 'admin@seevora.ai', passwordHash: hashPassword('Admin123!'), name: 'Alex Morgan', role: 'Admin', initials: 'AM' },
  { id: 'u2', email: 'viewer@seevora.ai', passwordHash: hashPassword('Viewer123!'), name: 'Sam Rivera', role: 'Viewer', initials: 'SR' },
];

export const AGENTS = [
  { id: 'a1', name: 'Sales Agent — Tier 1', script: 'Standard Sales Pitch', rate: 0.12 },
  { id: 'a2', name: 'Support Agent — General', script: 'Customer Support Flow', rate: 0.10 },
  { id: 'a3', name: 'Appointment Setter', script: 'Appointment Booking', rate: 0.11 },
  { id: 'a4', name: 'Re-engagement Agent', script: 'Win-Back Campaign', rate: 0.13 },
  { id: 'a5', name: 'Survey Agent', script: 'Post-Service Survey', rate: 0.09 },
];

const PHONE_NUMBERS = [
  '+1 (415) 555-0142', '+1 (646) 555-0198', '+1 (312) 555-0167',
  '+1 (213) 555-0134', '+1 (214) 555-0155', '+1 (305) 555-0176',
  '+1 (617) 555-0189', '+1 (404) 555-0121', '+1 (206) 555-0193',
  '+1 (702) 555-0148', '+44 20 7946 0958', '+1 (503) 555-0162',
  '+1 (512) 555-0174', '+1 (602) 555-0183', '+1 (720) 555-0151',
];

const SUMMARIES = [
  'Agent introduced product and secured a follow-up meeting scheduled for next Tuesday.',
  'Customer had questions about pricing. Agent provided tier breakdown. Customer requested a callback.',
  'Lead expressed interest in premium plan. Objection on contract length. Agent handled with trial offer.',
  'No answer after 4 rings. Voicemail left with callback number.',
  'Customer confirmed appointment for Aug 20 at 2:00 PM EST.',
  'Customer not interested. Added to do-not-call list.',
  'Successful upsell to enterprise tier. Revenue opportunity flagged for CRM.',
  'Technical issue on call — dropped after 45 seconds. Marked for retry.',
  'Survey completed — score: 4.5/5. Customer very satisfied with service.',
  'Agent collected delivery preference and updated account details.',
];

const TRANSCRIPTS = [
  [
    { speaker: 'agent', text: 'Hello, this is Aria from Seevora! Am I speaking with the account holder?', time: '0:02' },
    { speaker: 'caller', text: 'Yes, this is Mike speaking. Who did you say you are?', time: '0:05' },
    { speaker: 'agent', text: 'Hi Mike! I\'m Aria, calling from Seevora on behalf of our team. I wanted to share an exclusive offer we\'ve put together specifically for customers like you.', time: '0:08' },
    { speaker: 'caller', text: 'Oh alright, what kind of offer?', time: '0:16' },
    { speaker: 'agent', text: 'We\'re offering a 30-day free trial of our premium tier with access to all features including priority support. No credit card required to start. Would you be interested?', time: '0:19' },
    { speaker: 'caller', text: 'That sounds interesting, yeah. How do I get started?', time: '0:31' },
    { speaker: 'agent', text: 'Fantastic! I\'ll schedule a brief 15-minute onboarding call with one of our specialists. Are you available Tuesday at 2 PM EST?', time: '0:35' },
    { speaker: 'caller', text: 'Tuesday at 2 works for me.', time: '0:45' },
    { speaker: 'agent', text: 'Perfect! I\'ve got you booked in. You\'ll receive a calendar invite to your email shortly. Thanks so much, Mike, and have a great day!', time: '0:47' },
  ],
  [
    { speaker: 'agent', text: 'Good afternoon! This is Seevora Support, how can I help you today?', time: '0:01' },
    { speaker: 'caller', text: 'Hi, I\'ve been having trouble logging into my account since yesterday.', time: '0:04' },
    { speaker: 'agent', text: 'I\'m sorry to hear that. I can help you resolve this. Can you please confirm the email address on your account?', time: '0:09' },
    { speaker: 'caller', text: 'Sure, it\'s jess.ford@example.com', time: '0:15' },
    { speaker: 'agent', text: 'Thank you, Jessica. I can see your account. It looks like there was a recent security lock triggered. I\'m sending a reset link to your email now.', time: '0:18' },
    { speaker: 'caller', text: 'Oh okay, I should have gotten it. Let me check...', time: '0:28' },
    { speaker: 'agent', text: 'Of course, please take your time.', time: '0:31' },
    { speaker: 'caller', text: 'Yes! I see the email. Thank you so much, this was quick.', time: '0:45' },
    { speaker: 'agent', text: 'You\'re welcome! Is there anything else I can help you with today?', time: '0:49' },
    { speaker: 'caller', text: 'No that\'s all, thanks!', time: '0:54' },
  ],
  [
    { speaker: 'agent', text: 'Hi there! I\'m calling to confirm your appointment scheduled for this Friday.', time: '0:02' },
    { speaker: 'caller', text: 'Oh yes, what time was that again?', time: '0:07' },
    { speaker: 'agent', text: 'Your appointment is confirmed for Friday, August 16th at 10:30 AM. Will that still work for you?', time: '0:10' },
    { speaker: 'caller', text: 'Actually, could we move it to 11 AM instead?', time: '0:19' },
    { speaker: 'agent', text: 'Of course! I\'ve updated your appointment to 11:00 AM on Friday, August 16th. You\'ll receive an updated confirmation shortly.', time: '0:22' },
    { speaker: 'caller', text: 'Great, thank you!', time: '0:32' },
  ],
];

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomDuration(minSec, maxSec) {
  const s = randomInt(minSec, maxSec);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return { formatted: `${m}:${String(sec).padStart(2, '0')}`, seconds: s };
}

function randomDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(0, daysBack));
  d.setHours(randomInt(8, 20), randomInt(0, 59), 0, 0);
  return d;
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatTime(d) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function formatDateTime(d) { return `${formatDate(d)}, ${formatTime(d)}`; }

const OUTBOUND_STATUSES = ['completed', 'completed', 'completed', 'failed', 'in-progress', 'scheduled', 'missed'];
const INBOUND_STATUSES  = ['answered', 'answered', 'answered', 'missed', 'voicemail'];
const INIT_METHODS      = ['manual', 'manual', 'api', 'bulk', 'scheduled'];

function calcCost(durationSec, rate, platformFee = 0.02) {
  const minutes = durationSec / 60;
  const callCost = parseFloat((minutes * rate).toFixed(4));
  return { minuteRate: rate, minutes: parseFloat(minutes.toFixed(2)), callCost, platformFee, total: parseFloat((callCost + platformFee).toFixed(4)) };
}

// ── Generate Outbound Calls ─────────────────────────────────
export function generateOutboundCalls(count = 50) {
  return Array.from({ length: count }, (_, i) => {
    const status   = randomFrom(OUTBOUND_STATUSES);
    const agent    = randomFrom(AGENTS);
    const dur      = status === 'in-progress' ? randomDuration(20, 180) : status === 'scheduled' ? { formatted: '—', seconds: 0 } : status === 'failed' ? randomDuration(0, 30) : randomDuration(60, 480);
    const date     = status === 'scheduled' ? (() => { const d = new Date(); d.setDate(d.getDate() + randomInt(1, 7)); d.setHours(randomInt(9, 17), 0, 0, 0); return d; })() : randomDate(30);
    const cost     = status === 'scheduled' || status === 'failed' ? null : calcCost(dur.seconds, agent.rate);
    const transIdx = randomInt(0, TRANSCRIPTS.length - 1);
    return {
      id: `OUT-${String(1000 + i).padStart(4, '0')}`,
      type: 'outbound',
      phone: randomFrom(PHONE_NUMBERS),
      agent: agent.name,
      agentId: agent.id,
      status,
      duration: dur.formatted,
      durationSeconds: dur.seconds,
      date,
      dateFormatted: formatDateTime(date),
      initiatedBy: randomFrom(INIT_METHODS),
      summary: status === 'completed' ? randomFrom(SUMMARIES) : status === 'failed' ? 'Call failed to connect — network error.' : status === 'missed' ? 'No answer. Voicemail not available.' : null,
      transcript: status === 'completed' ? TRANSCRIPTS[transIdx] : [],
      cost,
      recording: status === 'completed',
    };
  }).sort((a, b) => b.date - a.date);
}

// ── Generate Inbound Calls ──────────────────────────────────
export function generateInboundCalls(count = 30) {
  return Array.from({ length: count }, (_, i) => {
    const status   = randomFrom(INBOUND_STATUSES);
    const agent    = randomFrom(AGENTS);
    const dur      = status === 'answered' ? randomDuration(60, 420) : randomDuration(0, 20);
    const date     = randomDate(30);
    const cost     = status === 'answered' ? calcCost(dur.seconds, agent.rate) : { minuteRate: agent.rate, minutes: 0, callCost: 0, platformFee: 0.02, total: 0.02 };
    const transIdx = randomInt(0, TRANSCRIPTS.length - 1);
    const outcomes = ['Issue resolved', 'Appointment booked', 'Follow-up required', 'Transferred to human', 'Survey completed', 'No further action needed'];
    return {
      id: `IN-${String(2000 + i).padStart(4, '0')}`,
      type: 'inbound',
      phone: randomFrom(PHONE_NUMBERS),
      agent: agent.name,
      agentId: agent.id,
      status,
      duration: dur.formatted,
      durationSeconds: dur.seconds,
      date,
      dateFormatted: formatDateTime(date),
      outcome: status === 'answered' ? randomFrom(outcomes) : status === 'voicemail' ? 'Voicemail recorded' : 'Missed — no action',
      summary: status === 'answered' ? randomFrom(SUMMARIES) : null,
      transcript: status === 'answered' ? TRANSCRIPTS[transIdx] : [],
      cost,
      recording: status === 'answered',
      callerName: Math.random() > 0.5 ? `${randomFrom(['James', 'Sarah', 'Mike', 'Jessica', 'David', 'Emily', 'Chris', 'Amy'])} ${randomFrom(['Johnson', 'Williams', 'Smith', 'Brown', 'Davis', 'Miller', 'Wilson', 'Taylor'])}` : null,
      capturedData: status === 'answered' ? {
        'Customer ID': `CX-${randomInt(10000, 99999)}`,
        'Reason for Call': randomFrom(['Billing inquiry', 'Product support', 'New service inquiry', 'Complaint', 'General question']),
        'Sentiment': randomFrom(['Positive', 'Neutral', 'Negative', 'Very Positive']),
        'Next Action': randomFrom(['Send follow-up email', 'Schedule callback', 'Escalate to team', 'No action needed']),
      } : null,
    };
  }).sort((a, b) => b.date - a.date);
}

// Singleton stores (re-generated once per session)
let _outbound = null;
let _inbound  = null;

export function getOutboundCalls() {
  if (!_outbound) _outbound = generateOutboundCalls(50);
  return _outbound;
}

export function getInboundCalls() {
  if (!_inbound) _inbound = generateInboundCalls(30);
  return _inbound;
}

export function addOutboundCall(call) {
  if (!_outbound) _outbound = generateOutboundCalls(50);
  _outbound.unshift(call);
}

export function getCallById(id) {
  const all = [...getOutboundCalls(), ...getInboundCalls()];
  return all.find(c => c.id === id) || null;
}

export function getAllCalls() {
  return [...getOutboundCalls(), ...getInboundCalls()].sort((a, b) => b.date - a.date);
}

export function getPricingSummary(calls) {
  const total = calls.reduce((acc, c) => {
    if (c.cost) acc += c.cost.total;
    return acc;
  }, 0);
  const totalMinutes = calls.reduce((acc, c) => acc + (c.durationSeconds || 0), 0) / 60;
  return {
    totalCalls: calls.length,
    totalMinutes: parseFloat(totalMinutes.toFixed(1)),
    totalCost: parseFloat(total.toFixed(2)),
    avgCostPerCall: calls.length ? parseFloat((total / calls.length).toFixed(4)) : 0,
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
    if (!c.cost) return;
    const d = c.date;
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    if (key in buckets) buckets[key] += c.cost.total;
  });
  const labels = Object.keys(buckets).reverse();
  const values = labels.map(k => parseFloat(buckets[k].toFixed(2)));
  return { labels, values };
}
