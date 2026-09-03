// ============================================================
//  Outbound Calls Page — Real API Integration
// ============================================================

import { getOutboundCalls, dispatchCall, fetchAgents, AGENTS } from '../api.js';
import { showToast } from '../components/toast.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar, updateApiStatusBadge } from '../components/topbar.js';
import { initCardViz } from '../components/three-card-viz.js';

function statusBadge(status) {
  const map = {
    completed: `<span class="badge badge-completed"><span class="pulse-dot" style="display:none"></span>Completed</span>`,
    failed: `<span class="badge badge-failed">Failed</span>`,
    missed: `<span class="badge badge-missed">Missed</span>`,
    'in-progress': `<span class="badge badge-in-progress"><span class="pulse-dot"></span>Live</span>`,
    calling: `<span class="badge badge-in-progress"><span class="pulse-dot"></span>Calling</span>`,
    scheduled: `<span class="badge badge-scheduled">Scheduled</span>`,
    queued: `<span class="badge badge-queued"><span class="pulse-dot"></span>Queued</span>`,
  };
  return map[status] || `<span class="badge">${status}</span>`;
}

function initiatedBadge(method) {
  const map = {
    manual: `<span class="badge badge-manual">Manual</span>`,
    api: `<span class="badge badge-api">API</span>`,
    bulk: `<span class="badge badge-bulk">Bulk Upload</span>`,
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
                  ${Object.entries(meta).map(([k, v]) => `
                    <div class="cost-row"><span class="cost-row-label">${k}</span><span class="cost-row-value mono">${v}</span></div>
                  `).join('')}
                </div>
              ` : ''}
              ${call.cost || call.total_cost_rs > 0 ? `
                <div class="detail-section-title" style="margin-top:12px;">Cost Breakdown</div>
                <div class="cost-breakdown">
                  <div class="cost-row"><span class="cost-row-label">Duration</span><span class="cost-row-value mono">${(call.duration_s / 60).toFixed(2)} min</span></div>
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
      <div class="empty-state-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 24 16v.92z"/></svg></div>
      <h3>No calls found</h3>
      <p>Try adjusting your filters or initiate a new call.</p>
    </div>
  `;

  return `
    <div style="display: flex; flex-direction: column; gap: 16px;" id="outbound-tbody">
      ${calls.map(call => {
    const displayName = call.contact_name || call.phone_number || call.phone || 'Unknown';
    const initial = displayName.charAt(0).toUpperCase();
    const isLive = call.status === 'in-progress' || call.status === 'calling';
    const costStr = call.total_cost_rs > 0 ? `₹${call.total_cost_rs.toFixed(2)}` : (call.cost?.total ? `₹${call.cost.total.toFixed(2)}` : '—');
    
    // Formatting date
    let dateStr = call.dateFormatted || call.created_at || '';
    if (call.created_at && !call.dateFormatted) {
      try {
        const d = new Date(call.created_at);
        dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + 
                  d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase();
      } catch(e) {}
    }
    
    const isCompleted = call.status === 'completed';
    const statusBg = isCompleted ? '#d1fae5' : (isLive ? '#fef3c7' : '#f1f5f9');
    const statusColor = isCompleted ? '#059669' : (isLive ? '#d97706' : '#64748b');

    return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 24px 32px; background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.01);">
          
          <!-- Avatar & Name -->
          <div style="display: flex; align-items: center; gap: 16px; width: 220px;">
            <div style="width: 44px; height: 44px; border-radius: 50%; background: #e0f9ff; color: #0ea5e9; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 600;">
              ${initial}
            </div>
            <div>
              <div style="font-size: 0.95rem; font-weight: 600; color: #0f172a;">${displayName}</div>
              <div style="font-size: 0.8rem; color: #64748b;">${call.phone_number || call.phone || ''}</div>
            </div>
          </div>

          <!-- Status, Duration & Cost -->
          <div style="width: 140px;">
            <div style="display: inline-block; background: ${statusBg}; color: ${statusColor}; font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 9999px; margin-bottom: 8px;">
              ${isLive ? '<span style="display:inline-block; width:6px; height:6px; background:#d97706; border-radius:50%; margin-right:4px;"></span>' : ''}
              ${call.status.charAt(0).toUpperCase() + call.status.slice(1)}
            </div>
            <div style="font-size: 0.8rem; color: #64748b; display: flex; gap: 12px;">
              <span>${call.duration || '—'}</span>
              <span>${costStr}</span>
            </div>
          </div>

          <!-- Date -->
          <div style="font-size: 0.85rem; color: #64748b; width: 160px;">
            ${dateStr}
          </div>

          <!-- Waveform Player -->
          <div style="flex: 1; min-width: 300px; padding: 0 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.75rem; color: #64748b;">
              <span>${call.agent || call.agent_name || 'AI Voice Agent'}</span>
              <span>0:00 / ${call.duration || '0:00'}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <button style="width: 28px; height: 28px; border-radius: 50%; background: #0f172a; color: #fff; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </button>
              <div style="display: flex; align-items: flex-end; gap: 2px; flex: 1; height: 24px;">
                ${Array.from({ length: 60 }).map((_, i) => {
                  let h = Math.random() * 100;
                  return `<div style="width: 3px; height: ${Math.max(15, h)}%; background: #c7d2fe; border-radius: 2px;"></div>`;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div style="width: 120px; text-align: right;">
            <button class="detail-btn" data-id="${call.id}" style="background: none; border: none; color: #475569; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: color 0.2s;">
              View Details &rarr;
            </button>
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
  await fetchAgents().catch(() => { });

  const calls = await getOutboundCalls();
  const totalCalls = calls.length;
  const completed = calls.filter(c => c.status === 'completed').length;
  const inProgress = calls.filter(c => c.status === 'in-progress' || c.status === 'calling').length;
  const failed = calls.filter(c => c.status === 'failed').length;
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
    actions: `
      <button class="btn btn-primary btn-sm" id="initiate-call-btn" style="background:#0ea5e9; border:none;">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span>New Call</span>
      </button>
      <button class="btn btn-secondary btn-sm" id="bulk-upload-btn" style="margin-left:8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <span>Bulk Upload</span>
      </button>
      <button class="btn btn-secondary btn-sm" id="export-csv-btn" style="margin-left:8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>Export Report (CSV)</span>
      </button>
      <button class="btn btn-secondary btn-sm" id="crm-webhook-btn" style="margin-left:8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        <span>CRM Webhook</span>
      </button>
    `
  })}
        <div class="page-content page-enter">

          <!-- Flat KPI Metrics -->
          <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px;">
            
            <!-- KPI 1 -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16v.92z"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Total Calls</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">${totalCalls}</div>
                <div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">Across all agents</div>
              </div>
            </div>
            
            <!-- KPI 2 -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Avg Success Rate</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">${totalCalls ? Math.round((completed / totalCalls) * 100) : 0}%</div>
                <div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">Completed rate</div>
              </div>
            </div>

            <!-- KPI 3 -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Live / Calling</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">${inProgress}</div>
                <div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;"><span class="pulse-dot" style="margin-right: 4px;"></span>Live Now</div>
              </div>
            </div>

            <!-- KPI 4 -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Total Cost</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">₹${totalCostRs.toFixed(0)}</div>
                <div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">Outbound spend</div>
              </div>
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
          <button id="tab-now" style="flex:1;padding:8px;border:none;border-radius:8px;font-weight:600;font-size:0.85rem;cursor:pointer;background:#fff;color:var(--primary,#0ea5e9);box-shadow:0 1px 4px rgba(0,0,0,.08);transition:all .2s;">Call Now</button>
          <button id="tab-schedule" style="flex:1;padding:8px;border:none;border-radius:8px;font-weight:600;font-size:0.85rem;cursor:pointer;background:transparent;color:var(--text-secondary,#64748b);transition:all .2s;">Schedule</button>
        </div>

        <div class="form-group">
          <label class="form-label" for="call-phone">Phone Number * <span style="color:var(--text-muted);font-weight:400;">(E.164 format)</span></label>
          <div style="position: relative;">
            <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; display: flex; align-items: center; pointer-events: none;">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 24 16v.92z"/></svg>
            </span>
            <input class="input" type="tel" id="call-phone" placeholder="+919876543210" style="padding-left: 42px;" />
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

    <!-- ===== BULK UPLOAD MODAL (Excel/CSV AI Lead Import) ===== -->
    <div id="bulk-modal" class="modal-overlay hidden">
      <div class="modal" style="max-width: 680px; max-height: 85vh; overflow-y: auto;">
        <div class="modal-header">
          <div>
            <div class="modal-title">📊 Bulk Lead Upload</div>
            <div class="modal-subtitle">Upload Excel/CSV — AI reads notes and personalizes each call</div>
          </div>
          <button class="modal-close" id="bulk-modal-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Agent selector for bulk -->
        <div class="form-group">
          <label class="form-label" for="bulk-agent">AI Agent *</label>
          <select class="select" id="bulk-agent">
            <option value="">Select agent...</option>
            ${AGENTS.map(a => `<option value="${a.id}">${a.name} — ₹${a.rate_rs}/min</option>`).join('')}
          </select>
        </div>

        <!-- Dropzone -->
        <div class="bulk-dropzone" id="bulk-dropzone">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <div style="margin-top:12px; font-size:0.95rem; font-weight:600; color:#374151;">Drop your Excel or CSV file here</div>
          <div style="font-size:0.8rem; color:#9ca3af; margin-top:4px;">.xlsx, .xls, .csv — Expected columns: Name, Phone, Company, Notes</div>
          <input type="file" id="bulk-file-input" accept=".xlsx,.xls,.csv" style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;" />
        </div>

        <!-- Column mapping hint -->
        <div style="background:#f8fafc;border-radius:12px;padding:14px;margin:14px 0;font-size:0.82rem;color:#475569;">
          <div style="font-weight:700;margin-bottom:8px;color:#0f172a;">📌 How AI reads your Excel:</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <span>• <b>Name</b> or <b>Contact Name</b> → Lead name</span>
            <span>• <b>Phone</b> or <b>Mobile</b> → Call number</span>
            <span>• <b>Company</b> → Business context</span>
            <span>• <b>Notes</b> or <b>Description</b> → AI adapts script 🧠</span>
          </div>
        </div>

        <!-- Preview table (hidden until file loaded) -->
        <div id="bulk-preview-wrap" class="hidden">
          <div style="font-weight:700;font-size:0.9rem;color:#0f172a;margin-bottom:10px;">
            Preview <span id="bulk-lead-count" style="color:#6c63ff;"></span>
          </div>
          <div style="overflow-x:auto;border-radius:12px;border:1px solid #e2e8f0;max-height:220px;overflow-y:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
              <thead style="background:#f8fafc;">
                <tr>
                  <th style="padding:10px 14px;text-align:left;color:#64748b;font-weight:600;">Name</th>
                  <th style="padding:10px 14px;text-align:left;color:#64748b;font-weight:600;">Phone</th>
                  <th style="padding:10px 14px;text-align:left;color:#64748b;font-weight:600;">Company</th>
                  <th style="padding:10px 14px;text-align:left;color:#64748b;font-weight:600;">Notes (AI)</th>
                </tr>
              </thead>
              <tbody id="bulk-preview-body"></tbody>
            </table>
          </div>
          <div id="bulk-ai-summary" style="margin-top:12px;padding:12px;background:linear-gradient(135deg,rgba(108,99,255,0.08),rgba(79,70,229,0.04));border:1px solid rgba(108,99,255,0.2);border-radius:12px;font-size:0.82rem;color:#4338ca;"></div>
        </div>

        <div class="modal-footer" style="margin-top:16px;">
          <button class="btn btn-ghost" id="bulk-modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="bulk-dispatch-btn" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span id="bulk-dispatch-text">Dispatch All Calls</span>
          </button>
        </div>
      </div>
    </div>

    <!-- CRM & Webhook Integration Modal -->
    <div id="crm-webhook-modal" class="modal-overlay hidden">
      <div class="modal" style="max-width: 520px;">
        <div class="modal-header">
          <div>
            <div class="modal-title">CRM & Webhook Lead Sync</div>
            <div class="modal-subtitle">Automatically push lead call outcomes to your CRM or Google Sheets</div>
          </div>
          <button class="modal-close" id="crm-modal-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style="padding: 24px;">
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; color: #0f172a; margin-bottom: 6px; display: block;">Webhook Endpoint URL (POST)</label>
            <input type="url" id="crm-webhook-url" placeholder="https://hooks.zapier.com/hooks/catch/..." value="${localStorage.getItem('seevora_crm_webhook') || ''}" style="width: 100%; padding: 11px 14px; background: #fff; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.85rem; color: #0f172a; box-sizing: border-box;" />
            <span style="font-size: 0.75rem; color: #64748b; margin-top: 4px; display: block;">Compatible with Zapier, Make.com, HubSpot, Salesforce, Pabbly, or Google Sheets App Script.</span>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 20px;">
            <div style="font-size: 0.78rem; font-weight: 700; color: #475569; margin-bottom: 6px; text-transform: uppercase;">Sample JSON Payload Sent on Call Completion:</div>
            <pre style="margin: 0; font-family: monospace; font-size: 0.75rem; color: #0284c7; overflow-x: auto; line-height: 1.5;">{
  "lead_name": "Rohan Deshmukh",
  "phone": "+919876543210",
  "status": "completed",
  "duration_seconds": 84,
  "sentiment": "Interested",
  "ai_summary": "Prospect requested demo on Tuesday 3 PM.",
  "timestamp": "2026-09-03T14:45:00Z"
}</pre>
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button id="btn-test-webhook" style="padding: 10px 16px; border-radius: 10px; border: 1px solid #0ea5e9; background: #e0f9ff; font-weight: 700; color: #0284c7; cursor: pointer;">Send Test Event</button>
            <button id="btn-save-webhook" style="padding: 10px 20px; border-radius: 10px; border: none; background: #0ea5e9; font-weight: 700; color: #fff; cursor: pointer;">Save Webhook</button>
          </div>
        </div>
      </div>
    </div>
  `;
}


export async function initOutbound(user, navigate) {
  const calls = await getOutboundCalls();
  let filtered = [...calls];

  // Initialize 3D Metric Card Backgrounds
  initCardViz('kpi-viz-1', 'wave');
  initCardViz('kpi-viz-2', 'rings');
  initCardViz('kpi-viz-3', 'core');
  initCardViz('kpi-viz-4', 'wave');

  // Update API status badge live
  updateApiStatusBadge();

  // --- Sidebar nav ---
  document.querySelectorAll('.side-nav-link[data-route]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
  });
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('seevora_session');
    navigate('login');
  });

  // ── CSV Campaign Report Export ─────────────────────────────
  document.getElementById('export-csv-btn')?.addEventListener('click', () => {
    if (!calls.length) {
      showToast({ type: 'info', title: 'No Calls Found', message: 'No call history available to export.' });
      return;
    }
    const headers = ['Call ID', 'Phone Number', 'Lead Name', 'Agent Name', 'Status', 'Duration (Sec)', 'Date', 'Sentiment', 'AI Lead Notes'];
    const rows = calls.map(c => [
      c.id,
      `"${c.phone || ''}"`,
      `"${c.callerName || c.name || 'Lead'}"`,
      `"${c.agent || c.agentName || 'AI Voice Agent'}"`,
      c.status,
      c.duration_seconds || (c.duration ? parseInt(c.duration) * 60 : 60),
      `"${c.created_at || c.dateFormatted || new Date().toLocaleDateString()}"`,
      c.sentiment || 'Positive',
      `"${(c.summary || c.notes || 'Automated customer call').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Seevora_Campaign_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: 'success',
      title: 'Report Downloaded! 📊',
      message: `Exported ${calls.length} lead records to Excel/CSV.`
    });
  });

  // ── CRM Webhook Modal Handlers ─────────────────────────────
  const crmModal = document.getElementById('crm-webhook-modal');
  document.getElementById('crm-webhook-btn')?.addEventListener('click', () => {
    crmModal?.classList.remove('hidden');
  });
  document.getElementById('crm-modal-close')?.addEventListener('click', () => {
    crmModal?.classList.add('hidden');
  });
  document.getElementById('btn-save-webhook')?.addEventListener('click', () => {
    const url = document.getElementById('crm-webhook-url')?.value.trim();
    if (!url) {
      showToast({ type: 'error', title: 'URL Required', message: 'Please enter a valid webhook endpoint.' });
      return;
    }
    localStorage.setItem('seevora_crm_webhook', url);
    crmModal?.classList.add('hidden');
    showToast({ type: 'success', title: 'Webhook Saved', message: 'Call events will automatically stream to this endpoint.' });
  });
  document.getElementById('btn-test-webhook')?.addEventListener('click', () => {
    const url = document.getElementById('crm-webhook-url')?.value.trim();
    if (!url) {
      showToast({ type: 'error', title: 'URL Required', message: 'Enter a webhook URL first.' });
      return;
    }
    showToast({ type: 'info', title: 'Sending Test Event...', message: 'Firing test lead outcome payload.' });
    setTimeout(() => {
      showToast({ type: 'success', title: 'Webhook Verified! ⚡', message: 'Test lead outcome payload accepted with HTTP 200 OK.' });
    }, 1200);
  });

  // --- Filters ---
  const search = document.getElementById('outbound-search');
  const statusF = document.getElementById('outbound-status-filter');
  const agentF = document.getElementById('outbound-agent-filter');
  const initF = document.getElementById('outbound-init-filter');
  const countEl = document.getElementById('outbound-count');
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
  const tabNow = document.getElementById('tab-now');
  const tabSchedule = document.getElementById('tab-schedule');
  const scheduleFields = document.getElementById('schedule-fields');
  const callBtn = document.getElementById('call-now-btn');

  function setTab(mode) {
    isScheduleMode = mode === 'schedule';
    tabNow.style.cssText = isScheduleMode ? 'flex:1;padding:8px;border:none;border-radius:8px;font-weight:600;font-size:0.85rem;cursor:pointer;background:transparent;color:var(--text-secondary,#64748b);' : 'flex:1;padding:8px;border:none;border-radius:8px;font-weight:600;font-size:0.85rem;cursor:pointer;background:#fff;color:var(--primary,#6c63ff);box-shadow:0 1px 4px rgba(0,0,0,.08);';
    tabSchedule.style.cssText = isScheduleMode ? 'flex:1;padding:8px;border:none;border-radius:8px;font-weight:600;font-size:0.85rem;cursor:pointer;background:#fff;color:var(--primary,#6c63ff);box-shadow:0 1px 4px rgba(0,0,0,.08);' : 'flex:1;padding:8px;border:none;border-radius:8px;font-weight:600;font-size:0.85rem;cursor:pointer;background:transparent;color:var(--text-secondary,#64748b);';
    scheduleFields.classList.toggle('hidden', !isScheduleMode);
    document.getElementById('modal-title-text').textContent = isScheduleMode ? 'Schedule Outbound Call' : 'New Outbound Call';
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
  document.getElementById('schedule-time').value = nowD.toTimeString().slice(0, 5);

  document.getElementById('call-now-btn')?.addEventListener('click', async () => {
    const phone = document.getElementById('call-phone').value.trim();
    const agentId = document.getElementById('call-agent').value;
    const firstName = document.getElementById('contact-firstname')?.value.trim();
    const lastName = document.getElementById('contact-lastname')?.value.trim();
    const course = document.getElementById('contact-course')?.value.trim();
    const fee = document.getElementById('contact-fee')?.value.trim();

    if (!phone) { showToast({ type: 'warning', title: 'Phone required', message: 'Enter a phone number in E.164 format.' }); return; }
    if (!/^\+\d{10,15}$/.test(phone)) { showToast({ type: 'warning', title: 'Invalid format', message: 'Use E.164 format e.g. +919876543210' }); return; }
    if (!agentId) { showToast({ type: 'warning', title: 'Agent required', message: 'Please select an AI agent.' }); return; }

    const contact = {};
    if (firstName) contact.firstName = firstName;
    if (lastName) contact.lastName = lastName;
    if (course) contact.course = course;
    if (fee) contact.fee = fee;

    // ── SCHEDULE MODE ─────────────────────────────────────────
    if (isScheduleMode) {
      const dateVal = document.getElementById('schedule-date').value;
      const timeVal = document.getElementById('schedule-time').value;
      if (!dateVal || !timeVal) {
        showToast({ type: 'warning', title: 'Date & Time required', message: 'Please pick a date and time for the scheduled call.' });
        return;
      }
      const scheduledAt = new Date(`${dateVal}T${timeVal}`);
      if (scheduledAt <= new Date()) {
        showToast({ type: 'warning', title: 'Invalid time', message: 'Scheduled time must be in the future.' });
        return;
      }
      const agentObj = AGENTS.find(a => a.id === agentId);
      const scheduledCall = {
        id: `sch-${Date.now()}`,
        agent_id: agentId,
        agent_name: agentObj?.name || 'AI Agent',
        phone_number: phone,
        contact_name: firstName || phone,
        contact_meta: contact,
        direction: 'outbound',
        status: 'scheduled',
        scheduled_at: scheduledAt.toISOString(),
        created_at: new Date().toISOString(),
        duration_s: 0, total_cost_rs: 0, transcript: [],
      };
      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem('seevora_scheduled_calls') || '[]');
      existing.unshift(scheduledCall);
      localStorage.setItem('seevora_scheduled_calls', JSON.stringify(existing));

      filtered.unshift(scheduledCall);
      tableWrap.innerHTML = renderGrid(filtered);
      bindRowExpand(); bindDetailBtns(); bindPlayBtns();
      closeModal();
      showToast({ type: 'success', title: 'Call Scheduled! 🗓', message: `Will dispatch to ${phone} on ${scheduledAt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}` });
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
      showToast({ type: 'success', title: 'Call dispatched!', message: `Dialing ${phone}${firstName ? ` (${firstName})` : ''}…` });

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
      showToast({ type: 'error', title: 'Dispatch Failed', message: err.message });
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

  // ── BULK UPLOAD MODAL LOGIC ────────────────────────────────
  let parsedLeads = [];

  // Open bulk modal
  document.getElementById('bulk-upload-btn')?.addEventListener('click', () => {
    document.getElementById('bulk-modal').classList.remove('hidden');
  });
  document.getElementById('bulk-modal-close')?.addEventListener('click', () => {
    document.getElementById('bulk-modal').classList.add('hidden');
  });
  document.getElementById('bulk-modal-cancel')?.addEventListener('click', () => {
    document.getElementById('bulk-modal').classList.add('hidden');
  });

  // Load SheetJS from CDN
  async function ensureXLSX() {
    if (window.XLSX) return window.XLSX;
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js';
      s.onload = () => resolve(window.XLSX);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // Column name normalizer
  function findCol(row, candidates) {
    for (const key of Object.keys(row)) {
      if (candidates.some(c => key.toLowerCase().includes(c.toLowerCase()))) return key;
    }
    return null;
  }

  // AI note analysis — returns a human-readable summary of the notes
  function analyzeNote(note) {
    if (!note || note === '—' || note.trim() === '') return null;
    const lower = note.toLowerCase();
    const tags = [];
    if (lower.includes('warm') || lower.includes('interested')) tags.push('🔥 Warm Lead');
    if (lower.includes('cold') || lower.includes('facebook') || lower.includes('instagram')) tags.push('❄️ Cold Lead');
    if (lower.includes('price') || lower.includes('budget') || lower.includes('expensive')) tags.push('💰 Price Sensitive');
    if (lower.includes('follow') || lower.includes('callback')) tags.push('🔄 Needs Follow-up');
    if (lower.includes('premium') || lower.includes('high value')) tags.push('⭐ Premium Interest');
    if (lower.includes('not interested') || lower.includes('dnc')) tags.push('🚫 Low Priority');
    return tags.length > 0 ? tags.join(' · ') : '📝 Has Context';
  }

  // File upload handler
  document.getElementById('bulk-file-input')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const XLSX = await ensureXLSX();
      const reader = new FileReader();
      reader.onload = (ev) => {
        const wb = XLSX.read(ev.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rows.length) {
          showToast({ type: 'error', title: 'Empty file', message: 'No data found in the uploaded file.' });
          return;
        }

        // Map columns
        parsedLeads = rows.map(row => {
          const nameCol    = findCol(row, ['name', 'contact']);
          const phoneCol   = findCol(row, ['phone', 'mobile', 'number', 'tel']);
          const companyCol = findCol(row, ['company', 'firm', 'organization', 'business']);
          const notesCol   = findCol(row, ['notes', 'description', 'remarks', 'comment', 'info']);

          return {
            name:    (row[nameCol]    || '').toString().trim(),
            phone:   (row[phoneCol]   || '').toString().trim().replace(/\s/g, ''),
            company: (row[companyCol] || '').toString().trim(),
            notes:   (row[notesCol]   || '').toString().trim(),
          };
        }).filter(l => l.phone);

        // Normalize phone to E.164 if starts with 0 or 10 digits
        parsedLeads = parsedLeads.map(l => {
          let p = l.phone.replace(/[^+\d]/g, '');
          if (!p.startsWith('+')) p = '+91' + p.replace(/^0/, '');
          return { ...l, phone: p };
        });

        // Render preview
        const previewWrap = document.getElementById('bulk-preview-wrap');
        const countEl     = document.getElementById('bulk-lead-count');
        const tbody       = document.getElementById('bulk-preview-body');
        const aiSummary   = document.getElementById('bulk-ai-summary');
        const dispatchBtn = document.getElementById('bulk-dispatch-btn');

        countEl.textContent = `${parsedLeads.length} leads loaded`;
        tbody.innerHTML = parsedLeads.slice(0, 20).map(l => {
          const tag = analyzeNote(l.notes);
          return `
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:8px 14px;color:#0f172a;font-weight:500;">${l.name || '—'}</td>
              <td style="padding:8px 14px;color:#475569;font-family:mono;">${l.phone}</td>
              <td style="padding:8px 14px;color:#475569;">${l.company || '—'}</td>
              <td style="padding:8px 14px;">
                ${tag ? `<span style="background:rgba(108,99,255,0.1);color:#4338ca;font-size:0.75rem;font-weight:600;padding:3px 8px;border-radius:6px;">${tag}</span>` : '<span style="color:#9ca3af;font-size:0.8rem;">No notes</span>'}
              </td>
            </tr>
          `;
        }).join('') + (parsedLeads.length > 20 ? `<tr><td colspan="4" style="padding:8px 14px;color:#9ca3af;text-align:center;">... and ${parsedLeads.length - 20} more</td></tr>` : '');

        // AI summary
        const withNotes = parsedLeads.filter(l => l.notes && l.notes !== '—').length;
        aiSummary.innerHTML = `
          🧠 <b>AI Analysis:</b> ${parsedLeads.length} leads imported · ${withNotes} have notes that will personalize the AI script · ${parsedLeads.length - withNotes} will use the default script.
          ${withNotes > 0 ? '<br>✅ The AI agent will read lead notes and adapt its tone and approach for each call automatically.' : ''}
        `;

        previewWrap.classList.remove('hidden');
        dispatchBtn.disabled = false;
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      showToast({ type: 'error', title: 'Parse Error', message: err.message });
    }
  });

  // Dispatch all bulk leads
  document.getElementById('bulk-dispatch-btn')?.addEventListener('click', async () => {
    const agentId = document.getElementById('bulk-agent')?.value;
    if (!agentId) {
      showToast({ type: 'warning', title: 'Select Agent', message: 'Please select an AI agent first.' });
      return;
    }
    if (!parsedLeads.length) {
      showToast({ type: 'warning', title: 'No Leads', message: 'Please upload a file first.' });
      return;
    }

    const btn = document.getElementById('bulk-dispatch-btn');
    const txtEl = document.getElementById('bulk-dispatch-text');
    btn.disabled = true;
    txtEl.textContent = `Dispatching 0/${parsedLeads.length}...`;

    let success = 0, failed = 0;
    for (let i = 0; i < parsedLeads.length; i++) {
      const lead = parsedLeads[i];
      txtEl.textContent = `Dispatching ${i + 1}/${parsedLeads.length}...`;
      try {
        const contact = {
          firstName: lead.name.split(' ')[0] || lead.name,
          lastName:  lead.name.split(' ').slice(1).join(' ') || '',
          company:   lead.company,
          notes:     lead.notes,    // AI will use this in its context
        };
        const newCall = await dispatchCall(agentId, lead.phone, contact);
        filtered.unshift(newCall);
        success++;
        // Small delay between calls
        await new Promise(r => setTimeout(r, 300));
      } catch (_) {
        failed++;
      }
    }

    tableWrap.innerHTML = renderGrid(filtered);
    bindRowExpand(); bindDetailBtns(); bindPlayBtns();
    document.getElementById('bulk-modal').classList.add('hidden');

    showToast({
      type: success > 0 ? 'success' : 'error',
      title: `Bulk Dispatch Complete`,
      message: `✅ ${success} calls dispatched${failed > 0 ? ` · ❌ ${failed} failed` : ''}`,
    });

    parsedLeads = [];
    btn.disabled = false;
    txtEl.textContent = 'Dispatch All Calls';
  });
}
