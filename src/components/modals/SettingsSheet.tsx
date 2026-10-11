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

  const togglePush = () => {
    triggerHaptic();
    const nextState = !pushEnabled;
    setPushEnabled(nextState);
    try {
      localStorage.setItem('nass_push_enabled', JSON.stringify(nextState));
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
          {/* THEME TOGGLE (LIGHT MODE / DARK MODE) */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-sm transition-colors ${
              isLight
                ? 'bg-slate-50 border-slate-200/90'
                : 'bg-[#091b36] border-blue-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  isLight
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-indigo-500/20 text-indigo-300'
                }`}
              >
                {isLight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </div>
              <div>
                <span
                  className={`font-semibold text-xs block ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Theme
                </span>
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {isLight ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>
            </div>

            {/* Segmented Light/Dark switcher */}
            <div
              className={`flex items-center p-1 rounded-xl border ${
                isLight
                  ? 'bg-slate-200/70 border-slate-300/80'
                  : 'bg-[#061226] border-blue-900/60'
              }`}
            >
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  isLight
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  !isLight
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-900" />
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
