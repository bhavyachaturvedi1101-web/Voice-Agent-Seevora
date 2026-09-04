// ============================================================
//  Topbar Component
// ============================================================

export function renderTopbar({ title, subtitle, actions = '', user }) {
  return `
    <header class="topbar" id="main-topbar" style="background:#ffffff; border-bottom:1px solid #e2e8f0; padding:14px 32px; position:sticky; top:0; z-index:50; margin-top:0;">
      <div class="topbar-title">
        <div style="font-weight:800; font-size:1.35rem; color:#0f172a;">${title}</div>
        ${subtitle ? `<div style="font-size:0.82rem; color:#64748b; font-weight:500; margin-top:2px;">${subtitle}</div>` : ''}
      </div>
      <div class="topbar-actions" style="display:flex; flex-direction:row; flex-wrap:nowrap; align-items:center; gap:10px;">
        ${actions}
        ${(user?.role || user?.user?.role || '').toLowerCase() === 'client' ? `
          <div class="badge" style="background:#e0f9ff; color:#0284c7; border-radius:10px; font-size:0.75rem; padding:6px 12px; font-weight:700; border:1px solid #bae6fd; display:flex; align-items:center; white-space:nowrap;">
            Client
          </div>
        ` : `
          <button class="btn" id="admin-btn" style="background:#f1f5f9; color:#0f172a; border-radius:10px; font-size:0.75rem; padding:6px 12px; font-weight:600; border:1px solid #e2e8f0; display:flex; align-items:center; white-space:nowrap; cursor:pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Admin
          </button>
        `}
        <button class="btn" id="logout-btn" style="background:transparent; color:#ef4444; border-radius:10px; font-size:0.75rem; padding:6px 12px; font-weight:600; border:1px solid rgba(239,68,68,0.2); display:flex; align-items:center; white-space:nowrap; cursor:pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="12" y1="12" x2="9" y2="12"/></svg>
          Log Out
        </button>
      </div>
    </header>
  `;
}

/**
 * No-op kept for backwards compatibility with pages that call this.
 */
export async function updateApiStatusBadge() { }

