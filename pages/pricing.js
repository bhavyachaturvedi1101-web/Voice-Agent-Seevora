// ============================================================
//  Pricing & Billing Page
// ============================================================

import { getAllCalls } from '../api.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar } from '../components/topbar.js';
import { showToast } from '../components/toast.js';
import { initCardViz } from '../components/three-card-viz.js';

let chartInstance = null;

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
    const d = new Date(c.date);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    if (key in buckets) buckets[key] += c.cost.total;
  });
  const labels = Object.keys(buckets).reverse();
  const values = labels.map(k => parseFloat(buckets[k].toFixed(2)));
  return { labels, values };
}

function renderPricingTable(calls) {
  if (!calls.length) return `<div class="empty-state"><h3>No data for this period</h3></div>`;
  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>Call ID</th>
          <th>Type</th>
          <th>Date</th>
          <th>Phone</th>
          <th>Duration (min)</th>
          <th>Per-min Rate</th>
          <th>Call Cost</th>
          <th>Platform Fee</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${calls.filter(c => c.cost).map(c => `
          <tr>
            <td class="col-num" style="color:var(--text-muted);font-size:0.78rem;">${c.id}</td>
            <td>
              ${c.type === 'outbound'
      ? `<span class="badge badge-manual" style="font-size:0.68rem;">Out</span>`
      : `<span class="badge badge-api" style="font-size:0.68rem;">In</span>`}
            </td>
            <td class="col-date">${c.dateFormatted}</td>
            <td class="col-num">${c.phone}</td>
            <td class="col-duration">${c.cost.minutes.toFixed(2)}</td>
            <td class="mono" style="color:var(--text-secondary);font-size:0.82rem;">₹${c.cost.minuteRate}</td>
            <td class="col-cost">₹${c.cost.callCost.toFixed(2)}</td>
            <td class="mono" style="color:var(--text-secondary);font-size:0.82rem;">₹${c.cost.platformFee.toFixed(2)}</td>
            <td class="col-cost" style="font-size:0.9rem;">₹${c.cost.total.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function exportCSV(calls) {
  const rows = [
    ['Call ID', 'Type', 'Date', 'Phone', 'Status', 'Duration (min)', 'Rate/min', 'Call Cost', 'Platform Fee', 'Total'],
    ...calls.filter(c => c.cost).map(c => [
      c.id, c.type, c.dateFormatted, c.phone, c.status,
      c.cost.minutes.toFixed(2), c.cost.minuteRate,
      c.cost.callCost.toFixed(4), c.cost.platformFee.toFixed(4), c.cost.total.toFixed(4)
    ])
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `seevora_billing_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

export async function renderPricing(user, navigate) {
  const allCalls = await getAllCalls();
  const summary = getPricingSummary(allCalls);
  const chartData = getDailySpend(allCalls, 30);

  return `
    <div class="dashboard-shell">
      ${renderSidebar('pricing', user)}
      <div class="main-content">
        ${renderTopbar({
    title: 'Billing & Integrations',
    subtitle: 'Manage your subscription and API keys',
    user: user,
    actions: `
            <button class="btn btn-ghost btn-sm" id="export-csv-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV
            </button>
          `
  })}
        <div class="page-content page-enter">
          <!-- Flat KPI Metrics -->
          <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px;">

            <!-- KPI 1: Total Calls -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 24 16v.92z"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Total Calls</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">${summary.totalCalls}</div>
                <div><span style="background: #f1f5f9; color: #475569; font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 8px;">Inbound + Outbound</span></div>
              </div>
            </div>

            <!-- KPI 2: Total Minutes -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Total Minutes</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">${summary.totalMinutes}</div>
                <div><span style="background: #f1f5f9; color: #475569; font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 8px;">min billed</span></div>
              </div>
            </div>

            <!-- KPI 3: Total Spend -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Total Spend</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">₹${summary.totalCost.toFixed(2)}</div>
                <div><span style="background: #f1f5f9; color: #475569; font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 8px;">This period</span></div>
              </div>
            </div>

            <!-- KPI 4: Avg Cost / Call -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Avg Cost / Call</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">₹${summary.avgCostPerCall}</div>
                <div><span style="background: #f1f5f9; color: #475569; font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 8px;">Est. per call</span></div>
              </div>
            </div>

          </div>

          <!-- Date Filter -->
          <div class="filter-bar" style="margin-bottom:20px;">
            <span class="filter-label">Date Range:</span>
            <select class="select select-sm" id="pricing-range" style="width:auto;">
              <option value="7">Last 7 days</option>
              <option value="30" selected>Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <select class="select select-sm" id="pricing-type" style="width:auto;">
              <option value="">All Types</option>
              <option value="outbound">Outbound Only</option>
              <option value="inbound">Inbound Only</option>
            </select>
            <button class="btn btn-ghost btn-sm" id="pricing-clear" style="margin-left:auto;">Reset</button>
          </div>

          <!-- Spend Chart -->
          <div class="chart-container" style="margin-bottom:20px;">
            <div class="chart-header">
              <div>
                <h3 style="font-size:0.9375rem;font-weight:600;">Daily Spend</h3>
                <p style="font-size:0.75rem;color:var(--text-muted);">Total cost per day over selected period</p>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="width:10px;height:10px;background:var(--accent-primary);border-radius:2px;display:inline-block;"></span>
                <span style="font-size:0.75rem;color:var(--text-secondary);">Daily cost (₹)</span>
              </div>
            </div>
            <div style="height:220px;position:relative;">
              <canvas id="spend-chart"></canvas>
            </div>
          </div>

          <!-- Pricing Table -->
          <div class="table-container">
            <div class="table-header-bar">
              <div>
                <span class="table-title">Per-Call Cost Breakdown</span>
                <span class="table-count" id="pricing-count">${allCalls.filter(c => c.cost).length} billed calls</span>
              </div>
              <div class="search-box">
                <div class="search-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
                <input type="text" id="pricing-search" placeholder="Search by ID or phone..." />
              </div>
            </div>
            <div id="pricing-table-wrap">
              ${renderPricingTable(allCalls)}
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}

export async function initPricing(user, navigate) {
  const allCalls = await getAllCalls();
  let filtered = [...allCalls];

  // 3D Canvas visualizers removed in favour of clean watermark icons
  
  document.querySelectorAll('.side-nav-link[data-route]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
  });
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('seevora_session');
    navigate('login');
  });

  // Build chart
  function buildChart(calls, numDays) {
    const ctx = document.getElementById('spend-chart')?.getContext('2d');
    if (!ctx) return;
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    const data = getDailySpend(calls, numDays);
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Daily Spend (₹)',
          data: data.values,
          borderColor: '#6c63ff',
          backgroundColor: 'rgba(108,99,255,0.12)',
          pointBackgroundColor: '#6c63ff',
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: true,
          tension: 0.4,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#151b30',
            borderColor: 'rgba(108,99,255,0.3)',
            borderWidth: 1,
            titleColor: '#f0f2ff',
            bodyColor: '#8892b0',
            callbacks: {
              label: ctx => ` ₹${ctx.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#4a5568', font: { size: 10, family: 'Inter' }, maxTicksLimit: 10 },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#4a5568', font: { size: 10, family: 'Inter' }, callback: v => `₹${v.toFixed(2)}` },
          }
        }
      }
    });
  }

  buildChart(allCalls, 30);

  const rangeEl = document.getElementById('pricing-range');
  const typeEl = document.getElementById('pricing-type');
  const searchEl = document.getElementById('pricing-search');
  const countEl = document.getElementById('pricing-count');
  const tableWrap = document.getElementById('pricing-table-wrap');

  function applyFilters() {
    days = parseInt(rangeEl.value);
    const type = typeEl.value;
    const q = searchEl.value.toLowerCase();
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
    filtered = allCalls.filter(c => {
      if (c.date < cutoff) return false;
      if (type && c.type !== type) return false;
      if (q && !c.id.toLowerCase().includes(q) && !c.phone.toLowerCase().includes(q)) return false;
      return true;
    });
    countEl.textContent = `${filtered.filter(c => c.cost).length} billed calls`;
    tableWrap.innerHTML = renderPricingTable(filtered);
    buildChart(filtered, days);
  }

  rangeEl.addEventListener('change', applyFilters);
  typeEl.addEventListener('change', applyFilters);
  searchEl.addEventListener('input', applyFilters);
  document.getElementById('pricing-clear')?.addEventListener('click', () => {
    rangeEl.value = '30'; typeEl.value = ''; searchEl.value = '';
    applyFilters();
  });

  document.getElementById('export-csv-btn')?.addEventListener('click', () => {
    exportCSV(filtered);
    showToast({ type: 'success', title: 'CSV exported', message: `${filtered.filter(c => c.cost).length} rows downloaded.` });
  });
}

