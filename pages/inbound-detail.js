// ============================================================
//  Inbound Call Detail Page
// ============================================================

import { getCallById } from '../api.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar } from '../components/topbar.js';
import { showToast } from '../components/toast.js';

function statusBadge(status) {
  const map = {
    answered:  `<span class="badge badge-answered">Answered</span>`,
    missed:    `<span class="badge badge-missed">Missed</span>`,
    voicemail: `<span class="badge badge-voicemail">Voicemail</span>`,
  };
  return map[status] || `<span class="badge">${status}</span>`;
}

function renderWaveform(totalSeconds) {
  const bars = 60;
  return Array.from({ length: bars }, (_, i) => {
    const h = Math.max(15, Math.round(15 + Math.random() * 75));
    return `<div class="audio-bar" data-idx="${i}" style="height:${h}%;" title="${Math.floor((i / bars) * totalSeconds)}s"></div>`;
  }).join('');
}

export async function renderInboundDetail(user, navigate, params) {
  const call = await getCallById(params?.id);

  if (!call) {
    return `
      <div class="dashboard-shell">
        ${renderSidebar('outbound', user)}
        <div class="main-content">
          ${renderTopbar({ title: 'Call Detail', subtitle: 'Not found', user })}
          <div class="page-content page-enter">
            <button class="back-btn" id="back-btn" data-back="inbound">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back
            </button>
            <div class="empty-state">
              <div class="empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div>
              <h3>Call not found</h3><p>This call record may have been deleted.</p>
            </div>
          </div>
        </div>
      </div>`;
  }

  const hasTranscript = call.transcript && call.transcript.length > 0;
  const hasRecording  = call.recording;
  const totalSec      = call.durationSeconds || 120;
  const startTime     = new Date(call.date);
  const endTime       = new Date(call.date.getTime() + totalSec * 1000);

  return `
    <div class="dashboard-shell">
      ${renderSidebar(call.type || 'inbound', user)}
      <div class="main-content">
        ${renderTopbar({
          title: `Call ${call.id}`,
          subtitle: `${call.phone} · ${call.dateFormatted}`,
          user: user,
          actions: `
            ${hasRecording ? `<button class="btn btn-secondary btn-sm" id="download-recording-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Recording
            </button>` : ''}
            <button class="btn btn-ghost btn-sm" id="export-detail-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Export
            </button>
          `
        })}
        <div class="page-content page-enter">
          <button class="back-btn" id="back-btn" data-back="${call.type || 'inbound'}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back to ${call.type === 'outbound' ? 'Outbound Conversations' : 'Inbound Conversations'}
          </button>

          <!-- Status banner -->
          <div style="background:rgba(108,99,255,0.06);border:1px solid rgba(108,99,255,0.2);border-radius:var(--radius-lg);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
              <div>
                <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px;">Call ID</div>
                <div style="font-family:'JetBrains Mono',monospace;font-weight:600;font-size:0.9rem;">${call.id}</div>
              </div>
              <div style="width:1px;height:32px;background:var(--border);"></div>
              <div>
                <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px;">Status</div>
                ${statusBadge(call.status)}
              </div>
              <div style="width:1px;height:32px;background:var(--border);"></div>
              <div>
                <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px;">Duration</div>
                <div style="font-family:'JetBrains Mono',monospace;font-weight:600;">${call.duration}</div>
              </div>
              <div style="width:1px;height:32px;background:var(--border);"></div>
              <div>
                <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px;">Outcome</div>
                <div style="font-size:0.875rem;font-weight:600;">${call.outcome}</div>
              </div>
              <div style="width:1px;height:32px;background:var(--border);"></div>
              <div>
                <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px;">AI Confidence</div>
                <div style="font-size:0.875rem;font-weight:600;color:var(--primary);">${Math.random() > 0.5 ? '98%' : '96%'}</div>
              </div>
            </div>
            ${call.cost ? `<div style="text-align:right;">
              <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px;">Total Cost</div>
              <div style="font-size:1.25rem;font-weight:800;font-family:'JetBrains Mono',monospace;color:var(--accent-green);">$${call.cost.total.toFixed(4)}</div>
            </div>` : ''}
          </div>

          <div class="detail-grid">
            <!-- Left column -->
            <div style="display:flex;flex-direction:column;gap:20px;">

              ${hasRecording ? `
              <!-- Audio Player -->
              <div class="card">
                <div class="detail-section-title">Recording</div>
                <div class="audio-player">
                  <div class="audio-waveform" id="waveform">
                    ${renderWaveform(totalSec)}
                  </div>
                  <div class="audio-progress" id="audio-progress">
                    <div class="audio-progress-fill" id="audio-progress-fill" style="width:0%"></div>
                  </div>
                  <div class="audio-controls">
                    <button class="audio-btn audio-btn-skip" id="audio-rewind" title="Rewind 10s">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.38"/></svg>
                    </button>
                    <button class="audio-btn audio-btn-play" id="audio-play" title="Play/Pause">
                      <svg id="play-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      <svg id="pause-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="display:none;"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    </button>
                    <button class="audio-btn audio-btn-skip" id="audio-forward" title="Forward 10s">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-3.38"/></svg>
                    </button>
                    <span class="audio-time" id="audio-time-display">0:00 / ${call.duration}</span>
                    <select id="playback-speed" class="select select-sm" style="width:auto;margin-left:auto;">
                      <option value="1">1x</option>
                      <option value="1.5">1.5x</option>
                      <option value="2">2x</option>
                    </select>
                  </div>
                </div>
              </div>
              ` : ''}

              <!-- Transcript -->
              <div class="card">
                <div class="detail-section-title">${hasTranscript ? 'Full Transcript' : 'Transcript'}</div>
                ${hasTranscript ? `
                  <div class="transcript-container" id="transcript-container">
                    ${call.transcript.map((line, i) => `
                      <div class="transcript-line" id="tline-${i}">
                        <span class="transcript-speaker ${line.speaker}">${line.speaker === 'agent' ? 'AI Agent' : 'Caller'}</span>
                        <span class="transcript-text">${line.text}</span>
                        <span class="transcript-time">${line.time}</span>
                      </div>
                    `).join('')}
                  </div>
                ` : `
                  <div class="empty-state" style="padding:30px 20px;">
                    <div class="empty-state-icon" style="width:48px;height:48px;"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
                    <p style="font-size:0.82rem;">No transcript available for this call.</p>
                  </div>
                `}
              </div>

              <!-- AI Summary -->
              ${call.summary ? `
              <div class="card">
                <div class="detail-section-title">AI Call Summary</div>
                <p style="font-size:0.9rem;color:var(--text-secondary);line-height:1.75;">${call.summary}</p>
              </div>
              ` : ''}

            </div>

            <!-- Right column -->
            <div style="display:flex;flex-direction:column;gap:20px;">

              <!-- Caller Info -->
              <div class="card">
                <div class="detail-section-title">Caller Information</div>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Phone</div>
                    <div class="info-value mono">${call.phone}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Name</div>
                    <div class="info-value">${call.callerName || 'Unknown'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Agent</div>
                    <div class="info-value" style="font-size:0.8rem;">${call.agent}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value">${statusBadge(call.status)}</div>
                  </div>
                </div>
              </div>

              <!-- Call Timeline -->
              <div class="card">
                <div class="detail-section-title">Call Timeline</div>
                <div class="timeline">
                  <div class="timeline-item">
                    <div class="timeline-dot start">▶</div>
                    <div class="timeline-content">
                      <div class="timeline-title">Call started</div>
                      <div class="timeline-time">${startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</div>
                    </div>
                  </div>
                  ${call.status === 'answered' ? `
                  <div class="timeline-item">
                    <div class="timeline-dot middle">●</div>
                    <div class="timeline-content">
                      <div class="timeline-title">AI Agent connected</div>
                      <div class="timeline-time">+2s from start</div>
                    </div>
                  </div>
                  ` : ''}
                  <div class="timeline-item">
                    <div class="timeline-dot end">■</div>
                    <div class="timeline-content">
                      <div class="timeline-title">${call.status === 'missed' ? 'Call missed' : call.status === 'voicemail' ? 'Voicemail recorded' : 'Call ended'}</div>
                      <div class="timeline-time">${endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Data Captured -->
              ${call.capturedData ? `
              <div class="card">
                <div class="detail-section-title">Data Captured by AI</div>
                <div style="display:flex;flex-direction:column;gap:8px;">
                  ${Object.entries(call.capturedData).map(([k, v]) => `
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:rgba(255,255,255,0.02);border-radius:var(--radius-sm);">
                      <span style="font-size:0.78rem;color:var(--text-secondary);">${k}</span>
                      <span style="font-size:0.82rem;font-weight:600;">${v}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
              ` : ''}

              <!-- Cost -->
              ${call.cost ? `
              <div class="card">
                <div class="detail-section-title">Cost Breakdown</div>
                <div class="cost-breakdown">
                  <div class="cost-row"><span class="cost-row-label">Duration</span><span class="cost-row-value mono">${call.cost.minutes.toFixed(2)} min</span></div>
                  <div class="cost-row"><span class="cost-row-label">Per-minute rate</span><span class="cost-row-value mono">$${call.cost.minuteRate}/min</span></div>
                  <div class="cost-row"><span class="cost-row-label">Call cost</span><span class="cost-row-value mono">$${call.cost.callCost.toFixed(4)}</span></div>
                  <div class="cost-row"><span class="cost-row-label">Platform fee</span><span class="cost-row-value mono">$${call.cost.platformFee.toFixed(4)}</span></div>
                  <div class="cost-row cost-row-total"><span class="cost-row-label" style="font-weight:600;color:var(--text-primary);">Total</span><span class="cost-row-value">$${call.cost.total.toFixed(4)}</span></div>
                </div>
              </div>
              ` : ''}

            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function initInboundDetail(user, navigate, params) {
  const call = await getCallById(params?.id);

  document.querySelectorAll('.bottom-nav-link[data-route]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
  });
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('seevora_session');
    navigate('login');
  });
  document.getElementById('back-btn')?.addEventListener('click', (e) => {
    const route = e.currentTarget.dataset.back || 'inbound';
    navigate(route);
  });

  document.getElementById('download-recording-btn')?.addEventListener('click', () => {
    showToast({ type: 'info', title: 'Downloading recording', message: `${call?.id}_recording.mp3 (mock)` });
  });

  document.getElementById('export-detail-btn')?.addEventListener('click', () => {
    showToast({ type: 'success', title: 'Exported', message: `Call detail for ${call?.id} exported as PDF.` });
  });

  if (!call?.recording) return;

  // Mock audio player
  const totalSec = call.durationSeconds || 120;
  let currentSec = 0;
  let playing = false;
  let interval = null;
  const bars = document.querySelectorAll('.audio-bar');
  const progressFill = document.getElementById('audio-progress-fill');
  const timeDisplay  = document.getElementById('audio-time-display');
  const playBtn      = document.getElementById('audio-play');
  const playIcon     = document.getElementById('play-icon');
  const pauseIcon    = document.getElementById('pause-icon');

  function formatTime(s) {
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  }

  function updateProgress() {
    const pct = (currentSec / totalSec) * 100;
    progressFill.style.width = `${pct}%`;
    timeDisplay.textContent  = `${formatTime(currentSec)} / ${call.duration}`;
    bars.forEach((b, i) => {
      b.classList.toggle('played', i / bars.length < currentSec / totalSec);
    });
  }

  playBtn?.addEventListener('click', () => {
    playing = !playing;
    playIcon.style.display  = playing ? 'none' : '';
    pauseIcon.style.display = playing ? '' : 'none';
    if (playing) {
      interval = setInterval(() => {
        currentSec = Math.min(currentSec + 1, totalSec);
        updateProgress();
        if (currentSec >= totalSec) {
          clearInterval(interval);
          playing = false;
          playIcon.style.display  = '';
          pauseIcon.style.display = 'none';
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
  });

  document.getElementById('audio-rewind')?.addEventListener('click', () => {
    currentSec = Math.max(0, currentSec - 10);
    updateProgress();
  });

  document.getElementById('audio-forward')?.addEventListener('click', () => {
    currentSec = Math.min(totalSec, currentSec + 10);
    updateProgress();
  });

  document.getElementById('audio-progress')?.addEventListener('click', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    currentSec = Math.round(pct * totalSec);
    updateProgress();
  });
}
