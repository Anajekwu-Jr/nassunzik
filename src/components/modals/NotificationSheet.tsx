import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { StatsAPI } from '../../services/api';
import { Announcement } from '../../types';
import { X, Bell, AlertCircle, CheckCircle2 } from 'lucide-react';

export const NotificationSheet: React.FC = () => {
  const { notificationsOpen, setNotificationsOpen, setActiveAnnouncement, triggerHaptic } = useApp();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    async function loadNotices() {
      const data = await StatsAPI.getAnnouncements();
      setAnnouncements(data);
    }
    loadNotices();
  }, []);

  if (!notificationsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end">
      <div
        className="w-full max-w-md mx-auto bg-[#061226] rounded-t-3xl border-t border-blue-900/60 max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200"
      >
        {/* Header */}
        <div className="p-4 pb-3 border-b border-blue-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Notification Center
              </h2>
              <p className="text-[10px] text-slate-300">
                Official Department Circulars & Bulletins
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setNotificationsOpen(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-blue-900/30 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inbuilt Push Notification Status Strip */}
        <div className="p-3 mx-4 my-2 rounded-xl bg-[#091b36] border border-blue-800/50 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="font-semibold text-white">Inbuilt Push Notifications</p>
              <p className="text-[10px] text-slate-300">
                Real-time delivery active for timetable, exam & congress alerts
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
            Active
          </span>
        </div>

        {/* Notices Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {announcements.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                triggerHaptic();
                setActiveAnnouncement(item);
              }}
              role="button"
              tabIndex={0}
              className="p-3.5 rounded-xl bg-[#081730] border border-blue-900/50 hover:border-blue-700 transition cursor-pointer space-y-1.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400">
                  {item.author} · {item.date}
                </span>
                {item.priority === 'high' ? (
                  <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 border border-amber-600/50 px-1.5 py-0.2 rounded flex items-center gap-1">
                    <AlertCircle className="w-2.5 h-2.5 text-red-400" />
                    URGENT
                  </span>
                ) : (
                  <span className="text-[9px] font-semibold text-blue-300 bg-blue-950/60 border border-blue-800/40 px-1.5 py-0.2 rounded">
                    CIRCULAR
                  </span>
                )}
              </div>

              <h4 className="text-xs font-bold text-white leading-snug">
                {item.title}
              </h4>

              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
