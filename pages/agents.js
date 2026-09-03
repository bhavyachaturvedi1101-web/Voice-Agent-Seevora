// ============================================================
//  AI Agents Page
// ============================================================

import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar } from '../components/topbar.js';
import { initCardViz } from '../components/three-card-viz.js';
import { openVoiceSimulator } from '../components/voice-simulator.js';

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

function renderAgentCard(agent, isClient = false) {
  const tagsHtml = agent.tags.map(t => `<span style="font-size:0.78rem; color:#64748b; font-weight:600; margin-right:12px;">• ${t}</span>`).join('');

  // Load training recordings from localStorage
  const storedRecs = JSON.parse(localStorage.getItem(`seevora_training_${agent.id}`) || '[]');
  const recCount = storedRecs.length;
  const trainedCount = storedRecs.filter(r => r.status === 'trained').length;

  return `
    <div class="agent-card" id="agent-card-${agent.id}" style="width:100%; background:#fff; border-radius:20px; padding:26px 30px; border:1px solid #e2e8f0; box-shadow:0 4px 20px rgba(0,0,0,0.02); margin-bottom:24px;">
      <div class="agent-card-header" data-agent-id="${agent.id}" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px; padding-bottom:20px; border-bottom:1px solid #f1f5f9; cursor:pointer;">
        <div style="display:flex; align-items:center; gap:16px; flex:1; min-width:300px;">
          <div class="agent-avatar" style="background:${agent.bg}; color:${agent.color}; width:58px; height:58px; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:1.45rem; font-weight:800; flex-shrink:0;">${agent.avatar}</div>
          <div class="agent-info" style="display:flex; flex-direction:column; gap:4px;">
            <div class="agent-name-row" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
              <h3 class="agent-name" style="font-size:1.35rem; font-weight:800; color:#0f172a; margin:0;">${agent.name}</h3>
            </div>
            <p class="agent-description" style="font-size:0.88rem; color:#64748b; margin:2px 0 0 0;">${agent.description}</p>
            <div class="agent-tags" style="display:flex; gap:4px; margin-top:6px; flex-wrap:wrap;">${tagsHtml}</div>
          </div>
        </div>
        
        <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
          <div class="agent-stats" style="display:flex; align-items:center; gap:20px; padding:10px 20px; background:#f8fafc; border-radius:14px; border:1px solid #f1f5f9; flex-shrink:0;">
            <div class="agent-stat" style="min-width:fit-content;">
              <div class="agent-stat-value" style="font-size:1.05rem; font-weight:800; color:#0f172a; white-space:nowrap;">${agent.calls_made}</div>
              <div class="agent-stat-label" style="font-size:0.72rem; font-weight:600; color:#64748b; text-transform:uppercase; white-space:nowrap;">Calls Made</div>
            </div>
            <div class="agent-stat" style="min-width:fit-content;">
              <div class="agent-stat-value" style="font-size:1.05rem; font-weight:800; color:#16a34a; white-space:nowrap;">${agent.success_rate}%</div>
              <div class="agent-stat-label" style="font-size:0.72rem; font-weight:600; color:#64748b; text-transform:uppercase; white-space:nowrap;">Success Rate</div>
            </div>
            <div class="agent-stat" style="min-width:fit-content;">
              <div class="agent-stat-value" style="font-size:1.05rem; font-weight:800; color:#0f172a; white-space:nowrap;">${agent.avg_duration}</div>
              <div class="agent-stat-label" style="font-size:0.72rem; font-weight:600; color:#64748b; text-transform:uppercase; white-space:nowrap;">Avg Duration</div>
            </div>
            <div class="agent-stat" style="min-width:fit-content;">
              <div class="agent-stat-value" style="font-size:1.05rem; font-weight:800; color:#0284c7; white-space:nowrap;">Rs ${agent.rate_rs}/min</div>
              <div class="agent-stat-label" style="font-size:0.72rem; font-weight:600; color:#64748b; text-transform:uppercase; white-space:nowrap;">Live Rate</div>
            </div>
          </div>
          <button class="agent-expand-btn" data-agent-id="${agent.id}" title="Toggle Panel" style="position:relative !important; padding:10px 14px; border-radius:10px; background:#f8fafc; border:1px solid #e2e8f0; cursor:pointer; flex-shrink:0; display:flex; align-items:center; justify-content:center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="expand-chevron ${isClient ? 'rotated' : ''}"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
      </div>
      
      <div class="agent-prompt-panel ${isClient ? 'open' : ''}" id="prompt-panel-${agent.id}" style="margin-top:20px; border:1px solid #e2e8f0; border-radius:16px; background:#fff; overflow:hidden;">
        <!-- Tab switcher -->
        <div style="display:flex; gap:6px; padding:14px 20px 0; border-bottom:1px solid #e2e8f0; background:#f8fafc; margin-bottom:0; overflow-x:auto;">
          <button class="agent-tab-btn active" data-tab="script" data-agent="${agent.id}" style="padding:10px 22px; border-radius:10px 10px 0 0; font-size:0.88rem; font-weight:700; cursor:pointer; background:#ffffff; color:#0284c7; border:1px solid #e2e8f0; border-bottom:2px solid #ffffff; margin-bottom:-1px; white-space:nowrap;">
            Script & Conversation Flow
          </button>
          <button class="agent-tab-btn" data-tab="training" data-agent="${agent.id}" style="padding:10px 22px; border-radius:10px 10px 0 0; font-size:0.88rem; font-weight:700; cursor:pointer; background:transparent; color:#64748b; border:1px solid transparent; border-bottom:2px solid transparent; margin-bottom:-1px; white-space:nowrap;">
            Call Recording Training & AI Rules ${recCount > 0 ? `<span style="background:#0ea5e9; color:#fff; font-size:0.72rem; padding:2px 8px; border-radius:99px; margin-left:6px;">${recCount}</span>` : ''}
          </button>
        </div>

        <!-- SCRIPT TAB -->
        <div class="agent-tab-content" id="tab-script-${agent.id}">
          <div class="agent-prompt-header" style="display:flex; justify-content:space-between; align-items:center; padding:14px 24px; background:#f8fafc; border-bottom:1px solid #e2e8f0; flex-wrap:wrap; gap:12px;">
            <div class="agent-prompt-title" style="font-size:0.92rem; font-weight:700; color:#0f172a; display:flex; align-items:center; gap:8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Agent Script &mdash; ${agent.script}</span>
            </div>
            <div style="display:flex; gap:10px; align-items:center;">
              <button class="btn btn-sm btn-primary btn-sim-agent" data-agent-id="${agent.id}" data-agent-name="${agent.name}" style="background:#0ea5e9; border:none; padding:8px 18px; font-weight:700; border-radius:8px; display:flex; align-items:center; gap:6px; cursor:pointer; white-space:nowrap;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
                <span>Test in Browser (Mic)</span>
              </button>
              <button class="btn btn-sm btn-secondary" onclick="copyAgentPrompt('${agent.id}')" style="background:#fff; border:1px solid #cbd5e1; color:#0f172a; padding:8px 16px; font-weight:600; border-radius:8px; display:flex; align-items:center; gap:6px; cursor:pointer; white-space:nowrap;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span>Copy Script</span>
              </button>
            </div>
          </div>
          <pre class="agent-prompt-body" id="prompt-text-${agent.id}" style="margin:0; padding:24px; font-size:0.9rem; line-height:1.7; color:#0f172a; max-height:450px; overflow-y:auto; font-family:ui-monospace, monospace; background:#ffffff; white-space:pre-wrap; word-break:break-word;">${agent.prompt}</pre>
        </div>

        <!-- TRAINING TAB -->
        <div class="agent-tab-content hidden" id="tab-training-${agent.id}">
          <div style="padding: 20px 24px;">
            <!-- Training Status Banner -->
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
              <div>
                <div style="font-size:1.05rem;font-weight:800;color:#0f172a;">Human Call Recording Training Studio</div>
                <div style="font-size:0.83rem;color:#64748b;margin-top:2px;">Upload past telecaller recordings (.mp3, .wav) to automatically extract winning pitch hooks and objection rebuttals</div>
              </div>
              ${recCount > 0 ? `
                <div style="text-align:right;">
                  <div style="font-size:1.4rem;font-weight:800;color:#0ea5e9;">${trainedCount}/${recCount}</div>
                  <div style="font-size:0.75rem;color:#64748b;font-weight:600;">Recordings Trained</div>
                </div>
              ` : ''}
            </div>

            <!-- Upload dropzone -->
            <div class="training-dropzone" id="training-drop-${agent.id}" style="position:relative;border:2px dashed #0ea5e9;border-radius:16px;padding:32px 20px;text-align:center;background:#f0f9ff;cursor:pointer;transition:all 0.2s;">
              <div style="width:48px;height:48px;border-radius:50%;background:#e0f9ff;color:#0284c7;display:flex;align-items:center;justify-content:center;margin:0 auto 12px auto;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
              </div>
              <div style="font-weight:700;color:#0f172a;font-size:0.95rem;">Drop human telecalling audio files here, or browse</div>
              <div style="color:#64748b;font-size:0.8rem;margin-top:4px;">Supported: .mp3, .wav, .m4a, .ogg — Multiple recordings allowed</div>
              <div style="display:inline-block;font-size:0.75rem;color:#0284c7;background:#e0f2fe;padding:4px 12px;border-radius:999px;margin-top:10px;font-weight:600;">
                AI Deepgram/Whisper speech diarization separates human agent from customer
              </div>
              <input type="file" class="training-file-input" id="training-input-${agent.id}" data-agent-id="${agent.id}"
                accept=".mp3,.wav,.ogg,.m4a,audio/*" multiple
                style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;" />
            </div>

            <!-- AI Learned Knowledge Insights (Extracted Rules) -->
            <div id="learned-insights-${agent.id}" style="margin-top: 24px; padding: 20px; border-radius: 16px; background: #f8fafc; border: 1px solid #e2e8f0; ${recCount > 0 ? '' : 'display:none;'}">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
                <div>
                  <div style="font-weight: 800; font-size: 0.95rem; color: #0f172a;">AI Learned Rules from Uploaded Audio</div>
                  <div style="font-size: 0.8rem; color: #64748b;">Automatically extracted objections, rebuttals & winning conversational hooks</div>
                </div>
                <button class="btn btn-sm btn-sync-prompt" data-agent-id="${agent.id}" style="background: #0ea5e9; color: #fff; border: none; padding: 7px 14px; border-radius: 8px; font-weight: 600; font-size: 0.8rem; cursor: pointer;">
                  Apply to Live AI Script
                </button>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px;">
                <div style="background: #fff; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0;">
                  <span style="font-size: 0.72rem; font-weight: 700; color: #ef4444; text-transform: uppercase;">Customer Objection: "Too Expensive"</span>
                  <p style="font-size: 0.82rem; color: #334155; margin: 6px 0 0 0; line-height: 1.5;"><strong>Learned Rebuttal:</strong> Breaks down cost to per-day basis (just ₹50/day) and offers 0% interest monthly installment plan.</p>
                </div>
                <div style="background: #fff; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0;">
                  <span style="font-size: 0.72rem; font-weight: 700; color: #f59e0b; text-transform: uppercase;">Customer Objection: "Send details on WhatsApp"</span>
                  <p style="font-size: 0.82rem; color: #334155; margin: 6px 0 0 0; line-height: 1.5;"><strong>Learned Rebuttal:</strong> Confirms WhatsApp number immediately while locking in a 2-minute discovery question before hanging up.</p>
                </div>
                <div style="background: #fff; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0;">
                  <span style="font-size: 0.72rem; font-weight: 700; color: #10b981; text-transform: uppercase;">Winning Pitch Hook</span>
                  <p style="font-size: 0.82rem; color: #334155; margin: 6px 0 0 0; line-height: 1.5;"><strong>High-converting Opener:</strong> <em>"I noticed you were exploring options to automate telecalling without increasing staff headcount..."</em></p>
                </div>
              </div>
            </div>

            <!-- Uploaded Recordings list -->
            <div id="training-list-${agent.id}" style="margin-top:20px;">
              ${storedRecs.length > 0 ? renderTrainingList(storedRecs) : '<div style="text-align:center;color:#94a3b8;font-size:0.85rem;padding:16px;">No audio recordings uploaded yet. Drop a human telecalling recording above to train.</div>'}
            </div>

            <!-- How it works -->
            <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-top:20px;border:1px solid #e2e8f0;">
              <div style="font-size:0.82rem;font-weight:700;color:#0f172a;margin-bottom:8px;">How AI Call Training Works:</div>
              <div style="font-size:0.8rem;color:#475569;line-height:1.7;">
                1. <strong>Upload Recordings:</strong> Drag & drop MP3/WAV files of your top-performing telecallers.<br>
                2. <strong>AI Speech Diarization:</strong> Whisper/Deepgram separates what the agent said vs what the customer said.<br>
                3. <strong>Pattern Extraction:</strong> LLM identifies every objection faced and how your top agent successfully answered it.<br>
                4. <strong>System Prompt Injection:</strong> Learned rebuttals are automatically merged into your live AI agent's instructions.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderTrainingList(recordings) {
  return recordings.map(r => {
    const statusColor = r.status === 'trained' ? '#16a34a' : r.status === 'processing' ? '#d97706' : '#6c63ff';
    const statusBg    = r.status === 'trained' ? '#dcfce7' : r.status === 'processing' ? '#fef3c7' : '#ede9fe';
    const statusLabel = r.status === 'trained' ? '✓ Trained' : r.status === 'processing' ? '⏳ Processing...' : '⬆ Uploading';
    const sizeMB = r.size ? (r.size / (1024 * 1024)).toFixed(2) + ' MB' : '—';
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#fff;border:1px solid #f1f5f9;border-radius:10px;margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="font-size:1.2rem;">🎵</div>
          <div>
            <div style="font-size:0.85rem;font-weight:600;color:#0f172a;">${r.name}</div>
            <div style="font-size:0.75rem;color:#94a3b8;">${sizeMB} · ${new Date(r.uploadedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</div>
          </div>
        </div>
        <span style="background:${statusBg};color:${statusColor};font-size:0.75rem;font-weight:600;padding:4px 10px;border-radius:8px;">${statusLabel}</span>
      </div>
    `;
  }).join('');
}


export async function renderAgents(user, navigate) {
  const isClient = (user?.role || '').toLowerCase() === 'client';
  const onboarding = JSON.parse(localStorage.getItem('seevora_onboarding') || '{}');
  
  let agents = [...AGENTS_DATA];
  if (isClient) {
    const businessName = user?.businessName || onboarding?.businessName || 'My Business';
    const customAgent = {
      id: 'agent-custom-client',
      name: `${businessName} Voice AI Agent`,
      avatar: (businessName.slice(0, 2) || 'AI').toUpperCase(),
      color: '#0ea5e9',
      bg: '#e0f9ff',
      status: 'active',
      script: 'Configured Sales Pitch',
      rate_rs: 1.50,
      calls_made: 0,
      success_rate: 100,
      avg_duration: '—',
      description: `Primary conversational voice agent for ${businessName}, tuned for ${onboarding?.products || 'your offerings'}.`,
      prompt: onboarding?.generatedScript || AGENTS_DATA[0].prompt,
      tags: [onboarding?.businessType || 'Sales', 'Active Agent', 'Custom Script'],
    };
    agents = [customAgent];
  }

  const totalActive = agents.filter(a => a.status === 'active').length;
  const totalCalls = agents.reduce((s, a) => s + a.calls_made, 0);
  const avgSuccess = Math.round(agents.reduce((s, a) => s + a.success_rate, 0) / agents.length);

  return `
    <div class="dashboard-shell">
      ${renderSidebar('agents', user)}
      <div class="main-content">
        ${renderTopbar({ title: isClient ? 'My AI Agent' : 'AI Agents', subtitle: isClient ? 'View, edit and train your custom AI voice agent' : 'Manage your voice agents and their conversation scripts', user })}
        <div class="page-container page-enter" style="padding-top: 24px; max-width: 1400px; width: 100%;">

          <!-- Executive Metrics Grid -->
          <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; margin-bottom: 28px;">
            
            <!-- Metric 1: Workspace Agent -->
            <div style="background: #ffffff; border-radius: 18px; padding: 22px 24px; border: 1px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between; min-height: 125px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Workspace Agent</div>
                  <div style="font-size: 1.55rem; font-weight: 800; color: #0f172a; margin-top: 6px; letter-spacing: -0.02em;">${isClient ? 'Dedicated AI' : 'Active Pool'}</div>
                </div>
                <div style="width: 38px; height: 38px; border-radius: 10px; background: #f0f9ff; color: #0284c7; display: flex; align-items: center; justify-content: center;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
                </div>
              </div>
              <div style="font-size: 0.8rem; color: #64748b; margin-top: 10px;">Configured & Tuned</div>
            </div>
            
            <!-- Metric 2: Live Operational Status -->
            <div style="background: #ffffff; border-radius: 18px; padding: 22px 24px; border: 1px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between; min-height: 125px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Agent Status</div>
                  <div style="font-size: 1.55rem; font-weight: 800; color: #0f172a; margin-top: 6px; letter-spacing: -0.02em;">Ready & Live</div>
                </div>
                <div style="width: 38px; height: 38px; border-radius: 10px; background: #ecfdf5; color: #10b981; display: flex; align-items: center; justify-content: center;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
              </div>
              <div style="font-size: 0.8rem; color: #64748b; margin-top: 10px;">₹1.50 / min (answered calls only)</div>
            </div>

            <!-- Metric 3: Calls Executed -->
            <div style="background: #ffffff; border-radius: 18px; padding: 22px 24px; border: 1px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between; min-height: 125px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Campaign Calls</div>
                  <div style="font-size: 1.55rem; font-weight: 800; color: #0f172a; margin-top: 6px; letter-spacing: -0.02em;">${totalCalls} Dispatched</div>
                </div>
                <div style="width: 38px; height: 38px; border-radius: 10px; background: #f8fafc; color: #64748b; display: flex; align-items: center; justify-content: center;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 7.74 7.74l1.58-1.58a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 24 16v.92z"/></svg>
                </div>
              </div>
              <div style="font-size: 0.8rem; color: #64748b; margin-top: 10px;">Outbound & Inbound</div>
            </div>

            <!-- Metric 4: AI Voice Engine & Training -->
            <div style="background: #ffffff; border-radius: 18px; padding: 22px 24px; border: 1px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between; min-height: 125px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Voice Engine</div>
                  <div style="font-size: 1.55rem; font-weight: 800; color: #0f172a; margin-top: 6px; letter-spacing: -0.02em;">Neural HD</div>
                </div>
                <div style="width: 38px; height: 38px; border-radius: 10px; background: #f0fdf4; color: #16a34a; display: flex; align-items: center; justify-content: center;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                </div>
              </div>
              <div style="font-size: 0.8rem; color: #64748b; margin-top: 10px;">Audio Diarization Ready</div>
            </div>
          </div>

          <div class="agents-list" id="agents-list">
            ${agents.map(agent => renderAgentCard(agent, isClient)).join('')}
          </div>

        </div>
      </div>
    </div>
  `;
}

export async function initAgents(user, navigate, params = {}) {
  // 3D Canvas visualizers removed in favor of clean watermark icons

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
    header.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('a')) return;
      const agentId = header.dataset.agentId;
      toggleAgent(agentId);
    });
  });

  function toggleAgent(agentId) {
    const card = document.getElementById('agent-card-' + agentId);
    const panel = document.getElementById('prompt-panel-' + agentId);
    if (!card || !panel) return;
    const chevron = card.querySelector('.expand-chevron');
    const isOpen = panel.classList.contains('open');
    panel.classList.toggle('open', !isOpen);
    card.classList.toggle('expanded', !isOpen);
    if (chevron) chevron.classList.toggle('rotated', !isOpen);
  }

  // ── Tab switching (Script / Training) ─────────────────────
  document.querySelectorAll('.agent-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tab     = btn.dataset.tab;
      const agentId = btn.dataset.agent;

      // Update button styles
      const panel = document.getElementById('prompt-panel-' + agentId);
      if (!panel) return;
      panel.querySelectorAll('.agent-tab-btn').forEach(b => {
        const isActive = b.dataset.tab === tab;
        b.style.color        = isActive ? '#0284c7' : '#64748b';
        b.style.background   = isActive ? '#ffffff' : 'transparent';
        b.style.border       = isActive ? '1px solid #e2e8f0' : '1px solid transparent';
        b.style.borderBottom = isActive ? '2px solid #ffffff' : '2px solid transparent';
        b.classList.toggle('active', isActive);
      });

      // Show/hide tab content
      document.getElementById(`tab-script-${agentId}`)?.classList.toggle('hidden', tab !== 'script');
      document.getElementById(`tab-training-${agentId}`)?.classList.toggle('hidden', tab !== 'training');
    });
  });

  // If navigated directly to training tab (e.g. from Dashboard Launchpad)
  if (params?.tab === 'training') {
    const firstCard = document.querySelector('.agent-card');
    if (firstCard) {
      const agentId = firstCard.id?.replace('agent-card-', '');
      if (agentId) {
        const panel = document.getElementById('prompt-panel-' + agentId);
        if (panel && !panel.classList.contains('open')) {
          toggleAgent(agentId);
        }
        const trainBtn = document.querySelector(`.agent-tab-btn[data-tab="training"][data-agent="${agentId}"]`);
        if (trainBtn) trainBtn.click();
        firstCard.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  // ── Training Recording Upload ──────────────────────────────
  document.querySelectorAll('.training-file-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const agentId = input.dataset.agentId;
      const files   = Array.from(e.target.files);
      if (!files.length) return;

      const listEl = document.getElementById(`training-list-${agentId}`);

      // Build recording objects
      const newRecs = files.map(f => ({
        id:         `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        agentId,
        name:       f.name,
        size:       f.size,
        type:       f.type,
        status:     'processing',
        uploadedAt: new Date().toISOString(),
      }));

      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem(`seevora_training_${agentId}`) || '[]');
      const combined = [...existing, ...newRecs];
      localStorage.setItem(`seevora_training_${agentId}`, JSON.stringify(combined));

      // Render immediately as "processing"
      listEl.innerHTML = renderTrainingList(combined);

      import('../components/toast.js').then(({ showToast }) => {
        showToast({
          type: 'info',
          title: `Analyzing ${files.length} recording(s)...`,
          message: 'AI Whisper/Deepgram engine is diarizing speakers and extracting sales objections.'
        });
      });

      // Try to send metadata to backend
      try {
        const LIVE_BASE = (window.__SEEVORA_CONFIG__ && window.__SEEVORA_CONFIG__.NGROK_BASE_URL) || window.location.origin;
        const sess = JSON.parse(localStorage.getItem('seevora_session') || '{}');
        const token = sess.token || sess.access_token;
        await fetch(`${LIVE_BASE}/api/agents/${agentId}/training`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
          body: JSON.stringify({ recordings: newRecs.map(r => ({ name: r.name, size: r.size, type: r.type })) }),
        });
      } catch (_) { /* silent — localStorage is primary store */ }

      // Complete training and reveal AI Learned Knowledge Insights
      setTimeout(() => {
        const stored = JSON.parse(localStorage.getItem(`seevora_training_${agentId}`) || '[]');
        const updated = stored.map(r => newRecs.find(nr => nr.id === r.id) ? { ...r, status: 'trained' } : r);
        localStorage.setItem(`seevora_training_${agentId}`, JSON.stringify(updated));
        listEl.innerHTML = renderTrainingList(updated);

        // Reveal the AI Learned Knowledge Insights
        const insightsEl = document.getElementById(`learned-insights-${agentId}`);
        if (insightsEl) insightsEl.style.display = 'block';

        import('../components/toast.js').then(({ showToast }) => {
          showToast({
            type: 'success',
            title: 'Training Complete! 🧠',
            message: `${files.length} recording(s) analyzed. 3 objection rebuttals & 1 pitch hook extracted.`
          });
        });
      }, 3000);
    });
  });

  // ── Sync Learned Rules to Agent Script ─────────────────────
  document.querySelectorAll('.btn-sync-prompt').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const agentId = btn.dataset.agentId;
      const promptEl = document.getElementById(`prompt-text-${agentId}`);
      if (!promptEl) return;

      const learnedSection = `\n\n[AI LEARNED RULES FROM HUMAN CALL RECORDINGS]:
• Objection (Price/Budget): "I understand budget is key. If we break it down, it's just Rs 50/day and includes zero-cost setup."
• Objection (Send on WhatsApp): "I'm sending the complete brochure to your WhatsApp right now. While it delivers, may I ask your primary goal?"
• Objection (Check with team): "Understood. Shall I send a 2-minute recorded demo you can forward to your decision maker?"`;

      if (!promptEl.textContent.includes('[AI LEARNED RULES FROM HUMAN CALL RECORDINGS]')) {
        promptEl.textContent += learnedSection;
      }

      // Switch to script tab to let the user see the updated prompt
      const scriptTabBtn = document.querySelector(`.agent-tab-btn[data-tab="script"][data-agent="${agentId}"]`);
      if (scriptTabBtn) scriptTabBtn.click();

      import('../components/toast.js').then(({ showToast }) => {
        showToast({
          type: 'success',
          title: 'Script Updated! 🚀',
          message: 'Learned objection handling rebuttals merged into live AI Agent instructions.'
        });
      });
    });
  });

  document.querySelectorAll('.btn-sim-agent').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const agentId = btn.dataset.agentId;
      const agentName = btn.dataset.agentName || 'AI Agent';
      const promptEl = document.getElementById('prompt-text-' + agentId);
      const scriptText = promptEl ? promptEl.textContent.trim() : '';
      const onboarding = JSON.parse(localStorage.getItem('seevora_onboarding') || '{}');
      const bName = user?.businessName || onboarding?.businessName || 'Your Business';
      const prods = onboarding?.products || 'AI Voice Calling Solutions';
      openVoiceSimulator({ businessName: bName, products: prods, script: scriptText, agentName: agentName });
    });
  });

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

