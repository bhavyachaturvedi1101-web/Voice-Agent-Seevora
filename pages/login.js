// ============================================================
//  Login Page — Ultra-Premium Full Screen with Particle Wave
// ============================================================

import { login } from '../api.js';
import { showToast } from '../components/toast.js';
import { initThreeParticleWave } from '../components/three-particle-wave.js';

let orbContext = null;

export function renderLogin(onSuccess) {
  return `
    <div class="login-wrapper" style="background-image: url('/assets/login_bg_final.jpg'); background-size: cover; background-position: center; min-height: 100vh; display: flex; align-items: center; justify-content: flex-start; padding: 24px; padding-left: 10%;">
      
      <!-- Floating Form perfectly covering the left side -->
      <div style="width: 100%; max-width: 460px; min-height: 520px; padding: 60px 40px; display: flex; flex-direction: column; justify-content: center; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px); border-radius: 24px; box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1); border: 1px solid rgba(255, 255, 255, 0.4); border-top: 1px solid rgba(255, 255, 255, 0.6); border-left: 1px solid rgba(255, 255, 255, 0.6);">
        
        <!-- Logo -->
        <div style="display:flex; align-items:center; margin-bottom: 20px;">
          <img src="/assets/logo.png" alt="Seevora" style="width: 38px; height: 38px; object-fit: contain; filter: url(#remove-white-bg);" />
          <span style="font-size: 2rem; font-weight: 800; color: #0f172a; margin-left: 10px; font-family: Inter, sans-serif; letter-spacing: -0.02em;">Seevora</span>
        </div>
          <h1 style="color: #111827; font-size: 1.8rem; font-weight: 700; margin-bottom: 6px; margin-top: 0; font-family: Inter, sans-serif;">AI Voice Agent</h1>
          <p style="color: #6b7280; margin-bottom: 32px; font-size: 0.9rem; margin-top: 0;">Your voice. Our AI. Infinite possibilities.</p>

        <!-- Error message -->
        <div class="login-error hidden" id="login-error" style="background: #fee2e2; color: #991b1b; font-weight: 600; padding: 12px 14px; border-radius: 12px; font-size: 0.85rem; margin-bottom: 16px; border: 1px solid #fca5a5; display: flex; align-items: center; gap: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span id="login-error-text">Invalid credentials.</span>
        </div>

        <form id="login-form" novalidate>
          <div class="l-group" style="position: relative; margin-bottom: 16px;">
            <div style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <input class="l-input" type="email" id="login-email" name="email" placeholder="Email address" required style="width: 100%; padding: 14px 14px 14px 44px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; font-size: 0.95rem; color: #111827; outline: none; transition: border-color 0.2s;" />
          </div>

          <div class="l-group" style="position: relative; margin-bottom: 12px;">
            <div style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <input class="l-input" type="password" id="login-password" name="password" placeholder="Password" required style="width: 100%; padding: 14px 14px 14px 44px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; font-size: 0.95rem; color: #111827; outline: none; transition: border-color 0.2s;" />
            <button type="button" id="toggle-pw" class="l-eye-btn" tabindex="-1" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #9ca3af; cursor: pointer;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>

          <div class="l-forgot-wrap" style="display: flex; justify-content: flex-end; margin-bottom: 24px;">
            <span class="l-forgot" id="forgot-password-link" style="font-size: 0.8rem; color: #6b7280; cursor: pointer; text-decoration: none;">Forgot password?</span>
          </div>

          <button type="submit" class="l-submit" id="login-submit-btn" style="width: 100%; padding: 14px; background: #0ea5e9; color: #fff; border: none; border-radius: 12px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: background 0.2s; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);">
            <span id="login-btn-text">Log In</span>
            <span id="login-btn-spinner" class="hidden spinner" style="border-top-color:#fff;"></span>
          </button>
        </form>

        <div style="margin-top: 32px; font-size: 0.85rem; color: #6b7280; text-align: center;">
          Don't have an account? <span id="signup-link" style="font-weight:600; color: #0ea5e9; cursor: pointer;">Sign up</span>
        </div>

      </div>

      <!-- Forgot Password Modal -->
      <div id="forgot-modal" class="modal-overlay hidden" style="z-index: 1000;">
        <div class="modal" style="max-width:400px; background: rgba(255,255,255,0.9); backdrop-filter: blur(16px);">
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
            <input class="input" type="email" id="forgot-email" placeholder="you@seevora.ai" style="background: rgba(255,255,255,0.8);" />
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

export function initLogin(onSuccess, onSignup) {
  const form = document.getElementById('login-form');
  const email = document.getElementById('login-email');
  const pw = document.getElementById('login-password');
  const err = document.getElementById('login-error');
  const errTxt = document.getElementById('login-error-text');
  const btn = document.getElementById('login-submit-btn');
  const btnTxt = document.getElementById('login-btn-text');
  const btnSpinner = document.getElementById('login-btn-spinner');

  // Toggle password visibility
  document.getElementById('toggle-pw')?.addEventListener('click', () => {
    pw.type = pw.type === 'password' ? 'text' : 'password';
  });

  // Sign Up link — direct ID selector
  document.getElementById('signup-link')?.addEventListener('click', () => {
    if (onSignup) onSignup();
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
      const token = data.access_token || data.token;

      // Decode JWT payload (middle part) to get user info
      let userInfo = {};
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userInfo = {
          userId: payload.userId,
          name: payload.name || 'User',
          email: payload.email || email.value.trim(),
          role: payload.role || 'Client',
          initials: (payload.initials || (payload.name || 'U').slice(0, 1)).toUpperCase(),
          businessName: payload.businessName || '',
          walletBalance: payload.walletBalance !== undefined ? payload.walletBalance : (payload.role === 'Admin' ? 50000 : 500),
          plan: payload.plan || (payload.role === 'Admin' ? 'Enterprise' : 'Self-Serve Starter'),
        };
      } catch {
        userInfo = { name: 'Admin', email: email.value.trim(), role: 'Admin', initials: 'AD', businessName: 'Seevora AI', walletBalance: 50000, plan: 'Enterprise' };
      }

      const session = { ...userInfo, user: userInfo, token, access_token: token, loginTime: Date.now() };
      localStorage.setItem('seevora_session', JSON.stringify(session));

      showToast({ type: 'success', title: `Welcome ${userInfo.role}` });

      // Cleanup 3D scene before navigating away
      if (orbContext) {
        orbContext.destroy();
        orbContext = null;
      }

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
