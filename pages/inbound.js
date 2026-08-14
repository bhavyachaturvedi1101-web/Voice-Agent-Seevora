// ============================================================
//  Inbound Calls Page
// ============================================================

import { getInboundCalls } from '../api.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar } from '../components/topbar.js';

function statusBadge(status) {
  const map = {
    answered:  `<span class="badge badge-answered">Answered</span>`,
    missed:    `<span class="badge badge-missed">Missed</span>`,
    voicemail: `<span class="badge badge-voicemail">Voicemail</span>`,
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
                ${Array.from({length: 40}).map((_, i) => {
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
  const calls = await getInboundCalls();
  const answered  = calls.filter(c => c.status === 'answered').length;
  const missed    = calls.filter(c => c.status === 'missed').length;
  const voicemail = calls.filter(c => c.status === 'voicemail').length;
  const totalCost = calls.reduce((acc, c) => acc + (c.cost?.total || 0), 0);

  return `
    <div class="dashboard-shell">
      ${renderSidebar('inbound', user)}
      <div class="main-content" style="background:#f4f6fa;">
        ${renderTopbar({ title: 'Inbound Calls', subtitle: 'Monitor and review incoming AI-handled calls', user })}
        <div class="page-content page-enter">

          <!-- Stats -->
          <div class="stats-grid-modern">
            <div class="stat-card-modern">
              <div class="stat-header-modern">
                <span class="stat-title-modern">Total Inbound Calls</span>
                <span class="stat-icon-modern"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16v.92z"/></svg></span>
              </div>
              <div class="stat-value-modern">${calls.length}</div>
              <div class="stat-trend-modern neutral">Last 30 days</div>
            </div>
            
            <div class="stat-card-modern">
              <div class="stat-header-modern">
                <span class="stat-title-modern">Answered</span>
                <span class="stat-icon-modern"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></span>
              </div>
              <div class="stat-value-modern">${answered}</div>
              <div class="stat-trend-modern up">↑ ${calls.length > 0 ? Math.round((answered/calls.length)*100) : 0}% Answer Rate</div>
            </div>
            
            <div class="stat-card-modern">
              <div class="stat-header-modern">
                <span class="stat-title-modern">Missed / Voicemail</span>
                <span class="stat-icon-modern"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>
              </div>
              <div class="stat-value-modern">${missed + voicemail}</div>
              <div class="stat-trend-modern down">↓ Requires Follow-up</div>
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
  `;
}

export async function initInbound(user, navigate) {
  const calls = await getInboundCalls();
  let filtered = [...calls];

  document.querySelectorAll('.bottom-nav-link[data-route]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
  });
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('seevora_session');
    navigate('login');
  });

  const search  = document.getElementById('inbound-search');
  const statusF = document.getElementById('inbound-status-filter');
  const countEl = document.getElementById('inbound-count');
  const tableWrap = document.getElementById('inbound-table-wrap');

  function applyFilters() {
    const q = search.value.toLowerCase();
    const s = statusF.value;
    filtered = calls.filter(c => {
      if (q && !c.phone.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q) && !(c.callerName || '').toLowerCase().includes(q)) return false;
      if (s && c.status !== s) return false;
      return true;
    });
    countEl.textContent = `${filtered.length} calls`;
    tableWrap.innerHTML = renderGrid(filtered);
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

    document.querySelectorAll('.inbound-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.detail-btn')) return;
        navigate('inbound-detail', { id: row.dataset.id });
      });
    });
  }

  search.addEventListener('input', applyFilters);
  statusF.addEventListener('change', applyFilters);
    document.getElementById('inbound-clear-filters')?.addEventListener('click', () => {
      search.value = ''; statusF.value = '';
      applyFilters();
    });
  
    bindDetailBtns();
    bindPlayBtns();
  }
