// ============================================================
//  Live Interactive Browser Voice Simulator
//  Allows clients to test and talk to their AI Agent directly
//  through their browser microphone and speakers with zero cost.
// ============================================================

export function openVoiceSimulator({ businessName = 'Your Business', products = 'Voice Solutions', script = '', agentName = 'Aria' } = {}) {
  // Remove existing simulator if any
  const existing = document.getElementById('voice-simulator-modal');
  if (existing) existing.remove();

  const modalHtml = `
    <div id="voice-simulator-modal" class="modal-overlay" style="z-index: 9999; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px);">
      <div class="modal" style="max-width: 500px; width: 90%; border-radius: 24px; padding: 0; overflow: hidden; background: #ffffff; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid #e2e8f0;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0c1a2e 0%, #0369a1 100%); padding: 24px; color: #fff; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
            </div>
            <div>
              <div style="font-weight: 800; font-size: 1.1rem; letter-spacing: -0.01em;">${agentName} — AI Voice Agent</div>
              <div style="font-size: 0.8rem; color: #bae6fd; display: flex; align-items: center; gap: 6px;">
                <span style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; box-shadow: 0 0 8px #10b981;"></span>
                Live Web Audio Connected • ${businessName}
              </div>
            </div>
          </div>
          <button id="sim-modal-close" style="background: rgba(255,255,255,0.15); border: none; border-radius: 50%; width: 32px; height: 32px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Animated Voice Visualizer Orb -->
        <div style="padding: 28px 24px 16px 24px; text-align: center; background: #f8fafc; border-bottom: 1px solid #f1f5f9;">
          <div id="sim-orb" style="width: 84px; height: 84px; margin: 0 auto 16px auto; border-radius: 50%; background: radial-gradient(circle, #0ea5e9 0%, #0369a1 100%); box-shadow: 0 0 25px rgba(14,165,233,0.4); display: flex; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
          </div>
          <div id="sim-status-text" style="font-size: 0.85rem; font-weight: 700; color: #0284c7;">
            Agent Speaking...
          </div>
        </div>

        <!-- Live Conversation Transcript Stream -->
        <div id="sim-transcript-box" style="padding: 20px; height: 210px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background: #ffffff;">
          <!-- Bubbles added dynamically -->
        </div>

        <!-- Input & Control Bar -->
        <div style="padding: 16px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; gap: 10px; align-items: center;">
          <input type="text" id="sim-text-input" placeholder="Type a customer question or speak..." style="flex: 1; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 12px; font-size: 0.88rem; outline: none; background: #fff; color: #0f172a;" />
          
          <button id="sim-mic-btn" title="Speak through Microphone" style="width: 42px; height: 42px; border-radius: 12px; border: none; background: #0ea5e9; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.2s;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
          </button>
          
          <button id="sim-send-btn" title="Send message" style="padding: 10px 16px; border-radius: 12px; border: none; background: #0f172a; color: #fff; font-weight: 600; font-size: 0.85rem; cursor: pointer; flex-shrink: 0;">
            Send
          </button>
        </div>

        <!-- Footer -->
        <div style="padding: 10px 20px; background: #f1f5f9; display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #64748b;">
          <span>Zero wallet credits used • Web Audio Mode</span>
          <button id="sim-end-call-btn" style="background: transparent; border: none; color: #ef4444; font-weight: 700; cursor: pointer;">End Voice Demo</button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modal = document.getElementById('voice-simulator-modal');
  const orb = document.getElementById('sim-orb');
  const statusTxt = document.getElementById('sim-status-text');
  const transcriptBox = document.getElementById('sim-transcript-box');
  const textInput = document.getElementById('sim-text-input');
  const sendBtn = document.getElementById('sim-send-btn');
  const micBtn = document.getElementById('sim-mic-btn');
  const closeBtn = document.getElementById('sim-modal-close');
  const endCallBtn = document.getElementById('sim-end-call-btn');

  function appendBubble(sender, text) {
    const isAI = sender === 'ai';
    const bubble = document.createElement('div');
    bubble.style.cssText = `
      max-width: 82%;
      padding: 10px 14px;
      border-radius: ${isAI ? '14px 14px 14px 4px' : '14px 14px 4px 14px'};
      background: ${isAI ? '#f0f9ff' : '#0ea5e9'};
      color: ${isAI ? '#0f172a' : '#ffffff'};
      border: ${isAI ? '1px solid #bae6fd' : 'none'};
      align-self: ${isAI ? 'flex-start' : 'flex-end'};
      font-size: 0.85rem;
      line-height: 1.5;
    `;
    bubble.innerHTML = `<strong>${isAI ? agentName : 'You'}:</strong> ${text}`;
    transcriptBox.appendChild(bubble);
    transcriptBox.scrollTop = transcriptBox.scrollHeight;
  }

  function speakText(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      utterance.onstart = () => {
        orb.style.transform = 'scale(1.15)';
        orb.style.boxShadow = '0 0 35px rgba(14,165,233,0.8)';
        statusTxt.textContent = `${agentName} is speaking...`;
        statusTxt.style.color = '#0284c7';
      };

      utterance.onend = () => {
        orb.style.transform = 'scale(1.0)';
        orb.style.boxShadow = '0 0 25px rgba(14,165,233,0.4)';
        statusTxt.textContent = 'Listening for your response...';
        statusTxt.style.color = '#10b981';
      };

      window.speechSynthesis.speak(utterance);
    }
  }

  // Initial greeting
  const initialGreeting = `Hello! Thank you for calling ${businessName}. This is ${agentName}. How can I help you today?`;
  appendBubble('ai', initialGreeting);
  speakText(initialGreeting);

  // Handle user input
  function handleUserMessage(msg) {
    if (!msg.trim()) return;
    appendBubble('user', msg);
    textInput.value = '';

    statusTxt.textContent = 'AI thinking...';
    statusTxt.style.color = '#64748b';

    setTimeout(() => {
      let reply = '';
      const lower = msg.toLowerCase();

      if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('plan')) {
        reply = `Our pricing is transparent at just 1 rupee 50 paise per answered minute with zero monthly subscription fees.`;
      } else if (lower.includes('what do you do') || lower.includes('product') || lower.includes('service') || lower.includes('offer')) {
        reply = `We specialize in ${products}. Our AI voice system handles calls, answers prospect questions, and logs qualified leads.`;
      } else if (lower.includes('demo') || lower.includes('meeting') || lower.includes('call back') || lower.includes('human')) {
        reply = `I would be happy to arrange a live walkthrough! Would morning or afternoon tomorrow work better for you?`;
      } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        reply = `Hi there! I am ready to answer any questions about ${businessName}. What would you like to know?`;
      } else {
        reply = `Understood! I've noted that down. Is there anything specific regarding our ${products} you'd like me to clarify?`;
      }

      appendBubble('ai', reply);
      speakText(reply);
    }, 700);
  }

  sendBtn?.addEventListener('click', () => handleUserMessage(textInput.value));
  textInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleUserMessage(textInput.value);
  });

  // Speech Recognition (Mic)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      micBtn.style.background = '#ef4444';
      statusTxt.textContent = 'Listening to your voice...';
      statusTxt.style.color = '#ef4444';
    };

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      handleUserMessage(transcript);
    };

    recognition.onend = () => {
      micBtn.style.background = '#0ea5e9';
    };

    micBtn?.addEventListener('click', () => {
      try {
        recognition.start();
      } catch (err) {
        recognition.stop();
      }
    });
  } else {
    micBtn?.addEventListener('click', () => {
      import('./toast.js').then(({ showToast }) => {
        showToast({ type: 'info', title: 'Microphone Demo', message: 'You can type in the box below to test responses in this browser.' });
      });
      textInput.focus();
    });
  }

  function closeModal() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    modal.remove();
  }

  closeBtn?.addEventListener('click', closeModal);
  endCallBtn?.addEventListener('click', closeModal);
}
