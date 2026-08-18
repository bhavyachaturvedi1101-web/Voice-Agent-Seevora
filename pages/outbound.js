// ============================================================
//  Outbound Calls Page — Real API Integration
// ============================================================

import { getOutboundCalls, dispatchCall, fetchAgents, AGENTS } from '../api.js';
import { showToast } from '../components/toast.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar, updateApiStatusBadge } from '../components/topbar.js';

function statusBadge(status) {
  const map = {
    completed:     `<span class="badge badge-completed"><span class="pulse-dot" style="display:none"></span>Completed</span>`,
    failed:        `<span class="badge badge-failed">Failed</span>`,
    missed:        `<span class="badge badge-missed">Missed</span>`,
    'in-progress': `<span class="badge badge-in-progress"><span class="pulse-dot"></span>Live</span>`,
    calling:       `<span class="badge badge-in-progress"><span class="pulse-dot"></span>Calling</span>`,
    scheduled:     `<span class="badge badge-scheduled">Scheduled</span>`,
    queued:        `<span class="badge badge-queued"><span class="pulse-dot"></span>Queued</span>`,
  };
  return map[status] || `<span class="badge">${status}</span>`;
}

function initiatedBadge(method) {
  const map = {
    manual:    `<span class="badge badge-manual">Manual</span>`,
    api:       `<span class="badge badge-api">API</span>`,
    bulk:      `<span class="badge badge-bulk">Bulk Upload</span>`,
    scheduled: `<span class="badge badge-auto">Scheduled</span>`,
  };
  return map[method] || `<span class="badge">${method}</span>`;
}

function formatCost(cost, totalCostRs) {
  // Prefer total_cost_rs (INR) from real API
  if (totalCostRs > 0) return `<span class="col-cost">₹${totalCostRs.toFixed(2)}</span>`;
  if (!cost) return '<span style="color:var(--text-muted);">—</span>';
  return `<span class="col-cost">₹${cost.total.toFixed(2)}</span>`;
}

function renderCallDetail(call) {
  if (!call) return '';
  const hasTranscript = call.transcript && call.transcript.length > 0;
  const meta = call.contact_meta || {};
  const hasMeta = Object.keys(meta).length > 0;
  return `
    <tr id="detail-row-${call.id}" class="detail-row-expanded">
      <td colspan="9" style="padding:0;border-bottom:1px solid rgba(108,99,255,0.15);">
        <div style="padding:20px 24px;background:rgba(108,99,255,0.04);border-top:1px solid rgba(108,99,255,0.15);" class="page-enter">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div>
              <div class="detail-section-title">Call Summary</div>
              <p style="font-size:0.875rem;color:var(--text-secondary);line-height:1.7;margin-bottom:16px;">
                ${call.summary || '<em style="color:var(--text-muted)">No summary available.</em>'}
              </p>
              ${hasMeta ? `
                <div class="detail-section-title" style="margin-top:12px;">Contact Metadata</div>
                <div class="cost-breakdown">
                  ${Object.entries(meta).map(([k,v]) => `
                    <div class="cost-row"><span class="cost-row-label">${k}</span><span class="cost-row-value mono">${v}</span></div>
                  `).join('')}
                </div>
              ` : ''}
              ${call.cost || call.total_cost_rs > 0 ? `
                <div class="detail-section-title" style="margin-top:12px;">Cost Breakdown</div>
                <div class="cost-breakdown">
                  <div class="cost-row"><span class="cost-row-label">Duration</span><span class="cost-row-value mono">${(call.duration_s/60).toFixed(2)} min</span></div>
                  <div class="cost-row"><span class="cost-row-label">Per-minute rate</span><span class="cost-row-value mono">₹${call.cost?.minuteRate?.toFixed(2) || '—'}/min</span></div>
                  <div class="cost-row"><span class="cost-row-label">Call cost</span><span class="cost-row-value mono">₹${call.cost?.callCost?.toFixed(2) || '—'}</span></div>
                  <div class="cost-row"><span class="cost-row-label">Platform fee</span><span class="cost-row-value mono">₹${call.cost?.platformFee?.toFixed(2) || '—'}</span></div>
                  <div class="cost-row cost-row-total"><span class="cost-row-label" style="font-weight:600;color:var(--text-primary);">Total</span><span class="cost-row-value">₹${call.total_cost_rs?.toFixed(2) || call.cost?.total?.toFixed(2) || '0.00'}</span></div>
                </div>
              ` : ''}
            </div>
            <div>
              <div class="detail-section-title">
                ${hasTranscript ? 'Transcript' : 'No Transcript Available'}
              </div>
              ${hasTranscript ? `
                <div class="transcript-container">
                  ${call.transcript.map(line => `
                    <div class="transcript-line">
                      <span class="transcript-speaker ${line.role || line.speaker}">${(line.role || line.speaker) === 'agent' ? 'AI Agent' : 'Caller'}</span>
                      <span class="transcript-text">${line.text}</span>
                      ${line.time ? `<span class="transcript-time">${line.time}</span>` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : `<p style="font-size:0.8rem;color:var(--text-muted);">Transcript not available for this call.</p>`}
            </div>
          </div>
        </div>
      </td>
    </tr>
  `;
}

function renderGrid(calls) {
  if (!calls.length) return `
    <div class="empty-state">
      <div class="empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 24 16v.92z"/></svg></div>
      <h3>No calls found</h3>
      <p>Try adjusting your filters or initiate a new call.</p>
    </div>
  `;
  
  return `
    <div class="card-grid" id="outbound-tbody">
      ${calls.map(call => {
        const displayName = call.contact_name || call.phone_number || call.phone || 'Unknown';
        const initial = displayName.charAt(0).toUpperCase();
        const isLive  = call.status === 'in-progress' || call.status === 'calling';
        const costStr = call.total_cost_rs > 0 ? `₹${call.total_cost_rs.toFixed(2)}` : '—';
        
        return `
        <div class="conv-card" data-id="${call.id}">
          <div class="conv-card-header">
            <div class="conv-profile">
              <div class="conv-avatar">
                <span class="conv-avatar-placeholder">${initial}</span>
              </div>
              <div>
                <div class="conv-name">${displayName}</div>
                <div class="conv-sub">${call.phone_number || call.phone || ''}</div>
              </div>
            </div>
            <div class="conv-status ${call.status}">
              ${isLive ? '<span class="pulse-dot" style="margin-right:2px; color:inherit;"></span>' : ''}
              ${call.status === 'calling' ? 'Calling...' : call.status.charAt(0).toUpperCase() + call.status.slice(1)}
            </div>
          </div>
          
          <div class="conv-meta">
            <div class="conv-meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${call.duration || '—'}
            </div>
            <div class="conv-meta-item">
              <span class="col-cost" style="font-weight:600;">${costStr}</span>
            </div>
            <div class="conv-meta-item" style="margin-left:auto;">
              ${call.dateFormatted || call.created_at || ''}
            </div>
          </div>

          <div class="conv-waveform">
            <div class="conv-waveform-label">
              <span>${call.agent || call.agent_name || 'AI Agent'}</span>
              <span>0:00 / ${call.duration || '—'}</span>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <button class="conv-play-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </button>
              <div class="conv-waveform-bars" style="flex:1; gap: 1.5px;">
                ${Array.from({length: 40}).map((_, i) => {
                  let h = Math.random() * 100;
                  const isPeak = h > 75;
                  return `<div class="conv-waveform-bar ${isPeak ? 'peak' : ''}" style="height:${Math.max(10, h)}%"></div>`;
                }).join('')}
              </div>
            </div>
          </div>

          <div class="conv-footer">
            ${isLive
              ? `<div style="display:flex;gap:8px;align-items:center;">
                  <button class="btn-pill-primary detail-btn" data-id="${call.id}">Monitor Now <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></button>
                  <button class="btn-link-action refresh-status-btn" data-id="${call.id}" title="Refresh call status from server" style="font-size:0.78rem;display:flex;align-items:center;gap:4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Refresh
                  </button>
                </div>`
              : `<button class="btn-link-action detail-btn" data-id="${call.id}">View Details →</button>`}
          </div>
        </div>
        `;
      }).join('')}
    </div>
  `;
}

let expandedRow = null;

export async function renderOutbound(user, navigate) {
  // Fetch agents from real API (populates AGENTS in api.js too)
  await fetchAgents().catch(() => {});

  const calls = await getOutboundCalls();
  const totalCalls = calls.length;
  const completed  = calls.filter(c => c.status === 'completed').length;
  const inProgress = calls.filter(c => c.status === 'in-progress' || c.status === 'calling').length;
  const failed     = calls.filter(c => c.status === 'failed').length;
  const totalCostRs = calls.reduce((acc, c) => acc + (c.total_cost_rs || c.cost?.total || 0), 0);

  const isAdmin = user?.role === 'Admin';

  return `
    <div class="dashboard-shell">
      ${renderSidebar('outbound', user)}
      <div class="main-content" style="background:#f4f6fa;">
        ${renderTopbar({
          title: 'Outbound Calls',
          subtitle: 'Launch and monitor AI voice campaigns',
          user: user,
          actions: `<button class="btn btn-primary btn-sm" id="initiate-call-btn"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New Call</button>`
        })}
        <div class="page-content page-enter">

          <!-- Stats -->
          <div class="stats-grid-modern">
            <div class="stat-card-modern">
              <div class="stat-header-modern">
                <span class="stat-title-modern">Total Outbound Calls</span>
                <span class="stat-icon-modern"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 24 16v.92z"/></svg></span>
              </div>
              <div class="stat-value-modern">${totalCalls}</div>
              <div class="stat-trend-modern neutral">All outbound activity</div>
            </div>
            
            <div class="stat-card-modern">
              <div class="stat-header-modern">
                <span class="stat-title-modern">Completed Successfully</span>
                <span class="stat-icon-modern"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></span>
              </div>
              <div class="stat-value-modern">${completed}</div>
              <div class="stat-trend-modern up">↑ ${totalCalls ? Math.round((completed/totalCalls)*100) : 0}% Success Rate</div>
            </div>
            
            <div class="stat-card-modern">
              <div class="stat-header-modern">
                <span class="stat-title-modern">Live / Calling</span>
                <span class="stat-icon-modern"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
              </div>
              <div class="stat-value-modern">${inProgress}</div>
              <div class="stat-trend-modern up"><span class="pulse-dot"></span> Live Now</div>
            </div>
            
            <div class="stat-card-modern">
              <div class="stat-header-modern">
                <span class="stat-title-modern">Total Cost (₹)</span>
                <span class="stat-icon-modern"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3a4.5 4.5 0 0 0 0-9H6"/></svg></span>
              </div>
              <div class="stat-value-modern">₹${totalCostRs.toFixed(2)}</div>
              <div class="stat-trend-modern neutral">Outbound spend</div>
            </div>
          </div>

          <!-- Filters -->
          <div class="filter-bar" style="background:transparent; padding:0; border:none;">
            <div style="font-weight:700; font-size:1.2rem; margin-right:20px; display:flex; align-items:center; gap:8px;">
              Conversation <span style="font-size:0.8rem; color:#64748b; font-weight:600;">· All</span>
            </div>
            
            <div style="display:flex; gap:12px; margin-left:auto;">
              <select class="select select-sm" id="outbound-status-filter" style="width:auto; border-radius:20px; background:#fff;">
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="failed">Failed</option>
                <option value="missed">Missed</option>
                <option value="scheduled">Scheduled</option>
              </select>
              <select class="select select-sm" id="outbound-agent-filter" style="width:auto; border-radius:20px; background:#fff;">
                <option value="">All Agents</option>
                ${AGENTS.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
              </select>
              <div class="search-box" style="border-radius:20px; background:#fff;">
                <div class="search-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
                <input type="text" id="outbound-search" placeholder="Search..." style="width:120px;" />
              </div>
            </div>
          </div>

          <!-- Grid -->
          <div id="outbound-table-wrap">
            ${renderGrid(calls)}
          </div>
        </div>
      </div>
    </div>

    <!-- Initiate Call Modal (Real API: POST /calls/dispatch) -->
    <div id="call-modal" class="modal-overlay hidden">
      <div class="modal">
        <div class="modal-header">
          <div>
            <div class="modal-title" id="modal-title-text">New Outbound Call</div>
            <div class="modal-subtitle" id="modal-subtitle-text">Dispatch immediately or schedule for later</div>
          </div>
          <button class="modal-close" id="call-modal-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Call Now / Schedule toggle -->
        <div style="display:flex;gap:8px;margin-bottom:18px;background:var(--surface-alt,#f4f6fa);border-radius:10px;padding:4px;">
          <button id="tab-now" style="flex:1;padding:8px;border:none;border-radius:8px;font-weight:600;font-size:0.85rem;cursor:pointer;background:#fff;color:var(--primary,#6c63ff);box-shadow:0 1px 4px rgba(0,0,0,.08);transition:all .2s;">⚡ Call Now</button>
          <button id="tab-schedule" style="flex:1;padding:8px;border:none;border-radius:8px;font-weight:600;font-size:0.85rem;cursor:pointer;background:transparent;color:var(--text-secondary,#64748b);transition:all .2s;">🗓 Schedule</button>
        </div>

        <div class="form-group">
          <label class="form-label" for="call-phone">Phone Number * <span style="color:var(--text-muted);font-weight:400;">(E.164 format)</span></label>
          <div class="input-with-icon">
            <div class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 24 16v.92z"/></svg>
            </div>
            <input class="input" type="tel" id="call-phone" placeholder="+919876543210" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="call-agent">AI Agent *</label>
          <select class="select" id="call-agent">
            <option value="">Select agent...</option>
            ${AGENTS.map(a => `<option value="${a.id}">${a.name} — ₹${a.rate_rs || a.rate || '—'}/min</option>`).join('')}
          </select>
        </div>

        <!-- Contact metadata -->
        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;margin-bottom:16px;">
          <div style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:10px;letter-spacing:0.04em;">CONTACT METADATA <span style="font-weight:400;opacity:0.6">(optional)</span></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" for="contact-firstname" style="font-size:0.78rem;">First Name</label>
              <input class="input" type="text" id="contact-firstname" placeholder="Rahul" />
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" for="contact-lastname" style="font-size:0.78rem;">Last Name</label>
              <input class="input" type="text" id="contact-lastname" placeholder="Sharma" />
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" for="contact-course" style="font-size:0.78rem;">Course / Product</label>
              <input class="input" type="text" id="contact-course" placeholder="Class 6 Admission" />
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" for="contact-fee" style="font-size:0.78rem;">Fee / Price</label>
              <input class="input" type="text" id="contact-fee" placeholder="Rs 15,000" />
            </div>
          </div>
        </div>

        <!-- Schedule fields (hidden by default) -->
        <div id="schedule-fields" class="hidden" style="background:rgba(108,99,255,0.06);border:1px solid rgba(108,99,255,0.2);border-radius:10px;padding:14px;margin-bottom:16px;">
          <div style="font-size:0.8rem;font-weight:600;color:#6c63ff;margin-bottom:10px;letter-spacing:0.04em;">🗓 SCHEDULE DETAILS</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" style="font-size:0.78rem;">Date *</label>
              <input class="input" type="date" id="schedule-date" />
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" style="font-size:0.78rem;">Time *</label>
              <input class="input" type="time" id="schedule-time" />
            </div>
          </div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:8px;">⚠️ The call will be queued and dispatched at the selected time.</div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" id="call-modal-cancel">Cancel</button>
          <button class="btn btn-success" id="call-now-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Call Now
          </button>
        </div>
      </div>
    </div>
  `;
}

export async function initOutbound(user, navigate) {
  const calls = await getOutboundCalls();
  let filtered = [...calls];

  // Update API status badge live
  updateApiStatusBadge();

  // --- Sidebar nav ---
  document.querySelectorAll('.bottom-nav-link[data-route]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
  });
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('seevora_session');
    navigate('login');
  });

  // --- Filters ---
  const search   = document.getElementById('outbound-search');
  const statusF  = document.getElementById('outbound-status-filter');
  const agentF   = document.getElementById('outbound-agent-filter');
  const initF    = document.getElementById('outbound-init-filter');
  const countEl  = document.getElementById('outbound-count');
  const tableWrap = document.getElementById('outbound-table-wrap');

  function applyFilters() {
    const q = search.value.toLowerCase();
    const s = statusF.value;
    const a = agentF.value;
    filtered = calls.filter(c => {
      if (q && !c.phone.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q) && !c.agent.toLowerCase().includes(q)) return false;
      if (s && c.status !== s) return false;
      if (a && c.agentId !== a) return false;
      return true;
    });
    tableWrap.innerHTML = renderGrid(filtered);
    bindDetailBtns();
    bindPlayBtns();
    bindRowExpand();
    bindRefreshBtns();
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
        label.textContent = `${Math.floor(currentSec/60)}:${String(currentSec%60).padStart(2,'0')} / ${durationText}`;
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
          import('../components/toast.js').then(({ showToast }) => showToast({type:'info', title:'No Audio', message:'No recording available for this call.'}));
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
  }

  function bindRefreshBtns() {
    document.querySelectorAll('.refresh-status-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const callId = btn.dataset.id;
        btn.innerHTML = `<span class="spinner" style="width:10px;height:10px;margin-right:4px;"></span> Updating...`;
        try {
          const { getCallById } = await import('../api.js');
          const updated = await getCallById(callId);
          if (updated) {
            const idx = filtered.findIndex(c => c.id === callId);
            if (idx !== -1) filtered[idx] = updated;
            tableWrap.innerHTML = renderGrid(filtered);
            bindRowExpand(); bindDetailBtns(); bindPlayBtns(); bindRefreshBtns();
            import('../components/toast.js').then(({ showToast }) => 
              showToast({ type: 'info', title: 'Status Checked', message: `Call status: ${updated.status}` })
            );
          }
        } catch (err) {
          btn.innerHTML = `Refresh`;
        }
      });
    });
  }

  search.addEventListener('input', applyFilters);
  statusF.addEventListener('change', applyFilters);
  agentF.addEventListener('change', applyFilters);
  document.getElementById('outbound-clear-filters')?.addEventListener('click', () => {
    search.value = ''; statusF.value = ''; agentF.value = '';
    applyFilters();
  });

  // --- Row expand ---
  function bindRowExpand() {
    document.querySelectorAll('.outbound-row').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.dataset.id;
        const existing = document.getElementById(`detail-row-${id}`);
        if (existing) {
          existing.remove();
          document.getElementById(`expand-icon-${id}`).style.transform = '';
          expandedRow = null;
          return;
        }
        if (expandedRow) {
          const old = document.getElementById(`detail-row-${expandedRow}`);
          if (old) old.remove();
          const icon = document.getElementById(`expand-icon-${expandedRow}`);
          if (icon) icon.style.transform = '';
        }
        const call = filtered.find(c => c.id === id);
        if (!call) return;
        row.insertAdjacentHTML('afterend', renderCallDetail(call));
        document.getElementById(`expand-icon-${id}`).style.transform = 'rotate(180deg)';
        expandedRow = id;
      });
    });
  }
  bindRowExpand();
  bindDetailBtns();
  bindPlayBtns();
  bindRefreshBtns();

  // --- Initiate Call Modal ---
  const modal = document.getElementById('call-modal');
  let isScheduleMode = false;

  document.getElementById('initiate-call-btn')?.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });

  const closeModal = () => modal.classList.add('hidden');
  document.getElementById('call-modal-close')?.addEventListener('click', closeModal);
  document.getElementById('call-modal-cancel')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // Tab switching — Call Now / Schedule
  const tabNow      = document.getElementById('tab-now');
  const tabSchedule = document.getElementById('tab-schedule');
  const scheduleFields = document.getElementById('schedule-fields');
  const callBtn     = document.getElementById('call-now-btn');

  function setTab(mode) {
    isScheduleMode = mode === 'schedule';
    tabNow.style.cssText      = isScheduleMode ? 'flex:1;padding:8px;border:none;border-radius:8px;font-weight:600;font-size:0.85rem;cursor:pointer;background:transparent;color:var(--text-secondary,#64748b);' : 'flex:1;padding:8px;border:none;border-radius:8px;font-weight:600;font-size:0.85rem;cursor:pointer;background:#fff;color:var(--primary,#6c63ff);box-shadow:0 1px 4px rgba(0,0,0,.08);';
    tabSchedule.style.cssText = isScheduleMode ? 'flex:1;padding:8px;border:none;border-radius:8px;font-weight:600;font-size:0.85rem;cursor:pointer;background:#fff;color:var(--primary,#6c63ff);box-shadow:0 1px 4px rgba(0,0,0,.08);' : 'flex:1;padding:8px;border:none;border-radius:8px;font-weight:600;font-size:0.85rem;cursor:pointer;background:transparent;color:var(--text-secondary,#64748b);';
    scheduleFields.classList.toggle('hidden', !isScheduleMode);
    document.getElementById('modal-title-text').textContent   = isScheduleMode ? 'Schedule Outbound Call' : 'New Outbound Call';
    document.getElementById('modal-subtitle-text').textContent = isScheduleMode ? 'Pick a date & time to auto-dispatch' : 'Dispatch immediately via AI agent';
    callBtn.innerHTML = isScheduleMode
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Save Schedule`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Call Now`;
  }
  tabNow?.addEventListener('click', () => setTab('now'));
  tabSchedule?.addEventListener('click', () => setTab('schedule'));

  // Pre-fill today's date and current time + 1h for convenience
  const nowD = new Date(); nowD.setHours(nowD.getHours() + 1, 0, 0, 0);
  document.getElementById('schedule-date').value = nowD.toISOString().split('T')[0];
  document.getElementById('schedule-time').value = nowD.toTimeString().slice(0,5);

  document.getElementById('call-now-btn')?.addEventListener('click', async () => {
    const phone   = document.getElementById('call-phone').value.trim();
    const agentId = document.getElementById('call-agent').value;
    const firstName = document.getElementById('contact-firstname')?.value.trim();
    const lastName  = document.getElementById('contact-lastname')?.value.trim();
    const course    = document.getElementById('contact-course')?.value.trim();
    const fee       = document.getElementById('contact-fee')?.value.trim();

    if (!phone) { showToast({ type:'warning', title:'Phone required', message:'Enter a phone number in E.164 format.' }); return; }
    if (!/^\+\d{10,15}$/.test(phone)) { showToast({ type:'warning', title:'Invalid format', message:'Use E.164 format e.g. +919876543210' }); return; }
    if (!agentId) { showToast({ type:'warning', title:'Agent required', message:'Please select an AI agent.' }); return; }

    const contact = {};
    if (firstName) contact.firstName = firstName;
    if (lastName)  contact.lastName  = lastName;
    if (course)    contact.course    = course;
    if (fee)       contact.fee       = fee;

    // ── SCHEDULE MODE ─────────────────────────────────────────
    if (isScheduleMode) {
      const dateVal = document.getElementById('schedule-date').value;
      const timeVal = document.getElementById('schedule-time').value;
      if (!dateVal || !timeVal) {
        showToast({ type:'warning', title:'Date & Time required', message:'Please pick a date and time for the scheduled call.' });
        return;
      }
      const scheduledAt = new Date(`${dateVal}T${timeVal}`);
      if (scheduledAt <= new Date()) {
        showToast({ type:'warning', title:'Invalid time', message:'Scheduled time must be in the future.' });
        return;
      }
      const agentObj = AGENTS.find(a => a.id === agentId);
      const scheduledCall = {
        id:            `sch-${Date.now()}`,
        agent_id:      agentId,
        agent_name:    agentObj?.name || 'AI Agent',
        phone_number:  phone,
        contact_name:  firstName || phone,
        contact_meta:  contact,
        direction:     'outbound',
        status:        'scheduled',
        scheduled_at:  scheduledAt.toISOString(),
        created_at:    new Date().toISOString(),
        duration_s:    0, total_cost_rs: 0, transcript: [],
      };
      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem('seevora_scheduled_calls') || '[]');
      existing.unshift(scheduledCall);
      localStorage.setItem('seevora_scheduled_calls', JSON.stringify(existing));

      filtered.unshift(scheduledCall);
      tableWrap.innerHTML = renderGrid(filtered);
      bindRowExpand(); bindDetailBtns(); bindPlayBtns();
      closeModal();
      showToast({ type:'success', title:'Call Scheduled! 🗓', message:`Will dispatch to ${phone} on ${scheduledAt.toLocaleString('en-IN', {dateStyle:'medium', timeStyle:'short'})}` });
      return;
    }

    // ── CALL NOW MODE ─────────────────────────────────────────
    const btn = document.getElementById('call-now-btn');
    btn.disabled = true;
    btn.innerHTML = `<span class="pulse-dot" style="margin-right:6px"></span> Dispatching...`;

    try {
      const newCall = await dispatchCall(agentId, phone, contact);
      filtered.unshift(newCall);
      tableWrap.innerHTML = renderGrid(filtered);
      bindRowExpand(); bindDetailBtns(); bindPlayBtns();
      closeModal();
      showToast({ type:'success', title:'Call dispatched!', message:`Dialing ${phone}${firstName ? ` (${firstName})` : ''}…` });

      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        if (attempts > 10) { clearInterval(poll); return; }
        try {
          const { getCallById } = await import('../api.js');
          const updated = await getCallById(newCall.id);
          if (!updated) return;
          const idx = filtered.findIndex(c => c.id === newCall.id);
          if (idx !== -1) { filtered[idx] = updated; tableWrap.innerHTML = renderGrid(filtered); bindRowExpand(); bindDetailBtns(); bindPlayBtns(); }
          if (updated.status === 'completed' || updated.status === 'failed') clearInterval(poll);
        } catch { /* silent */ }
      }, 3000);

    } catch (err) {
      showToast({ type:'error', title:'Dispatch Failed', message: err.message });
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Call Now`;
    }
  });

  // ── Load scheduled calls from localStorage into grid ──────
  const savedScheduled = JSON.parse(localStorage.getItem('seevora_scheduled_calls') || '[]');
  if (savedScheduled.length) {
    savedScheduled.forEach(sc => {
      if (!filtered.find(c => c.id === sc.id)) filtered.unshift(sc);
    });
    tableWrap.innerHTML = renderGrid(filtered);
    bindRowExpand(); bindDetailBtns(); bindPlayBtns();
  }
}
