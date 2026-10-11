import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  CalendarPlus,
  Share2,
  Check
} from 'lucide-react';

export const EventDetailModal: React.FC = () => {
  const { activeEvent, setActiveEvent, triggerHaptic } = useApp();
  const [copied, setCopied] = useState(false);

  if (!activeEvent) return null;

  const handleAddToCalendar = () => {
    triggerHaptic();
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//NASS UNIZIK//Department of Statistics//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${activeEvent.title}`,
      `DESCRIPTION:${activeEvent.description}`,
      `LOCATION:${activeEvent.venue}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeEvent.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    triggerHaptic();
    const shareText = `${activeEvent.title} on ${activeEvent.date} at ${activeEvent.venue}. Department of Statistics, UNIZIK.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeEvent.title,
          text: shareText,
          url: window.location.href
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end">
      <div
        className="w-full max-w-md mx-auto bg-[#061226] rounded-t-3xl border-t border-blue-900/60 max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200"
      >
        <div className="p-4 pb-2 border-b border-blue-900/40 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded-md inline-block mb-1">
              Department Event
            </span>
            <h2 className="text-sm font-bold text-white leading-snug">
              {activeEvent.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setActiveEvent(null);
            }}
            className="p-2 rounded-xl border border-blue-900/50 text-slate-400 hover:text-white hover:bg-blue-900/30 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed text-slate-300">
          <div className="space-y-2 p-3 bg-[#040b17] rounded-xl border border-blue-900/50">
            <div className="flex items-center gap-2 text-slate-200 font-medium">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{activeEvent.date}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{activeEvent.time}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{activeEvent.venue}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1 border-t border-blue-900/40">
              <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Organizer: {activeEvent.organizer}</span>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              Event Details
            </h3>
            <p className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60 text-slate-200 leading-relaxed whitespace-pre-line">
              {activeEvent.description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-2 border-t border-slate-800 flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCalendar}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Add to Device Calendar</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="py-2 px-3 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
