import express from 'express';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import path from 'path';
import { 
  USERS, 
  hashPassword, 
  getOutboundCalls, 
  getInboundCalls, 
  getAllCalls, 
  getPricingSummary, 
  getDailySpend, 
  addOutboundCall 
} from './backend/data.js';

const app = express();
const PORT = 3000;
const JWT_SECRET = 'seevora_super_secret_jwt_key_2026';

app.use(express.json());

// Serve static frontend files
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dirname));

// ── Authentication Middleware ──────────────────────────────
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user payload to request
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
  }
}

// ── Public Endpoints ───────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const hashedInput = hashPassword(password);
  const user = USERS.find(u => u.email === email && u.passwordHash === hashedInput);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Issue JWT Token
  const payload = { 
    userId: user.id, 
    name: user.name, 
    email: user.email, 
    role: user.role, 
    initials: user.initials 
  };
  
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

  res.json({ token, user: payload });
});

// ── Secure API Endpoints ───────────────────────────────────
app.get('/api/calls/outbound', requireAuth, (req, res) => {
  res.json(getOutboundCalls());
});

app.get('/api/calls/inbound', requireAuth, (req, res) => {
  res.json(getInboundCalls());
});

app.get('/api/calls/unified', requireAuth, (req, res) => {
  res.json(getAllCalls());
});

app.post('/api/calls/outbound', requireAuth, (req, res) => {
  // Authorization check
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Only Admins can initiate calls' });
  }
  
  const call = req.body;
  addOutboundCall(call);
  res.status(201).json({ success: true, call });
});

app.get('/api/pricing', requireAuth, (req, res) => {
  const calls = getAllCalls();
  const summary = getPricingSummary(calls);
  const daily = getDailySpend(calls);
  res.json({ summary, daily });
});

// Fallback to index.html for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start Server ───────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`[Seevora Backend] Secure API server running on http://localhost:${PORT}`);
  });
}

export default app;
