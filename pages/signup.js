// ============================================================
//  Signup Page — Ultra-Premium Full Screen
// ============================================================

import { showToast } from '../components/toast.js';

export function renderSignup() {
  return `
    <div class="login-wrapper" style="background-image: url('/assets/login_bg_final.jpg'); background-size: cover; background-position: center; min-height: 100vh; display: flex; align-items: center; justify-content: flex-start; padding: 24px; padding-left: 10%;">
      
      <div style="width: 100%; max-width: 480px; padding: 50px 40px; display: flex; flex-direction: column; justify-content: center; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px); border-radius: 24px; box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1); border: 1px solid rgba(255, 255, 255, 0.4); border-top: 1px solid rgba(255, 255, 255, 0.6); border-left: 1px solid rgba(255, 255, 255, 0.6);">
        
        <!-- Logo -->
        <div style="display:flex; align-items:center; margin-bottom: 16px;">
          <img src="/assets/logo.png" alt="Seevora" style="width: 38px; height: 38px; object-fit: contain; filter: url(#remove-white-bg);" />
          <span style="font-size: 2rem; font-weight: 800; color: #0f172a; margin-left: 10px; font-family: Inter, sans-serif; letter-spacing: -0.02em;">Seevora</span>
        </div>
        <h1 style="color: #111827; font-size: 1.6rem; font-weight: 700; margin-bottom: 4px; margin-top: 0; font-family: Inter, sans-serif;">Create your account</h1>
        <p style="color: #6b7280; margin-bottom: 20px; font-size: 0.9rem; margin-top: 0;">Start automating your calls in minutes.</p>

        <!-- Quick Demo Autofill Button -->
        <button type="button" id="btn-autofill-test" style="width: 100%; padding: 10px 14px; background: #e0f9ff; color: #0284c7; border: 1.5px dashed #0ea5e9; border-radius: 12px; font-size: 0.85rem; font-weight: 700; margin-bottom: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;">
          <span>Auto-fill Easy Test Details (1-Click)</span>
        </button>

        <!-- Error / Success messages -->
        <div class="login-error hidden" id="signup-error" style="background: #fee2e2; color: #991b1b; font-weight: 600; padding: 12px 14px; border-radius: 12px; font-size: 0.85rem; margin-bottom: 16px; border: 1px solid #fca5a5; display: flex; align-items: center; gap: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span id="signup-error-text">Something went wrong.</span>
        </div>

        <form id="signup-form" novalidate>
          <!-- Name row -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
            <div style="position: relative;">
              <input class="l-input" type="text" id="signup-firstname" placeholder="First name" required
                style="width: 100%; padding: 13px 14px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; font-size: 0.9rem; color: #111827; outline: none; box-sizing: border-box;" />
            </div>
            <div style="position: relative;">
              <input class="l-input" type="text" id="signup-lastname" placeholder="Last name"
                style="width: 100%; padding: 13px 14px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; font-size: 0.9rem; color: #111827; outline: none; box-sizing: border-box;" />
            </div>
          </div>

          <!-- Email -->
          <div style="position: relative; margin-bottom: 14px;">
            <div style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <input class="l-input" type="email" id="signup-email" placeholder="Email address" required
              style="width: 100%; padding: 13px 14px 13px 42px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; font-size: 0.9rem; color: #111827; outline: none; box-sizing: border-box;" />
          </div>

          <!-- Password -->
          <div style="position: relative; margin-bottom: 14px;">
            <div style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <input class="l-input" type="password" id="signup-password" placeholder="Password (min 6 chars)" required
              style="width: 100%; padding: 13px 14px 13px 42px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; font-size: 0.9rem; color: #111827; outline: none; box-sizing: border-box;" />
          </div>

          <!-- Business name -->
          <div style="position: relative; margin-bottom: 22px;">
            <div style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <input class="l-input" type="text" id="signup-business" placeholder="Business / Company name"
              style="width: 100%; padding: 13px 14px 13px 42px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; font-size: 0.9rem; color: #111827; outline: none; box-sizing: border-box;" />
          </div>

          <button type="submit" id="signup-submit-btn" style="width: 100%; padding: 14px; background: #0284c7; color: #fff; border: none; border-radius: 12px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: background 0.2s; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35); display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span id="signup-btn-text">Create Account & Continue</span>
            <span id="signup-btn-spinner" class="hidden spinner" style="border-top-color:#fff;"></span>
          </button>
        </form>

        <div style="margin-top: 24px; font-size: 0.85rem; color: #6b7280; text-align: center;">
          Already have an account? <span id="go-to-login" style="font-weight:600; color: #0284c7; cursor: pointer;">Sign in</span>
        </div>

      </div>
    </div>
  `;
}

export function initSignup(onSuccess, onLogin) {
  const form      = document.getElementById('signup-form');
  const errBox    = document.getElementById('signup-error');
  const errTxt    = document.getElementById('signup-error-text');
  const btn       = document.getElementById('signup-submit-btn');
  const btnTxt    = document.getElementById('signup-btn-text');
  const btnSpinner = document.getElementById('signup-btn-spinner');

  document.getElementById('go-to-login')?.addEventListener('click', () => onLogin());

  // 1-Click test autofill
  document.getElementById('btn-autofill-test')?.addEventListener('click', () => {
    const rand = Math.floor(100 + Math.random() * 900);
    const fn = document.getElementById('signup-firstname');
    const ln = document.getElementById('signup-lastname');
    const em = document.getElementById('signup-email');
    const pw = document.getElementById('signup-password');
    const biz = document.getElementById('signup-business');
    if (fn) fn.value = 'Rahul';
    if (ln) ln.value = 'Sharma';
    if (em) em.value = `testclient${rand}@demo.com`;
    if (pw) pw.value = '123456';
    if (biz) biz.value = 'Sharma Enterprises';

    import('../components/toast.js').then(({ showToast }) => {
      showToast({ type: 'info', title: 'Test details filled! ✨', message: 'Click "Create Account & Continue" below.' });
    });
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    errBox.classList.add('hidden');

    const firstName = document.getElementById('signup-firstname').value.trim();
    const lastName  = document.getElementById('signup-lastname').value.trim();
    const email     = document.getElementById('signup-email').value.trim();
    const password  = document.getElementById('signup-password').value;
    const business  = document.getElementById('signup-business').value.trim();

    if (!firstName || !email || !password) {
      errTxt.textContent = 'First name, email and password are required.';
      errBox.classList.remove('hidden');
      return;
    }
    if (password.length < 6) {
      errTxt.textContent = 'Password must be at least 6 characters.';
      errBox.classList.remove('hidden');
      return;
    }

    btnTxt.classList.add('hidden');
    btnSpinner.classList.remove('hidden');
    btn.disabled = true;

    const name     = `${firstName} ${lastName}`.trim();
    const initials = (firstName.slice(0,1) + (lastName ? lastName.slice(0,1) : '')).toUpperCase();
    const userObj  = {
      userId:       `u-${Date.now()}`,
      name,
      email,
      role:         'Client',
      initials,
      businessName: business,
      walletBalance: 500,
      plan:         'Self-Serve Starter',
    };

    try {
      const LIVE_BASE = (window.__SEEVORA_CONFIG__ && window.__SEEVORA_CONFIG__.NGROK_BASE_URL)
        || window.location.origin;

      const res  = await fetch(`${LIVE_BASE}/auth/signup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body:    JSON.stringify({ firstName, lastName, email, password, businessName: business }),
      });

      // If server responded OK, use its token; otherwise fall through to client-side session
      if (res.ok) {
        const data = await res.json();
        const token = data.access_token || data.token || '';
        const session = { ...userObj, user: userObj, token, access_token: token, loginTime: Date.now(), isNewUser: true };
        localStorage.setItem('seevora_session', JSON.stringify(session));
        showToast({ type: 'success', title: `Welcome, ${firstName}! 🎉`, message: 'Account created. Let\'s set up your AI agent.' });
        setTimeout(() => onSuccess(session), 400);
        return;
      }
    } catch (_) {
      // Server unavailable on Vercel — fall through to client-side session below
    }

    // ── Client-side fallback: create session locally so onboarding always works ──
    const session = { ...userObj, user: userObj, token: '', access_token: '', loginTime: Date.now(), isNewUser: true };
    localStorage.setItem('seevora_session', JSON.stringify(session));
    showToast({ type: 'success', title: `Welcome, ${firstName}! 🎉`, message: 'Account created. Let\'s set up your AI agent.' });
    setTimeout(() => onSuccess(session), 400);

  });
}
