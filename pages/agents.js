// ============================================================
//  AI Agents Page
// ============================================================

import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar } from '../components/topbar.js';

// Agent data with detailed prompts
const AGENTS_DATA = [
  {
    id: 'c5f590a2-25de-4d7a-8f4b-cf1042cb412e',
    name: 'Sales Agent — Tier 1',
    avatar: 'SA',
    color: '#6c63ff',
    bg: '#ede9fe',
    status: 'active',
    script: 'Standard Sales Pitch',
    rate_rs: 1.20,
    calls_made: 245,
    success_rate: 68,
    avg_duration: '3m 42s',
    description: 'Handles top-of-funnel sales outreach. Focuses on product introduction and qualifying leads.',
    prompt: `Hello [Customer Name], this is [Agent Name] calling from Seevora!

I am reaching out because you recently expressed interest in our [Product/Service]. I wanted to walk you through what we offer and how it can benefit you.

We provide [Key Feature 1], [Key Feature 2], and [Key Feature 3] — all designed to help you [Primary Benefit].

The total fee is Rs [Amount] for [Duration/Package], which includes [What's Included].

Would you be interested in learning more?

[If YES]: Wonderful! Let me get you scheduled. Are you available [Day/Time]?
[If NO]: I understand. May I ask what your main concern is? Perhaps I can address it.
[If CALLBACK]: Of course! When would be a good time for me to call you back?`,
    tags: ['Sales', 'Outbound', 'Lead Gen'],
  },
  {
    id: 'd7a821b3-36ef-5e8b-9g5c-dg2153dc523f',
    name: 'Support Agent — General',
    avatar: 'SG',
    color: '#0284c7',
    bg: '#e0f2fe',
    status: 'active',
    script: 'Customer Support Flow',
    rate_rs: 1.00,
    calls_made: 189,
    success_rate: 91,
    avg_duration: '5m 15s',
    description: 'Handles inbound support queries. Resolves issues, resets accounts, and escalates to humans when needed.',
    prompt: `Good [morning/afternoon]! This is Aria from Seevora Support. How can I help you today?

[Listen to customer issue]

I understand, [Customer Name]. Let me look into that for you right away.

[Account Issue]: I can see your account. There appears to be [Issue Description]. Let me resolve that for you now.
I have [Action Taken]. You should receive a confirmation shortly.

[Technical Issue]: I am going to walk you through a few quick steps to fix this.
Step 1: [Instruction]
Step 2: [Instruction]
Step 3: [Instruction]
Is that working for you now?

[Escalation Needed]: I am going to connect you with a senior specialist who can better assist you. Please hold for just a moment.

Is there anything else I can help you with today?
Thank you for calling Seevora Support. Have a wonderful day!`,
    tags: ['Support', 'Inbound', 'Resolution'],
  },
  {
    id: 'e8b932c4-47fg-6f9c-0h6d-eh3264ed634g',
    name: 'Appointment Setter',
    avatar: 'AP',
    color: '#16a34a',
    bg: '#dcfce7',
    status: 'active',
    script: 'Appointment Booking',
    rate_rs: 1.10,
    calls_made: 312,
    success_rate: 74,
    avg_duration: '2m 58s',
    description: 'Specialises in scheduling and confirming appointments. Handles rescheduling and reminders.',
    prompt: `Hello [Customer Name]! This is [Agent Name] from Seevora.

I am calling to [schedule/confirm/remind you about] your appointment with us.

[Scheduling New]:
We have the following slots available:
- [Date 1] at [Time 1]
- [Date 2] at [Time 2]
- [Date 3] at [Time 3]
Which of these works best for you?

[Confirming Existing]:
Your appointment is confirmed for [Date] at [Time] IST. Will that still work for you?
[If YES]: Wonderful! You will receive a confirmation to your registered number.
[If RESCHEDULE]: No problem at all! Let me find you a new slot.

[Reminder Call]:
Just a friendly reminder that you have an appointment scheduled for tomorrow, [Date] at [Time].

Is there anything specific you would like to discuss during the appointment?
Great, see you then! Have a wonderful day.`,
    tags: ['Scheduling', 'Outbound', 'Reminder'],
  },
  {
    id: 'f9c043d5-58gh-7g0d-1i7e-fi4375fe745h',
    name: 'Re-engagement Agent',
    avatar: 'RE',
    color: '#d97706',
    bg: '#fef3c7',
    status: 'active',
    script: 'Win-Back Campaign',
    rate_rs: 1.30,
    calls_made: 98,
    success_rate: 42,
    avg_duration: '4m 20s',
    description: 'Reaches out to dormant or churned customers with personalised win-back offers.',
    prompt: `Hello [Customer Name], this is [Agent Name] calling from Seevora.

I hope you are doing well! We noticed it has been a while since we last connected, and we genuinely miss having you as part of our community.

I am reaching out today with a very special offer exclusively for valued customers like yourself.

[Offer Pitch]:
We are offering [Discount/Offer Details] — valid only until [Expiry Date].

What made you step away from us initially, if you do not mind me asking?
[Listen carefully and address the concern genuinely]

A lot has changed since then, including [Key Improvement 1] and [Key Improvement 2]. I think you will find the experience much better now.

Would you like to give us another chance? I can get everything set up for you right now.

[If YES]: That is fantastic! Let me get your account reactivated.
[If NO]: I respect that. May I send you some information via [Email/SMS] for you to review at your own pace?`,
    tags: ['Win-back', 'Outbound', 'Retention'],
  },
  {
    id: 'g0d154e6-69hi-8h1e-2j8f-gj5486gf856i',
    name: 'Survey Agent',
    avatar: 'SV',
    color: '#dc2626',
    bg: '#fee2e2',
    status: 'paused',
    script: 'Post-Service Survey',
    rate_rs: 0.90,
    calls_made: 156,
    success_rate: 85,
    avg_duration: '2m 10s',
    description: 'Conducts post-interaction satisfaction surveys and collects structured feedback.',
    prompt: `Hello [Customer Name]! This is [Agent Name] from Seevora.

We truly value your experience with us, and I am calling to get your feedback on the service you recently received. This will only take about 2 minutes.

Question 1: On a scale of 1 to 5, how satisfied were you with the overall service you received today?
[Record answer]

Question 2: Was your issue or query fully resolved during this interaction?
[Record YES / NO / PARTIALLY]

Question 3: How would you rate the knowledge and professionalism of our team?
1 = Poor, 5 = Excellent
[Record answer]

Question 4: How likely are you to recommend Seevora to a friend or colleague?
1 = Not likely, 10 = Very likely
[Record answer]

Question 5: Is there any specific feedback or suggestion you would like to share with us today?
[Record open-ended response]

Thank you so much for your valuable feedback, [Customer Name]! Your input helps us improve and serve you better.

Have a wonderful rest of your day. Goodbye!`,
    tags: ['Survey', 'Feedback', 'Post-call'],
  },
];

function renderAgentCard(agent) {
  const tagsHtml = agent.tags.map(t => `<span class="agent-tag">${t}</span>`).join('');

  return `
    <div class="agent-card" id="agent-card-${agent.id}">
      <div class="agent-card-header" data-agent-id="${agent.id}">
        <div class="agent-avatar" style="background:${agent.bg};color:${agent.color};">${agent.avatar}</div>
        <div class="agent-info">
          <div class="agent-name-row">
            <h3 class="agent-name">${agent.name}</h3>
          </div>
          <p class="agent-description">${agent.description}</p>
          <div class="agent-tags">${tagsHtml}</div>
        </div>
        <div class="agent-stats">
          <div class="agent-stat">
            <div class="agent-stat-value">${agent.calls_made}</div>
            <div class="agent-stat-label">Calls Made</div>
          </div>
          <div class="agent-stat">
            <div class="agent-stat-value" style="color:#16a34a;">${agent.success_rate}%</div>
            <div class="agent-stat-label">Success Rate</div>
          </div>
          <div class="agent-stat">
            <div class="agent-stat-value">${agent.avg_duration}</div>
            <div class="agent-stat-label">Avg Duration</div>
          </div>
          <div class="agent-stat">
            <div class="agent-stat-value">Rs${agent.rate_rs}/min</div>
            <div class="agent-stat-label">Rate</div>
          </div>
        </div>
        <button class="agent-expand-btn" data-agent-id="${agent.id}" title="View Script">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="expand-chevron"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>
      <div class="agent-prompt-panel" id="prompt-panel-${agent.id}">
        <div class="agent-prompt-header">
          <div class="agent-prompt-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Agent Script &mdash; ${agent.script}
          </div>
          <button class="btn btn-sm btn-secondary" onclick="copyAgentPrompt('${agent.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy Script
          </button>
        </div>
        <pre class="agent-prompt-body" id="prompt-text-${agent.id}">${agent.prompt}</pre>
      </div>
    </div>
  `;
}

export async function renderAgents(user, navigate) {
  const totalActive = AGENTS_DATA.filter(a => a.status === 'active').length;
  const totalCalls  = AGENTS_DATA.reduce((s, a) => s + a.calls_made, 0);
  const avgSuccess  = Math.round(AGENTS_DATA.reduce((s, a) => s + a.success_rate, 0) / AGENTS_DATA.length);

  return `
    <div class="dashboard-shell">
      ${renderSidebar('agents', user)}
      <div class="main-content">
        ${renderTopbar({ title: 'AI Agents', subtitle: 'Manage your voice agents and their conversation scripts', user })}
        <div class="page-content page-enter">

          <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 28px;">
            <div class="stat-card">
              <div class="stat-icon purple"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
              <div class="stat-label">Total Agents</div>
              <div class="stat-value">${AGENTS_DATA.length}</div>
              <div class="stat-sub">${totalActive} active</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon green"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
              <div class="stat-label">Active Agents</div>
              <div class="stat-value">${totalActive}</div>
              <div class="stat-sub">Ready to call</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon cyan"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 24 16v.92z"/></svg></div>
              <div class="stat-label">Total Calls</div>
              <div class="stat-value">${totalCalls.toLocaleString()}</div>
              <div class="stat-sub">Across all agents</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon yellow"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div>
              <div class="stat-label">Avg Success Rate</div>
              <div class="stat-value">${avgSuccess}%</div>
              <div class="stat-sub">Across all agents</div>
            </div>
          </div>

          <div class="agents-list" id="agents-list">
            ${AGENTS_DATA.map(agent => renderAgentCard(agent)).join('')}
          </div>

        </div>
      </div>
    </div>
  `;
}

export async function initAgents(user, navigate) {
  document.querySelectorAll('.side-nav-link[data-route]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
  });
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('seevora_session');
    navigate('login');
  });

  document.querySelectorAll('.agent-expand-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const agentId = btn.dataset.agentId;
      toggleAgent(agentId);
    });
  });

  document.querySelectorAll('.agent-card-header').forEach(header => {
    header.addEventListener('click', () => {
      const agentId = header.dataset.agentId;
      toggleAgent(agentId);
    });
  });

  function toggleAgent(agentId) {
    const card    = document.getElementById('agent-card-' + agentId);
    const panel   = document.getElementById('prompt-panel-' + agentId);
    const chevron = card.querySelector('.expand-chevron');
    const isOpen  = panel.classList.contains('open');
    panel.classList.toggle('open', !isOpen);
    card.classList.toggle('expanded', !isOpen);
    if (chevron) chevron.classList.toggle('rotated', !isOpen);
  }

  window.copyAgentPrompt = (agentId) => {
    const el = document.getElementById('prompt-text-' + agentId);
    if (!el) return;
    navigator.clipboard.writeText(el.textContent.trim()).then(() => {
      import('../components/toast.js').then(({ showToast }) => {
        showToast({ type: 'success', title: 'Copied!', message: 'Agent script copied to clipboard.' });
      });
    });
  };
}
