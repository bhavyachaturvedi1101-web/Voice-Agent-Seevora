// ============================================================
//  AI Business Onboarding Wizard — Chat-style, post-signup
// ============================================================

import { renderSidebar } from '../components/sidebar.js';
import { showToast } from '../components/toast.js';

// ── Wizard steps definition ──────────────────────────────────
const STEPS = [
  {
    id: 'business_name',
    ai: (data) => `👋 Hey ${data._firstName || 'there'}! I'm your Seevora AI assistant. I'll help set up your personalized voice agent in just a few minutes.\n\nFirst — what's the name of your business?`,
    type: 'text',
    placeholder: 'e.g. Sharma Motors, TechFlow Solutions...',
    key: 'businessName',
  },
  {
    id: 'business_type',
    ai: (data) => `Great, ${data.businessName}! 🚀\n\nIs your business service-based or product-based?`,
    type: 'choice',
    choices: [
      { label: '🛠️ Service-Based', value: 'service', desc: 'Consulting, coaching, support, etc.' },
      { label: '📦 Product-Based', value: 'product', desc: 'Physical or digital products for sale' },
    ],
    key: 'businessType',
  },
  {
    id: 'service_description',
    ai: (data) => data.businessType === 'product'
      ? `What products do you sell? List them with their prices.\n\n💡 Tip: e.g. "Premium Plan – ₹5,000/month, Basic Plan – ₹2,000/month"`
      : `What services do you offer? Describe them briefly.\n\n💡 Tip: e.g. "We offer digital marketing packages starting at ₹15,000/month"`,
    type: 'textarea',
    placeholder: 'Describe your products/services and pricing...',
    key: 'offerings',
  },
  {
    id: 'product_images',
    condition: (data) => data.businessType === 'product',
    ai: () => `Want to upload product images? This helps our AI describe your products better during calls.\n\n(You can skip this — it's optional)`,
    type: 'file',
    accept: 'image/*',
    multiple: true,
    key: 'productImages',
    optional: true,
  },
  {
    id: 'problems',
    ai: () => `What problems are you currently facing with your sales or calling process? Be specific — the AI will tailor its strategy around this.\n\n💡 Examples: "Leads don't pick up", "Too many price objections", "Low follow-up conversion"`,
    type: 'textarea',
    placeholder: 'Describe your biggest sales/calling challenges...',
    key: 'problems',
  },
  {
    id: 'goal',
    ai: () => `What's the primary goal of your AI voice agent?`,
    type: 'choice',
    choices: [
      { label: '📈 Sales & Lead Conversion', value: 'sales', desc: 'Convert cold leads into paying customers' },
      { label: '🗓️ Appointment Booking', value: 'appointments', desc: 'Schedule meetings and demos' },
      { label: '🎧 Customer Support', value: 'support', desc: 'Handle queries and resolve issues' },
      { label: '🔄 Re-engagement', value: 'reengagement', desc: 'Win back dormant or lost leads' },
    ],
    key: 'goal',
  },
  {
    id: 'lead_notes',
    ai: (data) => `Almost done! Any notes about your leads?\n\nThis helps the AI understand your audience better — e.g. "Most leads are cold, contacted through Facebook ads" or "These are warm leads who enquired last month"`,
    type: 'textarea',
    placeholder: 'Describe your leads and their typical mindset...',
    key: 'leadNotes',
    optional: true,
  },
];

// ── Generate AI agent script from onboarding data ───────────
function generateAgentScript(data) {
  const goalMap = {
    sales: 'converting leads into paying customers',
    appointments: 'booking appointments and demos',
    support: 'resolving customer queries',
    reengagement: 're-engaging dormant leads',
  };
  const typeMap = {
    service: 'service provider',
    product: 'product seller',
  };

  return `You are an AI voice agent for ${data.businessName}, a ${typeMap[data.businessType] || 'business'} focused on ${goalMap[data.goal] || 'helping customers'}.

BUSINESS OVERVIEW:
${data.offerings || 'Ask the agent to describe offerings.'}

KNOWN CHALLENGES:
${data.problems || 'No specific challenges provided.'}

LEAD CONTEXT:
${data.leadNotes || 'Treat each lead professionally and warmly.'}

CALL OBJECTIVES:
Your primary objective is ${goalMap[data.goal] || 'to help the customer'}.

CALL SCRIPT:
1. Greet the customer warmly and introduce yourself as calling from ${data.businessName}.
2. Ask if this is a good time to speak (30 seconds).
3. Briefly explain why you're calling based on their interest in ${data.businessType === 'product' ? 'our products' : 'our services'}.
4. Address their needs using the business overview above.
5. Handle objections patiently — especially around ${data.problems ? 'the challenges mentioned: ' + data.problems.split('\n')[0] : 'pricing or timing'}.
6. Always close with a clear next step: schedule a call, send a link, or book an appointment.
7. Be warm, professional, and concise. Never pressure the customer.

TONE: Professional yet conversational. Empathetic. Results-driven.`;
}

// ── Render Onboarding Page ────────────────────────────────────
export function renderOnboarding(session, navigate) {
  const user = session?.user || session;
  return `
    <div class="onb-shell">
      <!-- Minimal sidebar -->
      <div class="onb-sidebar">
        <div class="onb-logo">
          <img src="/assets/logo.png" alt="Seevora" style="width: 32px; height: 32px; object-fit: contain; filter: url(#remove-white-bg) brightness(0) invert(1);" />
          <span>Seevora</span>
        </div>
        <div class="onb-steps-nav" id="onb-steps-nav">
          <!-- Filled by JS -->
        </div>
        <div style="margin-top: auto; padding: 20px;">
          <div style="font-size:0.78rem; color: rgba(255,255,255,0.4); text-align:center;">Setup Wizard</div>
          <div style="font-size:0.72rem; color: rgba(255,255,255,0.25); text-align:center; margin-top:4px;">Step <span id="onb-step-num">1</span> of <span id="onb-step-total">7</span></div>
        </div>
      </div>

      <!-- Main chat area -->
      <div class="onb-main">
        <!-- Progress bar -->
        <div class="onb-progress-wrap">
          <div class="onb-progress-bar" id="onb-progress-bar" style="width: 0%"></div>
        </div>

        <!-- Chat messages -->
        <div class="onb-chat-area" id="onb-chat-area">
          <div class="onb-welcome-msg">
            <div class="onb-ai-avatar">AI</div>
            <div class="onb-bubble onb-bubble-ai" id="onb-typing-bubble">
              <span class="onb-typing-dots"><span></span><span></span><span></span></span>
            </div>
          </div>
        </div>

        <!-- Input area -->
        <div class="onb-input-area" id="onb-input-area">
          <!-- Dynamically filled by JS -->
        </div>
      </div>
    </div>
  `;
}

// ── Init Onboarding Wizard ────────────────────────────────────
export function initOnboarding(session, navigate) {
  const user = session?.user || session;
  const firstName = (user?.name || '').split(' ')[0] || 'there';

  const data = { _firstName: firstName };
  let currentStepIndex = 0;
  let visibleSteps = []; // Steps filtered by conditions

  function getVisibleSteps() {
    return STEPS.filter(s => !s.condition || s.condition(data));
  }

  function updateSidebarNav() {
    const nav = document.getElementById('onb-steps-nav');
    if (!nav) return;
    const visible = getVisibleSteps();
    nav.innerHTML = visible.map((s, i) => `
      <div class="onb-nav-item ${i < currentStepIndex ? 'done' : i === currentStepIndex ? 'active' : ''}">
        <div class="onb-nav-dot">${i < currentStepIndex ? '✓' : (i + 1)}</div>
        <span>${s.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
      </div>
    `).join('');
  }

  function updateProgress() {
    const visible = getVisibleSteps();
    const pct = Math.round((currentStepIndex / visible.length) * 100);
    const bar = document.getElementById('onb-progress-bar');
    if (bar) bar.style.width = `${pct}%`;
    const numEl = document.getElementById('onb-step-num');
    const totEl = document.getElementById('onb-step-total');
    if (numEl) numEl.textContent = currentStepIndex + 1;
    if (totEl) totEl.textContent = visible.length;
  }

  // ── Add AI message bubble ──────────────────────────────────
  function addAIBubble(text, animate = true) {
    const area = document.getElementById('onb-chat-area');
    const existing = document.getElementById('onb-typing-bubble');
    if (existing) existing.closest('.onb-welcome-msg')?.remove();

    const wrap = document.createElement('div');
    wrap.className = 'onb-welcome-msg';
    wrap.innerHTML = `
      <div class="onb-ai-avatar">AI</div>
      <div class="onb-bubble onb-bubble-ai onb-bubble-appear" style="white-space: pre-line;">${text}</div>
    `;
    area.appendChild(wrap);
    area.scrollTop = area.scrollHeight;
  }

  // ── Add user reply bubble ──────────────────────────────────
  function addUserBubble(text) {
    const area = document.getElementById('onb-chat-area');
    const wrap = document.createElement('div');
    wrap.className = 'onb-user-msg';
    wrap.innerHTML = `<div class="onb-bubble onb-bubble-user onb-bubble-appear">${text}</div>`;
    area.appendChild(wrap);
    area.scrollTop = area.scrollHeight;
  }

  // ── Show typing indicator ──────────────────────────────────
  function showTyping() {
    return new Promise(resolve => {
      const area = document.getElementById('onb-chat-area');
      const wrap = document.createElement('div');
      wrap.className = 'onb-welcome-msg';
      wrap.id = 'onb-typing-indicator';
      wrap.innerHTML = `
        <div class="onb-ai-avatar">AI</div>
        <div class="onb-bubble onb-bubble-ai">
          <span class="onb-typing-dots"><span></span><span></span><span></span></span>
        </div>
      `;
      area.appendChild(wrap);
      area.scrollTop = area.scrollHeight;
      setTimeout(() => {
        wrap.remove();
        resolve();
      }, 1000);
    });
  }

  // ── Render input for current step ─────────────────────────
  function renderInput(step) {
    const inputArea = document.getElementById('onb-input-area');
    if (!inputArea) return;

    if (step.type === 'text') {
      inputArea.innerHTML = `
        <div class="onb-text-input-row">
          <input type="text" class="onb-text-input" id="onb-text-input" placeholder="${step.placeholder || 'Type here...'}" autocomplete="off" />
          <button class="onb-send-btn" id="onb-send-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      `;
      const inp = document.getElementById('onb-text-input');
      const btn = document.getElementById('onb-send-btn');
      inp?.focus();
      const submit = () => {
        const val = inp.value.trim();
        if (!val) return;
        submitAnswer(step, val);
      };
      inp?.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
      btn?.addEventListener('click', submit);

    } else if (step.type === 'textarea') {
      inputArea.innerHTML = `
        <div class="onb-textarea-wrap">
          <textarea class="onb-textarea" id="onb-textarea" placeholder="${step.placeholder || 'Type your answer...'}" rows="3"></textarea>
          <div style="display:flex; gap:10px; justify-content: flex-end; margin-top: 10px;">
            ${step.optional ? `<button class="onb-skip-btn" id="onb-skip-btn">Skip</button>` : ''}
            <button class="onb-send-btn-wide" id="onb-send-btn">
              Continue →
            </button>
          </div>
        </div>
      `;
      document.getElementById('onb-textarea')?.focus();
      document.getElementById('onb-send-btn')?.addEventListener('click', () => {
        const val = document.getElementById('onb-textarea').value.trim();
        if (!val && !step.optional) {
          showToast({ type: 'warning', title: 'Required', message: 'Please fill in this field.' });
          return;
        }
        submitAnswer(step, val || '—');
      });
      document.getElementById('onb-skip-btn')?.addEventListener('click', () => {
        submitAnswer(step, '—');
      });

    } else if (step.type === 'choice') {
      inputArea.innerHTML = `
        <div class="onb-choices">
          ${step.choices.map(c => `
            <button class="onb-choice-btn" data-value="${c.value}">
              <span class="onb-choice-label">${c.label}</span>
              <span class="onb-choice-desc">${c.desc}</span>
            </button>
          `).join('')}
        </div>
      `;
      document.querySelectorAll('.onb-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const chosen = step.choices.find(c => c.value === btn.dataset.value);
          submitAnswer(step, chosen.value, chosen.label);
        });
      });

    } else if (step.type === 'file') {
      inputArea.innerHTML = `
        <div class="onb-file-area">
          <div class="onb-dropzone" id="onb-dropzone">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <div style="font-size:0.9rem; font-weight:600; color:#374151; margin-top:8px;">Drop product images here</div>
            <div style="font-size:0.8rem; color:#9ca3af; margin-top:4px;">PNG, JPG, WEBP — max 5 files</div>
            <input type="file" id="onb-file-input" accept="${step.accept || 'image/*'}" ${step.multiple ? 'multiple' : ''} style="position:absolute;inset:0;opacity:0;cursor:pointer;" />
          </div>
          <div id="onb-file-preview" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:12px;"></div>
          <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:12px;">
            <button class="onb-skip-btn" id="onb-skip-btn">Skip for now</button>
            <button class="onb-send-btn-wide" id="onb-file-continue">Continue →</button>
          </div>
        </div>
      `;
      let uploadedFiles = [];
      document.getElementById('onb-file-input')?.addEventListener('change', (e) => {
        uploadedFiles = Array.from(e.target.files);
        const preview = document.getElementById('onb-file-preview');
        preview.innerHTML = uploadedFiles.map(f => `
          <div style="background:#f1f5f9;border-radius:8px;padding:6px 12px;font-size:0.8rem;color:#374151;">
            📎 ${f.name}
          </div>
        `).join('');
      });
      document.getElementById('onb-skip-btn')?.addEventListener('click', () => submitAnswer(step, null, 'Skipped'));
      document.getElementById('onb-file-continue')?.addEventListener('click', () => {
        submitAnswer(step, uploadedFiles, uploadedFiles.length > 0 ? `${uploadedFiles.length} image(s) uploaded` : 'Skipped');
      });
    }
  }

  // ── Submit answer & advance ────────────────────────────────
  async function submitAnswer(step, value, displayText = null) {
    data[step.key] = value;

    // Show user bubble
    addUserBubble(displayText || (typeof value === 'string' ? value : JSON.stringify(value)));

    // Clear input area
    const inputArea = document.getElementById('onb-input-area');
    if (inputArea) inputArea.innerHTML = '';

    // Advance step
    currentStepIndex++;
    visibleSteps = getVisibleSteps();

    updateSidebarNav();
    updateProgress();

    if (currentStepIndex >= visibleSteps.length) {
      // All done — show summary
      await showTyping();
      await showCompletion();
    } else {
      // Show next step
      await showTyping();
      const nextStep = visibleSteps[currentStepIndex];
      addAIBubble(nextStep.ai(data));
      renderInput(nextStep);
    }
  }

  // ── Completion screen ──────────────────────────────────────
  async function showCompletion() {
    const script = generateAgentScript(data);

    addAIBubble(`🎉 Perfect! I've generated your custom AI agent script based on everything you've told me.\n\nHere's a preview of how your agent will talk to leads:`);

    await new Promise(r => setTimeout(r, 600));

    // Save to localStorage
    localStorage.setItem('seevora_onboarding', JSON.stringify({ ...data, generatedScript: script, completedAt: new Date().toISOString() }));

    // Save to backend
    try {
      const LIVE_BASE = (window.__SEEVORA_CONFIG__ && window.__SEEVORA_CONFIG__.NGROK_BASE_URL) || window.location.origin;
      const sess = JSON.parse(localStorage.getItem('seevora_session') || '{}');
      const token = sess.token || sess.access_token;
      await fetch(`${LIVE_BASE}/api/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ ...data, generatedScript: script }),
      });
    } catch (_) { /* backend may not be running, localStorage is fallback */ }

    const inputArea = document.getElementById('onb-input-area');
    if (inputArea) {
      inputArea.innerHTML = `
        <div class="onb-completion">
          <div class="onb-script-preview">
            <div class="onb-script-header">
              <span>📋 Generated Agent Script</span>
              <button class="onb-copy-script" id="onb-copy-script">Copy</button>
            </div>
            <pre class="onb-script-body">${script}</pre>
          </div>
          <button class="onb-go-dashboard-btn" id="onb-go-dashboard">
            🚀 Go to Dashboard
          </button>
        </div>
      `;

      document.getElementById('onb-copy-script')?.addEventListener('click', () => {
        navigator.clipboard.writeText(script).then(() => {
          showToast({ type: 'success', title: 'Copied!', message: 'Agent script copied to clipboard.' });
        });
      });

      document.getElementById('onb-go-dashboard')?.addEventListener('click', () => {
        // Mark session as onboarded
        const sess = JSON.parse(localStorage.getItem('seevora_session') || '{}');
        sess.onboarded = true;
        localStorage.setItem('seevora_session', JSON.stringify(sess));
        navigate('dashboard');
      });
    }
  }

  // ── Boot the wizard ────────────────────────────────────────
  async function boot() {
    visibleSteps = getVisibleSteps();
    updateSidebarNav();
    updateProgress();

    // Remove initial typing bubble and show first AI message
    await showTyping();
    const firstStep = visibleSteps[0];
    addAIBubble(firstStep.ai(data));
    renderInput(firstStep);
  }

  boot();
}
