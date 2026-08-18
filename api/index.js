import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';
import {
  USERS,
  AGENTS,
  hashPassword,
  getAllCalls,
  getCallById,
  addCall,
  getPricingSummary,
  getDailySpend,
} from '../backend/data.js';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'default_development_jwt_secret';

app.use(express.json());

// ── CORS — allow browser/ngrok/file:// clients ────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Serve static frontend files
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '..')));

// ── Auth Middleware ────────────────────────────────────────
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
  }
}

// ── /auth/login  (matches API docs: POST /auth/login) ──────
// Also aliased to /api/login for backwards compatibility
function handleLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const hashedInput = hashPassword(password);
  const user = USERS.find(u => u.email === email && u.passwordHash === hashedInput);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const payload = {
    userId:   user.id,
    name:     user.name,
    email:    user.email,
    role:     user.role,
    initials: user.initials,
  };
  // API docs return { access_token }; also return { token, user } for dashboard session
  const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
  res.json({ access_token, token: access_token, user: payload });
}

app.post('/auth/login', handleLogin);
app.post('/api/login', handleLogin);     // legacy alias

// ── GET /calls  (matches API docs) ────────────────────────
// Query params: agent_id, direction, skip, limit
app.get('/calls', requireAuth, (req, res) => {
  const { agent_id, direction, skip = 0, limit = 50 } = req.query;
  const calls = getAllCalls({
    agent_id:  agent_id  || undefined,
    direction: direction || undefined,
    skip:      parseInt(skip,  10),
    limit:     parseInt(limit, 10),
  });
  res.json(calls);
});

// Legacy aliases used by old frontend code
app.get('/api/calls/outbound', requireAuth, (req, res) => {
  res.json(getAllCalls({ direction: 'outbound', limit: 50 }));
});
app.get('/api/calls/inbound', requireAuth, (req, res) => {
  res.json(getAllCalls({ direction: 'inbound', limit: 50 }));
});
app.get('/api/calls/unified', requireAuth, (req, res) => {
  res.json(getAllCalls({ limit: 100 }));
});

// ── GET /calls/:id  (matches API docs) ───────────────────
app.get('/calls/:id', requireAuth, (req, res) => {
  const call = getCallById(req.params.id);
  if (!call) return res.status(404).json({ error: 'Call not found' });
  res.json(call);
});

// Legacy alias
app.get('/api/calls/:id', requireAuth, (req, res) => {
  const call = getCallById(req.params.id);
  if (!call) return res.status(404).json({ error: 'Call not found' });
  res.json(call);
});

// ── POST /calls/dispatch  (matches API docs) ─────────────
app.post('/calls/dispatch', requireAuth, (req, res) => {
  // Role gate
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Only Admins can dispatch calls' });
  }

  const { agent_id, phone_number, contact = {} } = req.body;

  if (!agent_id) {
    return res.status(422).json({ error: 'agent_id is required' });
  }
  if (!phone_number || !/^\+\d{10,15}$/.test(phone_number)) {
    return res.status(422).json({ error: 'phone_number must be in E.164 format (e.g. +919876543210)' });
  }

  const agent = AGENTS.find(a => a.id === agent_id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  const id        = crypto.randomUUID();
  const room_name = `call-${id.replace(/-/g, '').slice(0, 12)}`;

  const newCall = {
    id,
    agent_id,
    room_name,
    phone_number,
    contact_name:   contact.firstName || phone_number,
    contact_meta:   contact,
    direction:      'outbound',
    status:         'calling',
    duration_s:     0.0,
    total_cost_rs:  0.0,
    transcript:     [],
    started_at:     null,
    ended_at:       null,
    created_at:     new Date().toISOString(),

    // Dashboard display helpers
    agent_name:     agent.name,
    summary:        null,
    cost_breakdown: null,
    outcome:        null,
    recording:      false,
    caller_name:    null,
    captured_data:  null,
  };

  addCall(newCall);

  // Simulate call progression in background (in-memory only)
  setTimeout(() => {
    newCall.status     = 'calling';
    newCall.started_at = new Date().toISOString();
  }, 2000);

  setTimeout(() => {
    const dur           = parseFloat((Math.random() * 180 + 30).toFixed(1));
    newCall.status      = 'completed';
    newCall.duration_s  = dur;
    newCall.total_cost_rs = parseFloat(((dur / 60) * agent.rate_rs + 0.20).toFixed(2));
    newCall.ended_at    = new Date().toISOString();
    newCall.transcript  = [
      { role: 'agent', text: `Hello ${contact.firstName || 'there'}, this is Seevora calling regarding ${contact.course || 'your inquiry'}.` },
      { role: 'user',  text: 'Yes, I was expecting this call. Please go ahead.' },
      { role: 'agent', text: `I wanted to inform you that the fee for ${contact.course || 'the program'} is ${contact.fee || 'available on request'}. Would you like to proceed?` },
      { role: 'user',  text: 'Yes, please send me the enrollment link.' },
      { role: 'agent', text: 'Perfect! I\'ve sent the details to your registered number. Thank you!' },
    ];
    newCall.summary = 'Call completed successfully. Customer requested enrollment link.';
  }, 30000);

  res.status(201).json(newCall);
});

// Legacy alias — old frontend used /api/calls/outbound POST
app.post('/api/calls/outbound', requireAuth, (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Only Admins can initiate calls' });
  }
  addCall(req.body);
  res.status(201).json({ success: true, call: req.body });
});

// ── GET /api/pricing ──────────────────────────────────────
app.get('/api/pricing', requireAuth, (req, res) => {
  const calls   = getAllCalls({ limit: 500 });
  const summary = getPricingSummary(calls);
  const daily   = getDailySpend(calls);
  res.json({ summary, daily });
});

// ── GET /api/agents ───────────────────────────────────────
app.get('/api/agents', requireAuth, (req, res) => {
  res.json(AGENTS.map(({ id, name, script, rate_rs }) => ({ id, name, script, rate_rs })));
});

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0', timestamp: new Date().toISOString() });
});

// Fallback to index.html for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ── Start Server ──────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`[Seevora v2] API server running → http://localhost:${PORT}`);
    console.log(`  POST /auth/login           — Authenticate`);
    console.log(`  GET  /calls                — List all calls`);
    console.log(`  GET  /calls/:id            — Call detail + transcript`);
    console.log(`  POST /calls/dispatch       — Dispatch outbound call`);
    console.log(`  GET  /api/agents           — List agents`);
    console.log(`  GET  /api/health           — Health check`);
  });
}

export default app;
