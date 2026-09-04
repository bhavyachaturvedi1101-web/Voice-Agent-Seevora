// ============================================================
//  AI Business Onboarding Wizard — Chat-style (v2 Enhanced)
//  New: Industry, Language, Tone, USP, Target Customer,
//       Working Hours, Back Button, 3 Script Variants,
//       Confetti, Voice Preview, ROI Estimate
// ============================================================

import { showToast } from '../components/toast.js';

// ── Wizard Steps (13 total) ──────────────────────────────────
const STEPS = [
  {
    id: 'business_name',
    ai: (data) => `👋 Hey ${data._firstName || 'there'}! I'm your Seevora AI assistant. I'll help set up your personalized voice agent in just a few minutes.\n\nFirst — what's the name of your business?`,
    type: 'text',
    placeholder: 'e.g. Sharma Motors, TechFlow Solutions...',
    key: 'businessName',
  },
  {
    id: 'industry',
    ai: (data) => `Great — ${data.businessName}! 🏢\n\nWhich industry does your business operate in? This helps me tailor the agent's vocabulary and pitch perfectly.`,
    type: 'choice',
    choices: [
      { label: '🏠 Real Estate',       value: 'real_estate',  desc: 'Property sales, rentals, brokerage' },
      { label: '🏥 Healthcare',         value: 'healthcare',   desc: 'Clinics, hospitals, wellness' },
      { label: '🎓 Education',          value: 'education',    desc: 'Coaching, institutes, ed-tech' },
      { label: '🛒 E-Commerce',         value: 'ecommerce',    desc: 'Online retail, D2C brands' },
      { label: '🏦 Finance & Insurance',value: 'finance',      desc: 'Loans, investments, insurance' },
      { label: '🍽️ Food & Restaurant',  value: 'food',         desc: 'Restaurants, cloud kitchens' },
      { label: '💻 SaaS / Tech',        value: 'saas',         desc: 'Software, apps, IT services' },
      { label: '💄 Beauty & Wellness',  value: 'beauty',       desc: 'Salons, spas, fitness' },
      { label: '🔧 Other / General',    value: 'other',        desc: 'Any other business type' },
    ],
    key: 'industry',
  },
  {
    id: 'business_type',
    ai: (data) => `Got it! 🚀\n\nIs ${data.businessName} service-based or product-based?`,
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
    id: 'usp',
    ai: (data) => `What makes ${data.businessName} stand out from competitors? 🏆\n\nThis becomes your agent's "secret weapon" when handling objections.\n\n💡 e.g. "Same-day delivery", "Only certified trainers", "30-day money-back guarantee"`,
    type: 'textarea',
    placeholder: 'What is your unique selling point / competitive advantage?',
    key: 'usp',
  },
  {
    id: 'target_customer',
    ai: () => `Describe your ideal customer in 1-2 sentences. 🎯\n\nThe more specific, the better your agent will qualify leads!\n\n💡 e.g. "Business owners aged 30-50 in tier-2 cities looking to automate their sales process"`,
    type: 'textarea',
    placeholder: 'Who is your ideal customer? Age, location, pain points...',
    key: 'targetCustomer',
  },
  {
    id: 'problems',
    ai: () => `What problems are you facing with your sales or calling process? Be specific — the AI will tailor its strategy around this.\n\n💡 Examples: "Leads don't pick up", "Too many price objections", "Low follow-up conversion"`,
    type: 'textarea',
    placeholder: 'Describe your biggest sales/calling challenges...',
    key: 'problems',
  },
  {
    id: 'goal',
    ai: () => `What's the primary goal of your AI voice agent?`,
    type: 'choice',
    choices: [
      { label: '📈 Sales & Lead Conversion', value: 'sales',        desc: 'Convert cold leads into paying customers' },
      { label: '🗓️ Appointment Booking',     value: 'appointments', desc: 'Schedule meetings and demos' },
      { label: '🎧 Customer Support',         value: 'support',      desc: 'Handle queries and resolve issues' },
      { label: '🔄 Re-engagement',            value: 'reengagement', desc: 'Win back dormant or lost leads' },
    ],
    key: 'goal',
  },
  {
    id: 'language',
    ai: () => `🌐 Which language should your AI agent speak?\n\nChoose the primary language for all customer calls:`,
    type: 'choice',
    choices: [
      { label: '🇬🇧 English (Indian)', value: 'english_indian', desc: 'Professional Indian English' },
      { label: '🇮🇳 Hindi',           value: 'hindi',          desc: 'Pure Hindi for Hindi-belt markets' },
      { label: '🔀 Hinglish',         value: 'hinglish',       desc: 'Hindi + English mix (most popular)' },
      { label: '🌴 Tamil',            value: 'tamil',          desc: 'Tamil Nadu & Sri Lanka markets' },
      { label: '🌿 Telugu',           value: 'telugu',         desc: 'Andhra Pradesh & Telangana' },
      { label: '🌻 Marathi',          value: 'marathi',        desc: 'Maharashtra markets' },
    ],
    key: 'language',
  },
  {
    id: 'tone',
    ai: () => `How should your AI agent sound? 🎭\n\nChoose a personality that fits your brand — this drives the entire call style:`,
    type: 'choice',
    choices: [
      { label: '🤝 Friendly Advisor',  value: 'friendly',  desc: 'Warm, empathetic & conversational' },
      { label: '🎯 Assertive Closer',  value: 'assertive', desc: 'Direct, confident & results-driven' },
      { label: '🏆 Premium & Formal',  value: 'formal',    desc: 'Professional, structured & precise' },
      { label: '💬 Casual & Relatable',value: 'casual',    desc: 'Relaxed, fun & easy-going' },
    ],
    key: 'tone',
  },
  {
    id: 'working_hours',
    ai: () => `⏰ When should the AI make calls?\n\nThis auto-configures your calling schedule on the platform:`,
    type: 'choice',
    choices: [
      { label: '🌅 Morning (9 AM – 12 PM)',       value: '9am-12pm',  desc: 'Best for corporate & B2B leads' },
      { label: '☀️ Afternoon (12 PM – 5 PM)',      value: '12pm-5pm',  desc: 'Good for retail & B2C' },
      { label: '🌆 Evening (5 PM – 8 PM)',         value: '5pm-8pm',   desc: 'Best for consumers & personal clients' },
      { label: '🕐 Business Hours (9 AM – 6 PM)', value: '9am-6pm',   desc: 'Full working day coverage' },
      { label: '📅 All Day (8 AM – 8 PM)',         value: '8am-8pm',   desc: 'Maximum reach, all segments' },
    ],
    key: 'workingHours',
  },
  {
    id: 'lead_notes',
    ai: () => `Almost done! 🎉 Any extra notes about your leads?\n\nThis helps the AI understand your audience better — e.g. "Most leads are cold, contacted through Facebook ads" or "These are warm leads who enquired last month"`,
    type: 'textarea',
    placeholder: 'Describe your leads and their typical mindset...',
    key: 'leadNotes',
    optional: true,
  },
];

// ── Industry label lookup ────────────────────────────────────
function industryLabel(val) {
  const map = {
    real_estate: 'Real Estate', healthcare: 'Healthcare', education: 'Education',
    ecommerce: 'E-Commerce', finance: 'Finance & Insurance', food: 'Food & Restaurant',
    saas: 'SaaS / Tech', beauty: 'Beauty & Wellness', other: 'General',
  };
  return map[val] || val || 'your industry';
}

// ── Language label ───────────────────────────────────────────
function langLabel(val) {
  const map = {
    english_indian: 'Indian English', hindi: 'Hindi', hinglish: 'Hinglish',
    tamil: 'Tamil', telugu: 'Telugu', marathi: 'Marathi',
  };
  return map[val] || val || 'English';
}

// ── Generate Script Variant ──────────────────────────────────
function generateScriptVariant(data, tone) {
  const goalMap = {
    sales:        'converting leads into paying customers',
    appointments: 'booking appointments and demos',
    support:      'resolving customer queries',
    reengagement: 're-engaging dormant leads',
  };
  const typeMap = { service: 'service provider', product: 'product seller' };
  const toneLabels = { friendly: 'FRIENDLY ADVISOR', assertive: 'ASSERTIVE CLOSER', formal: 'PREMIUM & FORMAL', casual: 'CASUAL & RELATABLE' };

  const config = {
    friendly: {
      opener:   `Hi [Name], this is [Agent] calling from ${data.businessName}. How are you doing today?`,
      approach: `I'd love to learn a little about what you're looking for and see if we can help. We've been working with clients like you, and I think you'll find what we offer really valuable.`,
      objection:`I completely understand — and I appreciate your honesty. Here's what many of our clients felt the same way initially, but after trying us out, they were really glad they did.`,
      close:    `Would you be open to a quick 10-minute conversation this week? I promise to keep it short and to the point.`,
    },
    assertive: {
      opener:   `Hello [Name], this is [Agent] from ${data.businessName}. I'll keep this brief.`,
      approach: `We help ${data.targetCustomer || 'businesses like yours'} achieve ${goalMap[data.goal] || 'their goals'}. Our USP: ${data.usp || 'we deliver results'}. Most clients see ROI in 30 days.`,
      objection:`I hear you. But consider this: every day without a solution costs you more than what we charge. Can you afford not to act?`,
      close:    `I can block Tuesday at 3 PM or Wednesday at 11 AM for a demo. Which works better for you?`,
    },
    formal: {
      opener:   `Good day. May I please speak with [Name]? This is [Agent] calling on behalf of ${data.businessName}.`,
      approach: `We specialize in ${industryLabel(data.industry)} solutions with a focus on ${goalMap[data.goal] || 'client success'}. Our offerings include: ${data.offerings || '[as described]'}.`,
      objection:`I understand your concern. Our clients typically report a measurable ROI within the first quarter. I'd be happy to share case studies relevant to your situation.`,
      close:    `I would like to propose scheduling a formal consultation at your earliest convenience. Would you prefer a morning or afternoon slot?`,
    },
    casual: {
      opener:   `Hey [Name]! This is [Agent] from ${data.businessName} — hope I'm not catching you at a bad time!`,
      approach: `So basically we help ${data.targetCustomer || 'people like you'} with ${goalMap[data.goal] || 'growing their business'}. Pretty cool stuff honestly — and it's way simpler than you'd think!`,
      objection:`Totally get it! No pressure at all. But between us — a lot of our customers said the same thing and now they're our biggest fans. Worth a quick chat, right?`,
      close:    `Want to hop on a super quick call sometime this week? 10-15 mins max, I promise!`,
    },
  };

  const c = config[tone] || config.friendly;
  const toneLabel = toneLabels[tone] || 'STANDARD';

  return `╔══════════════════════════════════════════════╗
  ${toneLabel} — AI Agent Script
  Business: ${data.businessName || 'Your Business'}
  Industry: ${industryLabel(data.industry)}
  Language: ${langLabel(data.language)}
  Goal: ${goalMap[data.goal] || 'Help customers'}
  Working Hours: ${data.workingHours || 'Business hours'}
╚══════════════════════════════════════════════╝

[CALL OPENING]
"${c.opener}"

[ASK FOR TIME]
"Is this a good time to speak? It'll only take about 2 minutes."

[MAIN PITCH]
"${c.approach}"

[OFFERINGS]
${data.offerings || '— Describe your products/services here —'}

[YOUR UNIQUE ADVANTAGE]
${data.usp || '— Add your USP here —'}

[TARGET CUSTOMER FIT]
"This is specifically designed for ${data.targetCustomer || 'clients like you'}."

[HANDLING OBJECTIONS]
"${c.objection}"

Known challenges we address: ${data.problems || '— Add specific challenges here —'}

[CLOSING]
"${c.close}"

[LEAD NOTES]
${data.leadNotes || 'Treat each lead professionally and warmly.'}

[CALL RULES]
• Always confirm the customer's name at the start
• Never pressure — respect a clear "no" and offer to call back
• Always end with a defined next step
• Keep the call under 3 minutes for cold leads

TONE GUIDE: ${toneLabel}`;
}

// ── ROI Estimate ─────────────────────────────────────────────
function generateROIEstimate(data) {
  const goalData = {
    sales:        { calls: '600', rate: '15–20%', revenue: '₹72K – ₹96K/mo', icon: '📈' },
    appointments: { calls: '600', rate: '25–35%', revenue: '₹45K – ₹63K/mo', icon: '🗓️' },
    support:      { calls: '800', rate: '85%+ resolution', revenue: '₹40K+ saved/mo', icon: '🎧' },
    reengagement: { calls: '500', rate: '10–15%', revenue: '₹60K – ₹90K/mo', icon: '🔄' },
  };
  return goalData[data.goal] || goalData.sales;
}

// ── Pure JS Canvas Confetti ───────────────────────────────────
function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:99999;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#0ea5e9','#38bdf8','#818cf8','#a78bfa','#34d399','#fbbf24','#f87171','#fb923c'];
  const particles = Array.from({ length: 140 }, () => ({
    x:        Math.random() * canvas.width,
    y:        -10 - Math.random() * 200,
    w:        7 + Math.random() * 9,
    h:        4 + Math.random() * 6,
    color:    colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 10,
    speedX:   (Math.random() - 0.5) * 3,
    speedY:   2.5 + Math.random() * 4,
    opacity:  1,
  }));

  let rafId;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      p.y        += p.speedY;
      p.x        += p.speedX;
      p.rotation += p.rotSpeed;
      if (p.y > canvas.height * 0.65) p.opacity -= 0.018;
      if (p.opacity > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    }
    if (alive) { rafId = requestAnimationFrame(animate); }
    else { canvas.remove(); }
  }
  animate();
  setTimeout(() => { cancelAnimationFrame(rafId); canvas.remove(); }, 5000);
}

// ── Browser Voice Preview (Web Speech API — no API key needed) ──
function previewVoice(scriptText, btn) {
  if (!window.speechSynthesis) {
    showToast({ type: 'info', title: 'Not supported', message: 'Voice preview not supported in this browser.' });
    return;
  }
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    if (btn) { btn.textContent = '🎤 Preview Voice'; btn.classList.remove('playing'); }
    return;
  }
  // Extract the opening line for preview
  const lines   = scriptText.split('\n').filter(l => l.trim().startsWith('"'));
  const preview = lines.slice(0, 3).join(' ').replace(/"/g, '') || scriptText.slice(0, 300);

  const utterance = new SpeechSynthesisUtterance(preview);
  utterance.rate  = 0.92;
  utterance.pitch = 1.05;

  const voices   = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.lang === 'en-IN')
    || voices.find(v => v.lang.startsWith('en-') && v.name.includes('Female'))
    || voices.find(v => v.lang.startsWith('en'))
    || voices[0];
  if (preferred) utterance.voice = preferred;

  utterance.onend = () => {
    if (btn) { btn.textContent = '🎤 Preview Voice'; btn.classList.remove('playing'); }
  };

  if (btn) { btn.textContent = '⏹ Stop Preview'; btn.classList.add('playing'); }
  window.speechSynthesis.speak(utterance);
}

// ── Render Onboarding Page ────────────────────────────────────
export function renderOnboarding(session, navigate) {
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
          <div style="font-size:0.72rem; color: rgba(255,255,255,0.25); text-align:center; margin-top:4px;">Step <span id="onb-step-num">1</span> of <span id="onb-step-total">13</span></div>
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
  const user      = session?.user || session;
  const firstName = (user?.name || '').split(' ')[0] || 'there';

  const data = { _firstName: firstName };
  let currentStepIndex = 0;
  let visibleSteps     = [];
  let isProcessing     = false;
  const bubbleHistory  = []; // { user: El, ai: El } per step

  // ── Helpers ──────────────────────────────────────────────
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
        <span>${s.id.replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
      </div>
    `).join('');
  }

  function updateProgress() {
    const visible = getVisibleSteps();
    const pct  = Math.round((currentStepIndex / visible.length) * 100);
    const bar  = document.getElementById('onb-progress-bar');
    const numEl = document.getElementById('onb-step-num');
    const totEl = document.getElementById('onb-step-total');
    if (bar)   bar.style.width = `${pct}%`;
    if (numEl) numEl.textContent = currentStepIndex + 1;
    if (totEl) totEl.textContent = visible.length;
  }

  // ── Chat bubble helpers ──────────────────────────────────
  function addAIBubble(text) {
    const area  = document.getElementById('onb-chat-area');
    const typingEl = document.getElementById('onb-typing-bubble');
    if (typingEl) typingEl.closest('.onb-welcome-msg')?.remove();

    const wrap = document.createElement('div');
    wrap.className = 'onb-welcome-msg';
    wrap.innerHTML = `
      <div class="onb-ai-avatar">AI</div>
      <div class="onb-bubble onb-bubble-ai onb-bubble-appear" style="white-space: pre-line;">${text}</div>
    `;
    area.appendChild(wrap);
    area.scrollTop = area.scrollHeight;
    return wrap;
  }

  function addUserBubble(text) {
    const area = document.getElementById('onb-chat-area');
    const wrap = document.createElement('div');
    wrap.className = 'onb-user-msg';
    wrap.innerHTML = `<div class="onb-bubble onb-bubble-user onb-bubble-appear">${text}</div>`;
    area.appendChild(wrap);
    area.scrollTop = area.scrollHeight;
    return wrap;
  }

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
      setTimeout(() => { wrap.remove(); resolve(); }, 900);
    });
  }

  // ── Back Button ──────────────────────────────────────────
  function goBack() {
    if (isProcessing || currentStepIndex <= 0 || bubbleHistory.length === 0) return;

    const last = bubbleHistory.pop();
    last.ai?.remove();
    last.user?.remove();

    currentStepIndex--;
    visibleSteps = getVisibleSteps();

    // Clear data for the step we're back to, so user re-answers fresh
    const step = visibleSteps[currentStepIndex];
    delete data[step.key];

    updateSidebarNav();
    updateProgress();

    const inputArea = document.getElementById('onb-input-area');
    if (inputArea) inputArea.innerHTML = '';
    renderInput(step);

    showToast({ type: 'info', title: 'Went back', message: `Editing: "${step.id.replace(/_/g,' ')}"` });
  }

  // ── Back button HTML snippet ─────────────────────────────
  function backBtnHTML() {
    return currentStepIndex > 0
      ? `<button class="onb-back-btn" id="onb-back-btn">&#8592; Back</button>`
      : '';
  }

  // ── Render Input for current step ───────────────────────
  function renderInput(step) {
    const inputArea = document.getElementById('onb-input-area');
    if (!inputArea) return;

    if (step.type === 'text') {
      inputArea.innerHTML = `
        <div class="onb-text-input-row">
          ${backBtnHTML()}
          <input type="text" class="onb-text-input" id="onb-text-input" placeholder="${step.placeholder || 'Type here...'}" autocomplete="off" style="flex:1;" />
          <button class="onb-send-btn" id="onb-send-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      `;
      const inp = document.getElementById('onb-text-input');
      const btn = document.getElementById('onb-send-btn');
      inp?.focus();
      const submit = () => { const v = inp.value.trim(); if (v && !isProcessing) submitAnswer(step, v); };
      inp?.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
      btn?.addEventListener('click', submit);
      document.getElementById('onb-back-btn')?.addEventListener('click', goBack);

    } else if (step.type === 'textarea') {
      inputArea.innerHTML = `
        <div class="onb-textarea-wrap">
          <textarea class="onb-textarea" id="onb-textarea" placeholder="${step.placeholder || 'Type your answer...'}" rows="3"></textarea>
          <div style="display:flex; gap:10px; justify-content: space-between; align-items:center; margin-top: 10px;">
            ${backBtnHTML()}
            <div style="display:flex; gap:10px; margin-left: auto;">
              ${step.optional ? `<button class="onb-skip-btn" id="onb-skip-btn">Skip</button>` : ''}
              <button class="onb-send-btn-wide" id="onb-send-btn">Continue &#8594;</button>
            </div>
          </div>
        </div>
      `;
      document.getElementById('onb-textarea')?.focus();
      document.getElementById('onb-send-btn')?.addEventListener('click', () => {
        const val = document.getElementById('onb-textarea').value.trim();
        if (!val && !step.optional) { showToast({ type: 'warning', title: 'Required', message: 'Please fill in this field.' }); return; }
        if (!isProcessing) submitAnswer(step, val || '—');
      });
      document.getElementById('onb-skip-btn')?.addEventListener('click', () => { if (!isProcessing) submitAnswer(step, '—'); });
      document.getElementById('onb-back-btn')?.addEventListener('click', goBack);

    } else if (step.type === 'choice') {
      // Use 3-col grid for larger sets (industry=9), 2-col for smaller
      const cols = step.choices.length > 4 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)';
      inputArea.innerHTML = `
        ${currentStepIndex > 0 ? `<div style="margin-bottom:12px;">${backBtnHTML()}</div>` : ''}
        <div class="onb-choices" style="grid-template-columns: ${cols};">
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
          if (isProcessing) return;
          const chosen = step.choices.find(c => c.value === btn.dataset.value);
          submitAnswer(step, chosen.value, chosen.label);
        });
      });
      document.getElementById('onb-back-btn')?.addEventListener('click', goBack);

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
          <div style="display:flex; gap:10px; justify-content:space-between; align-items:center; margin-top:12px;">
            ${backBtnHTML()}
            <div style="display:flex; gap:10px; margin-left:auto;">
              <button class="onb-skip-btn" id="onb-skip-btn">Skip for now</button>
              <button class="onb-send-btn-wide" id="onb-file-continue">Continue &#8594;</button>
            </div>
          </div>
        </div>
      `;
      let uploadedFiles = [];
      document.getElementById('onb-file-input')?.addEventListener('change', (e) => {
        uploadedFiles = Array.from(e.target.files);
        document.getElementById('onb-file-preview').innerHTML = uploadedFiles.map(f =>
          `<div style="background:#f1f5f9;border-radius:8px;padding:6px 12px;font-size:0.8rem;color:#374151;">📎 ${f.name}</div>`
        ).join('');
      });
      document.getElementById('onb-skip-btn')?.addEventListener('click', () => { if (!isProcessing) submitAnswer(step, null, 'Skipped'); });
      document.getElementById('onb-file-continue')?.addEventListener('click', () => {
        if (!isProcessing) submitAnswer(step, uploadedFiles, uploadedFiles.length > 0 ? `${uploadedFiles.length} image(s) uploaded` : 'Skipped');
      });
      document.getElementById('onb-back-btn')?.addEventListener('click', goBack);
    }
  }

  // ── Submit answer & advance ──────────────────────────────
  async function submitAnswer(step, value, displayText = null) {
    if (isProcessing) return;
    isProcessing = true;

    data[step.key] = value;
    const userEl = addUserBubble(displayText || (typeof value === 'string' ? value : String(value)));

    const inputArea = document.getElementById('onb-input-area');
    if (inputArea) inputArea.innerHTML = '';

    currentStepIndex++;
    visibleSteps = getVisibleSteps();
    updateSidebarNav();
    updateProgress();

    if (currentStepIndex >= visibleSteps.length) {
      await showTyping();
      bubbleHistory.push({ user: userEl, ai: null });
      isProcessing = false;
      await showCompletion();
    } else {
      await showTyping();
      const nextStep = visibleSteps[currentStepIndex];
      const aiEl = addAIBubble(nextStep.ai(data));
      bubbleHistory.push({ user: userEl, ai: aiEl });
      isProcessing = false;
      renderInput(nextStep);
    }
  }

  // ── Completion screen ────────────────────────────────────
  async function showCompletion() {
    // Confetti!
    launchConfetti();

    // Generate all 3 script variants
    const scripts = {
      friendly:  generateScriptVariant(data, 'friendly'),
      assertive: generateScriptVariant(data, 'assertive'),
      formal:    generateScriptVariant(data, 'formal'),
    };

    // Use user's chosen tone as default tab
    const defaultTone   = data.tone || 'friendly';
    let   currentScript = scripts[defaultTone] || scripts.friendly;

    // Save to localStorage
    localStorage.setItem('seevora_onboarding', JSON.stringify({
      ...data,
      generatedScript: currentScript,
      allScripts: scripts,
      completedAt: new Date().toISOString(),
    }));

    // Save to backend (best-effort)
    try {
      const LIVE_BASE = (window.__SEEVORA_CONFIG__ && window.__SEEVORA_CONFIG__.NGROK_BASE_URL) || window.location.origin;
      const sess  = JSON.parse(localStorage.getItem('seevora_session') || '{}');
      const token = sess.token || sess.access_token;
      await fetch(`${LIVE_BASE}/api/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ ...data, generatedScript: currentScript, allScripts: scripts }),
      });
    } catch (_) { /* backend may not be running */ }

    // AI celebration message
    addAIBubble(`🎉 Amazing, ${data._firstName || ''}! Your personalized AI agent is 100% ready!\n\nI've generated 3 script variants for different calling styles. Pick the one that fits your brand — or use all three for A/B testing!`);
    await new Promise(r => setTimeout(r, 700));

    // ROI estimate
    const roi = generateROIEstimate(data);

    const inputArea = document.getElementById('onb-input-area');
    if (!inputArea) return;

    inputArea.innerHTML = `
      <!-- ROI Card -->
      <div class="onb-roi-card">
        <div class="onb-roi-title">${roi.icon} Estimated Monthly Impact for ${data.businessName || 'Your Business'}</div>
        <div class="onb-roi-stats">
          <div class="onb-roi-stat">
            <div class="onb-roi-stat-val">${roi.calls}</div>
            <div class="onb-roi-stat-label">Calls / Month</div>
          </div>
          <div class="onb-roi-stat">
            <div class="onb-roi-stat-val">${roi.rate}</div>
            <div class="onb-roi-stat-label">Conversion Rate</div>
          </div>
          <div class="onb-roi-stat">
            <div class="onb-roi-stat-val" style="font-size:0.95rem;">${roi.revenue}</div>
            <div class="onb-roi-stat-label">Potential Revenue</div>
          </div>
        </div>
      </div>

      <!-- Script Variant Tabs -->
      <div style="margin-bottom:0; margin-top: 4px;">
        <div style="font-size:0.8rem; color:#64748b; font-weight:600; margin-bottom:8px;">&#128196; Generated Agent Scripts — 3 Tone Variants</div>
        <div class="onb-script-tabs">
          <button class="onb-tab-btn ${defaultTone === 'friendly'  ? 'active' : ''}" data-tone="friendly">🤝 Friendly</button>
          <button class="onb-tab-btn ${defaultTone === 'assertive' ? 'active' : ''}" data-tone="assertive">🎯 Assertive</button>
          <button class="onb-tab-btn ${defaultTone === 'formal'    ? 'active' : ''}" data-tone="formal">🏆 Formal</button>
        </div>
        <div class="onb-script-preview" style="border-radius: 0 12px 12px 12px; margin-top:0;">
          <div class="onb-script-header">
            <span>&#128221; ${defaultTone.charAt(0).toUpperCase() + defaultTone.slice(1)} Script</span>
            <div style="display:flex; gap:8px; align-items:center;">
              <button class="onb-voice-preview-btn" id="onb-voice-btn">&#127908; Preview Voice</button>
              <button class="onb-copy-script" id="onb-copy-script">Copy</button>
            </div>
          </div>
          <pre class="onb-script-body" id="onb-script-body">${scripts[defaultTone] || scripts.friendly}</pre>
        </div>
      </div>

      <!-- Go to Dashboard -->
      <button class="onb-go-dashboard-btn" id="onb-go-dashboard">
        &#128640; Launch My AI Agent — Go to Dashboard
      </button>
    `;

    // Retrieve the voice button element
    const voiceBtn = document.getElementById('onb-voice-btn');

    // Tab switching
    document.querySelectorAll('.onb-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.onb-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tone = btn.dataset.tone;
        currentScript = scripts[tone] || scripts.friendly;
        const bodyEl = document.getElementById('onb-script-body');
        if (bodyEl) bodyEl.textContent = currentScript;
        // Update header label
        const hdr = inputArea.querySelector('.onb-script-header span');
        if (hdr) hdr.textContent = `📋 ${tone.charAt(0).toUpperCase() + tone.slice(1)} Script`;
        // Stop any active voice preview
        if (window.speechSynthesis?.speaking) {
          window.speechSynthesis.cancel();
          if (voiceBtn) { voiceBtn.textContent = '🎤 Preview Voice'; voiceBtn.classList.remove('playing'); }
        }
      });
    });

    // Voice preview
    voiceBtn?.addEventListener('click', () => {
      previewVoice(currentScript, voiceBtn);
    });

    // Copy script
    document.getElementById('onb-copy-script')?.addEventListener('click', () => {
      navigator.clipboard.writeText(currentScript).then(() => {
        showToast({ type: 'success', title: 'Copied!', message: 'Agent script copied to clipboard.' });
      });
    });

    // Go to Dashboard
    document.getElementById('onb-go-dashboard')?.addEventListener('click', () => {
      window.speechSynthesis?.cancel();
      const sess = JSON.parse(localStorage.getItem('seevora_session') || '{}');
      sess.onboarded = true;
      localStorage.setItem('seevora_session', JSON.stringify(sess));
      navigate('dashboard');
    });
  }

  // ── Boot the wizard ──────────────────────────────────────
  async function boot() {
    visibleSteps = getVisibleSteps();
    updateSidebarNav();
    updateProgress();
    await showTyping();
    const firstStep = visibleSteps[0];
    const firstAiEl = addAIBubble(firstStep.ai(data));
    // Push a sentinel so going back from step 1 removes step 1's AI bubble
    // but the step 0 AI bubble (from boot) stays
    // We track it separately in case the user never goes back to step 0
    renderInput(firstStep);
  }

  boot();
}
