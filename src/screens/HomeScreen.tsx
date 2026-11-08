import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatsAPI } from '../services/api';
import { CourseResource, EventItem, Announcement } from '../types';
import { AnnouncementBillboard } from '../components/home/AnnouncementBillboard';
import {
  BookOpen,
  FileText,
  Users,
  GraduationCap,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  Bookmark
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    setActiveTab,
    setSelectedLevel,
    setActiveResource,
    setActiveEvent,
    triggerHaptic,
    theme
  } = useApp();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [featuredResource, setFeaturedResource] = useState<CourseResource | null>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    async function loadData() {
      const [annList, evList, resList] = await Promise.all([
        StatsAPI.getAnnouncements(),
        StatsAPI.getEvents(),
        StatsAPI.getResources()
      ]);
      setAnnouncements(annList);
      setUpcomingEvents(evList.filter(e => e.is_upcoming));
      const statTables = resList.find(r => r.resource_type === 'table') || resList[0];
      setFeaturedResource(statTables);
    }
    loadData();
  }, []);

  const nextEvent = upcomingEvents[0];

  const handleQuickLevel = (lvl: 100 | 200 | 300 | 400) => {
    triggerHaptic();
    setSelectedLevel(lvl);
    setActiveTab('academics');
  };

  return (
    <div className="flex-1 pb-20 px-4 pt-3 space-y-4">
      {/* NASS & Department Masthead */}
      <div
        className={`relative overflow-hidden rounded-2xl p-4 border shadow-md transition-colors ${
          isLight
            ? 'bg-gradient-to-br from-white via-blue-50/70 to-amber-50/50 border-slate-200/90 text-slate-900'
            : 'bg-gradient-to-br from-[#061226] via-[#091b36] to-[#850b05]/30 border-blue-900/50 text-white'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[10px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                  isLight
                    ? 'text-amber-800 bg-amber-100 border border-amber-300'
                    : 'text-amber-300 bg-amber-950/70 border border-amber-600/40'
                }`}
              >
                NASS UNIZIK
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                Chapter
              </span>
            </div>
            <h2
              className={`text-lg font-bold tracking-tight leading-snug ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Department of Statistics
            </h2>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Faculty of Physical Sciences · Nnamdi Azikiwe University
            </p>
            <p className="text-[11px] text-amber-500 font-medium italic pt-0.5">
              "Facts from Figures"
            </p>
          </div>

          <div
            className={`w-13 h-13 rounded-2xl border-2 flex items-center justify-center p-1 shrink-0 shadow-lg ${
              isLight
                ? 'bg-white border-amber-400'
                : 'bg-[#061226] border-amber-500/50'
            }`}
          >
            <img
              src="/resources/images/nass-logo.jpg"
              alt="UNIZIK NASS Crest"
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Academic Level Fast Jumper */}
        <div
          className={`mt-4 pt-3 border-t ${
            isLight ? 'border-slate-200/80' : 'border-blue-900/40'
          }`}
        >
          <span
            className={`text-[11px] font-semibold block mb-2 ${
              isLight ? 'text-slate-700' : 'text-slate-300'
            }`}
          >
            Select Academic Level:
          </span>
          <div className="grid grid-cols-4 gap-2">
            {[100, 200, 300, 400].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => handleQuickLevel(lvl as 100 | 200 | 300 | 400)}
                className={`py-2 px-1 rounded-xl text-center transition group shadow-sm border ${
                  isLight
                    ? 'bg-white hover:bg-amber-50 active:scale-95 border-slate-200 text-slate-800 hover:border-amber-400'
                    : 'bg-[#091d3d] hover:bg-amber-500/20 active:scale-95 border-blue-800/60 hover:border-amber-500/50 text-white'
                }`}
              >
                <span className="text-xs font-bold block group-hover:text-amber-500">
                  {lvl}L
                </span>
                <span
                  className={`text-[9px] block ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Courses
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Horizontal Announcement Billboard */}
      <AnnouncementBillboard announcements={announcements} />

      {/* Quick Access Grid */}
      <div>
        <h3
          className={`text-xs font-bold uppercase tracking-wider mb-2.5 px-0.5 ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          Quick Access
        </h3>
        <div className="grid grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setActiveTab('academics');
            }}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border active:scale-95 transition shadow-sm ${
              isLight
                ? 'bg-white border-slate-200 hover:border-blue-400'
                : 'bg-[#081730] border-blue-900/50 hover:border-amber-500/40'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center mb-1.5">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <span
              className={`text-[11px] font-medium ${
                isLight ? 'text-slate-800' : 'text-slate-200'
              }`}
            >
              Courses
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setActiveTab('resources');
            }}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border active:scale-95 transition shadow-sm ${
              isLight
                ? 'bg-white border-slate-200 hover:border-amber-400'
                : 'bg-[#081730] border-blue-900/50 hover:border-amber-500/40'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center mb-1.5">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <span
              className={`text-[11px] font-medium text-center leading-tight ${
                isLight ? 'text-slate-800' : 'text-slate-200'
              }`}
            >
              Past Qs
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setActiveTab('department');
            }}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border active:scale-95 transition shadow-sm ${
              isLight
                ? 'bg-white border-slate-200 hover:border-emerald-400'
                : 'bg-[#081730] border-blue-900/50 hover:border-amber-500/40'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mb-1.5">
              <Users className="w-4.5 h-4.5" />
            </div>
            <span
              className={`text-[11px] font-medium text-center leading-tight ${
                isLight ? 'text-slate-800' : 'text-slate-200'
              }`}
            >
              Faculty
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setActiveTab('department');
            }}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border active:scale-95 transition shadow-sm ${
              isLight
                ? 'bg-white border-slate-200 hover:border-red-400'
                : 'bg-[#081730] border-blue-900/50 hover:border-amber-500/40'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 border ${
                isLight
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : 'bg-[#850b05]/30 text-red-300 border-[#850b05]/50'
              }`}
            >
              <GraduationCap className="w-4.5 h-4.5" />
            </div>
            <span
              className={`text-[11px] font-medium text-center leading-tight ${
                isLight ? 'text-slate-800' : 'text-slate-200'
              }`}
            >
              NASS Exco
            </span>
          </button>
        </div>
      </div>


      {/* Featured Resource Spotlight: Official Statistical Tables */}
      {featuredResource && (
        <div
          className={`rounded-2xl p-3.5 space-y-2.5 shadow-sm border transition-colors ${
            isLight
              ? 'bg-white border-slate-200/90'
              : 'bg-[#081730] border-blue-900/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-500 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Standard Academic Resource</span>
            </div>
            <span
              className={`text-[10px] ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              PDF · 44 KB
            </span>
          </div>

          <div>
            <h4
              className={`text-xs font-bold leading-snug ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Official UNIZIK Statistical Tables & Formulas
            </h4>
            <p
              className={`text-[11px] mt-0.5 line-clamp-2 ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              Essential reference for STA 111, STA 112, STA 211, STA 312, STA 341. Includes Standard Normal (Z), Student t, Chi-Square, and F-distribution tables.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setActiveResource(featuredResource);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Open in Portal</span>
            </button>
            <a
              href="/downloads/Statistical_Tables.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className={`py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition border ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  : 'bg-[#0d2246] text-slate-200 border-blue-800/60 hover:border-blue-600'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              <span>Save Copy</span>
            </a>
          </div>
        </div>
      )}

      {/* Spotlight Upcoming Event Card */}
      {nextEvent && (
        <div
          onClick={() => {
            triggerHaptic();
            setActiveEvent(nextEvent);
          }}
          role="button"
          tabIndex={0}
          className={`rounded-2xl border overflow-hidden cursor-pointer active:scale-[0.99] transition shadow-sm ${
            isLight
              ? 'bg-white border-slate-200/90 hover:border-blue-400'
              : 'bg-[#081730] border-blue-900/50 hover:border-blue-700'
          }`}
        >
          <div className="p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  isLight
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    : 'text-emerald-300 bg-emerald-950/60 border border-emerald-800/50'
                }`}
              >
                Upcoming Event
              </span>
              <span
                className={`text-[11px] flex items-center gap-1 ${
                  isLight ? 'text-slate-500' : 'text-slate-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {nextEvent.time}
              </span>
            </div>

            <h4
              className={`text-xs font-bold leading-snug ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {nextEvent.title}
            </h4>

            <div
              className={`flex items-center gap-1.5 text-[11px] ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{nextEvent.venue}</span>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Metadata & Accreditation Info Strip */}
      <div
        className={`rounded-xl border p-3 text-center space-y-2 transition-colors ${
          isLight
            ? 'bg-white/80 border-slate-200 text-slate-600'
            : 'bg-[#061226]/80 border-blue-900/40 text-slate-400'
        }`}
      >
        <div className="flex items-center justify-center gap-3 text-[11px] font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            NUC Full Accreditation
          </span>
          <span>·</span>
          <span>NASS UNIZIK Chapter</span>
          <span>·</span>
          <span>2026/2027 Session</span>
        </div>

        {/* Social Media Handles */}
        <div className="flex items-center justify-center gap-2 pt-1 border-t border-slate-200/60 dark:border-blue-900/40">
          <a
            href="https://www.tiktok.com/@nassunizik0?_r=1&_t=ZS-9AsI2FmdH9i"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold bg-slate-900 text-white hover:bg-black transition shadow-sm"
          >
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43c1.7-1.7 1.6-4.14 1.6-4.14V8.58a8.28 8.28 0 0 0 4.84 1.56V6.69h-.71z"/>
            </svg>
            <span>TikTok</span>
          </a>
          <div
            title="Facebook page coming soon"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500 border border-dashed border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 select-none cursor-default"
          >
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Facebook <span className="opacity-70 text-[9px]">(Coming Soon)</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};
