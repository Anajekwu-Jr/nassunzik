import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { StatsAPI } from '../../services/api';
import { SearchResultItem } from '../../types';
import { Search, X, BookOpen, Users, FileText, CalendarDays, ArrowRight } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const {
    searchOpen,
    setSearchOpen,
    setActiveCourse,
    setActiveStaff,
    setActiveResource,
    setActiveEvent,
    setActiveTab,
    triggerHaptic
  } = useApp();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await StatsAPI.searchGlobal(query);
      setResults(res);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!searchOpen) return null;

  const handleSelect = (item: SearchResultItem) => {
    triggerHaptic();
    setSearchOpen(false);

    if (item.type === 'course') {
      setActiveCourse(item.actionPayload);
      setActiveTab('academics');
    } else if (item.type === 'staff') {
      setActiveStaff(item.actionPayload);
      setActiveTab('department');
    } else if (item.type === 'resource') {
      setActiveResource(item.actionPayload);
      setActiveTab('resources');
    } else if (item.type === 'event') {
      setActiveEvent(item.actionPayload);
      setActiveTab('events');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'staff':
      case 'executive':
        return <Users className="w-4 h-4 text-emerald-400" />;
      case 'resource':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'event':
        return <CalendarDays className="w-4 h-4 text-purple-400" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-start">
      <div className="w-full max-w-md mx-auto bg-[#061226] border-b border-blue-900/50 p-4 shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search courses, past Qs, staff, tables..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#040b17] border border-blue-900/50 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="text-xs font-semibold text-slate-400 hover:text-white px-2 py-1"
          >
            Cancel
          </button>
        </div>

        {/* Quick query tags */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-slate-400 shrink-0">Popular:</span>
          {['Statistical Tables', 'STA 312', 'STA 111', 'Dr. Enogwe', 'Past Questions', 'SIWES'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setQuery(tag)}
              className="text-[10px] font-medium text-slate-300 hover:text-amber-300 bg-[#091b36] hover:bg-blue-900/40 px-2.5 py-0.5 rounded-full border border-blue-800/50 whitespace-nowrap transition"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results Area */}
      <div className="flex-1 max-w-md w-full mx-auto overflow-y-auto p-4 space-y-2 bg-[#040b17]">
        {loading ? (
          <div className="text-center py-10 text-xs text-slate-400">
            Searching departmental catalog...
          </div>
        ) : query.length >= 2 && results.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#061226] border border-blue-900/50">
            <p className="text-xs font-semibold text-slate-300">No matches for "{query}"</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Check spelling or try broader terms like "Probability" or "Regression".
            </p>
          </div>
        ) : (
          results.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              role="button"
              tabIndex={0}
              className="p-3 rounded-xl bg-[#081730] border border-blue-900/50 hover:border-blue-700 active:scale-[0.99] transition cursor-pointer flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#0d2246] border border-blue-800/40 flex items-center justify-center shrink-0">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
