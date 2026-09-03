// ============================================================
//  Dashboard Overview Page (Role-Based: Client vs Admin)
// ============================================================

import { renderSidebar } from '../components/sidebar.js';
import { openVoiceSimulator } from '../components/voice-simulator.js';

export function renderDashboard(user, navigate) {
  const isClient = (user?.role || '').toLowerCase() === 'client';
  return isClient ? renderClientDashboard(user) : renderAdminDashboard(user);
}

// ────────────────────────────────────────────────────────────
//  CLIENT DASHBOARD (Self-Serve SaaS Workspace)
// ────────────────────────────────────────────────────────────
function renderClientDashboard(user) {
  const onboarding = JSON.parse(localStorage.getItem('seevora_onboarding') || '{}');
  const businessName = user?.businessName || onboarding?.businessName || 'Your Business';
  const products = onboarding?.products || 'AI Voice Calling Solutions';
  const walletBalance = user?.walletBalance !== undefined ? user.walletBalance : 500;
  const script = onboarding?.generatedScript || `Hello! This is your AI Voice Agent calling from ${businessName}. How can I assist you today?`;

  const clientCalls = JSON.parse(localStorage.getItem('seevora_client_calls') || '[]');
  const totalCalls = clientCalls.length;
  const connectedCalls = clientCalls.filter(c => c.status === 'completed').length;
  const totalMins = clientCalls.reduce((acc, c) => acc + (c.duration_seconds ? Math.round(c.duration_seconds / 60) : 1), 0);

  return `
    <div class="dashboard-shell page-enter">
      ${renderSidebar('dashboard', user)}
      
      <main class="main-content">
        <!-- Topbar -->
        <header class="topbar">
          <div class="topbar-left">
            <h1>Welcome, ${user?.name || 'Partner'}</h1>
            <p>${businessName} • Automated Voice AI Dashboard</p>
          </div>
          <div class="topbar-right" style="display:flex; align-items:center; gap:12px;">
            <button class="btn btn-primary btn-sm" id="client-quick-call-btn" style="background:#0ea5e9; border:none; padding:8px 16px; font-weight:600; border-radius:10px; display:flex; align-items:center; gap:6px; cursor:pointer;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 24 16v.92z"/></svg>
              <span>Make a Call</span>
            </button>
            <button class="btn btn-secondary btn-sm" id="client-quick-leads-btn" style="border:1px solid #e2e8f0; background:#fff; padding:8px 16px; font-weight:600; border-radius:10px; display:flex; align-items:center; gap:6px; color:#0f172a; cursor:pointer;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <span>Bulk Leads</span>
            </button>
            <div style="display: flex; align-items: center; gap: 8px; background: #f8fafc; padding: 4px 12px 4px 4px; border-radius: 9999px; border: 1px solid #f1f5f9;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: #e0f9ff; color: #0369a1; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600;">${user?.initials || 'U'}</div>
              <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${user?.name || 'Client'}</span>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <div class="page-container" style="padding-top: 24px;">

          <!-- Client Setup Success Banner (Light Theme) -->
          <div style="background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%); border-radius: 20px; padding: 28px 32px; color: #0f172a; margin-bottom: 28px; position: relative; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
            <div style="position: absolute; right: 24px; top: 50%; transform: translateY(-50%); color: #0ea5e9; opacity: 0.07;">
              <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>
            </div>
            <div style="max-width: 650px; position: relative; z-index: 1;">
              <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 8px; color: #0f172a;">Your Automated Sales Voice Agent is Ready!</h2>
              <p style="font-size: 0.92rem; color: #475569; line-height: 1.6; margin-bottom: 20px;">
                Tailored for <strong style="color: #0f172a;">${products}</strong>. Dispatches voice calls, handles prospect questions, notes sales objections, and logs transcripts automatically.
              </p>
              <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <button class="btn" id="btn-hero-test-call" style="background: #0ea5e9; color: #fff; font-weight: 700; border-radius: 10px; padding: 10px 20px; font-size: 0.9rem; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(14,165,233,0.25);">
                  Dispatch Test Call
                </button>
                <button class="btn" id="btn-hero-browser-demo" style="background: #f0f9ff; color: #0284c7; font-weight: 700; border-radius: 10px; padding: 10px 18px; font-size: 0.9rem; border: 1.5px solid #0ea5e9; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                  <span>Test in Browser (Mic)</span>
                </button>
                <button class="btn" id="btn-hero-upload" style="background: #fff; color: #0f172a; font-weight: 600; border-radius: 10px; padding: 10px 18px; font-size: 0.9rem; border: 1px solid #cbd5e1; cursor: pointer;">
                  Upload Leads (Excel)
                </button>
                <button class="btn" id="btn-hero-train-audio" style="background: #fff; color: #0f172a; font-weight: 600; border-radius: 10px; padding: 10px 18px; font-size: 0.9rem; border: 1px solid #cbd5e1; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
                  <span>Train with Audio</span>
                </button>
                <button class="btn" id="btn-hero-edit-agent" style="background: transparent; color: #0284c7; font-weight: 600; border-radius: 10px; padding: 10px 16px; font-size: 0.9rem; border: none; cursor: pointer;">
                  Customize Script →
                </button>
              </div>
            </div>
          </div>

          <!-- KPI Row -->
          <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px;">
            
            <!-- Wallet Card -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Calling Balance</div>
                  <button id="btn-recharge-wallet" style="background:#e0f9ff; color:#0284c7; border:none; padding:3px 10px; border-radius:6px; font-size:0.72rem; font-weight:700; cursor:pointer;">+ Add Funds</button>
                </div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">₹${walletBalance}</div>
                <div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">Free Trial Active (~${Math.round(walletBalance / 1.5)} mins)</div>
              </div>
            </div>

            <!-- Agent Status -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">AI Voice Agent</div>
                <div style="font-size: 1.8rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">Live & Ready</div>
                <div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">₹1.50 / answered min</div>
              </div>
            </div>

            <!-- Calls Dispatched -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 24 16v.92z"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Calls Dispatched</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">${totalCalls}</div>
                <div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">${connectedCalls} completed</div>
              </div>
            </div>

            <!-- Minutes Used -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Minutes Used</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">${totalMins}m</div>
                <div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">Outbound calling time</div>
              </div>
            </div>

          </div>

          <!-- Three Main Action Panels -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 28px;">
            
            <!-- Quick Single Call Panel -->
            <div class="panel" style="padding: 24px; border-radius: 20px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #f1f5f9; background:#fff;">
              <div>
                <div style="display:flex; align-items:center; gap:10px; margin-bottom: 12px;">
                  <div style="width:38px; height:38px; border-radius:10px; background:#e0f9ff; color:#0284c7; display:flex; align-items:center; justify-content:center;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 24 16v.92z"/></svg>
                  </div>
                  <div>
                    <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">Test Live Voice Agent</h3>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">Place an immediate demonstration call to your mobile number</p>
                  </div>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
                  Experience how your AI agent introduces ${businessName}, pitches ${products}, and negotiates pricing with live interactive voice.
                </p>
              </div>
              <button class="btn btn-primary" id="btn-dashboard-dispatch" style="background:#0ea5e9; border:none; padding:12px 20px; font-weight:700; border-radius:12px; width:100%; display:flex; justify-content:center; align-items:center; gap:8px; cursor:pointer;">
                <span>Place Test Call to My Phone</span>
              </button>
            </div>

            <!-- Bulk Leads Campaign Panel -->
            <div class="panel" style="padding: 24px; border-radius: 20px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #f1f5f9; background:#fff;">
              <div>
                <div style="display:flex; align-items:center; gap:10px; margin-bottom: 12px;">
                  <div style="width:38px; height:38px; border-radius:10px; background:#e0f9ff; color:#0284c7; display:flex; align-items:center; justify-content:center;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <div>
                    <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">Bulk Lead Calling Campaign</h3>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">Upload Excel/CSV sheet with phone numbers & custom notes</p>
                  </div>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
                  Our AI reads previous lead interactions and past objections from your Excel sheet to dynamically personalize every single outgoing conversation.
                </p>
              </div>
              <button class="btn btn-secondary" id="btn-dashboard-upload-leads" style="border:1.5px solid #0ea5e9; color:#0ea5e9; background:#f0f9ff; padding:12px 20px; font-weight:700; border-radius:12px; width:100%; display:flex; justify-content:center; align-items:center; gap:8px; cursor:pointer;">
                <span>Open Bulk Excel Upload</span>
              </button>
            </div>

            <!-- Call Recording AI Training Panel -->
            <div class="panel" style="padding: 24px; border-radius: 20px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #f1f5f9; background:#fff;">
              <div>
                <div style="display:flex; align-items:center; gap:10px; margin-bottom: 12px;">
                  <div style="width:38px; height:38px; border-radius:10px; background:#e0f9ff; color:#0284c7; display:flex; align-items:center; justify-content:center;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                  </div>
                  <div>
                    <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">Train AI with Recordings</h3>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">Upload past human telecaller audio (.mp3, .wav)</p>
                  </div>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
                  Have audio from your best human callers? Upload them to automatically extract winning pitch hooks and objection rebuttals.
                </p>
              </div>
              <button class="btn btn-secondary" id="btn-dashboard-train-recordings" style="border:1.5px solid #0ea5e9; color:#0284c7; background:#f0f9ff; padding:12px 20px; font-weight:700; border-radius:12px; width:100%; display:flex; justify-content:center; align-items:center; gap:8px; cursor:pointer;">
                <span>Upload Audio & Train</span>
              </button>
            </div>

          </div>

          <!-- Active Agent Script Preview Panel -->
          <div class="panel" style="padding: 24px; border-radius: 20px; margin-bottom: 30px; border: 1px solid #f1f5f9; background:#fff;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <div style="width:10px; height:10px; background:#10b981; border-radius:50%;"></div>
                <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">Configured Agent Script & Pitch</h3>
              </div>
              <button id="btn-edit-script-link" style="background:transparent; border:none; color:#0ea5e9; font-size:0.85rem; font-weight:600; cursor:pointer;">Edit in AI Agents →</button>
            </div>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px; font-family:'JetBrains Mono', monospace; font-size:0.82rem; color:#334155; line-height:1.7; max-height:220px; overflow-y:auto; white-space:pre-wrap;">${script}</div>
          </div>

        </div>
      </main>
    </div>
  `;
}

// ────────────────────────────────────────────────────────────
//  ADMIN DASHBOARD (Original Global View)
// ────────────────────────────────────────────────────────────
function renderAdminDashboard(user) {
  return `
    <div class="dashboard-shell page-enter">
      ${renderSidebar('dashboard', user)}
      
      <main class="main-content">
        <!-- Topbar -->
        <header class="topbar">
          <div class="topbar-left">
            <h1>Dashboard Overview</h1>
            <p>High-level metrics and campaign performance</p>
          </div>
          <div class="topbar-right">
            <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; position: relative;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span style="position: absolute; top: 0; right: 0; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; border: 2px solid #fff;"></span>
            </button>
            <div style="display: flex; align-items: center; gap: 8px; background: #f8fafc; padding: 4px 12px 4px 4px; border-radius: 9999px; cursor: pointer; border: 1px solid #f1f5f9;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: #e0f9ff; color: #0369a1; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600;">${user?.initials || 'AD'}</div>
              <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${user?.name || 'Admin'}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted)"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <div class="page-container" style="padding-top: 24px;">
          
          <!-- KPI Row -->
          <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px;">
            
            <!-- KPI 1 -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 24 16v.92z"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Total Calls</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">3,024</div>
                <div><span style="background: #f1f5f9; color: #475569; font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 8px;">Across all agents</span></div>
              </div>
            </div>
            
            <!-- KPI 2 -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Avg Success Rate</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">71%</div>
                <div><span style="background: #f1f5f9; color: #475569; font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 8px;">Across all agents</span></div>
              </div>
            </div>

            <!-- KPI 3 -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Live / Calling</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">142</div>
                <div><span style="background: #f1f5f9; color: #475569; font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 8px;"><span class="pulse-dot" style="margin-right: 4px;"></span>Live Now</span></div>
              </div>
            </div>

            <!-- KPI 4 -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Total Cost</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">₹42.8k</div>
                <div><span style="background: #f1f5f9; color: #475569; font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 8px;">Outbound spend</span></div>
              </div>
            </div>
          </div>

          <!-- Charts Row -->
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 32px;">
            <!-- Call Volume Chart (Mockup) -->
            <div class="glass-card" style="padding: 24px; border-radius: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">Call Volume Trend</h3>
                <select style="padding: 6px 12px; border-radius: 99px; border: 1px solid var(--border); font-size: 0.8rem; background: #f8fafc; color: var(--text-secondary); outline: none;">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Year</option>
                </select>
              </div>
              <div style="height: 280px; width: 100%; position: relative;">
                <canvas id="dashboard-volume-chart"></canvas>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.75rem; color: var(--text-muted);">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>

            <!-- Agent Performance -->
            <div class="glass-card" style="padding: 24px; border-radius: 20px;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 24px;">Top Performing Agents</h3>
              <div style="display: flex; flex-direction: column; gap: 20px;">
                <div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">Sales Agent (Sarah)</span>
                    <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">84%</span>
                  </div>
                  <div style="width: 100%; height: 8px; background: var(--border); border-radius: 99px; overflow: hidden;">
                    <div style="width: 84%; height: 100%; background: #0ea5e9; border-radius: 99px;"></div>
                  </div>
                </div>
                <div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">Customer Support</span>
                    <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">68%</span>
                  </div>
                  <div style="width: 100%; height: 8px; background: var(--border); border-radius: 99px; overflow: hidden;">
                    <div style="width: 68%; height: 100%; background: #10b981; border-radius: 99px;"></div>
                  </div>
                </div>
                <div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">Lead Gen Bot</span>
                    <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">45%</span>
                  </div>
                  <div style="width: 100%; height: 8px; background: var(--border); border-radius: 99px; overflow: hidden;">
                    <div style="width: 45%; height: 100%; background: #f59e0b; border-radius: 99px;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  `;
}

// ────────────────────────────────────────────────────────────
//  INIT DASHBOARD
// ────────────────────────────────────────────────────────────
export function initDashboard(user, navigate) {
  const isClient = (user?.role || '').toLowerCase() === 'client';

  if (isClient) {
    // Client dashboard event bindings
    const handleNavigate = (route) => {
      if (navigate) navigate(route);
    };

    document.getElementById('client-quick-call-btn')?.addEventListener('click', () => handleNavigate('outbound'));
    document.getElementById('client-quick-leads-btn')?.addEventListener('click', () => handleNavigate('outbound'));
    document.getElementById('btn-hero-test-call')?.addEventListener('click', () => handleNavigate('outbound'));
    document.getElementById('btn-hero-upload')?.addEventListener('click', () => handleNavigate('outbound'));
    document.getElementById('btn-hero-train-audio')?.addEventListener('click', () => handleNavigate('agents', { tab: 'training' }));
    document.getElementById('btn-hero-browser-demo')?.addEventListener('click', () => {
      const onboarding = JSON.parse(localStorage.getItem('seevora_onboarding') || '{}');
      const bName = user?.businessName || onboarding?.businessName || 'Your Business';
      const prods = onboarding?.products || 'AI Voice Calling Solutions';
      const scr = onboarding?.generatedScript || '';
      openVoiceSimulator({ businessName: bName, products: prods, script: scr, agentName: 'Aria' });
    });
    document.getElementById('btn-dashboard-dispatch')?.addEventListener('click', () => handleNavigate('outbound'));
    document.getElementById('btn-dashboard-upload-leads')?.addEventListener('click', () => handleNavigate('outbound'));
    document.getElementById('btn-dashboard-train-recordings')?.addEventListener('click', () => handleNavigate('agents', { tab: 'training' }));
    document.getElementById('btn-hero-edit-agent')?.addEventListener('click', () => handleNavigate('agents'));
    document.getElementById('btn-edit-script-link')?.addEventListener('click', () => handleNavigate('agents'));
    document.getElementById('btn-recharge-wallet')?.addEventListener('click', () => handleNavigate('client-billing'));
    return;
  }

  // Admin: Build Chart.js Graph
  const ctx = document.getElementById('dashboard-volume-chart')?.getContext('2d');
  if (ctx && window.Chart) {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['8/4', '8/7', '8/10', '8/13', '8/16', '8/19', '8/22', '8/25', '8/28', '8/31'],
        datasets: [{
          label: 'Call Volume',
          data: [120, 150, 180, 140, 210, 250, 310, 290, 380, 420],
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14,165,233,0.1)',
          pointBackgroundColor: '#0ea5e9',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11 } } },
          y: { 
            beginAtZero: true, 
            grid: { color: '#f1f5f9' },
            ticks: { color: '#64748b', font: { size: 11 } }
          }
        }
      }
    });
  }
}
