/**
 * Sam AI - Floating Chat Widget
 * Friendly study companion for statistics students at the NASS portal
 */
(function() {
  if (window.SamAIWidgetLoaded) return;
  window.SamAIWidgetLoaded = true;

  const GREETING = "Hey! I'm Sam AI, your statistics companion. Ask me about your courses, past questions, or anything about the department. What are we studying today?";
  const STORAGE_KEY = 'nass_sam_ai_chat_history_v2';

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
        content: GREETING
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
    launcher.setAttribute('aria-label', 'Ask Sam');
    launcher.innerHTML = `
      <div class="sam-launcher-bubble">
        <span>Ask Sam</span>
        <div class="sam-launcher-bubble-tail"></div>
      </div>
      <div class="sam-launcher-img-wrap">
        <img src="/resources/images/sam-ai.jpg" alt="SAM AI" class="sam-launcher-img" />
        <span class="sam-launcher-online-dot"></span>
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
            <img src="/resources/images/sam-ai.jpg" alt="SAM AI" class="sam-avatar-img" />
          </div>
          <div>
            <div class="sam-header-title">
              <span>SAM AI</span>
            </div>
            <div class="sam-header-status">
              <span>Friendly Study Companion · Department of Statistics</span>
            </div>
          </div>
        </div>
        <div class="sam-header-actions">
          <button type="button" class="sam-action-btn" id="samClearBtn" title="Reset conversation">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
          </button>
          <button type="button" class="sam-action-btn" id="samCloseBtn" title="Minimize SAM AI">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
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
            placeholder="Ask Sam AI about courses, notes, excos, events..."
            aria-label="Ask Sam AI a question"
          ></textarea>
          <button type="submit" class="sam-send-btn" id="samSendBtn" title="Send Question">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
        <div class="sam-chat-disclaimer">
          Sam AI is your statistics study companion.
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
    // Backwards-compatible alias for any callers
    window.openGeminiAI = window.openSamAI;

    window.addEventListener('open-sam-ai', (e) => {
      const prompt = e.detail && e.detail.prompt;
      window.openSamAI(prompt);
    });
    window.addEventListener('open-gemini-ai', (e) => {
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
        content: GREETING
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

      return `
        <div class="sam-msg-wrap ${isUser ? 'sam-msg-user' : 'sam-msg-bot'}">
          <div class="sam-msg-bubble">
            ${formatted}
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
          content: data.reply
        });
      } else {
        chatHistory.push({
          role: 'assistant',
          content: data.error || "I don't have that exact detail right now. Could you check with the department or an executive officer? What else are we studying today?"
        });
      }
    } catch (err) {
      typingEl?.remove();
      chatHistory.push({
        role: 'assistant',
        content: "Network connection error. Please verify your connection and try again."
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
