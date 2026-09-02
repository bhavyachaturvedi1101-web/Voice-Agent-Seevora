// ============================================================
//  Dashboard Overview Page
// ============================================================

import { renderSidebar } from '../components/sidebar.js';

export function renderDashboard(user) {
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
              <div style="width: 32px; height: 32px; border-radius: 50%; background: #e0e7ff; color: #3730a3; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600;">${user?.initials || 'AD'}</div>
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
              <div style="position: absolute; right: -8px; bottom: -8px; color: #0ea5e9; opacity: 0.18;">
                <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 24 16v.92z"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Total Calls</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">3,024</div>
                <div><span style="background: #f1f5f9; color: #475569; font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 8px;">Across all agents</span></div>
              </div>
            </div>
            
            <!-- KPI 2 -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: -8px; bottom: -8px; color: #eab308; opacity: 0.18;">
                <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Avg Success Rate</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">71%</div>
                <div><span style="background: #f1f5f9; color: #475569; font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 8px;">Across all agents</span></div>
              </div>
            </div>

            <!-- KPI 3 -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: -8px; bottom: -8px; color: #a855f7; opacity: 0.18;">
                <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Live / Calling</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">142</div>
                <div><span style="background: #f1f5f9; color: #475569; font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 8px;"><span class="pulse-dot" style="margin-right: 4px;"></span>Live Now</span></div>
              </div>
            </div>

            <!-- KPI 4 -->
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: -8px; bottom: -8px; color: #10b981; opacity: 0.18;">
                <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
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
                <!-- Call Volume Chart (Chart.js) -->
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
                <!-- Agent 1 -->
                <div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">Sales Agent (Sarah)</span>
                    <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">84%</span>
                  </div>
                  <div style="width: 100%; height: 8px; background: var(--border); border-radius: 99px; overflow: hidden;">
                    <div style="width: 84%; height: 100%; background: #3b82f6; border-radius: 99px;"></div>
                  </div>
                </div>

                <!-- Agent 2 -->
                <div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">Customer Support</span>
                    <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">68%</span>
                  </div>
                  <div style="width: 100%; height: 8px; background: var(--border); border-radius: 99px; overflow: hidden;">
                    <div style="width: 68%; height: 100%; background: #10b981; border-radius: 99px;"></div>
                  </div>
                </div>

                <!-- Agent 3 -->
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

export function initDashboard(onAction) {
  // Build Chart.js Graph
  const ctx = document.getElementById('dashboard-volume-chart')?.getContext('2d');
  if (ctx && window.Chart) {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['8/4', '8/7', '8/10', '8/13', '8/16', '8/19', '8/22', '8/25', '8/28', '8/31'],
        datasets: [{
          label: 'Call Volume',
          data: [120, 150, 180, 140, 210, 250, 310, 290, 380, 420],
          borderColor: '#6c63ff',
          backgroundColor: 'rgba(108,99,255,0.12)',
          pointBackgroundColor: '#6c63ff',
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

