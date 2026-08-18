// ============================================================
//  Topbar Component — with API status indicator
// ============================================================

let cachedApiStatus = 'live'; // Default to live since Express backend is active

export function renderTopbar({ title, subtitle, actions = '', user, apiStatus }) {
  const currentStatus = apiStatus || cachedApiStatus || 'live';
  
  const statusBadge = (currentStatus === 'offline')
    ? `<span id="api-status-badge" style="display:inline-flex;align-items:center;gap:5px;background:#fff7ed;border:1px solid #fed7aa;border-radius:20px;padding:3px 10px;font-size:0.7rem;font-weight:600;color:#c2410c;">
        <span style="width:6px;height:6px;border-radius:50%;background:#f97316;display:inline-block;"></span>
        Offline
      </span>`
    : `<span id="api-status-badge" style="display:inline-flex;align-items:center;gap:5px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:20px;padding:3px 10px;font-size:0.7rem;font-weight:600;color:#059669;">
        <span style="width:6px;height:6px;border-radius:50%;background:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,0.2);display:inline-block;"></span>
        API Live
      </span>`;

  return `
    <header class="topbar" id="main-topbar" style="background:transparent; border-bottom:none;">
      <div class="topbar-title">
        <div style="font-weight:800;font-size:1.4rem; color:#0f172a;">${title}</div>
        ${subtitle ? `<div style="font-size:0.8rem;color:#64748b;font-weight:500; margin-top:2px;">${subtitle}</div>` : ''}
      </div>
      <div class="topbar-actions" style="gap:12px; flex-wrap:wrap; align-items:center;">
        ${statusBadge}
        ${actions}
        <div style="display: flex; flex-direction: row; gap: 6px; flex-wrap:wrap;">
          <button class="btn" id="admin-btn" style="background:#f1f5f9; color:#0f172a; border-radius:12px; font-size:0.75rem; padding:4px 12px; font-weight:600; border:1px solid #e2e8f0; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            ${user?.role || 'Admin'}
          </button>
          <button class="btn" id="logout-btn" style="background:transparent; color:#ef4444; border-radius:12px; font-size:0.75rem; padding:4px 12px; font-weight:600; border:1px solid rgba(239, 68, 68, 0.2); justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log Out
          </button>
        </div>
      </div>
    </header>
  `;
}

/**
 * After page render, ping /api/health and update the badge live.
 */
export async function updateApiStatusBadge() {
  const badge = document.getElementById('api-status-badge');
  if (!badge) return;
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      cachedApiStatus = 'live';
      badge.style.background = '#ecfdf5';
      badge.style.border = '1px solid #a7f3d0';
      badge.style.color = '#059669';
      badge.innerHTML = `
        <span style="width:6px;height:6px;border-radius:50%;background:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,0.2);display:inline-block;"></span>
        API Live
      `;
    } else {
      throw new Error('not ok');
    }
  } catch {
    cachedApiStatus = 'offline';
    badge.style.background = '#fff7ed';
    badge.style.border = '1px solid #fed7aa';
    badge.style.color = '#c2410c';
    badge.innerHTML = `
      <span style="width:6px;height:6px;border-radius:50%;background:#f97316;display:inline-block;"></span>
      Offline
    `;
  }
}
