// ============================================================
//  Unified Call Log Page
// ============================================================

import { getAllCalls } from '../api.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar } from '../components/topbar.js';

function statusBadge(status) {
  const map = {
    completed:     `<span class="badge badge-completed"><span class="pulse-dot" style="display:none"></span>Completed</span>`,
    answered:      `<span class="badge badge-answered">Answered</span>`,
    failed:        `<span class="badge badge-failed">Failed</span>`,
    missed:        `<span class="badge badge-missed">Missed</span>`,
    voicemail:     `<span class="badge badge-voicemail">Voicemail</span>`,
    'in-progress': `<span class="badge badge-in-progress"><span class="pulse-dot"></span>Live</span>`,
    calling:       `<span class="badge badge-in-progress"><span class="pulse-dot"></span>Calling</span>`,
    scheduled:     `<span class="badge badge-scheduled">Scheduled</span>`,
    queued:        `<span class="badge badge-queued"><span class="pulse-dot"></span>Queued</span>`,
  };
  return map[status] || `<span class="badge">${status}</span>`;
}

function typeBadge(type) {
  return type === 'outbound'
    ? `<span class="badge badge-manual" style="font-size:0.68rem;">↑ Out</span>`
    : `<span class="badge badge-api" style="font-size:0.68rem;">↓ In</span>`;
}

function initiatedBadge(method) {
  const map = {
    manual:    `<span class="badge badge-manual">Manual</span>`,
    api:       `<span class="badge badge-api">API</span>`,
    bulk:      `<span class="badge badge-bulk">Bulk</span>`,
    scheduled: `<span class="badge badge-auto">Scheduled</span>`,
  };
  return map[method] || (method ? `<span class="badge">${method}</span>` : `<span style="color:var(--text-muted)">—</span>`);
}

function renderTable(calls) {
  if (!calls.length) return `
    <div class="empty-state">
      <div class="empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></div>
      <h3>No calls found</h3>
      <p>Try adjusting your filters.</p>
    </div>`;

  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>Call ID</th>
          <th>Type</th>
          <th>Date & Time</th>
          <th>Phone Number</th>
          <th>Agent</th>
          <th>Status</th>
          <th>Duration</th>
          <th>Initiated By</th>
          <th>Cost</th>
        </tr>
      </thead>
      <tbody>
        ${calls.map(c => `
          <tr style="cursor:default;">
            <td class="col-num" style="color:var(--text-muted);font-size:0.78rem;">${c.id}</td>
            <td>${typeBadge(c.type)}</td>
            <td class="col-date">${c.dateFormatted}</td>
            <td class="col-num">${c.phone}</td>
            <td style="font-size:0.82rem;max-width:160px;" class="truncate">${c.agent}</td>
            <td>${statusBadge(c.status)}</td>
            <td class="col-duration">${c.duration}</td>
            <td>${initiatedBadge(c.initiatedBy)}</td>
            <td class="col-cost">${c.total_cost_rs > 0 ? '₹' + c.total_cost_rs.toFixed(2) : (c.cost ? '₹' + c.cost.total.toFixed(2) : '<span style="color:var(--text-muted)">—</span>')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

export async function renderUnified(user, navigate) {
  const allCalls = await getAllCalls();
  const outbound = allCalls.filter(c => c.type === 'outbound').length;
  const inbound  = allCalls.filter(c => c.type === 'inbound').length;
  const manual   = allCalls.filter(c => c.initiatedBy === 'manual').length;
  const api      = allCalls.filter(c => c.initiatedBy === 'api').length;
  const bulk     = allCalls.filter(c => c.initiatedBy === 'bulk').length;

  return `
    <div class="dashboard-shell">
      ${renderSidebar('unified', user)}
      <div class="main-content">
        ${renderTopbar({ title: 'Unified Call Log', subtitle: 'All inbound & outbound calls — for auditing and debugging', user })}
        <div class="page-content page-enter">

          <!-- Stats -->
          <div class="stats-grid stats-grid-5col">
            <div class="stat-card">
              <div class="stat-icon purple"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></div>
              <div class="stat-label">Total Calls</div>
              <div class="stat-value">${allCalls.length}</div>
              <div class="stat-sub">All time</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon purple"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 24 16v.92z"/></svg></div>
              <div class="stat-label">Outbound</div>
              <div class="stat-value">${outbound}</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon cyan"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16v.92z"/></svg></div>
              <div class="stat-label">Inbound</div>
              <div class="stat-value">${inbound}</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon yellow"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
              <div class="stat-label">Manual / Dashboard</div>
              <div class="stat-value">${manual}</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon green"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></div>
              <div class="stat-label">API / Bulk</div>
              <div class="stat-value">${api + bulk}</div>
            </div>
          </div>

          <!-- Filters -->
          <div class="filter-bar">
            <div class="search-box">
              <div class="search-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
              <input type="text" id="unified-search" placeholder="Search phone, ID, agent..." />
            </div>
            <select class="select select-sm" id="unified-type-filter" style="width:auto;">
              <option value="">All Types</option>
              <option value="outbound">Outbound</option>
              <option value="inbound">Inbound</option>
            </select>
            <select class="select select-sm" id="unified-status-filter" style="width:auto;">
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="answered">Answered</option>
              <option value="in-progress">In Progress</option>
              <option value="failed">Failed</option>
              <option value="missed">Missed</option>
              <option value="scheduled">Scheduled</option>
              <option value="voicemail">Voicemail</option>
            </select>
            <select class="select select-sm" id="unified-init-filter" style="width:auto;">
              <option value="">All Sources</option>
              <option value="manual">Manual</option>
              <option value="api">API</option>
              <option value="bulk">Bulk Upload</option>
              <option value="scheduled">Scheduled</option>
            </select>
            <button class="btn btn-ghost btn-sm" id="unified-clear" style="margin-left:auto;">Clear</button>
          </div>

          <!-- Table -->
          <div class="table-container">
            <div class="table-header-bar">
              <div>
                <span class="table-title">All Calls</span>
                <span class="table-count" id="unified-count">${allCalls.length} total</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;font-size:0.75rem;color:var(--text-muted);">
                <span>↑ Out</span><span style="color:var(--accent-primary);">■</span>
                <span>↓ In</span><span style="color:var(--accent-cyan);">■</span>
              </div>
            </div>
            <div id="unified-table-wrap">
              ${renderTable(allCalls)}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function initUnified(user, navigate) {
  const allCalls = await getAllCalls();
  let filtered = [...allCalls];

  document.querySelectorAll('.bottom-nav-link[data-route]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
  });
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('seevora_session');
    navigate('login');
  });

  const search   = document.getElementById('unified-search');
  const typeF    = document.getElementById('unified-type-filter');
  const statusF  = document.getElementById('unified-status-filter');
  const initF    = document.getElementById('unified-init-filter');
  const countEl  = document.getElementById('unified-count');
  const tableWrap = document.getElementById('unified-table-wrap');

  function applyFilters() {
    const q = search.value.toLowerCase();
    const t = typeF.value;
    const s = statusF.value;
    const m = initF.value;
    filtered = allCalls.filter(c => {
      if (q && !c.phone.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q) && !c.agent.toLowerCase().includes(q)) return false;
      if (t && c.type !== t) return false;
      if (s && c.status !== s) return false;
      if (m && c.initiatedBy !== m) return false;
      return true;
    });
    countEl.textContent = `${filtered.length} total`;
    tableWrap.innerHTML = renderTable(filtered);
  }

  search.addEventListener('input', applyFilters);
  typeF.addEventListener('change', applyFilters);
  statusF.addEventListener('change', applyFilters);
  initF.addEventListener('change', applyFilters);
  document.getElementById('unified-clear')?.addEventListener('click', () => {
    search.value = ''; typeF.value = ''; statusF.value = ''; initF.value = '';
    applyFilters();
  });
}
