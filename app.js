// ============================================================
//  SEEVORA — App Router & Auth Guard
// ============================================================

import { renderLogin, initLogin }           from './pages/login.js';
import { renderSignup, initSignup }         from './pages/signup.js';
import { renderOnboarding, initOnboarding } from './pages/onboarding.js';
import { renderDashboard, initDashboard }   from './pages/dashboard.js';
import { renderOutbound, initOutbound }     from './pages/outbound.js';
import { renderInbound, initInbound }       from './pages/inbound.js';
import { renderInboundDetail, initInboundDetail } from './pages/inbound-detail.js';
import { renderPricing, initPricing }       from './pages/pricing.js';
import { renderUnified, initUnified }       from './pages/unified.js';
import { renderAgents, initAgents }         from './pages/agents.js';
import { renderClientBilling, initClientBilling } from './pages/client-billing.js';

const app = document.getElementById('app');

// ── Session helpers ────────────────────────────────────────
function getSession() {
  try {
    const raw = localStorage.getItem('seevora_session');
    if (!raw) return null;
    const s = JSON.parse(raw);
    
    // Auto-logout after 30 min inactivity
    if (Date.now() - s.loginTime > 30 * 60 * 1000) {
      localStorage.removeItem('seevora_session');
      return null;
    }
    // Refresh timestamp on activity
    s.loginTime = Date.now();
    
    // Normalize user object so all components have clean role & business data
    if (!s.user) {
      s.user = {
        userId: s.userId || s.id,
        name: s.name || 'User',
        email: s.email || '',
        role: s.role || 'Client',
        initials: s.initials || 'U',
        businessName: s.businessName || '',
        walletBalance: s.walletBalance !== undefined ? s.walletBalance : 500,
        plan: s.plan || 'Self-Serve Starter'
      };
    }
    localStorage.setItem('seevora_session', JSON.stringify(s));
    return s;
  } catch { return null; }
}

// ── Router ─────────────────────────────────────────────────
const PUBLIC_ROUTES = ['login', 'signup', 'onboarding'];

function navigate(route, params = {}) {
  const session = getSession();

  if (PUBLIC_ROUTES.includes(route)) {
    renderPage(route, session, params);
    return;
  }

  if (!session) {
    renderPage('login', null, params);
    return;
  }

  // Client Route Guard: Prevent clients from accessing internal agency tools or system infra logs
  const isClient = (session.user?.role || session.role || '').toLowerCase() === 'client';
  const ADMIN_ONLY_ROUTES = ['unified', 'pricing'];
  if (isClient && ADMIN_ONLY_ROUTES.includes(route)) {
    import('./components/toast.js').then(({ showToast }) => {
      showToast({ type: 'warning', title: 'Admin Area Restricted', message: 'This section is reserved for platform administrators.' });
    });
    renderPage('dashboard', session, params);
    return;
  }

  renderPage(route, session, params);
}

async function renderPage(route, session, params = {}) {
  // Scroll to top
  window.scrollTo(0, 0);

  const currentUser = session?.user || session;

  try {
    switch (route) {
      case 'login':
        app.innerHTML = await renderLogin();
        initLogin(
          (sess) => navigate('dashboard'),
          () => navigate('signup')
        );
        break;

      case 'signup':
        app.innerHTML = renderSignup();
        initSignup(
          (sess) => navigate('onboarding'),   // after signup → onboarding
          () => navigate('login')             // go back to login
        );
        break;

      case 'onboarding':
        app.innerHTML = renderOnboarding(session, navigate);
        initOnboarding(session, navigate);
        break;

      case 'dashboard':
        app.innerHTML = renderDashboard(currentUser, navigate);
        initDashboard(currentUser, navigate);
        break;

      case 'outbound':
        app.innerHTML = await renderOutbound(session, navigate);
        initOutbound(session, navigate);
        break;

      case 'inbound':
        app.innerHTML = await renderInbound(session, navigate);
        initInbound(session, navigate);
        break;

      case 'inbound-detail':
        app.innerHTML = await renderInboundDetail(session, navigate, params);
        initInboundDetail(session, navigate, params);
        break;

      case 'pricing':
        app.innerHTML = await renderPricing(session, navigate);
        initPricing(session, navigate);
        break;

      case 'agents':
        app.innerHTML = await renderAgents(session, navigate);
        initAgents(session, navigate, params);
        break;

      case 'client-billing':
        app.innerHTML = await renderClientBilling(session, navigate);
        initClientBilling(session, navigate);
        break;

      case 'unified':
        app.innerHTML = await renderUnified(session, navigate);
        initUnified(session, navigate);
        break;

      default:
        navigate('dashboard');
    }

    // Sidebar links
    if (document.querySelector('.side-nav')) {
      document.querySelector('.side-nav').addEventListener('click', (e) => {
        if (e.target.closest('.side-nav-link')) {
          const btn = e.target.closest('.side-nav-link');
          const route = btn.dataset.route;
          if (route) navigate(route);
        }
      });
    }

    // Ensure API status badge is refreshed across all pages
    if (route !== 'login') {
      import('./components/topbar.js').then(({ updateApiStatusBadge }) => {
        updateApiStatusBadge();
      });
    }

    // Initialize 3D Card effects for any newly injected cards
    if (window.VanillaTilt) {
      VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
        max: 8,
        speed: 400,
        glare: true,
        "max-glare": 0.2
      });
    }
  } catch (err) {
    console.error('Render error:', err);
    app.innerHTML = `
      <div style="padding: 40px; text-align: center; color: var(--text-primary);">
        <h2>Oops, something went wrong.</h2>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">${err.message}</p>
        <button class="btn btn-primary" onclick="localStorage.removeItem('seevora_session'); window.location.reload();">Clear Session & Reload</button>
      </div>
    `;
  }
}

// ── Boot ────────────────────────────────────────────────────
const session = getSession();
if (session) {
  navigate('dashboard');
} else {
  navigate('login');
}

// ── Global Logout Handler ───────────────────────────────────
document.addEventListener('click', (e) => {
  const logoutBtn = e.target.closest('#logout-btn') || e.target.closest('#sidebar-logout-btn');
  if (logoutBtn) {
    localStorage.removeItem('seevora_session');
    navigate('login');
  }
});

// ── Inactivity auto-logout ──────────────────────────────────
let inactivityTimer;
function resetInactivity() {
  clearTimeout(inactivityTimer);
  const session = getSession();
  if (!session) return;
  inactivityTimer = setTimeout(() => {
    localStorage.removeItem('seevora_session');
    navigate('login');
    import('./components/toast.js').then(({ showToast }) => {
      showToast({ type: 'warning', title: 'Session expired', message: 'You were logged out due to inactivity.' });
    });
  }, 30 * 60 * 1000);
}

['click', 'keydown', 'mousemove', 'scroll', 'touchstart'].forEach(evt => {
  document.addEventListener(evt, resetInactivity, { passive: true });
});
resetInactivity();
