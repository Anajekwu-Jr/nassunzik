import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {
  Sparkles,
  X,
  Send,
  Mic,
  Paperclip,
  Trash2,
  Volume2,
  ExternalLink,
  BookOpen,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Loader2,
  Check
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderMathMarkdown(content: string): string {
  if (!content) return '';

  // 1. Protect code blocks from math and markdown parsing
  const codeBlocks: string[] = [];
  let processed = content.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre class="p-2.5 my-2 rounded-lg bg-slate-900 text-slate-100 overflow-x-auto text-xs font-mono border border-slate-700/60"><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`);
    return `__CODE_BLOCK_${idx}__`;
  });

  // Protect inline code
  const inlineCodes: string[] = [];
  processed = processed.replace(/`([^`]+)`/g, (_, code) => {
    const idx = inlineCodes.length;
    inlineCodes.push(`<code class="px-1.5 py-0.5 rounded bg-black/30 text-amber-300 text-xs font-mono">${escapeHtml(code)}</code>`);
    return `__INLINE_CODE_${idx}__`;
  });

  // 2. Render and protect Display Math: $$ ... $$ or \[ ... \]
  const mathBlocks: string[] = [];
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    const idx = mathBlocks.length;
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      mathBlocks.push(`<div class="katex-display my-2.5 overflow-x-auto py-1 text-center bg-black/10 dark:bg-black/20 rounded-lg p-2">${rendered}</div>`);
    } catch {
      mathBlocks.push(`<div class="font-mono text-center my-2 text-amber-300">$$${escapeHtml(math)}$$</div>`);
    }
    return `__MATH_BLOCK_${idx}__`;
  });

  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    const idx = mathBlocks.length;
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      mathBlocks.push(`<div class="katex-display my-2.5 overflow-x-auto py-1 text-center bg-black/10 dark:bg-black/20 rounded-lg p-2">${rendered}</div>`);
    } catch {
      mathBlocks.push(`<div class="font-mono text-center my-2 text-amber-300">\\[${escapeHtml(math)}\\]</div>`);
    }
    return `__MATH_BLOCK_${idx}__`;
  });

  // 3. Render and protect Inline Math: $ ... $ (exclude standalone $) or \( ... \)
  const inlineMaths: string[] = [];
  processed = processed.replace(/(^|[^\\])\$([^\$\n]+?)\$/g, (_, prefix, math) => {
    const idx = inlineMaths.length;
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      inlineMaths.push(rendered);
    } catch {
      inlineMaths.push(`$${escapeHtml(math)}$`);
    }
    return `${prefix}__INLINE_MATH_${idx}__`;
  });

  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
    const idx = inlineMaths.length;
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      inlineMaths.push(rendered);
    } catch {
      inlineMaths.push(`\\(${escapeHtml(math)}\\)`);
    }
    return `__INLINE_MATH_${idx}__`;
  });

  // 4. Markdown typography: Bold, Italics, Headers
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-amber-400 dark:text-amber-300">$1</strong>');
  processed = processed.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

  // Headers
  processed = processed.replace(/^### (.*$)/gim, '<h4 class="text-xs font-bold mt-2.5 mb-1 text-amber-400">$1</h4>');
  processed = processed.replace(/^## (.*$)/gim, '<h3 class="text-sm font-bold mt-3 mb-1 text-amber-400">$1</h3>');
  processed = processed.replace(/^# (.*$)/gim, '<h2 class="text-base font-bold mt-3.5 mb-1.5 text-amber-400">$1</h2>');

  // Bullet points
  processed = processed.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4 list-disc">$1</li>');
  processed = processed.replace(/(<li class="ml-4 list-disc">[\s\S]*?<\/li>)/g, (match) => {
    return `<ul class="my-1 space-y-0.5">${match}</ul>`;
  });

  // Restore protected items
  mathBlocks.forEach((block, i) => {
    processed = processed.replace(`__MATH_BLOCK_${i}__`, block);
  });
  inlineMaths.forEach((math, i) => {
    processed = processed.replace(`__INLINE_MATH_${i}__`, math);
  });
  inlineCodes.forEach((code, i) => {
    processed = processed.replace(`__INLINE_CODE_${i}__`, code);
  });
  codeBlocks.forEach((block, i) => {
    processed = processed.replace(`__CODE_BLOCK_${i}__`, block);
  });

  // Line breaks to paragraphs
  const paragraphs = processed.split(/\n{2,}/).map(p => {
    if (p.startsWith('<pre') || p.startsWith('<ul') || p.startsWith('<h') || p.startsWith('<div class="katex-display')) {
      return p;
    }
    return `<p class="mb-1.5 leading-relaxed">${p.replace(/\n/g, '<br/>')}</p>`;
  });

  return paragraphs.join('');
}

export const SamAiModal: React.FC = () => {
  const {
    samOpen,
    setSamOpen,
    samInitialCourse,
    theme,
    triggerHaptic
  } = useApp();

  const isLight = theme === 'light';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: `**Hello Great NASSite!** I'm **Sam**, your official AI Study Companion for the Department of Statistics, UNIZIK.\n\nAsk me about courses, lecture notes, formulas, past examination papers, or upload a document to discuss!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [studyMode, setStudyMode] = useState<string>('general');
  const [courses, setCourses] = useState<any[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{
    fileName: string;
    fileSize: number;
    mimeType: string;
    base64: string;
    fileUrl?: string;
  } | null>(null);

  const [feedbackGiven, setFeedbackGiven] = useState<{ [msgIdx: number]: 'up' | 'down' | 'learned' }>({});
  const [teachModalIdx, setTeachModalIdx] = useState<number | null>(null);
  const [correctionText, setCorrectionText] = useState('');
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecRef = useRef<any>(null);

  // Load courses
  useEffect(() => {
    fetch('/api/sam/courses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCourses(data);
      })
      .catch(() => {});
  }, []);

  // When samInitialCourse changes, update selectedCourse
  useEffect(() => {
    if (samInitialCourse) {
      setSelectedCourse(samInitialCourse);
    }
  }, [samInitialCourse]);

  // Scroll to bottom
  useEffect(() => {
    if (samOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, samOpen]);

  if (!samOpen) return null;

  const handleSend = async () => {
    const text = input.trim();
    if (!text && !attachedFile) return;
    if (isThinking || isUploading) return;

    triggerHaptic();

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userDisplayMsg = attachedFile
      ? `📎 **[Attached: ${attachedFile.fileName}]**\n\n${text || 'Please analyze this uploaded document.'}`
      : text;

    const newMsgs: ChatMessage[] = [
      ...messages,
      { role: 'user', content: userDisplayMsg, timestamp: time }
    ];
    setMessages(newMsgs);
    setInput('');
    setIsThinking(true);

    const payload = {
      message: text || 'Please analyze this uploaded document in detail and solve any questions or statistics problems contained in it.',
      courseCode: selectedCourse || undefined,
      studyMode,
      conversationHistory: newMsgs.map(m => ({ role: m.role, content: m.content })),
      uploadedFile: attachedFile
    };

    setAttachedFile(null);

    try {
      const res = await fetch('/api/sam/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [
          ...prev,
          {
            role: 'model',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'model',
            content: `⚠️ ${data.error || 'Glitch connecting to Sam AI.'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: '⚠️ Network connection issue. Please check your data and retry.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Immediate client-side file reading with server persistence
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic();
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;

      setAttachedFile({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        base64: base64
      });
      setIsUploading(false);

      // Also upload to server in parallel for server storage
      try {
        const formData = new FormData();
        formData.append('document', file);
        fetch('/api/sam/upload', {
          method: 'POST',
          body: formData
        })
          .then(r => r.json())
          .then(data => {
            if (data.success && data.fileUrl) {
              setAttachedFile(prev => prev ? { ...prev, fileUrl: data.fileUrl } : null);
            }
          })
          .catch(() => {});
      } catch (_) {}
    };

    reader.onerror = () => {
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Feedback & Learning from Student Responses
  const handleFeedback = async (idx: number, isHelpful: boolean) => {
    triggerHaptic();
    setFeedbackGiven(prev => ({ ...prev, [idx]: isHelpful ? 'up' : 'down' }));
    try {
      await fetch('/api/sam/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isHelpful,
          originalAnswer: messages[idx]?.content
        })
      });
    } catch (_) {}
  };

  const handleTeachSamSubmit = async (idx: number) => {
    if (!correctionText.trim()) return;
    setIsSubmittingCorrection(true);
    triggerHaptic();

    try {
      const res = await fetch('/api/sam/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedCourse || 'Department & Academic Knowledge',
          question: messages[idx - 1]?.content || 'Student update',
          learnedFact: correctionText.trim(),
          sourceUser: 'Student Community'
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackGiven(prev => ({ ...prev, [idx]: 'learned' }));
        setMessages(prev => [
          ...prev,
          {
            role: 'model',
            content: `🎓 **Thank you Great NASSite!**\n\nI have learned and saved your correction: *"${correctionText.trim()}"* into my UNIZIK Statistics knowledge base! I will use this to accurately assist you and all students.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setCorrectionText('');
        setTeachModalIdx(null);
      }
    } catch (_) {}
    setIsSubmittingCorrection(false);
  };

  const toggleVoiceRecording = () => {
    triggerHaptic();
    const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (isRecording) {
      setIsRecording(false);
      if (speechRecRef.current) {
        try { speechRecRef.current.stop(); } catch (e) {}
      }
      return;
    }

    if (SpeechClass) {
      try {
        const recognition = new SpeechClass();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-NG';

        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          setInput(transcript);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);

        speechRecRef.current = recognition;
        recognition.start();
      } catch (err) {
        alert('Voice recognition unavailable. Please type your question.');
      }
    } else {
      alert('Speech recognition is not supported on this device/browser.');
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*#`_]/g, '');
      const ut = new SpeechSynthesisUtterance(clean);
      window.speechSynthesis.speak(ut);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg mx-auto h-[90vh] flex flex-col rounded-t-3xl shadow-2xl border-t transition-colors overflow-hidden ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#091322] border-blue-900/60 text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`px-4 py-3.5 border-b flex items-center justify-between ${
            isLight
              ? 'bg-gradient-to-r from-slate-900 to-blue-950 text-white'
              : 'bg-gradient-to-r from-[#061226] to-[#0d2346] text-white border-blue-900/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-amber-500 overflow-hidden relative shrink-0 shadow-sm">
              <img
                src="/resources/images/sam_avatar.jpg"
                alt="Sam AI"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/resources/images/nass-logo.jpg';
                }}
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-slate-900 rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold leading-tight">Sam AI</h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-semibold uppercase">
                  Study Companion
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">NASS UNIZIK Department of Statistics</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <a
              href="/sam.html"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Open Fullscreen Workspace"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                if (confirm('Clear chat history?')) {
                  setMessages([messages[0]]);
                }
              }}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Clear Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setSamOpen(false);
              }}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Course & Mode Bar */}
        <div
          className={`px-3 py-2 border-b flex items-center gap-2 text-xs ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0f1c30] border-blue-900/40'
          }`}
        >
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className={`flex-1 py-1 px-2 rounded-md border text-xs font-medium outline-none ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900'
                : 'bg-[#091322] border-blue-800 text-slate-100'
            }`}
          >
            <option value="">🎓 All Departmental Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.code}>
                {c.code}: {c.title} ({c.resources_count} items)
              </option>
            ))}
          </select>

          <select
            value={studyMode}
            onChange={(e) => setStudyMode(e.target.value)}
            className={`py-1 px-2 rounded-md border text-xs font-medium outline-none ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900'
                : 'bg-[#091322] border-blue-800 text-slate-100'
            }`}
          >
            <option value="general">💬 General Q&A</option>
            <option value="explain">💡 Explain Concept</option>
            <option value="quiz">📝 Quiz Me</option>
            <option value="exam_prep">📚 Exam Prep</option>
            <option value="code_help">💻 Code Help</option>
          </select>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-sm">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div key={idx} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-slate-900 border border-amber-500 overflow-hidden shrink-0 mt-0.5 shadow-xs">
                    <img
                      src="/resources/images/sam_avatar.jpg"
                      alt="Sam AI"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/resources/images/nass-logo.jpg';
                      }}
                    />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-[13px] ${
                    isUser
                      ? 'bg-blue-900 text-white rounded-br-xs'
                      : isLight
                      ? 'bg-slate-100 text-slate-900 border border-slate-200/80 rounded-bl-xs'
                      : 'bg-[#0f1c30] text-slate-100 border border-blue-900/40 rounded-bl-xs'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  ) : (
                    <div
                      className="sam-math-rendered space-y-1 text-[13px] leading-relaxed break-words"
                      dangerouslySetInnerHTML={{ __html: renderMathMarkdown(m.content) }}
                    />
                  )}
                  <div className="mt-1.5 flex items-center justify-between text-[10px] opacity-75 border-t border-slate-200/40 dark:border-blue-900/30 pt-1">
                    <span>{m.timestamp}</span>
                    {!isUser && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleFeedback(idx, true)}
                          className={`p-1 rounded hover:bg-slate-200/50 dark:hover:bg-blue-900/40 transition-colors ${
                            feedbackGiven[idx] === 'up' ? 'text-emerald-500 font-bold' : ''
                          }`}
                          title="Helpful response"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTeachModalIdx(teachModalIdx === idx ? null : idx);
                            setCorrectionText('');
                          }}
                          className={`p-1 rounded hover:bg-slate-200/50 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-1 ${
                            feedbackGiven[idx] === 'learned' ? 'text-amber-400 font-bold' : ''
                          }`}
                          title="Teach Sam / Suggest Correction"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span className="text-[9px]">Teach Sam</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => speakText(m.content)}
                          className="hover:text-amber-400 p-1 transition-colors"
                          title="Read Aloud"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Teach Sam / Community Correction Card */}
                  {!isUser && teachModalIdx === idx && (
                    <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1.5 text-xs text-slate-100">
                      <div className="font-semibold text-amber-400 flex items-center justify-between">
                        <span>🎓 Teach Sam / Suggest Correction</span>
                        <button type="button" onClick={() => setTeachModalIdx(null)} className="text-slate-400 hover:text-white">&times;</button>
                      </div>
                      <textarea
                        value={correctionText}
                        onChange={(e) => setCorrectionText(e.target.value)}
                        placeholder="Type the correction or updated departmental information for Sam to learn..."
                        rows={2}
                        className="w-full p-1.5 text-xs rounded bg-black/30 border border-amber-500/30 text-white outline-none resize-none"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setTeachModalIdx(null)}
                          className="px-2 py-0.5 rounded text-[10px] text-slate-300 hover:bg-white/10"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isSubmittingCorrection || !correctionText.trim()}
                          onClick={() => handleTeachSamSubmit(idx)}
                          className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500 hover:bg-amber-600 text-slate-900 disabled:opacity-50 flex items-center gap-1"
                        >
                          {isSubmittingCorrection ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Check className="w-2.5 h-2.5" />}
                          Save Knowledge
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isThinking && (
            <div className="flex items-center gap-2 text-xs text-amber-400 italic">
              <div className="w-5 h-5 rounded-full overflow-hidden border border-amber-500/80 shrink-0">
                <img src="/resources/images/sam_avatar.jpg" alt="Sam" className="w-full h-full object-cover" />
              </div>
              <span>Sam is formulating an answer...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attachment Pill */}
        {attachedFile && (
          <div className="mx-4 mb-2 p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold truncate">{attachedFile.fileName}</span>
              <span className="opacity-60 text-[10px]">({Math.round(attachedFile.fileSize / 1024)} KB)</span>
            </div>
            <button
              type="button"
              onClick={() => setAttachedFile(null)}
              className="text-red-400 hover:text-red-300 font-bold px-1"
            >
              &times;
            </button>
          </div>
        )}

        {isUploading && (
          <div className="mx-4 mb-2 p-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center gap-2 text-xs text-blue-400 animate-pulse font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
            <span>Attaching document...</span>
          </div>
        )}

        {/* Voice Recording Notification */}
        {isRecording && (
          <div className="mx-4 mb-2 p-2 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center gap-2 text-xs text-red-400 animate-pulse font-medium">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Listening to your voice... Speak your question now.</span>
          </div>
        )}

        {/* Composer Area */}
        <div
          className={`p-3 border-t flex items-end gap-2 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#061226] border-blue-900/40'
          }`}
        >
          <input
            type="file"
            id="samFileInputModal"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx,.doc,.txt,.csv,.png,.jpg,.jpeg,.webp"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
                fileInputRef.current.click();
              }
            }}
            className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
              isLight
                ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                : 'border-blue-900/40 text-slate-400 hover:bg-blue-900/30'
            }`}
            title="Attach Document, PDF, or Image"
            aria-label="Attach file"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`p-2 rounded-xl border transition-colors shrink-0 ${
              isRecording
                ? 'bg-red-500 text-white border-red-600 animate-pulse'
                : isLight
                ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                : 'border-blue-900/40 text-slate-400 hover:bg-blue-900/30'
            }`}
            title="Voice Dictation"
          >
            <Mic className="w-4 h-4" />
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                // Tab key must NEVER send
                return;
              }
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder="Ask Sam anything... (Press Enter to send)"
            className={`flex-1 max-h-24 min-h-[38px] p-2 text-xs rounded-xl border outline-none resize-none leading-relaxed ${
              isLight
                ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                : 'bg-[#0f1c30] border-blue-800 text-slate-100 focus:border-amber-400'
            }`}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={(!input.trim() && !attachedFile) || isThinking || isUploading}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-900 to-amber-600 hover:from-blue-800 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm border border-amber-500/40"
            title="Send Message (Enter)"
            aria-label="Send Message"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
