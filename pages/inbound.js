// ============================================================
//  Inbound Calls Page
// ============================================================

import { getInboundCalls } from '../api.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar, updateApiStatusBadge } from '../components/topbar.js';
import { initCardViz } from '../components/three-card-viz.js';
import { openVoiceSimulator } from '../components/voice-simulator.js';

function statusBadge(status) {
  const map = {
    answered: `<span class="badge badge-answered">Answered</span>`,
    completed: `<span class="badge badge-completed">Completed</span>`,
    missed: `<span class="badge badge-missed">Missed</span>`,
    voicemail: `<span class="badge badge-voicemail">Voicemail</span>`,
    failed: `<span class="badge badge-failed">Failed</span>`,
    'in-progress': `<span class="badge badge-in-progress"><span class="pulse-dot"></span>Live</span>`,
    calling: `<span class="badge badge-in-progress"><span class="pulse-dot"></span>Calling</span>`,
  };
  return map[status] || `<span class="badge">${status}</span>`;
}

function renderGrid(calls) {
  if (!calls.length) return `
    <div class="empty-state">
      <div class="empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16v.92z"/></svg></div>
      <h3>No inbound calls found</h3>
      <p>Try adjusting your filters.</p>
    </div>
  `;

  return `
    <div class="card-grid" id="inbound-tbody">
      ${calls.map(call => {
    const nameOrPhone = call.callerName || call.phone;
    const initial = nameOrPhone.charAt(0).toUpperCase();
    const isLive = call.status === 'in-progress';

    return `
        <div class="conv-card inbound-row" data-id="${call.id}">
          <div class="conv-card-header">
            <div class="conv-profile">
              <div class="conv-avatar">
                <span class="conv-avatar-placeholder">${initial}</span>
              </div>
              <div>
                <div class="conv-name">${nameOrPhone}</div>
                <div class="conv-sub">${call.agent || 'Routing...'}</div>
              </div>
            </div>
            <div class="conv-status ${call.status}">
              ${isLive ? '<span class="pulse-dot" style="margin-right:2px; color:inherit;"></span>' : ''}
              ${call.status.charAt(0).toUpperCase() + call.status.slice(1)}
            </div>
          </div>
          
          <div class="conv-meta">
            <div class="conv-meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              ${call.id}
            </div>
            <div class="conv-meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${call.duration}
            </div>
            <div class="conv-meta-item" style="margin-left:auto;">
              ${call.dateFormatted}
            </div>
          </div>

          <div class="conv-waveform">
            <div class="conv-waveform-label">
              <span>Recording</span>
              <span>0:00 / ${call.duration}</span>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <button class="conv-play-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </button>
              <div class="conv-waveform-bars" style="flex:1; gap: 1.5px;">
                ${Array.from({ length: 40 }).map((_, i) => {
      let h = Math.random() * 100;
      if (call.status === 'missed') h = 10;
      const isPeak = h > 75;
      return `<div class="conv-waveform-bar ${isPeak ? 'peak' : ''}" style="height:${Math.max(10, h)}%"></div>`;
    }).join('')}
              </div>
            </div>
          </div>

          <div class="conv-footer">
            ${isLive
        ? `<button class="btn-pill-primary detail-btn" data-id="${call.id}">Monitor Now <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></button>`
        : `<button class="btn-link-action detail-btn" data-id="${call.id}">View Details →</button>`}
          </div>
        </div>
        `;
  }).join('')}
    </div>
  `;
}

export async function renderInbound(user, navigate) {
  const customInbound = JSON.parse(localStorage.getItem('seevora_inbound_calls') || 'null');
  const initialCalls = await getInboundCalls();
  const calls = customInbound || initialCalls;

  const inboundConfig = JSON.parse(localStorage.getItem('seevora_inbound_config') || 'null') || {
    virtualNumber: '+91 80 4567 8900',
    forwardingNumber: '+91 98765 43210',
    greeting: `Hello! Thank you for calling ${user?.businessName || 'our business'}. How can I direct your call today?`,
    hours: '24/7 Always Active',
    humanTransfer: true
  };

  const answered = calls.filter(c => c.status === 'answered').length;
  const missed = calls.filter(c => c.status === 'missed').length;
  const voicemail = calls.filter(c => c.status === 'voicemail').length;
  const totalCost = calls.reduce((acc, c) => acc + (c.cost?.total || 0), 0);

  return `
    <div class="dashboard-shell">
      ${renderSidebar('inbound', user)}
      <div class="main-content" style="background:#f4f6fa;">
        ${renderTopbar({ title: 'Inbound Calls', subtitle: 'Monitor and review incoming AI-handled calls', user })}
        <div class="page-content page-enter">

          <!-- Dedicated Virtual Number (DID) Card -->
          <div style="background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%); border-radius: 20px; padding: 24px 28px; margin-bottom: 26px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; border-radius: 14px; background: #e0f9ff; color: #0284c7; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16v.92z"/></svg>
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 1.25rem; font-weight: 800; color: #0f172a; letter-spacing: -0.01em;" id="display-virtual-num">${inboundConfig.virtualNumber}</span>
                  <button id="btn-copy-virtual-num" title="Copy Number" style="background: transparent; border: none; color: #0ea5e9; cursor: pointer; padding: 2px; display: flex; align-items: center;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                </div>
                <p style="font-size: 0.85rem; color: #64748b; margin: 4px 0 0 0;">
                  Dedicated AI Voice Line • Human Transfer: <strong style="color:#0f172a;" id="display-forwarding-num">${inboundConfig.forwardingNumber}</strong> • ${inboundConfig.hours}
                </p>
              </div>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button id="btn-simulate-inbound" class="btn" style="background: #0ea5e9; color: #fff; font-weight: 600; padding: 9px 16px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.85rem; box-shadow: 0 4px 12px rgba(14,165,233,0.25);">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16v.92z"/></svg>
                <span>Simulate Inbound Call</span>
              </button>
              <button id="btn-open-inbound-config" class="btn" style="background: #fff; color: #0f172a; font-weight: 600; padding: 9px 16px; border-radius: 10px; border: 1px solid #cbd5e1; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.85rem;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                <span>Call Forwarding & Settings</span>
              </button>
            </div>
          </div>

          <!-- Flat KPI Metrics -->
          <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px;">
            
            <!-- KPI 1 -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <!-- Giant BG Icon -->
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16v.92z"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Total Inbound Calls</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">${calls.length}</div>
                <div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">Last 30 days</div>
              </div>
            </div>
            
            <!-- KPI 2 -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <!-- Giant BG Icon -->
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Answered</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">${answered}</div>
                <div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">${calls.length > 0 ? Math.round((answered / calls.length) * 100) : 0}% Answer Rate</div>
              </div>
            </div>

            <!-- KPI 3 -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <!-- Giant BG Icon -->
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Missed / Voicemail</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">${missed + voicemail}</div>
                <div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">Requires Follow-up</div>
              </div>
            </div>
          </div>

          <!-- Filters -->
          <div class="filter-bar" style="background:transparent; padding:0; border:none;">
            <div style="font-weight:700; font-size:1.2rem; margin-right:20px; display:flex; align-items:center; gap:8px;">
              Conversation <span style="font-size:0.8rem; color:#64748b; font-weight:600;">· All</span>
            </div>
            
            <div style="display:flex; gap:12px; margin-left:auto;">
              <select class="select select-sm" id="inbound-status-filter" style="width:auto; border-radius:20px; background:#fff;">
                <option value="">All Statuses</option>
                <option value="answered">Answered</option>
                <option value="missed">Missed</option>
                <option value="voicemail">Voicemail</option>
              </select>
              <div class="search-box" style="border-radius:20px; background:#fff;">
                <div class="search-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
                <input type="text" id="inbound-search" placeholder="Search..." style="width:120px;" />
              </div>
            </div>
          </div>

          <!-- Grid -->
          <div id="inbound-table-wrap">
            ${renderGrid(calls)}
          </div>

          <!-- Inbound Settings & Call Forwarding Modal -->
          <div id="inbound-settings-modal" class="modal-overlay hidden">
            <div class="modal" style="max-width: 520px;">
              <div class="modal-header">
                <div>
                  <div class="modal-title">Inbound Voice Configuration</div>
                  <div class="modal-subtitle">Configure receptionist greeting & human call forwarding</div>
                </div>
                <button class="modal-close" id="inbound-modal-close">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <div style="padding: 24px;">
                <div class="form-group" style="margin-bottom: 16px;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.85rem; color: #0f172a; margin-bottom: 6px; display: block;">Dedicated Virtual Phone Number</label>
                  <input type="text" id="cfg-virtual-num" value="${inboundConfig.virtualNumber}" readonly style="width: 100%; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 600; color: #64748b; font-family: monospace;" />
                  <span style="font-size: 0.75rem; color: #64748b; margin-top: 4px; display: block;">Managed by Seevora Telecom Gateway</span>
                </div>

                <div class="form-group" style="margin-bottom: 16px;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.85rem; color: #0f172a; margin-bottom: 6px; display: block;">Human Agent Transfer Number (Fallback)</label>
                  <input type="text" id="cfg-forwarding-num" value="${inboundConfig.forwardingNumber}" placeholder="+91 98765 43210" style="width: 100%; padding: 10px 14px; background: #fff; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.9rem; color: #0f172a; box-sizing: border-box;" />
                  <span style="font-size: 0.75rem; color: #64748b; margin-top: 4px; display: block;">If a caller requests a live manager, AI seamlessly bridges the call to this mobile.</span>
                </div>

                <div class="form-group" style="margin-bottom: 16px;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.85rem; color: #0f172a; margin-bottom: 6px; display: block;">Inbound Welcome Greeting</label>
                  <textarea id="cfg-greeting" rows="3" style="width: 100%; padding: 10px 14px; background: #fff; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.85rem; color: #0f172a; box-sizing: border-box; resize: vertical;">${inboundConfig.greeting}</textarea>
                </div>

                <div class="form-group" style="margin-bottom: 24px;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.85rem; color: #0f172a; margin-bottom: 6px; display: block;">Operating Schedule</label>
                  <select id="cfg-hours" style="width: 100%; padding: 10px 14px; background: #fff; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.85rem; color: #0f172a;">
                    <option value="24/7 Always Active" ${inboundConfig.hours === '24/7 Always Active' ? 'selected' : ''}>24/7 — AI Answers All Incoming Calls Instantly</option>
                    <option value="9:00 AM – 8:00 PM (IST)" ${inboundConfig.hours === '9:00 AM – 8:00 PM (IST)' ? 'selected' : ''}>9:00 AM – 8:00 PM (IST) with After-Hours Voicemail</option>
                  </select>
                </div>

                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                  <button id="btn-cancel-inbound-cfg" style="padding: 10px 18px; border-radius: 10px; border: 1px solid #cbd5e1; background: #fff; font-weight: 600; color: #64748b; cursor: pointer;">Cancel</button>
                  <button id="btn-save-inbound-cfg" style="padding: 10px 20px; border-radius: 10px; border: none; background: #0ea5e9; font-weight: 700; color: #fff; cursor: pointer;">Save Settings</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function initInbound(user, navigate) {
  const customInbound = JSON.parse(localStorage.getItem('seevora_inbound_calls') || 'null');
  const initialCalls = await getInboundCalls();
  let calls = customInbound || initialCalls;
  let filtered = [...calls];

  // 3D Canvas visualizers removed in favor of clean watermark icons

  // Update API status badge live
  updateApiStatusBadge();

  document.querySelectorAll('.side-nav-link[data-route]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
  });
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('seevora_session');
    navigate('login');
  });

  const search = document.getElementById('inbound-search');
  const statusF = document.getElementById('inbound-status-filter');
  const countEl = document.getElementById('inbound-count');
  const tableWrap = document.getElementById('inbound-table-wrap');

  function applyFilters() {
    const q = (search?.value || '').toLowerCase();
    const s = statusF?.value || '';
    filtered = calls.filter(c => {
      if (q && !c.phone.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q) && !(c.callerName || '').toLowerCase().includes(q)) return false;
      if (s && c.status !== s) return false;
      return true;
    });
    if (countEl) countEl.textContent = `${filtered.length} calls`;
    if (tableWrap) tableWrap.innerHTML = renderGrid(filtered);
    bindDetailBtns();
    bindPlayBtns();
  }

  function bindPlayBtns() {
    document.querySelectorAll('.conv-play-btn').forEach(btn => {
      // Prevent duplicate bindings
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      let playing = false;
      let interval = null;
      let currentSec = 0;

      const wrapper = newBtn.closest('.conv-waveform');
      const label = wrapper.querySelector('.conv-waveform-label span:nth-child(2)');
      const bars = Array.from(wrapper.querySelectorAll('.conv-waveform-bar'));
      const durationText = label.textContent.split(' / ')[1] || "0:00";
      const [m, s] = durationText.split(':').map(Number);
      const totalSec = isNaN(m) ? 0 : (m * 60 + s);

      function updateUI() {
        label.textContent = `${Math.floor(currentSec / 60)}:${String(currentSec % 60).padStart(2, '0')} / ${durationText}`;
        bars.forEach((b, i) => {
          b.classList.toggle('played', (i / bars.length) <= (currentSec / totalSec));
        });
      }

      // Allow seeking by clicking on bars
      bars.forEach((bar, i) => {
        bar.addEventListener('click', (ev) => {
          ev.stopPropagation();
          if (totalSec === 0) return;
          const pct = (i + 1) / bars.length;
          currentSec = Math.round(pct * totalSec);
          updateUI();
        });
      });

      newBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (totalSec === 0) {
          import('../components/toast.js').then(({ showToast }) => showToast({ type: 'info', title: 'No Audio', message: 'No recording available for this call.' }));
          return;
        }

        playing = !playing;
        const svgPlay = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
        const svgPause = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
        newBtn.innerHTML = playing ? svgPause : svgPlay;

        if (playing) {
          if (currentSec >= totalSec) currentSec = 0;
          interval = setInterval(() => {
            currentSec++;
            if (currentSec >= totalSec) {
              clearInterval(interval);
              playing = false;
              newBtn.innerHTML = svgPlay;
            }
            updateUI();
          }, 1000);
        } else {
          clearInterval(interval);
        }
      });
    });
  }

  function bindDetailBtns() {
    document.querySelectorAll('.detail-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigate('inbound-detail', { id: btn.dataset.id });
      });
    });

    document.querySelectorAll('.inbound-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.detail-btn')) return;
        navigate('inbound-detail', { id: row.dataset.id });
      });
    });
  }

  search?.addEventListener('input', applyFilters);
  statusF?.addEventListener('change', applyFilters);
  document.getElementById('inbound-clear-filters')?.addEventListener('click', () => {
    if (search) search.value = '';
    if (statusF) statusF.value = '';
    applyFilters();
  });

  // ── Virtual Number & Inbound Settings Handlers ─────────
  const modal = document.getElementById('inbound-settings-modal');
  const openModalBtn = document.getElementById('btn-open-inbound-config');
  const closeModalBtn = document.getElementById('inbound-modal-close');
  const cancelModalBtn = document.getElementById('btn-cancel-inbound-cfg');
  const saveModalBtn = document.getElementById('btn-save-inbound-cfg');
  const copyNumBtn = document.getElementById('btn-copy-virtual-num');
  const simCallBtn = document.getElementById('btn-simulate-inbound');

  copyNumBtn?.addEventListener('click', () => {
    const num = document.getElementById('display-virtual-num')?.textContent || '+91 80 4567 8900';
    navigator.clipboard.writeText(num).then(() => {
      import('../components/toast.js').then(({ showToast }) => {
        showToast({ type: 'success', title: 'Copied!', message: `${num} copied to clipboard.` });
      });
    });
  });

  openModalBtn?.addEventListener('click', () => modal?.classList.remove('hidden'));
  closeModalBtn?.addEventListener('click', () => modal?.classList.add('hidden'));
  cancelModalBtn?.addEventListener('click', () => modal?.classList.add('hidden'));

  saveModalBtn?.addEventListener('click', () => {
    const fwNum = document.getElementById('cfg-forwarding-num')?.value.trim() || '+91 98765 43210';
    const greeting = document.getElementById('cfg-greeting')?.value.trim();
    const hours = document.getElementById('cfg-hours')?.value;

    const saved = {
      virtualNumber: '+91 80 4567 8900',
      forwardingNumber: fwNum,
      greeting: greeting,
      hours: hours,
      humanTransfer: true
    };
    localStorage.setItem('seevora_inbound_config', JSON.stringify(saved));
    const dispFw = document.getElementById('display-forwarding-num');
    if (dispFw) dispFw.textContent = fwNum;

    modal?.classList.add('hidden');
    import('../components/toast.js').then(({ showToast }) => {
      showToast({ type: 'success', title: 'Settings Saved', message: 'Inbound receptionist & forwarding rules updated.' });
    });
  });

  simCallBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const randomNames = ['Ananya Verma', 'Kunal Malhotra', 'Pooja Singhania', 'Vikram Sethi', 'Neha Kulkarni'];
    const randomPhones = ['+91 98112 34567', '+91 98201 98765', '+91 99345 67890', '+91 98450 12345'];
    const chosenName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const chosenPhone = randomPhones[Math.floor(Math.random() * randomPhones.length)];
    const durations = ['1m 12s', '2m 04s', '0m 48s', '1m 35s'];

    const newInboundCall = {
      id: `inb-${Date.now().toString().slice(-4)}`,
      callerName: chosenName,
      phone: chosenPhone,
      agent: `${user?.businessName || 'Business'} AI Receptionist`,
      duration: durations[Math.floor(Math.random() * durations.length)],
      dateFormatted: 'Just now',
      status: 'answered',
      cost: { total: 1.80 },
      sentiment: 'Positive',
      summary: 'Customer called inquiring about current service pricing and availability. AI answered all FAQs successfully.'
    };

    calls.unshift(newInboundCall);
    localStorage.setItem('seevora_inbound_calls', JSON.stringify(calls));
    applyFilters();

    import('../components/toast.js').then(({ showToast }) => {
      showToast({
        type: 'success',
        title: 'Incoming Call Connected! 📞',
        message: `${chosenName} (${chosenPhone}) is calling your AI Receptionist.`
      });
    });

    openVoiceSimulator({
      businessName: user?.businessName || 'Your Business',
      products: 'Inbound Customer Service & Receptionist',
      script: 'Thank you for calling. I am your AI receptionist. How can I assist you with your inquiry today?',
      agentName: 'AI Receptionist'
    });
  });

  bindDetailBtns();
  bindPlayBtns();
}

