// ============================================================
//  Login Page — Light Theme, Centered
// ============================================================

import { login } from '../api.js';
import { showToast } from '../components/toast.js';

export function renderLogin(onSuccess) {
  return `
    <div class="login-wrapper">
      
      <!-- Top Logo outside card -->
      <div class="login-top-logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        Seevora Voice Agent
      </div>

      <!-- The Card -->
      <div class="login-box">
        <h1 class="login-title">Login</h1>

        <!-- Error message -->
        <div class="login-error hidden" id="login-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <span id="login-error-text">Invalid credentials.</span>
        </div>

        <form id="login-form" novalidate>
          <div class="l-group">
            <label class="l-label" for="login-email">Email</label>
            <input class="l-input" type="email" id="login-email" name="email" placeholder="username@gmail.com" required />
          </div>

          <div class="l-group">
            <label class="l-label" for="login-password">Password</label>
            <div style="position: relative;">
              <input class="l-input" type="password" id="login-password" name="password" placeholder="Password" required />
              <button type="button" id="toggle-pw" class="l-eye-btn" tabindex="-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <div class="l-forgot-wrap">
              <span class="l-forgot" id="forgot-password-link">Forgot Password?</span>
            </div>
          </div>

          <button type="submit" class="l-submit" id="login-submit-btn">
            <span id="login-btn-text">Sign in</span>
            <span id="login-btn-spinner" class="hidden spinner"></span>
          </button>
        </form>

        <div class="l-divider">
          <span>or continue with</span>
        </div>

        <!-- Social / Demo Buttons -->
        <div class="l-social-grid">
          <button type="button" class="l-social-btn" id="demo-admin" title="Admin Demo">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea4335" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span style="font-size:0.75rem; font-weight:600; color:#374151; margin-left:6px;">Admin</span>
          </button>
          <button type="button" class="l-social-btn" id="demo-viewer" title="Viewer Demo">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span style="font-size:0.75rem; font-weight:600; color:#374151; margin-left:6px;">Viewer</span>
          </button>
        </div>

        <div class="l-footer">
          Don't have an account yet? <span style="font-weight:700; cursor:pointer;">Register for free</span>
        </div>
      </div>

      <!-- Forgot Password Modal -->
      <div id="forgot-modal" class="modal-overlay hidden">
        <div class="modal" style="max-width:400px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Reset Password</div>
              <div class="modal-subtitle">We'll send a reset link to your email.</div>
            </div>
            <button class="modal-close" id="forgot-modal-close">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="form-group">
            <label class="form-label" for="forgot-email">Email address</label>
            <input class="input" type="email" id="forgot-email" placeholder="you@seevora.ai" />
          </div>
          <div class="modal-footer" style="margin-top:12px;padding-top:12px;">
            <button class="btn btn-ghost" id="forgot-cancel-btn">Cancel</button>
            <button class="btn btn-primary" id="forgot-submit-btn">Send Reset Link</button>
          </div>
        </div>
      </div>

    </div>
  `;
}

export function initLogin(onSuccess) {
  const form       = document.getElementById('login-form');
  const email      = document.getElementById('login-email');
  const pw         = document.getElementById('login-password');
  const err        = document.getElementById('login-error');
  const errTxt     = document.getElementById('login-error-text');
  const btn        = document.getElementById('login-submit-btn');
  const btnTxt     = document.getElementById('login-btn-text');
  const btnSpinner = document.getElementById('login-btn-spinner');

  // Toggle password visibility
  document.getElementById('toggle-pw')?.addEventListener('click', () => {
    pw.type = pw.type === 'password' ? 'text' : 'password';
  });

  // Demo buttons
  document.getElementById('demo-admin')?.addEventListener('click', () => {
    email.value = 'admin@seevora.ai';
    pw.value = 'Admin123!';
    email.dispatchEvent(new Event('input'));
  });
  document.getElementById('demo-viewer')?.addEventListener('click', () => {
    email.value = 'viewer@seevora.ai';
    pw.value = 'Viewer123!';
    email.dispatchEvent(new Event('input'));
  });

  // Forgot password
  document.getElementById('forgot-password-link')?.addEventListener('click', () => {
    document.getElementById('forgot-modal').classList.remove('hidden');
  });
  document.getElementById('forgot-modal-close')?.addEventListener('click', () => {
    document.getElementById('forgot-modal').classList.add('hidden');
  });
  document.getElementById('forgot-cancel-btn')?.addEventListener('click', () => {
    document.getElementById('forgot-modal').classList.add('hidden');
  });
  document.getElementById('forgot-submit-btn')?.addEventListener('click', () => {
    const val = document.getElementById('forgot-email').value.trim();
    if (!val || !val.includes('@')) {
      showToast({ type: 'warning', title: 'Invalid email', message: 'Please enter a valid email address.' });
      return;
    }
    document.getElementById('forgot-modal').classList.add('hidden');
    showToast({ type: 'success', title: 'Reset link sent', message: `Password reset link sent to ${val}` });
  });

  // Form submit
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.classList.add('hidden');
    btnTxt.classList.add('hidden');
    btnSpinner.classList.remove('hidden');
    btn.disabled = true;

    try {
      const data = await login(email.value.trim(), pw.value);
      const session = { ...data.user, token: data.token, loginTime: Date.now() };
      localStorage.setItem('seevora_session', JSON.stringify(session));
      
      showToast({ type: 'success', title: `Welcome back, ${session.name.split(' ')[0]}!`, message: `Signed in as ${session.role}` });
      setTimeout(() => onSuccess(session), 300);
    } catch (error) {
      err.classList.remove('hidden');
      errTxt.textContent = error.message || 'Invalid email or password. Please try again.';
      btnTxt.classList.remove('hidden');
      btnSpinner.classList.add('hidden');
      btn.disabled = false;
      pw.value = '';
      pw.focus();
    }
  });
}
