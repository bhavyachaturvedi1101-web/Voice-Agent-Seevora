// ============================================================
//  Outbound Calls Page
// ============================================================

import { getOutboundCalls, initiateOutboundCall as addOutboundCall, AGENTS } from '../api.js';
import { showToast } from '../components/toast.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar } from '../components/topbar.js';

function statusBadge(status) {
  const map = {
    completed:   `<span class="badge badge-completed"><span class="pulse-dot" style="display:none"></span>Completed</span>`,
    failed:      `<span class="badge badge-failed">Failed</span>`,
    missed:      `<span class="badge badge-missed">Missed</span>`,
    'in-progress': `<span class="badge badge-in-progress"><span class="pulse-dot"></span>In Progress</span>`,
    scheduled:   `<span class="badge badge-scheduled">Scheduled</span>`,
    queued:      `<span class="badge badge-queued"><span class="pulse-dot"></span>Queued</span>`,
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

function formatCost(cost) {
  if (!cost) return '<span style="color:var(--text-muted);">—</span>';
  return `<span class="col-cost">$${cost.total.toFixed(4)}</span>`;
}

function renderCallDetail(call) {
  if (!call) return '';
  const hasTranscript = call.transcript && call.transcript.length > 0;
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
              ${call.cost ? `
                <div class="detail-section-title" style="margin-top:12px;">Cost Breakdown</div>
                <div class="cost-breakdown">
                  <div class="cost-row"><span class="cost-row-label">Duration</span><span class="cost-row-value mono">${call.cost.minutes.toFixed(2)} min</span></div>
                  <div class="cost-row"><span class="cost-row-label">Per-minute rate</span><span class="cost-row-value mono">$${call.cost.minuteRate}/min</span></div>
                  <div class="cost-row"><span class="cost-row-label">Call cost</span><span class="cost-row-value mono">$${call.cost.callCost.toFixed(4)}</span></div>
                  <div class="cost-row"><span class="cost-row-label">Platform fee</span><span class="cost-row-value mono">$${call.cost.platformFee.toFixed(4)}</span></div>
                  <div class="cost-row cost-row-total"><span class="cost-row-label" style="font-weight:600;color:var(--text-primary);">Total</span><span class="cost-row-value">$${call.cost.total.toFixed(4)}</span></div>
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
                      <span class="transcript-speaker ${line.speaker}">${line.speaker === 'agent' ? 'AI Agent' : 'Caller'}</span>
                      <span class="transcript-text">${line.text}</span>
                      <span class="transcript-time">${line.time}</span>
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
        // Dummy profile avatar initals from phone number or name
        const initial = call.phone ? call.phone.charAt(call.phone.length-1) : '?';
        const isLive = call.status === 'in-progress';
        
        return `
        <div class="conv-card" data-id="${call.id}">
          <div class="conv-card-header">
            <div class="conv-profile">
              <div class="conv-avatar">
                <span class="conv-avatar-placeholder">${initial}</span>
              </div>
              <div>
                <div class="conv-name">${call.phone}</div>
                <div class="conv-sub">${call.agent}</div>
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
                ${Array.from({length: 40}).map((_, i) => {
                  let h = Math.random() * 100;
                  const isPeak = h > 75;
                  return `<div class="conv-waveform-bar ${isPeak ? 'peak' : ''}" style="height:${Math.max(10, h)}%"></div>`;
                }).join('')}
              </div>
            </div>
          </div>

          <div class="conv-footer">
            ${isLive || call.status === 'queued' 
              ? `<button class="btn-pill-primary detail-btn" data-id="${call.id}">Monitor Now <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></button>` 
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
  const calls = await getOutboundCalls();
  const totalCalls = calls.length;
  const completed  = calls.filter(c => c.status === 'completed').length;
  const inProgress = calls.filter(c => c.status === 'in-progress').length;
  const failed     = calls.filter(c => c.status === 'failed').length;
  const totalCost  = calls.reduce((acc, c) => acc + (c.cost?.total || 0), 0);

  const isAdmin = user?.role === 'Admin';

  return `
    <div class="dashboard-shell">
      ${renderSidebar('outbound', user)}
      <div class="main-content" style="background:#f4f6fa;">
        ${renderTopbar({
          title: 'Outbound Calls',
          subtitle: 'Launch and monitor AI voice campaigns',
          user: user,
          actions: isAdmin ? `<button class="btn btn-primary btn-sm" id="initiate-call-btn"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New Call</button>` : ''
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
              <div class="stat-trend-modern up">↑ ${Math.round((completed/totalCalls)*100)}% Success Rate</div>
            </div>
            
            <div class="stat-card-modern">
              <div class="stat-header-modern">
                <span class="stat-title-modern">Active Connections</span>
                <span class="stat-icon-modern"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
              </div>
              <div class="stat-value-modern">${inProgress}</div>
              <div class="stat-trend-modern up"><span class="pulse-dot"></span> Live Now</div>
            </div>
            
            <div class="stat-card-modern">
              <div class="stat-header-modern">
                <span class="stat-title-modern">Failed / Missed</span>
                <span class="stat-icon-modern"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></span>
              </div>
              <div class="stat-value-modern">${failed}</div>
              <div class="stat-trend-modern down">↓ ${Math.round((failed/totalCalls)*100)}% Failure Rate</div>
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

    <!-- Initiate Call Modal -->
    <div id="call-modal" class="modal-overlay hidden">
      <div class="modal">
        <div class="modal-header">
          <div>
            <div class="modal-title">Initiate New Call</div>
            <div class="modal-subtitle">Launch an AI voice agent call immediately or schedule it.</div>
          </div>
          <button class="modal-close" id="call-modal-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="form-group">
          <label class="form-label" for="call-phone">Phone Number *</label>
          <div class="input-with-icon">
            <div class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 24 16v.92z"/></svg>
            </div>
            <input class="input" type="tel" id="call-phone" placeholder="+1 (555) 000-0000" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="call-agent">AI Agent / Campaign *</label>
          <select class="select" id="call-agent">
            <option value="">Select agent...</option>
            ${AGENTS.map(a => `<option value="${a.id}">${a.name} — $${a.rate}/min</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="call-notes">Notes (optional)</label>
          <textarea class="input" id="call-notes" rows="2" placeholder="Call objective, customer context..."></textarea>
        </div>

        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;margin-bottom:16px;">
          <label class="toggle-wrapper" id="schedule-toggle-label">
            <span class="toggle">
              <input type="checkbox" id="schedule-toggle" />
              <span class="toggle-track"></span>
              <span class="toggle-thumb"></span>
            </span>
            <span style="font-size:0.875rem;font-weight:500;">Schedule for later</span>
          </label>
          <div id="schedule-fields" class="hidden" style="margin-top:12px;">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" for="schedule-dt">Scheduled Date & Time</label>
              <input class="input" type="datetime-local" id="schedule-dt" />
            </div>
          </div>
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

  // --- Initiate Call Modal ---
  const modal = document.getElementById('call-modal');
  const isAdmin = user?.role === 'Admin';

  if (isAdmin) {
    document.getElementById('initiate-call-btn')?.addEventListener('click', () => {
      modal.classList.remove('hidden');
    });
  }

  const closeModal = () => modal.classList.add('hidden');
  document.getElementById('call-modal-close')?.addEventListener('click', closeModal);
  document.getElementById('call-modal-cancel')?.addEventListener('click', closeModal);

  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  document.getElementById('schedule-toggle')?.addEventListener('change', (e) => {
    document.getElementById('schedule-fields').classList.toggle('hidden', !e.target.checked);
    document.getElementById('call-now-btn').innerHTML = e.target.checked
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Schedule Call`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> Call Now`;
  });

  document.getElementById('call-now-btn')?.addEventListener('click', async () => {
    const phone = document.getElementById('call-phone').value.trim();
    const agentId = document.getElementById('call-agent').value;
    const isScheduled = document.getElementById('schedule-toggle').checked;
    const schedDt = document.getElementById('schedule-dt')?.value;

    if (!phone) { showToast({ type: 'warning', title: 'Phone required', message: 'Please enter a phone number.' }); return; }
    if (!agentId) { showToast({ type: 'warning', title: 'Agent required', message: 'Please select an AI agent.' }); return; }
    if (isScheduled && !schedDt) { showToast({ type: 'warning', title: 'Schedule time required', message: 'Please pick a date and time.' }); return; }

    const agent = AGENTS.find(a => a.id === agentId);
    const now = new Date();
    const status = isScheduled ? 'scheduled' : 'queued';
    const newCall = {
      id: `OUT-${Date.now().toString().slice(-6)}`,
      type: 'outbound',
      phone,
      agent: agent.name,
      agentId,
      status,
      duration: '—',
      durationSeconds: 0,
      date: isScheduled ? new Date(schedDt) : now,
      dateFormatted: (isScheduled ? new Date(schedDt) : now).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
      initiatedBy: 'manual',
      summary: null,
      transcript: [],
      cost: null,
      recording: false,
    };

    try {
      await addOutboundCall(newCall);
      filtered.unshift(newCall);
      tableWrap.innerHTML = renderGrid(filtered);
      countEl.textContent = `${filtered.length} calls`;
      bindRowExpand();
      bindDetailBtns();
      bindPlayBtns();
      closeModal();
      showToast({
        type: 'success',
        title: isScheduled ? 'Call scheduled!' : 'Call queued!',
        message: isScheduled ? `Scheduled for ${new Date(schedDt).toLocaleString()}` : `Dialing ${phone}...`
      });
    } catch (err) {
      showToast({ type: 'error', title: 'Action Denied', message: err.message });
      return;
    }

    // Simulate status update if "Call Now"
    if (!isScheduled) {
      setTimeout(() => {
        newCall.status = 'in-progress';
        newCall.duration = '0:12';
        tableWrap.innerHTML = renderGrid(filtered);
        bindRowExpand();
        bindDetailBtns();
        bindPlayBtns();
      }, 2500);
    }
  });
}
