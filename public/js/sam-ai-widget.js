/**
 * Sam AI - Floating Chat Widget
 * Official companion for Statistics students at Nnamdi Azikiwe University
 */
(function() {
  if (window.SamAIWidgetLoaded) return;
  window.SamAIWidgetLoaded = true;

  const GREETING = "Hi, I'm Sam AI, your companion for statistics. Ask me about your courses, past questions, or the department, its executives and staff. I'm here for you.";
  const STORAGE_KEY = 'nass_sam_ai_chat_history_v1';

  // Inject CSS if not already present
  if (!document.querySelector('link[href*="sam-ai-widget.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/sam-ai-widget.css';
    document.head.appendChild(link);
  }

  // Load chat history from sessionStorage
  function getChatHistory() {
    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return [
      {
        role: 'assistant',
        content: GREETING,
        sources: []
      }
    ];
  }

  function saveChatHistory(history) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {}
  }

  let chatHistory = getChatHistory();
  let isOpen = false;
  let isSending = false;

  // Create Widget DOM Elements
  function initWidget() {
    // 1. Floating Launcher Button
    const launcher = document.createElement('div');
    launcher.className = 'sam-ai-launcher';
    launcher.id = 'samAiLauncher';
    launcher.setAttribute('role', 'button');
    launcher.setAttribute('aria-label', 'Open Sam AI Chatbot');
    launcher.innerHTML = `
      <div class="sam-launcher-avatar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
          <path d="M4 11v2a8 8 0 0 0 16 0v-2"/>
          <rect width="18" height="12" x="3" y="10" rx="4"/>
          <circle cx="8" cy="16" r="1.5" fill="currentColor"/>
          <circle cx="16" cy="16" r="1.5" fill="currentColor"/>
        </svg>
        <span class="sam-launcher-pulse"></span>
        <span class="sam-launcher-beacon"></span>
      </div>
      <div class="sam-launcher-text">
        <div class="sam-launcher-title">
          <span>Sam AI</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <div class="sam-launcher-sub">Ask about courses & excos</div>
      </div>
    `;

    // 2. Chat Window
    const windowEl = document.createElement('div');
    windowEl.className = 'sam-chat-window';
    windowEl.id = 'samChatWindow';
    windowEl.innerHTML = `
      <div class="sam-chat-header">
        <div class="sam-header-info">
          <div class="sam-header-avatar">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
              <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
              <rect width="18" height="12" x="3" y="10" rx="4"/>
              <circle cx="8" cy="16" r="1.5" fill="currentColor"/>
              <circle cx="16" cy="16" r="1.5" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <div class="sam-header-title">
              <span>Sam AI</span>
              <span class="sam-header-badge">UNIZIK STATS</span>
            </div>
            <div class="sam-header-status">
              <span class="sam-header-dot"></span>
              <span>Online · Statistics Companion</span>
            </div>
          </div>
        </div>
        <div class="sam-header-actions">
          <button type="button" class="sam-action-btn" id="samClearBtn" title="Reset conversation">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
          </button>
          <button type="button" class="sam-action-btn" id="samCloseBtn" title="Minimize Sam AI">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <!-- Quick Suggestion Pills -->
      <div class="sam-suggestions-wrap">
        <button class="sam-suggestion-pill" data-prompt="Explain Bayes Theorem in STA 112">
          <span>💡 Bayes Theorem (STA 112)</span>
        </button>
        <button class="sam-suggestion-pill" data-prompt="What is STA 312 Bivariate Distribution?">
          <span>📊 STA 312 Bivariate</span>
        </button>
        <button class="sam-suggestion-pill" data-prompt="Who is the Director of Socials?">
          <span>👥 Director of Socials</span>
        </button>
        <button class="sam-suggestion-pill" data-prompt="How long is SIWES and when is it done?">
          <span>🛠 SIWES Guidelines</span>
        </button>
        <button class="sam-suggestion-pill" data-prompt="What past questions are available for STA 211?">
          <span>📝 STA 211 Questions</span>
        </button>
      </div>

      <!-- Messages Stream -->
      <div class="sam-chat-body" id="samChatBody"></div>

      <!-- Input Area -->
      <div class="sam-chat-input-area">
        <form class="sam-input-form" id="samChatForm">
          <textarea
            id="samInputText"
            class="sam-chat-input"
            rows="1"
            placeholder="Ask Sam AI about courses, notes, excos..."
            aria-label="Ask Sam AI a question"
          ></textarea>
          <button type="submit" class="sam-send-btn" id="samSendBtn" title="Send Question">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
        <div class="sam-chat-disclaimer">
          Sam AI answers using official UNIZIK Statistics materials and records.
        </div>
      </div>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(windowEl);

    // Event Listeners
    launcher.addEventListener('click', toggleChat);
    document.getElementById('samCloseBtn').addEventListener('click', toggleChat);
    document.getElementById('samClearBtn').addEventListener('click', clearConversation);

    const form = document.getElementById('samChatForm');
    const input = document.getElementById('samInputText');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSend();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    // Global helper to open Sam AI from anywhere
    window.openSamAI = function(customPrompt) {
      if (!isOpen) toggleChat();
      if (customPrompt) {
        const input = document.getElementById('samInputText');
        if (input) {
          input.value = customPrompt;
          handleSend();
        }
      }
    };

    window.addEventListener('open-sam-ai', (e) => {
      const prompt = e.detail && e.detail.prompt;
      window.openSamAI(prompt);
    });

    renderMessages();
  }

  function toggleChat() {
    isOpen = !isOpen;
    const win = document.getElementById('samChatWindow');
    const launcher = document.getElementById('samAiLauncher');

    if (isOpen) {
      win.classList.add('sam-active');
      launcher.style.display = 'none';
      setTimeout(() => {
        document.getElementById('samInputText')?.focus();
        scrollToBottom();
      }, 150);
    } else {
      win.classList.remove('sam-active');
      launcher.style.display = 'flex';
    }
  }

  function clearConversation() {
    chatHistory = [
      {
        role: 'assistant',
        content: GREETING,
        sources: []
      }
    ];
    saveChatHistory(chatHistory);
    renderMessages();
  }

  function scrollToBottom() {
    const body = document.getElementById('samChatBody');
    if (body) {
      body.scrollTop = body.scrollHeight;
    }
  }

  // Escape HTML to prevent XSS
  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Lightweight markdown and newline renderer
  function formatReply(text) {
    let clean = escapeHTML(text);
    // Bold **text**
    clean = clean.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic *text*
    clean = clean.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Bullet points
    clean = clean.replace(/^\s*[-•]\s+(.+)$/gm, '<li style="margin-left:14px;">$1</li>');
    // Line breaks
    clean = clean.replace(/\n\n/g, '<div style="height:6px;"></div>');
    clean = clean.replace(/\n/g, '<br>');
    return clean;
  }

  function renderMessages() {
    const body = document.getElementById('samChatBody');
    if (!body) return;

    body.innerHTML = chatHistory.map((msg) => {
      const isUser = msg.role === 'user';
      const formatted = isUser ? escapeHTML(msg.content) : formatReply(msg.content);

      let sourcesHtml = '';
      if (!isUser && Array.isArray(msg.sources) && msg.sources.length > 0) {
        sourcesHtml = `
          <div class="sam-msg-sources">
            ${msg.sources.map(s => `
              <span class="sam-source-tag" title="Source: ${escapeHTML(s.fileName)}">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                <span>${escapeHTML(s.courseCode || 'Doc')} · ${escapeHTML(s.fileName)}</span>
              </span>
            `).join('')}
          </div>
        `;
      }

      return `
        <div class="sam-msg-wrap ${isUser ? 'sam-msg-user' : 'sam-msg-bot'}">
          <div class="sam-msg-bubble">
            ${formatted}
            ${sourcesHtml}
          </div>
        </div>
      `;
    }).join('');

    scrollToBottom();
  }

  async function handleSend() {
    if (isSending) return;
    const input = document.getElementById('samInputText');
    const sendBtn = document.getElementById('samSendBtn');
    const body = document.getElementById('samChatBody');
    const query = input.value.trim();

    if (!query) return;

    // Append user message
    chatHistory.push({ role: 'user', content: query });
    saveChatHistory(chatHistory);
    input.value = '';
    renderMessages();

    // Show typing indicator
    isSending = true;
    sendBtn.disabled = true;

    const typingEl = document.createElement('div');
    typingEl.className = 'sam-msg-wrap sam-msg-bot';
    typingEl.id = 'samTypingElement';
    typingEl.innerHTML = `
      <div class="sam-typing-indicator">
        <span class="sam-typing-dot"></span>
        <span class="sam-typing-dot"></span>
        <span class="sam-typing-dot"></span>
      </div>
    `;
    body.appendChild(typingEl);
    scrollToBottom();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: chatHistory.slice(-6)
        })
      });

      const data = await res.json();
      typingEl.remove();

      if (res.ok && data.reply) {
        chatHistory.push({
          role: 'assistant',
          content: data.reply,
          sources: data.sources || []
        });
      } else {
        chatHistory.push({
          role: 'assistant',
          content: data.error || "I'm sorry, I encountered a temporary problem reading the course materials. Please try asking again in a moment.",
          sources: []
        });
      }
    } catch (err) {
      typingEl?.remove();
      chatHistory.push({
        role: 'assistant',
        content: "Network connection error. Please verify your connection and try again.",
        sources: []
      });
    } finally {
      isSending = false;
      sendBtn.disabled = false;
      saveChatHistory(chatHistory);
      renderMessages();
      input.focus();
    }
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
