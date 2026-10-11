import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StatsAPI } from '../services/api';
import { EventItem } from '../types';
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  CalendarPlus,
  Share2,
  Check,
  ChevronRight
} from 'lucide-react';

export const EventsScreen: React.FC = () => {
  const { setActiveEvent, triggerHaptic } = useApp();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [viewFilter, setViewFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      const data = await StatsAPI.getEvents();
      setEvents(data);
      setLoading(false);
    }
    loadEvents();
  }, []);

  const filteredEvents = events.filter((e) =>
    viewFilter === 'upcoming' ? e.is_upcoming : !e.is_upcoming
  );

  const handleAddToCalendar = (e: React.MouseEvent, ev: EventItem) => {
    e.stopPropagation();
    triggerHaptic();

    // Generate .ics iCalendar file data and download
    const title = ev.title;
    const description = ev.description;
    const location = ev.venue;
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//NASS UNIZIK//Department of Statistics//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${ev.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async (e: React.MouseEvent, ev: EventItem) => {
    e.stopPropagation();
    triggerHaptic();

    const shareData = {
      title: ev.title,
      text: `${ev.title} on ${ev.date} at ${ev.venue} - Department of Statistics, UNIZIK.`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareData.text);
      setCopiedId(ev.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="flex-1 pb-20 px-4 pt-3 space-y-4">
      {/* Segmented Filter: Upcoming vs Past */}
      <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center">
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            setViewFilter('upcoming');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            viewFilter === 'upcoming'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Upcoming Events
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            setViewFilter('past');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            viewFilter === 'past'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Past Department Archives
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 text-xs text-slate-400">
            Loading departmental events...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
            <CalendarDays className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">
              No {viewFilter} events recorded
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Check back for updates on departmental colloquia and seminars.
            </p>
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <div
              key={ev.id}
              onClick={() => {
                triggerHaptic();
                setActiveEvent(ev);
              }}
              role="button"
              tabIndex={0}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-[0.99] transition cursor-pointer space-y-2.5"
            >
              {/* Event Header with Date Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-md">
                    {ev.date}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {ev.time}
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
              </div>

              <div>
                <h4 className="text-xs font-bold text-white leading-snug">
                  {ev.title}
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                  {ev.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 truncate max-w-[200px]">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  {ev.venue}
                </span>

                <span className="text-slate-400 font-medium truncate">
                  {ev.organizer}
                </span>
              </div>

              {/* Action Buttons: Add to Calendar & Share */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={(e) => handleAddToCalendar(e, ev)}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Add to Calendar</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleShare(e, ev)}
                  className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  {copiedId === ev.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
