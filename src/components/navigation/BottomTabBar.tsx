import React from 'react';
import { useApp, TabType } from '../../context/AppContext';
import { Home, GraduationCap, FolderArchive, Building2, CalendarDays } from 'lucide-react';

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'academics', label: 'Academics', icon: GraduationCap },
  { id: 'resources', label: 'Resources', icon: FolderArchive },
  { id: 'department', label: 'Department', icon: Building2 },
  { id: 'events', label: 'Events', icon: CalendarDays }
];

export const BottomTabBar: React.FC = () => {
  const { activeTab, setActiveTab, platformStyle, theme } = useApp();
  const isLight = theme === 'light';

  return (
    <nav
      aria-label="App Navigation"
      className={`fixed bottom-0 left-0 right-0 z-30 backdrop-blur-xl border-t transition-colors ${
        isLight
          ? 'bg-white/95 border-slate-200/90 text-slate-900 shadow-lg'
          : 'bg-[#061226]/95 border-blue-900/40 text-white'
      }`}
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
    >
      <div className="max-w-md mx-auto px-2 h-14 flex items-center justify-around">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (platformStyle === 'android') {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex flex-col items-center justify-center py-1 transition-all group"
              >
                <div
                  className={`px-4 py-1 rounded-full transition-colors ${
                    isActive
                      ? isLight
                        ? 'bg-amber-500/20 text-amber-600'
                        : 'bg-amber-500/20 text-amber-300'
                      : isLight
                      ? 'text-slate-500 group-hover:text-slate-800'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] font-medium tracking-tight mt-0.5 transition-colors ${
                    isActive
                      ? isLight
                        ? 'text-amber-600 font-bold'
                        : 'text-amber-300 font-semibold'
                      : isLight
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          // iOS Style (Cupertino minimalist bottom bar)
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-1 transition-transform active:scale-90"
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive
                    ? isLight
                      ? 'text-amber-600'
                      : 'text-amber-300'
                    : isLight
                    ? 'text-slate-400 hover:text-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              />
              <span
                className={`text-[10px] tracking-tight mt-1 transition-colors ${
                  isActive
                    ? isLight
                      ? 'text-amber-600 font-bold'
                      : 'text-amber-300 font-semibold'
                    : isLight
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
