// ============================================================
//  Sidebar Component
// ============================================================

export function renderSidebar(activeRoute, user) {
  return `
    <nav class="side-nav" id="main-sidebar">
      <div class="side-nav-header">
        <div class="logo">
          <img src="/assets/logo.png" alt="Seevora" class="logo-icon" style="width: 28px; height: 28px; border-radius: 4px;" />
          <span>Seevora</span>
        </div>
      </div>
      <div class="side-nav-container">

        <button class="side-nav-link ${activeRoute === 'outbound' ? 'active' : ''}" data-route="outbound" id="nav-outbound">
          <svg class="side-nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 24 16v.92z"/><line x1="18" y1="6" x2="23" y2="11"/><line x1="23" y1="6" x2="18" y2="11"/></svg>
          <span class="side-nav-text">Outbound</span>
        </button>

        <button class="side-nav-link ${activeRoute === 'inbound' ? 'active' : ''}" data-route="inbound" id="nav-inbound">
          <svg class="side-nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span class="side-nav-text">Inbound</span>
        </button>

        <button class="side-nav-link ${activeRoute === 'agents' ? 'active' : ''}" data-route="agents" id="nav-agents">
          <svg class="side-nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>
          <span class="side-nav-text">AI Agents</span>
        </button>

        <button class="side-nav-link ${activeRoute === 'unified' ? 'active' : ''}" data-route="unified" id="nav-unified">
          <svg class="side-nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span class="side-nav-text">Logs</span>
        </button>

        <button class="side-nav-link ${activeRoute === 'client-billing' ? 'active' : ''}" data-route="client-billing" id="nav-client-billing">
          <svg class="side-nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span class="side-nav-text">Client Billing</span>
        </button>

        <button class="side-nav-link ${activeRoute === 'pricing' ? 'active' : ''}" data-route="pricing" id="nav-pricing">
          <svg class="side-nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span class="side-nav-text">Platform Billing</span>
        </button>

      </div>
    </nav>
  `;
}

