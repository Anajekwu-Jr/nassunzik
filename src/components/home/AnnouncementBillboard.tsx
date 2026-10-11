import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Announcement } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Megaphone,
  ChevronRight,
  ChevronLeft,
  Calendar,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface AnnouncementBillboardProps {
  announcements: Announcement[];
}

export const AnnouncementBillboard: React.FC<AnnouncementBillboardProps> = ({ announcements }) => {
  const { setActiveAnnouncement, triggerHaptic, theme } = useApp();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isInteractingRef = useRef(false);
  const interactionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isLight = theme === 'light';

  const scrollToIndex = useCallback((index: number, haptic = true) => {
    if (haptic) triggerHaptic();
    if (!scrollContainerRef.current) return;
    const itemWidth = scrollContainerRef.current.clientWidth * 0.85;
    scrollContainerRef.current.scrollTo({
      left: index * (itemWidth + 12),
      behavior: 'smooth'
    });
    setActiveIndex(index);
  }, [triggerHaptic]);

  // Handle user manual scroll tracking
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    if (clientWidth > 0) {
      const itemWidth = clientWidth * 0.85 + 12;
      const index = Math.round(scrollLeft / itemWidth);
      setActiveIndex(Math.max(0, Math.min(index, announcements.length - 1)));
    }
  };

  // Pause slideshow temporarily when user touches or hovers
  const handleUserInteractionStart = () => {
    isInteractingRef.current = true;
    if (interactionTimerRef.current) {
      clearTimeout(interactionTimerRef.current);
    }
  };

  const handleUserInteractionEnd = () => {
    if (interactionTimerRef.current) {
      clearTimeout(interactionTimerRef.current);
    }
    interactionTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 3000);
  };

  // Auto-advancing horizontal slideshow timer (every 4 seconds)
  useEffect(() => {
    if (!announcements || announcements.length <= 1) return;

    const interval = setInterval(() => {
      if (isInteractingRef.current) return;

      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % announcements.length;
        if (scrollContainerRef.current) {
          const itemWidth = scrollContainerRef.current.clientWidth * 0.85 + 12;
          scrollContainerRef.current.scrollTo({
            left: nextIndex * itemWidth,
            behavior: 'smooth'
          });
        }
        return nextIndex;
      });
    }, 4000);

    return () => {
      clearInterval(interval);
      if (interactionTimerRef.current) {
        clearTimeout(interactionTimerRef.current);
      }
    };
  }, [announcements]);

  // If no announcements yet, return null
  if (!announcements || announcements.length === 0) {
    return null;
  }

  return (
    <div
      className="space-y-2.5"
      onMouseEnter={handleUserInteractionStart}
      onMouseLeave={handleUserInteractionEnd}
      onTouchStart={handleUserInteractionStart}
      onTouchEnd={handleUserInteractionEnd}
    >
      {/* Announcements Section Header */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
              isLight
                ? 'bg-amber-100 text-amber-600 border border-amber-200'
                : 'bg-[#850b05]/30 border border-[#850b05]/60 text-amber-400'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <h3
              className={`text-xs font-extrabold uppercase tracking-wider ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Announcements
            </h3>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          </div>
        </div>

        {/* Scroll cues / dot count */}
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[10px] font-semibold ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            {activeIndex + 1} of {announcements.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition disabled:opacity-30 ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  : 'bg-[#091b36] border-blue-900/60 text-slate-300'
              }`}
              aria-label="Previous announcement"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex((activeIndex + 1) % announcements.length)}
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  : 'bg-[#091b36] border-blue-900/60 text-slate-300'
              }`}
              aria-label="Next announcement"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontally Scrolling Slideshow */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-1 -mx-4 px-4 scroll-touch"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {announcements.map((item, idx) => {
          const isUrgent = item.priority === 'high';

          return (
            <div
              key={item.id}
              onClick={() => {
                triggerHaptic();
                setActiveAnnouncement(item);
              }}
              role="button"
              tabIndex={0}
              className={`snap-center shrink-0 w-[86%] max-w-[340px] rounded-2xl p-4 cursor-pointer transition active:scale-[0.98] select-none shadow-md relative overflow-hidden flex flex-col justify-between ${
                isLight
                  ? isUrgent
                    ? 'bg-gradient-to-br from-white via-amber-50/30 to-red-50/20 border-2 border-amber-400 text-slate-900'
                    : 'bg-white border border-slate-200/90 text-slate-900 hover:border-blue-400'
                  : isUrgent
                  ? 'bg-gradient-to-br from-[#0a1832] via-[#0d2246] to-[#850b05]/30 border-2 border-amber-500/50 hover:border-amber-400 text-white'
                  : 'bg-gradient-to-br from-[#081730] via-[#0a1d3d] to-[#0d2650] border border-blue-800/60 hover:border-blue-600 text-white'
              }`}
            >
              {/* Decorative background watermark */}
              <div
                className={`absolute -right-4 -bottom-4 pointer-events-none ${
                  isLight ? 'text-slate-900/5' : 'text-white/5'
                }`}
              >
                <Megaphone className="w-24 h-24" />
              </div>

              <div>
                {/* Top Badge Strip */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {isUrgent ? (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-300 dark:text-amber-300 dark:bg-amber-950/80 dark:border-amber-600/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-red-500" />
                        URGENT
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 border border-blue-300 dark:text-blue-300 dark:bg-blue-950/70 dark:border-blue-700/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        CIRCULAR
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium flex items-center gap-1 ${
                      isLight ? 'text-slate-500' : 'text-slate-300'
                    }`}
                  >
                    <Calendar className="w-3 h-3 text-amber-500" />
                    {item.date}
                  </span>
                </div>

                {/* Main Headline */}
                <h4
                  className={`text-sm font-bold line-clamp-2 leading-snug tracking-tight mb-1.5 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {item.title}
                </h4>

                {/* Excerpt Body */}
                <p
                  className={`text-[11px] line-clamp-2 leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-slate-300'
                  }`}
                >
                  {item.content}
                </p>
              </div>

              {/* Bottom Authority & Open Action */}
              <div
                className={`mt-3.5 pt-2.5 border-t flex items-center justify-between ${
                  isLight ? 'border-slate-100' : 'border-blue-900/40'
                }`}
              >
                <span
                  className={`text-[10px] font-medium truncate max-w-[170px] ${
                    isLight ? 'text-amber-700' : 'text-amber-300/90'
                  }`}
                >
                  {item.author}
                </span>

                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 hover:text-amber-600">
                  <span>Read Notice</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Horizontal Slideshow Dots Indicator */}
      <div className="flex items-center justify-center gap-1.5 pt-0.5">
        {announcements.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => scrollToIndex(idx)}
            className={`transition-all duration-300 rounded-full ${
              activeIndex === idx
                ? 'w-5 h-1.5 bg-amber-500'
                : isLight
                ? 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                : 'w-1.5 h-1.5 bg-blue-900/70 hover:bg-blue-700'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
