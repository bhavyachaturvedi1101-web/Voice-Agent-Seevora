// ============================================================
//  Sidebar Component
// ============================================================

export function renderSidebar(activeRoute, user) {
  const userName = user?.name || 'User';
  const userInitials = user?.initials || user?.user?.initials || (userName ? userName.slice(0, 2).toUpperCase() : 'U');
  const userEmail = user?.email || user?.user?.email || '';
  const businessName = user?.businessName || user?.user?.businessName || '';
  const isClient = (user?.role || user?.user?.role || '').toLowerCase() === 'client';

  const navLinks = isClient ? `
    <!-- Client Nav Links -->
    <button class="side-nav-link ${activeRoute === 'dashboard' ? 'active' : ''}" data-route="dashboard" id="nav-dashboard">
      <svg class="side-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
      <span class="side-nav-text">Dashboard</span>
    </button>

    <button class="side-nav-link ${activeRoute === 'outbound' ? 'active' : ''}" data-route="outbound" id="nav-outbound">
      <svg class="side-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 24 16v.92z"/><line x1="18" y1="6" x2="23" y2="11"/><line x1="23" y1="6" x2="18" y2="11"/></svg>
      <span class="side-nav-text">Outbound Calls</span>
    </button>

    <button class="side-nav-link ${activeRoute === 'inbound' ? 'active' : ''}" data-route="inbound" id="nav-inbound">
      <svg class="side-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span class="side-nav-text">Inbound Calls</span>
    </button>

    <button class="side-nav-link ${activeRoute === 'agents' ? 'active' : ''}" data-route="agents" id="nav-agents">
      <svg class="side-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>
      <span class="side-nav-text">My AI Agent</span>
    </button>

    <button class="side-nav-link ${activeRoute === 'client-billing' ? 'active' : ''}" data-route="client-billing" id="nav-client-billing">
      <svg class="side-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
      <span class="side-nav-text">Billing & Wallet</span>
    </button>
  ` : `
    <!-- Admin Nav Links -->
    <button class="side-nav-link ${activeRoute === 'dashboard' ? 'active' : ''}" data-route="dashboard" id="nav-dashboard">
      <svg class="side-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
      <span class="side-nav-text">Dashboard</span>
    </button>

    <button class="side-nav-link ${activeRoute === 'outbound' ? 'active' : ''}" data-route="outbound" id="nav-outbound">
      <svg class="side-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 24 16v.92z"/><line x1="18" y1="6" x2="23" y2="11"/><line x1="23" y1="6" x2="18" y2="11"/></svg>
      <span class="side-nav-text">Outbound</span>
    </button>

    <button class="side-nav-link ${activeRoute === 'inbound' ? 'active' : ''}" data-route="inbound" id="nav-inbound">
      <svg class="side-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span class="side-nav-text">Inbound</span>
    </button>

    <button class="side-nav-link ${activeRoute === 'agents' ? 'active' : ''}" data-route="agents" id="nav-agents">
      <svg class="side-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>
      <span class="side-nav-text">AI Agents</span>
    </button>

    <button class="side-nav-link ${activeRoute === 'unified' ? 'active' : ''}" data-route="unified" id="nav-unified">
      <svg class="side-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
      <span class="side-nav-text">Logs</span>
    </button>
    
    <div style="height: 32px;"></div>

    <button class="side-nav-link ${activeRoute === 'client-billing' ? 'active' : ''}" data-route="client-billing" id="nav-client-billing">
      <svg class="side-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <span class="side-nav-text">Client Billing</span>
    </button>

    <button class="side-nav-link ${activeRoute === 'pricing' ? 'active' : ''}" data-route="pricing" id="nav-pricing">
      <svg class="side-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      <span class="side-nav-text">Platform Billing</span>
    </button>
  `;

  return `
    <nav class="side-nav" id="main-sidebar">
      <div class="side-nav-header" style="height: 100px; padding-left: 32px;">
        <div class="logo">
          <img src="/assets/logo.png" alt="Seevora" style="width: 28px; height: 28px; object-fit: contain; filter: url(#remove-white-bg);" />
          <span style="font-size: 1.4rem; font-weight: 800; color: #0f172a; margin-left: 8px;">Seevora</span>
        </div>
      </div>
      <div class="side-nav-links" style="padding: 0 24px; flex: 1;">
        ${navLinks}
      </div>
      
      <!-- Bottom Section -->
      <div style="padding: 24px; border-top: 1px solid var(--border-subtle);">
        <!-- User Profile & Logout -->
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="avatar" style="width: 36px; height: 36px; background: #e0f9ff; color: #0369a1; font-size: 0.85rem; box-shadow: none;">${userInitials}</div>
          <div style="flex: 1; overflow: hidden; cursor: default;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${userName}</div>
              <span style="font-size: 0.6rem; font-weight: 700; background: ${isClient ? '#e0f9ff' : '#f1f5f9'}; color: ${isClient ? '#0284c7' : '#475569'}; padding: 1px 6px; border-radius: 4px;">${isClient ? 'CLIENT' : 'ADMIN'}</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${businessName || userEmail}</div>
          </div>
          <button id="sidebar-logout-btn" title="Log Out" style="background: none; border: none; padding: 6px; border-radius: 8px; color: #ef4444; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='none'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>
    </nav>
  `;
}

