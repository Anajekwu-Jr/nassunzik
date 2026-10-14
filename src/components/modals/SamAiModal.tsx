import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
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
  FileText
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
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
  const [attachedFile, setAttachedFile] = useState<{
    fileName: string;
    fileSize: number;
    mimeType: string;
    base64: string;
  } | null>(null);

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
    if (isThinking) return;

    triggerHaptic();

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userDisplayMsg = attachedFile
      ? `📎 **[Attached: ${attachedFile.fileName}]**\n\n${text}`
      : text;

    const newMsgs: ChatMessage[] = [
      ...messages,
      { role: 'user', content: userDisplayMsg, timestamp: time }
    ];
    setMessages(newMsgs);
    setInput('');
    setIsThinking(true);

    const payload = {
      message: text,
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic();
    const formData = new FormData();
    formData.append('document', file);

    try {
      const res = await fetch('/api/sam/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setAttachedFile({
          fileName: data.fileName,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
          base64: data.base64
        });
      } else {
        alert(data.error || 'Failed to upload document');
      }
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
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
            <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center text-amber-400 relative">
              <Sparkles className="w-5 h-5" />
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
                  <div className="w-6 h-6 rounded-full bg-slate-900 border border-amber-500/60 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
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
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  <div className="mt-1 flex items-center justify-between text-[10px] opacity-60">
                    <span>{m.timestamp}</span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => speakText(m.content)}
                        className="hover:text-amber-400 p-0.5 transition-colors"
                        title="Read Aloud"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isThinking && (
            <div className="flex items-center gap-2 text-xs text-amber-400 italic">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
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
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-xl border transition-colors ${
              isLight
                ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                : 'border-blue-900/40 text-slate-400 hover:bg-blue-900/30'
            }`}
            title="Attach Document or Image"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`p-2 rounded-xl border transition-colors ${
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
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder="Ask Sam about a course, theorem or note..."
            className={`flex-1 max-h-24 min-h-[38px] p-2 text-xs rounded-xl border outline-none resize-none leading-relaxed ${
              isLight
                ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                : 'bg-[#0f1c30] border-blue-800 text-slate-100 focus:border-amber-400'
            }`}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={(!input.trim() && !attachedFile) || isThinking}
            className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold transition-all shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
