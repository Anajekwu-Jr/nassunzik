import React from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Bell, Settings2, WifiOff, Sparkles } from 'lucide-react';

export const AppHeader: React.FC = () => {
  const {
    isOnline,
    theme,
    setSearchOpen,
    setNotificationsOpen,
    setSettingsOpen,
    setSamOpen,
    triggerHaptic
  } = useApp();

  const isLight = theme === 'light';

  return (
    <header
      className={`sticky top-0 z-30 w-full backdrop-blur-md border-b transition-colors ${
        isLight
          ? 'bg-white/95 border-slate-200/80 shadow-sm text-slate-900'
          : 'bg-[#061226]/95 border-blue-900/40 text-white'
      }`}
    >
      {/* Offline banner if disconnected */}
      {!isOnline && (
        <div className="bg-[#850b05]/90 border-b border-[#a8160f]/60 px-4 py-1.5 flex items-center justify-center gap-2 text-xs text-white font-medium">
          <WifiOff className="w-3.5 h-3.5 text-amber-300" />
          <span>Offline Mode · Cached Departmental Data Active</span>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Department & Association Identity */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src="/resources/images/nass-logo.jpg"
              alt="NASS UNIZIK"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-500/50 shadow-sm"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1
                className={`text-sm font-extrabold tracking-tight leading-none ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                NASS
              </h1>
              <span className="text-[10px] font-semibold tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/30 px-1 py-0.2 rounded leading-tight">
                UNIZIK
              </span>
            </div>
            <p
              className={`text-[10px] font-medium leading-tight mt-0.5 ${
                isLight ? 'text-slate-500' : 'text-slate-300'
              }`}
            >
              Department of Statistics
            </p>
          </div>
        </div>

        {/* Right: Action Buttons (Search, Notifications, Settings) */}
        <div className="flex items-center gap-1.5">
          {/* Sam AI Study Companion */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setSamOpen(true);
            }}
            className="px-2.5 py-1 rounded-full flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/40 text-amber-400 hover:bg-amber-500/25 active:scale-95 transition shadow-xs"
            aria-label="Ask Sam"
            title="Ask Sam - AI Study Companion"
          >
            <div className="w-4 h-4 rounded-full overflow-hidden border border-amber-500 shrink-0">
              <img
                src="/resources/images/sam_avatar.jpg"
                alt="Sam AI"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/resources/images/nass-logo.jpg';
                }}
              />
            </div>
            <span className="text-[11px] font-bold tracking-tight text-amber-500">Ask Sam</span>
          </button>

          {/* Global Search */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setSearchOpen(true);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/40'
            }`}
            aria-label="Open Search"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setNotificationsOpen(true);
            }}
            className={`relative w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/40'
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span
              className={`absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full ring-2 ${
                isLight ? 'ring-white' : 'ring-[#061226]'
              }`}
            />
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setSettingsOpen(true);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/40'
            }`}
            aria-label="Settings"
          >
            <Settings2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
