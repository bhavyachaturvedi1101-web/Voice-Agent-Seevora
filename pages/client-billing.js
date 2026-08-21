// ============================================================
//  Client Billing Page
// ============================================================

import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar } from '../components/topbar.js';

// Mock Client Data for Demonstration
const MOCK_CLIENTS = [
  {
    id: 'c-001',
    name: 'Acme Corp',
    initials: 'AC',
    color: '#0284c7',
    bg: '#e0f2fe',
    status: 'active',
    agents: 2,
    calls: 1245,
    minutes: 4150.5,
    rateMultiplier: 1.5, // 50% markup
    revenue: 12451.50, // Rs
    cost: 8301.00 // Rs
  },
  {
    id: 'c-002',
    name: 'TechFlow Inc.',
    initials: 'TF',
    color: '#6c63ff',
    bg: '#ede9fe',
    status: 'active',
    agents: 4,
    calls: 3890,
    minutes: 12100.25,
    rateMultiplier: 1.8,
    revenue: 43560.90,
    cost: 24200.50
  },
  {
    id: 'c-003',
    name: 'Greenfield Real Estate',
    initials: 'GR',
    color: '#16a34a',
    bg: '#dcfce7',
    status: 'active',
    agents: 1,
    calls: 850,
    minutes: 2125.0,
    rateMultiplier: 2.0,
    revenue: 8500.00,
    cost: 4250.00
  },
  {
    id: 'c-004',
    name: 'Apex Fitness',
    initials: 'AF',
    color: '#ea580c',
    bg: '#ffedd5',
    status: 'inactive',
    agents: 1,
    calls: 120,
    minutes: 340.0,
    rateMultiplier: 1.5,
    revenue: 1020.00,
    cost: 680.00
  }
];

function getClientSummary(clients) {
  return clients.reduce((acc, c) => {
    acc.totalRevenue += c.revenue;
    acc.totalCost += c.cost;
    acc.totalCalls += c.calls;
    acc.activeClients += c.status === 'active' ? 1 : 0;
    return acc;
  }, { totalRevenue: 0, totalCost: 0, totalCalls: 0, activeClients: 0 });
}

function renderClientTable(clients) {
  if (!clients.length) return `<div class="empty-state"><h3>No clients found</h3></div>`;
  
  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>Client</th>
          <th>Status</th>
          <th>Active Agents</th>
          <th>Total Calls</th>
          <th>Duration (min)</th>
          <th>Platform Cost</th>
          <th>Client Billed</th>
          <th>Margin</th>
        </tr>
      </thead>
      <tbody>
        ${clients.map(c => {
          const margin = c.revenue - c.cost;
          const marginPercent = ((margin / c.revenue) * 100).toFixed(1);
          
          return `
          <tr>
            <td>
              <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; background:${c.bg}; color:${c.color}; font-weight:600; font-size:0.85rem;">
                  ${c.initials}
                </div>
                <span style="font-weight:500; color:var(--text-primary);">${c.name}</span>
              </div>
            </td>
            <td>
              ${c.status === 'active' 
                ? `<span class="badge badge-manual" style="font-size:0.68rem; background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0;">Active</span>` 
                : `<span class="badge badge-api" style="font-size:0.68rem; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0;">Inactive</span>`}
            </td>
            <td class="col-num">${c.agents}</td>
            <td class="col-num">${c.calls.toLocaleString()}</td>
            <td class="col-duration">${c.minutes.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}</td>
            <td class="col-cost" style="color:var(--text-secondary);">₹${c.cost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td class="col-cost" style="font-size:0.95rem; font-weight:600; color:var(--text-primary);">₹${c.revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td class="col-cost" style="color:#16a34a; font-weight:500;">+₹${margin.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span style="font-size:0.75rem; color:var(--text-muted);">(${marginPercent}%)</span></td>
          </tr>
        `}).join('')}
      </tbody>
    </table>
  `;
}

export async function renderClientBilling(user, navigate) {
  const summary = getClientSummary(MOCK_CLIENTS);
  const totalMargin = summary.totalRevenue - summary.totalCost;

  return `
    <div class="dashboard-shell">
      ${renderSidebar('client-billing', user)}
      <div class="main-content">
        ${renderTopbar({ title: 'Client Base Billing', subtitle: 'Manage billing and track margins across your clients', user })}
        
        <div class="page-content page-enter">
          
          <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 28px;">
            <div class="stat-card" style="border-bottom: 3px solid #6c63ff;">
              <div class="stat-icon purple"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
              <div class="stat-label">Active Clients</div>
              <div class="stat-value">${summary.activeClients}</div>
              <div class="stat-sub">Out of ${MOCK_CLIENTS.length} total</div>
            </div>
            
            <div class="stat-card" style="border-bottom: 3px solid #0ea5e9;">
              <div class="stat-icon cyan"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 24 16v.92z"/></svg></div>
              <div class="stat-label">Client Calls</div>
              <div class="stat-value">${summary.totalCalls.toLocaleString()}</div>
              <div class="stat-sub">Across all clients</div>
            </div>
            
            <div class="stat-card" style="border-bottom: 3px solid #f59e0b;">
              <div class="stat-icon yellow"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
              <div class="stat-label">Total Billed</div>
              <div class="stat-value">₹${summary.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <div class="stat-sub">Platform Cost: ₹${summary.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            
            <div class="stat-card" style="border-bottom: 3px solid #10b981; background: linear-gradient(145deg, #ffffff, #f0fdf4);">
              <div class="stat-icon green"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div>
              <div class="stat-label" style="color: #065f46;">Total Margin</div>
              <div class="stat-value" style="color: #059669;">+₹${totalMargin.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <div class="stat-sub" style="color: #047857;">Overall Profit</div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-header" style="display:flex; justify-content:space-between; align-items:center;">
              <h2 class="panel-title">Client Breakdown</h2>
              <button class="btn btn-primary btn-sm" id="btn-export-clients">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export CSV
              </button>
            </div>
            
            <div style="overflow-x:auto;">
              ${renderClientTable(MOCK_CLIENTS)}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  `;
}

export async function initClientBilling(user, navigate) {
  // Bind sidebar nav
  document.querySelectorAll('.side-nav-link[data-route]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
  });

  // Bind logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('seevora_session');
    navigate('login');
  });

  // Export CSV functionality
  const exportBtn = document.getElementById('btn-export-clients');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportClientsCSV(MOCK_CLIENTS);
    });
  }
}

function exportClientsCSV(clients) {
  const rows = [
    ['Client ID', 'Name', 'Status', 'Active Agents', 'Total Calls', 'Total Minutes', 'Platform Cost', 'Billed Revenue', 'Margin'],
    ...clients.map(c => [
      c.id, 
      c.name, 
      c.status, 
      c.agents, 
      c.calls, 
      c.minutes.toFixed(2), 
      c.cost.toFixed(2), 
      c.revenue.toFixed(2), 
      (c.revenue - c.cost).toFixed(2)
    ])
  ];
  
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; 
  a.download = `seevora_client_billing_${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); 
  URL.revokeObjectURL(url);
}
