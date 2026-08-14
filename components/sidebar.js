// ============================================================
//  Sidebar Component
// ============================================================

export function renderSidebar(activeRoute, user) {
  return `
    <nav class="bottom-nav" id="main-sidebar">
      <div class="bottom-nav-container">
        <button class="bottom-nav-link ${activeRoute === 'outbound' ? 'active' : ''}" data-route="outbound" id="nav-outbound">
          <svg class="bottom-nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          <span class="bottom-nav-text">Outbound</span>
        </button>

        <button class="bottom-nav-link ${activeRoute === 'inbound' ? 'active' : ''}" data-route="inbound" id="nav-inbound">
          <div class="nav-icon-wrapper">
            <svg class="bottom-nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span class="nav-badge">34</span>
          </div>
          <span class="bottom-nav-text">Inbound</span>
        </button>

        <button class="bottom-nav-link ${activeRoute === 'unified' ? 'active' : ''}" data-route="unified" id="nav-unified">
          <svg class="bottom-nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span class="bottom-nav-text">Logs</span>
        </button>

        <button class="bottom-nav-link ${activeRoute === 'pricing' ? 'active' : ''}" data-route="pricing" id="nav-pricing">
          <svg class="bottom-nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          <span class="bottom-nav-text">Billing</span>
        </button>


      </div>
    </nav>
  `;
}
