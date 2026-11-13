import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Bell,
  Sliders,
  Database,
  RotateCcw,
  Sun,
  Moon
} from 'lucide-react';

export const SettingsSheet: React.FC = () => {
  const {
    settingsOpen,
    setSettingsOpen,
    theme,
    setTheme,
    triggerHaptic
  } = useApp();

  // Clean Push Notification state (default ON)
  const [pushEnabled, setPushEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nass_push_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [cacheStatus, setCacheStatus] = useState<string | null>(null);

  if (!settingsOpen) return null;

  const togglePush = async () => {
    triggerHaptic();
    const nextState = !pushEnabled;
    setPushEnabled(nextState);
    try {
      localStorage.setItem('nass_push_enabled', JSON.stringify(nextState));
      if (nextState && 'Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    } catch {}
  };

  const handleClearCache = () => {
    triggerHaptic();
    try {
      localStorage.removeItem('nass_unizik_mobile_cache_v2');
      setCacheStatus('Cache cleared successfully.');
      setTimeout(() => setCacheStatus(null), 3000);
    } catch {}
  };

  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end">
      <div
        className={`w-full max-w-md mx-auto rounded-t-3xl border-t max-h-[88vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200 transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#061226] border-blue-900/60 text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 pb-3 border-b flex items-center justify-between ${
            isLight ? 'border-slate-100' : 'border-blue-900/40'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            <h2
              className={`text-xs font-bold uppercase tracking-wider ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Settings
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setSettingsOpen(false);
            }}
            className={`p-1.5 rounded-lg transition ${
              isLight
                ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-blue-900/30'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {/* App Theme Toggle (Light / Dark Mode - App Only) */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-sm transition-colors ${
              isLight
                ? 'bg-slate-50 border-slate-200/90'
                : 'bg-[#091b36] border-blue-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isLight
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-blue-500/20 text-amber-300'
                }`}
              >
                {isLight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </div>
              <div>
                <p
                  className={`font-semibold text-xs ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  App Appearance
                </p>
                <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {isLight ? 'Light Mode active' : 'Dark Mode active'}
                </p>
              </div>
            </div>

            <div
              className={`inline-flex items-center p-1 rounded-xl border ${
                isLight
                  ? 'bg-slate-200/80 border-slate-300/70'
                  : 'bg-[#061226] border-blue-900/60'
              }`}
              role="group"
              aria-label="App Theme Mode"
            >
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                  isLight
                    ? 'bg-white text-amber-600 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-pressed={isLight}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                  !isLight
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-pressed={!isLight}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Push Notification row with default ON toggle */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-sm transition-colors ${
              isLight
                ? 'bg-slate-50 border-slate-200/90'
                : 'bg-[#091b36] border-blue-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isLight
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                <Bell className="w-4 h-4" />
              </div>
              <span
                className={`font-semibold text-xs ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Push Notification
              </span>
            </div>

            {/* Toggle switch */}
            <button
              type="button"
              onClick={togglePush}
              role="switch"
              aria-checked={pushEnabled}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                pushEnabled ? 'bg-amber-500' : 'bg-slate-400'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  pushEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Offline Cache Storage */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-sm transition-colors ${
              isLight
                ? 'bg-slate-50 border-slate-200/90'
                : 'bg-[#091b36]/70 border-blue-900/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isLight
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-blue-500/20 text-blue-300'
                }`}
              >
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p
                  className={`font-semibold text-xs ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Offline Cache
                </p>
                <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {cacheStatus || 'Local cached data'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              className={`py-1 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 active:scale-95 transition ${
                isLight
                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  : 'bg-blue-900/50 hover:bg-blue-800 text-slate-200'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>

          {/* Department Crest Info Box */}
          <div
            className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
              isLight
                ? 'bg-blue-50/70 border-blue-200'
                : 'bg-gradient-to-r from-blue-950/40 via-[#091b36] to-[#850b05]/20 border-blue-800/40'
            }`}
          >
            <img
              src="/resources/images/nass-logo.jpg"
              alt="NASS UNIZIK"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/40 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4
                className={`text-xs font-bold truncate ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                National Association of Statistical Science Students
              </h4>
              <p className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                Department of Statistics · UNIZIK Chapter
              </p>
            </div>
          </div>

          {/* Social Media Links */}
          <div
            className={`p-3 rounded-xl border space-y-2 transition-colors ${
              isLight
                ? 'bg-slate-50 border-slate-200/90'
                : 'bg-[#091b36]/70 border-blue-900/50'
            }`}
          >
            <span
              className={`text-[10px] font-bold uppercase tracking-wider block ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Connect with NASS UNIZIK
            </span>
            <div className="flex items-center gap-2">
              <a
                href="https://www.tiktok.com/@nassunizik0?_r=1&_t=ZS-9AsI2FmdH9i"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-black text-white hover:bg-slate-900 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43c1.7-1.7 1.6-4.14 1.6-4.14V8.58a8.28 8.28 0 0 0 4.84 1.56V6.69h-.71z"/>
                </svg>
                <span>TikTok</span>
              </a>
              <div
                title="Facebook page coming soon"
                className={`flex-1 py-2 px-3 rounded-xl border border-dashed font-medium text-xs flex items-center justify-center gap-1.5 cursor-default select-none ${
                  isLight
                    ? 'bg-slate-100 text-slate-500 border-slate-300'
                    : 'bg-[#061226]/50 text-slate-400 border-blue-900/50'
                }`}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook <span className="opacity-70 text-[10px]">(Soon)</span></span>
              </div>
            </div>
          </div>

          {/* App Footer with "powered by PhanCore" */}
          <div
            className={`pt-4 pb-2 text-center space-y-1.5 border-t transition-colors ${
              isLight ? 'border-slate-100 text-slate-500' : 'border-blue-900/50 text-slate-400'
            }`}
          >
            <p
              className={`text-[12px] font-bold tracking-wide ${
                isLight ? 'text-slate-800' : 'text-white'
              }`}
            >
              NASS UNIZIK
            </p>
            <p
              className={`text-[11px] font-medium ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              National Association of Statistical Science Students
            </p>
            <p className="text-[10px]">
              Department of Statistics · Faculty of Physical Sciences
            </p>
            <p className="text-[10px]">
              Nnamdi Azikiwe University, Awka
            </p>

            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium">
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>powered by</span>
              <span
                className={`font-extrabold tracking-wider px-2.5 py-0.5 rounded shadow-sm border ${
                  isLight
                    ? 'text-blue-900 bg-blue-50 border-blue-200'
                    : 'text-white bg-blue-950/80 border-blue-500/40'
                }`}
              >
                PhanCore
              </span>
            </div>

            <p className="text-[9px] text-slate-400 pt-1">
              © 2026 NASS UNIZIK · All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
