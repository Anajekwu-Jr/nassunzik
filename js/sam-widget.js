/**
 * Sam AI - Universal Study Companion Widget
 * Department of Statistics, Nnamdi Azikiwe University (UNIZIK)
 * Embeds a floating AI chat assistant on every portal page.
 */

(function () {
  if (window.__SAM_AI_INITIALIZED__) return;
  window.__SAM_AI_INITIALIZED__ = true;

  // Configuration and state
  const state = {
    isOpen: false,
    selectedCourse: '',
    studyMode: 'general',
    attachedFile: null, // { fileName, fileSize, mimeType, base64 }
    isRecording: false,
    isThinking: false,
    courses: [],
    messages: [
      {
        role: 'model',
        content: `**Hello Great NASSite!** I'm **Sam**, your official AI Study Companion for the Department of Statistics, UNIZIK. 🎓

I can help you:
- **Understand Lecture Notes & Formulas** (Probability, Regression, Biostatistics, C++, R, etc.)
- **Solve Exam & Past Questions** step-by-step
- **Analyze uploaded documents & PDFs**
- **Check course syllabus & timetable schedules**

Pick a course or type your question below. You can also tap the 🎙️ **mic** to speak or 📎 **attach a document**!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  };

  // Restore cached messages if any
  try {
    const saved = localStorage.getItem('sam_ai_widget_messages');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        state.messages = parsed;
      }
    }
  } catch (e) {
    // ignore
  }

  // Inject Styles
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    /* Sam AI Widget Floating Launcher */
    .sam-launcher-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9998;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #091e42 0%, #1e3a8a 60%, #b45309 100%);
      color: #ffffff;
      border: 1.5px solid rgba(245, 158, 11, 0.5);
      border-radius: 9999px;
      padding: 10px 18px 10px 12px;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.4), 0 0 15px rgba(245, 158, 11, 0.35);
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
    }
    .sam-launcher-btn:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 14px 28px -4px rgba(15, 23, 42, 0.5), 0 0 20px rgba(245, 158, 11, 0.5);
      border-color: #f59e0b;
    }
    .sam-launcher-btn:active {
      transform: translateY(0) scale(0.98);
    }
    .sam-launcher-avatar {
      position: relative;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #f59e0b;
      overflow: hidden;
      flex-shrink: 0;
    }
    .sam-launcher-avatar svg {
      width: 20px;
      height: 20px;
      color: #fbbf24;
    .sam-launcher-avatar {
      position: relative;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #091e42;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #f59e0b;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
    }
    .sam-launcher-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .sam-status-pulse {
      position: absolute;
      bottom: 1px;
      right: 1px;
      width: 10px;
      height: 10px;
      background: #10b981;
      border: 2px solid #091e42;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
    }
    .sam-launcher-label {
      display: flex;
      align-items: center;
      gap: 6px;
      line-height: 1;
    }
    .sam-launcher-name {
      font-size: 0.95rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: 0.02em;
    }
    .sam-launcher-bubble {
      background: #f59e0b;
      color: #091e42;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    /* Chat Drawer Container */
    .sam-drawer {
      position: fixed;
      bottom: 84px;
      right: 24px;
      width: 420px;
      max-width: calc(100vw - 32px);
      height: 620px;
      max-height: calc(100vh - 110px);
      background: var(--bg-card, #ffffff);
      color: var(--text-primary, #0f172a);
      border-radius: 18px;
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.08);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      opacity: 0;
      transform: translateY(16px) scale(0.96);
      pointer-events: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .sam-drawer.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    /* Dark theme support */
    [data-theme="dark"] .sam-drawer {
      background: #091322;
      color: #f8fafc;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 20px rgba(30, 58, 138, 0.3);
    }

    /* Header */
    .sam-drawer-header {
      background: linear-gradient(135deg, #091e42 0%, #1e3a8a 100%);
      color: #ffffff;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(245, 158, 11, 0.2);
    }
    .sam-drawer-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .sam-header-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #0f172a;
      border: 1.5px solid #f59e0b;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fbbf24;
      flex-shrink: 0;
      overflow: hidden;
    }
    .sam-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      border-radius: 50%;
    }
    .sam-drawer-title {
      font-size: 0.9375rem;
      font-weight: 700;
      margin: 0;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .sam-drawer-subtitle {
      font-size: 0.6875rem;
      color: #cbd5e1;
      margin: 0;
    }
    .sam-drawer-controls {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .sam-icon-btn {
      background: rgba(255, 255, 255, 0.12);
      border: none;
      color: #ffffff;
      width: 30px;
      height: 30px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .sam-icon-btn:hover {
      background: rgba(255, 255, 255, 0.22);
    }

    /* Course & Mode Selectors Bar */
    .sam-filter-bar {
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.03);
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      display: flex;
      gap: 8px;
      align-items: center;
    }
    [data-theme="dark"] .sam-filter-bar {
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .sam-course-select, .sam-mode-select {
      flex: 1;
      padding: 5px 8px;
      font-size: 0.75rem;
      border-radius: 6px;
      border: 1px solid rgba(0, 0, 0, 0.15);
      background: var(--bg-card, #ffffff);
      color: inherit;
      outline: none;
      font-weight: 500;
    }
    [data-theme="dark"] .sam-course-select, [data-theme="dark"] .sam-mode-select {
      background: #0f1c30;
      border-color: rgba(255, 255, 255, 0.15);
      color: #f1f5f9;
    }

    /* Messages Stream */
    .sam-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px 14px 8px 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }
    .sam-msg-row {
      display: flex;
      gap: 8px;
      max-width: 90%;
    }
    .sam-msg-row.user {
      align-self: flex-end;
      flex-direction: row-reverse;
    }
    .sam-msg-row.model {
      align-self: flex-start;
    }
    .sam-msg-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #0f172a;
      border: 1.5px solid #f59e0b;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fbbf24;
      flex-shrink: 0;
      margin-top: 2px;
      overflow: hidden;
    }
    .sam-msg-bubble {
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 0.84rem;
      line-height: 1.5;
      word-break: break-word;
      position: relative;
    }
    .sam-msg-row.user .sam-msg-bubble {
      background: #1e3a8a;
      color: #ffffff;
      border-bottom-right-radius: 3px;
    }
    .sam-msg-row.model .sam-msg-bubble {
      background: rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(0, 0, 0, 0.06);
      color: inherit;
      border-bottom-left-radius: 3px;
    }
    [data-theme="dark"] .sam-msg-row.model .sam-msg-bubble {
      background: #0f1a2e;
      border-color: rgba(255, 255, 255, 0.08);
    }
    .sam-msg-time {
      font-size: 0.625rem;
      color: rgba(0, 0, 0, 0.4);
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    [data-theme="dark"] .sam-msg-time {
      color: rgba(255, 255, 255, 0.4);
    }
    .sam-msg-row.user .sam-msg-time {
      color: rgba(255, 255, 255, 0.7);
      justify-content: flex-end;
    }

    /* Markdown inside bubbles */
    .sam-msg-bubble p { margin: 0 0 8px 0; }
    .sam-msg-bubble p:last-child { margin-bottom: 0; }
    .sam-msg-bubble strong { font-weight: 700; color: inherit; }
    .sam-msg-bubble code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.78rem;
      background: rgba(0, 0, 0, 0.07);
      padding: 1px 4px;
      border-radius: 4px;
    }
    [data-theme="dark"] .sam-msg-bubble code {
      background: rgba(255, 255, 255, 0.1);
    }
    .sam-msg-bubble pre {
      background: #0f172a;
      color: #e2e8f0;
      padding: 10px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 0.75rem;
      margin: 8px 0;
    }
    .sam-msg-bubble pre code {
      background: transparent;
      padding: 0;
      color: inherit;
    }
    .sam-msg-bubble ul, .sam-msg-bubble ol {
      margin: 4px 0 8px 18px;
      padding: 0;
    }
    .sam-msg-bubble li { margin-bottom: 3px; }

    /* Speaking icon */
    .sam-speak-btn {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      margin-left: 6px;
    }
    .sam-speak-btn:hover {
      color: #f59e0b;
    }

    /* Thinking Indicator */
    .sam-thinking {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.04);
      border-radius: 12px;
      font-size: 0.75rem;
      color: var(--text-secondary, #64748b);
    }
    [data-theme="dark"] .sam-thinking {
      background: #0f1a2e;
      color: #94a3b8;
    }
    .sam-dot {
      width: 6px;
      height: 6px;
      background: #f59e0b;
      border-radius: 50%;
      animation: samBounce 1.4s infinite ease-in-out both;
    }
    .sam-dot:nth-child(1) { animation-delay: -0.32s; }
    .sam-dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes samBounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    /* Suggested Chips */
    .sam-suggestions {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding: 6px 12px;
      background: rgba(0, 0, 0, 0.02);
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      scrollbar-width: none;
    }
    .sam-suggestions::-webkit-scrollbar { display: none; }
    .sam-chip {
      white-space: nowrap;
      font-size: 0.71875rem;
      padding: 4px 10px;
      border-radius: 9999px;
      background: rgba(0, 0, 0, 0.05);
      color: inherit;
      border: 1px solid rgba(0, 0, 0, 0.08);
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }
    [data-theme="dark"] .sam-chip {
      background: #0f1c30;
      border-color: rgba(255, 255, 255, 0.1);
    }
    .sam-chip:hover {
      background: #f59e0b;
      color: #ffffff;
      border-color: #f59e0b;
    }

    /* Attached Document Pill */
    .sam-attachment-preview {
      display: none;
      align-items: center;
      justify-content: space-between;
      margin: 6px 12px 0 12px;
      padding: 6px 10px;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 8px;
      font-size: 0.75rem;
      color: inherit;
    }
    .sam-attachment-preview.show { display: flex; }
    .sam-attachment-info {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .sam-remove-attachment {
      background: none;
      border: none;
      color: #ef4444;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: bold;
      padding: 0 4px;
    }

    /* Voice Recording Banner */
    .sam-voice-recording-banner {
      display: none;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: #fee2e2;
      color: #991b1b;
      font-size: 0.75rem;
      font-weight: 600;
      border-top: 1px solid #fca5a5;
    }
    [data-theme="dark"] .sam-voice-recording-banner {
      background: #450a0a;
      color: #fecaca;
      border-color: #7f1d1d;
    }
    .sam-voice-recording-banner.active { display: flex; }
    .sam-recording-pulse {
      width: 8px;
      height: 8px;
      background: #ef4444;
      border-radius: 50%;
      animation: pulseRecord 1s infinite;
    }
    @keyframes pulseRecord {
      0% { transform: scale(0.9); opacity: 0.8; }
      50% { transform: scale(1.3); opacity: 1; }
      100% { transform: scale(0.9); opacity: 0.8; }
    }

    /* Input Bar */
    .sam-input-bar {
      padding: 10px 12px;
      display: flex;
      align-items: flex-end;
      gap: 6px;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
      background: var(--bg-card, #ffffff);
    }
    [data-theme="dark"] .sam-input-bar {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: #091322;
    }
    .sam-tool-btn {
      background: transparent;
      border: none;
      color: #64748b;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }
    .sam-tool-btn:hover {
      background: rgba(0, 0, 0, 0.06);
      color: #0f172a;
    }
    [data-theme="dark"] .sam-tool-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }
    .sam-tool-btn.active {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.15);
    }
    .sam-textarea {
      flex: 1;
      resize: none;
      border: 1px solid rgba(0, 0, 0, 0.15);
      border-radius: 12px;
      padding: 8px 12px;
      font-size: 0.84rem;
      font-family: inherit;
      line-height: 1.4;
      max-height: 100px;
      min-height: 36px;
      background: transparent;
      color: inherit;
      outline: none;
    }
    [data-theme="dark"] .sam-textarea {
      border-color: rgba(255, 255, 255, 0.15);
    }
    .sam-textarea:focus {
      border-color: #f59e0b;
      box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
    }
    .sam-send-btn {
      background: #1e3a8a;
      color: #ffffff;
      border: none;
      padding: 0 10px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
      gap: 3px;
      font-weight: 700;
    }
    .sam-send-btn:hover:not(:disabled) {
      background: #f59e0b;
      transform: translateY(-1px);
    }
    .sam-send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    @media (max-width: 480px) {
      .sam-drawer {
        right: 12px;
        bottom: 80px;
        width: calc(100vw - 24px);
        height: calc(100vh - 100px);
      }
      .sam-launcher-btn {
        right: 16px;
        bottom: 16px;
        padding: 8px 14px 8px 10px;
      }
    }
  `;
  document.head.appendChild(styleEl);

  // Simple Markdown Formatter
  function formatMarkdown(text) {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks
    html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold & Italics
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h4 style="margin: 8px 0 4px 0; font-size: 0.95rem; font-weight:700;">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 style="margin: 10px 0 4px 0; font-size: 1.05rem; font-weight:700;">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 style="margin: 12px 0 6px 0; font-size: 1.15rem; font-weight:700;">$1</h2>');

    // Bullet lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Line breaks to paragraphs
    const paragraphs = html.split(/\n{2,}/).map(p => {
      if (p.startsWith('<pre>') || p.startsWith('<ul>') || p.startsWith('<h')) return p;
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    });

    return paragraphs.join('');
  }

  // Create Launcher Button
  const launcher = document.createElement('div');
  launcher.className = 'sam-launcher-btn';
  launcher.id = 'samLauncherBtn';
  launcher.setAttribute('role', 'button');
  launcher.setAttribute('aria-label', 'Ask Sam - AI Study Companion');
  launcher.innerHTML = `
    <div class="sam-launcher-avatar">
      <img src="/resources/images/sam_avatar.jpg" alt="Sam AI" class="sam-avatar-img" onerror="this.style.display='none'">
      <div class="sam-status-pulse"></div>
    </div>
    <div class="sam-launcher-label">
      <span class="sam-launcher-name">Ask Sam</span>
      <span class="sam-launcher-bubble">AI</span>
    </div>
  `;
  document.body.appendChild(launcher);

  // Create Chat Drawer
  const drawer = document.createElement('div');
  drawer.className = 'sam-drawer';
  drawer.id = 'samDrawer';
  drawer.innerHTML = `
    <!-- Drawer Header -->
    <div class="sam-drawer-header">
      <div class="sam-drawer-title-group">
        <div class="sam-header-avatar">
          <img src="/resources/images/sam_avatar.jpg" alt="Sam AI" class="sam-avatar-img" onerror="this.style.display='none'">
        </div>
        <div>
          <h3 class="sam-drawer-title">
            Sam AI
            <span class="sam-badge-pill">Online</span>
          </h3>
          <p class="sam-drawer-subtitle">Department of Statistics · UNIZIK</p>
        </div>
      </div>
      <div class="sam-drawer-controls">
        <a href="/sam.html" class="sam-icon-btn" title="Open Full Screen AI Workspace" aria-label="Fullscreen">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </a>
        <button type="button" class="sam-icon-btn" id="samClearBtn" title="Clear Conversation" aria-label="Clear chat">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
        <button type="button" class="sam-icon-btn" id="samCloseBtn" title="Close" aria-label="Close">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- Course & Mode Selectors -->
    <div class="sam-filter-bar">
      <select class="sam-course-select" id="samCourseSelect" title="Select a course to focus discussions on">
        <option value="">🎓 All Departmental Knowledge</option>
      </select>
      <select class="sam-mode-select" id="samModeSelect" title="Select Study Mode">
        <option value="general">💬 General Q&A</option>
        <option value="explain">💡 Explain Concept</option>
        <option value="quiz">📝 Practice Quiz</option>
        <option value="exam_prep">📚 Exam & Past Questions</option>
        <option value="code_help">💻 R / Python / C++</option>
      </select>
    </div>

    <!-- Messages Container -->
    <div class="sam-messages" id="samMessages"></div>

    <!-- Suggested Chips -->
    <div class="sam-suggestions" id="samSuggestions">
      <button type="button" class="sam-chip" data-query="Explain Bayes' Theorem step-by-step with an example">💡 Bayes' Theorem</button>
      <button type="button" class="sam-chip" data-query="What lecture materials and notes do we have on this portal?">📂 Portal Notes</button>
      <button type="button" class="sam-chip" data-query="Give me 3 practice quiz questions on STA 111 Probability">📝 Quiz me on STA 111</button>
      <button type="button" class="sam-chip" data-query="How does the UNIZIK 5.0 CGPA system work?">📊 5.0 CGPA Scale</button>
      <button type="button" class="sam-chip" data-query="Explain C++ dynamic memory pointers in COS 201">💻 COS 201 C++</button>
    </div>

    <!-- Attached Document Banner -->
    <div class="sam-attachment-preview" id="samAttachmentPreview">
      <div class="sam-attachment-info">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        <span id="samAttachmentName" style="font-weight:600;">document.pdf</span>
        <span id="samAttachmentSize" style="opacity:0.7;">(0 KB)</span>
      </div>
      <button type="button" class="sam-remove-attachment" id="samRemoveAttachment" title="Remove attached document">&times;</button>
    </div>

    <!-- Live Voice Recording Banner -->
    <div class="sam-voice-recording-banner" id="samVoiceBanner">
      <div class="sam-recording-pulse"></div>
      <span id="samVoiceStatus">Listening... Speak your question now</span>
    </div>

    <!-- Input Bar -->
    <div class="sam-input-bar">
      <!-- Hidden file input -->
      <input type="file" id="samFileInput" accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg" style="display: none;">
      
      <button type="button" class="sam-tool-btn" id="samAttachBtn" title="Attach lecture note, PDF, or homework image" aria-label="Attach file">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
        </svg>
      </button>

      <button type="button" class="sam-tool-btn" id="samVoiceBtn" title="Voice dictation (click to speak)" aria-label="Voice input">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="22"></line>
        </svg>
      </button>

      <textarea class="sam-textarea" id="samTextarea" rows="1" placeholder="Ask Sam anything... (Press Tab to send)"></textarea>

      <button type="button" class="sam-send-btn" id="samSendBtn" aria-label="Send message (Tab)" title="Send message (Press Tab)">
        <span style="font-size: 0.65rem; font-weight: 800; letter-spacing: 0.03em;">TAB</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  `;
  document.body.appendChild(drawer);

  // Elements
  const messagesContainer = document.getElementById('samMessages');
  const textarea = document.getElementById('samTextarea');
  const sendBtn = document.getElementById('samSendBtn');
  const closeBtn = document.getElementById('samCloseBtn');
  const clearBtn = document.getElementById('samClearBtn');
  const attachBtn = document.getElementById('samAttachBtn');
  const fileInput = document.getElementById('samFileInput');
  const voiceBtn = document.getElementById('samVoiceBtn');
  const courseSelect = document.getElementById('samCourseSelect');
  const modeSelect = document.getElementById('samModeSelect');
  const attachmentPreview = document.getElementById('samAttachmentPreview');
  const attachmentName = document.getElementById('samAttachmentName');
  const attachmentSize = document.getElementById('samAttachmentSize');
  const removeAttachmentBtn = document.getElementById('samRemoveAttachment');
  const voiceBanner = document.getElementById('samVoiceBanner');
  const suggestionsBox = document.getElementById('samSuggestions');

  // Load Courses for Dropdown
  async function loadCourses() {
    try {
      const res = await fetch('/api/sam/courses');
      if (res.ok) {
        state.courses = await res.json();
        courseSelect.innerHTML = '<option value="">🎓 All Departmental Knowledge</option>';
        state.courses.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.code;
          opt.textContent = `${c.code}: ${c.title} (${c.resources_count} materials)`;
          courseSelect.appendChild(opt);
        });
      }
    } catch (err) {
      console.warn('Could not load Sam courses:', err);
    }
  }
  loadCourses();

  // Render Messages
  function renderMessages() {
    messagesContainer.innerHTML = state.messages.map((m, idx) => {
      const isUser = m.role === 'user';
      return `
        <div class="sam-msg-row ${isUser ? 'user' : 'model'}">
          ${!isUser ? `
            <div class="sam-msg-avatar">
              <img src="/resources/images/sam_avatar.jpg" alt="Sam AI" class="sam-avatar-img" onerror="this.style.display='none'">
            </div>
          ` : ''}
          <div class="sam-msg-bubble">
            ${formatMarkdown(m.content)}
            <div class="sam-msg-time">
              <span>${m.timestamp || ''}</span>
              ${!isUser ? `
                <button type="button" class="sam-speak-btn" data-idx="${idx}" title="Listen to this explanation">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach speak button handlers
    messagesContainer.querySelectorAll('.sam-speak-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const msg = state.messages[idx];
        if (msg && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const cleanText = msg.content.replace(/[*#`_]/g, '');
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      });
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Toggle Drawer
  function toggleDrawer() {
    state.isOpen = !state.isOpen;
    if (state.isOpen) {
      drawer.classList.add('open');
      renderMessages();
      textarea.focus();
    } else {
      drawer.classList.remove('open');
    }
  }

  launcher.addEventListener('click', toggleDrawer);
  closeBtn.addEventListener('click', toggleDrawer);

  // Clear Chat
  clearBtn.addEventListener('click', () => {
    if (confirm('Clear chat history with Sam?')) {
      state.messages = [state.messages[0]];
      localStorage.removeItem('sam_ai_widget_messages');
      renderMessages();
    }
  });

  // Course & Mode Change
  courseSelect.addEventListener('change', (e) => {
    state.selectedCourse = e.target.value;
  });
  modeSelect.addEventListener('change', (e) => {
    state.studyMode = e.target.value;
  });

  // Auto-resize Textarea
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
  });

  // Tab key or Enter sends message
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      sendMessage();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  // Suggestions click
  suggestionsBox.addEventListener('click', (e) => {
    const chip = e.target.closest('.sam-chip');
    if (chip) {
      const q = chip.getAttribute('data-query');
      if (q) {
        textarea.value = q;
        sendMessage();
      }
    }
  });

  // File Upload Handling
  attachBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);

    attachmentPreview.classList.add('show');
    attachmentName.textContent = 'Uploading ' + file.name + '...';
    attachmentSize.textContent = `(${(file.size / 1024).toFixed(0)} KB)`;

    try {
      const res = await fetch('/api/sam/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        state.attachedFile = {
          fileName: data.fileName,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
          base64: data.base64
        };
        attachmentName.textContent = data.fileName;
        attachmentSize.textContent = `(${(data.fileSize / 1024).toFixed(0)} KB)`;
      } else {
        alert(data.error || 'Failed to upload document');
        attachmentPreview.classList.remove('show');
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
      attachmentPreview.classList.remove('show');
    }
    fileInput.value = '';
  });

  removeAttachmentBtn.addEventListener('click', () => {
    state.attachedFile = null;
    attachmentPreview.classList.remove('show');
  });

  // Voice Dictation (Web Speech API with graceful fallback to server transcription)
  let speechRecognition = null;
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  voiceBtn.addEventListener('click', () => {
    if (state.isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  });

  function startVoiceRecording() {
    if (SpeechRec) {
      try {
        speechRecognition = new SpeechRec();
        speechRecognition.continuous = false;
        speechRecognition.interimResults = true;
        speechRecognition.lang = 'en-NG'; // Nigerian English or en-US

        speechRecognition.onstart = () => {
          state.isRecording = true;
          voiceBtn.classList.add('active');
          voiceBanner.classList.add('active');
          document.getElementById('samVoiceStatus').textContent = 'Listening to your question...';
        };

        speechRecognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          textarea.value = transcript;
          textarea.style.height = 'auto';
          textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
        };

        speechRecognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error);
          stopVoiceRecording();
        };

        speechRecognition.onend = () => {
          stopVoiceRecording();
        };

        speechRecognition.start();
      } catch (err) {
        fallbackAudioRecorder();
      }
    } else {
      fallbackAudioRecorder();
    }
  }

  function stopVoiceRecording() {
    state.isRecording = false;
    voiceBtn.classList.remove('active');
    voiceBanner.classList.remove('active');
    if (speechRecognition) {
      try { speechRecognition.stop(); } catch (e) {}
    }
  }

  // Fallback MediaRecorder for devices without Web Speech API
  let mediaRecorder = null;
  let audioChunks = [];
  async function fallbackAudioRecorder() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Microphone access is not supported on this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice_query.webm');

        document.getElementById('samVoiceStatus').textContent = 'Transcribing with Sam AI...';
        try {
          const res = await fetch('/api/sam/transcribe', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.text) {
            textarea.value = data.text;
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
          }
        } catch (e) {
          console.warn('Voice transcribe error:', e);
        }
        stopVoiceRecording();
      };

      state.isRecording = true;
      voiceBtn.classList.add('active');
      voiceBanner.classList.add('active');
      document.getElementById('samVoiceStatus').textContent = 'Recording audio... Click mic again to finish.';
      mediaRecorder.start();
    } catch (err) {
      alert('Could not access microphone: ' + err.message);
      stopVoiceRecording();
    }
  }

  // Send Message to Sam AI
  async function sendMessage() {
    const text = textarea.value.trim();
    if (!text && !state.attachedFile) return;
    if (state.isThinking) return;

    if (state.isRecording) {
      stopVoiceRecording();
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userDisplayMsg = state.attachedFile
      ? `📎 **[Attached: ${state.attachedFile.fileName}]**\n\n${text}`
      : text;

    // Add user message
    state.messages.push({
      role: 'user',
      content: userDisplayMsg,
      timestamp: timeStr
    });

    textarea.value = '';
    textarea.style.height = 'auto';
    renderMessages();

    // Show thinking indicator
    state.isThinking = true;
    sendBtn.disabled = true;
    const thinkingRow = document.createElement('div');
    thinkingRow.className = 'sam-msg-row model';
    thinkingRow.id = 'samThinkingIndicator';
    thinkingRow.innerHTML = `
      <div class="sam-msg-avatar">
        <img src="/resources/images/sam_avatar.jpg" alt="Sam AI" class="sam-avatar-img" onerror="this.style.display='none'">
      </div>
      <div class="sam-thinking">
        <span>Sam is thinking</span>
        <div class="sam-dot"></div>
        <div class="sam-dot"></div>
        <div class="sam-dot"></div>
      </div>
    `;
    messagesContainer.appendChild(thinkingRow);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Payload
    const payload = {
      message: text,
      courseCode: state.selectedCourse || undefined,
      studyMode: state.studyMode,
      conversationHistory: state.messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      uploadedFile: state.attachedFile || null
    };

    // Reset attached file UI
    state.attachedFile = null;
    attachmentPreview.classList.remove('show');

    try {
      const res = await fetch('/api/sam/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      thinkingRow.remove();

      if (data.reply) {
        state.messages.push({
          role: 'model',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      } else {
        state.messages.push({
          role: 'model',
          content: `⚠️ ${data.error || 'I had a momentary glitch contacting the AI engine. Please try asking again!'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    } catch (err) {
      thinkingRow.remove();
      state.messages.push({
        role: 'model',
        content: `⚠️ Network error: Could not reach Sam AI. Please check your connection.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } finally {
      state.isThinking = false;
      sendBtn.disabled = false;
      renderMessages();

      // Cache messages
      try {
        localStorage.setItem('sam_ai_widget_messages', JSON.stringify(state.messages.slice(-15)));
      } catch (e) {}
    }
  }

  // Export API for external triggers (e.g. from course cards)
  window.SamAI = {
    openWithCourse: (courseCode, initialQuestion) => {
      if (!state.isOpen) toggleDrawer();
      if (courseCode) {
        state.selectedCourse = courseCode;
        if (courseSelect) courseSelect.value = courseCode;
      }
      if (initialQuestion && textarea) {
        textarea.value = initialQuestion;
        sendMessage();
      }
    },
    open: () => {
      if (!state.isOpen) toggleDrawer();
    }
  };

})();
