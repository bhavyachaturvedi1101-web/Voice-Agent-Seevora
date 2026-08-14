// ============================================================
//  SEEVORA — App Router & Auth Guard
// ============================================================

import { renderLogin, initLogin }           from './pages/login.js';
import { renderOutbound, initOutbound }     from './pages/outbound.js';
import { renderInbound, initInbound }       from './pages/inbound.js';
import { renderInboundDetail, initInboundDetail } from './pages/inbound-detail.js';
import { renderPricing, initPricing }       from './pages/pricing.js';
import { renderUnified, initUnified }       from './pages/unified.js';

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
    localStorage.setItem('seevora_session', JSON.stringify(s));
    return s;
  } catch { return null; }
}

// ── Router ─────────────────────────────────────────────────
function navigate(route, params = {}) {
  const session = getSession();

  if (route === 'login') {
    renderPage('login', null, params);
    return;
  }

  if (!session) {
    renderPage('login', null, params);
    return;
  }

  renderPage(route, session, params);
}

async function renderPage(route, session, params = {}) {
  // Scroll to top
  window.scrollTo(0, 0);

  try {
    switch (route) {
      case 'login':
        app.innerHTML = await renderLogin();
        initLogin((sess) => navigate('outbound'));
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

      case 'unified':
        app.innerHTML = await renderUnified(session, navigate);
        initUnified(session, navigate);
        break;

      default:
        navigate('outbound');
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
  navigate('outbound');
} else {
  navigate('login');
}

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
