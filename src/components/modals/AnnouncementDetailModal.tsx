import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, AlertCircle, Calendar, User, FileText } from 'lucide-react';

export const AnnouncementDetailModal: React.FC = () => {
  const { activeAnnouncement, setActiveAnnouncement, triggerHaptic } = useApp();

  if (!activeAnnouncement) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end">
      <div
        className="w-full max-w-md mx-auto bg-[#061226] rounded-t-3xl border-t border-blue-900/60 max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200"
      >
        <div className="p-4 pb-2 border-b border-blue-900/40 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 border border-amber-600/50 px-2 py-0.5 rounded-md">
                Official NASS Circular
              </span>
              <span className="text-[11px] text-slate-300">
                {activeAnnouncement.date}
              </span>
            </div>
            <h2 className="text-sm font-bold text-white leading-snug">
              {activeAnnouncement.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setActiveAnnouncement(null);
            }}
            className="p-2 rounded-xl border border-blue-900/50 text-slate-400 hover:text-white hover:bg-blue-900/30 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed text-slate-300">
          <div className="flex items-center gap-2 text-slate-300 pb-2 border-b border-blue-900/40">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>Issued by: {activeAnnouncement.author}</span>
          </div>

          <div className="p-3 bg-[#040b17] rounded-xl border border-blue-900/50 whitespace-pre-line leading-relaxed text-slate-200">
            {activeAnnouncement.content}
          </div>
        </div>
      </div>
    </div>
  );
};
