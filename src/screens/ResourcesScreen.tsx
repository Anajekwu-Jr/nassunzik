import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StatsAPI } from '../services/api';
import { CourseResource, AcademicLevel, SemesterNumber } from '../types';
import {
  FolderArchive,
  Search,
  FileText,
  Bookmark,
  Eye,
  Sparkles,
  Filter,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

export const ResourcesScreen: React.FC = () => {
  const {
    selectedLevel,
    setSelectedLevel,
    selectedSemester,
    setSelectedSemester,
    setActiveResource,
    bookmarkedResources,
    toggleBookmarkResource,
    triggerHaptic
  } = useApp();

  const [resources, setResources] = useState<CourseResource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadResources() {
      setLoading(true);
      const data = await StatsAPI.getResources();
      setResources(data);
      setLoading(false);
    }
    loadResources();
  }, []);

  const categories = [
    { id: 'all', label: 'All Documents' },
    { id: 'table', label: 'Statistical Tables' },
    { id: 'past_question', label: 'Past Questions' },
    { id: 'lecture_note', label: 'Lecture Notes' },
    { id: 'siwes', label: 'SIWES Pack' },
    { id: 'form', label: 'Guides & Forms' }
  ];

  const filteredResources = resources.filter((r) => {
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'table' && r.resource_type !== 'table') return false;
      if (selectedCategory === 'past_question' && r.resource_type !== 'past_question') return false;
      if (selectedCategory === 'lecture_note' && r.resource_type !== 'lecture_note') return false;
      if (selectedCategory === 'siwes' && r.resource_type !== 'siwes') return false;
      if (selectedCategory === 'form' && (r.resource_type !== 'form' && r.resource_type !== 'syllabus')) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchFile = r.file_name.toLowerCase().includes(q);
      const matchCode = r.course_code ? r.course_code.toLowerCase().includes(q) : false;
      if (!matchTitle && !matchFile && !matchCode) return false;
    }

    return true;
  });

  const statisticalTableResource = resources.find((r) => r.resource_type === 'table') || resources[0];

  return (
    <div className="flex-1 pb-20 px-4 pt-3 space-y-4">
      {/* Prominent Card: Official UNIZIK Statistical Tables */}
      {statisticalTableResource && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-amber-950/40 p-4 border border-amber-600/30 shadow-sm space-y-2.5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Department Standard</span>
            </div>
            <span className="text-[10px] text-amber-300/80 font-mono">PDF · 44 KB</span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white leading-snug">
              Official UNIZIK Statistical Tables & Formulas
            </h3>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              Standard compilation of statistical distributions (Normal Z, Student's t, Chi-Square χ², Fisher-Snedecor F, Binomial & Poisson probabilities) for coursework and examinations.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setActiveResource(statisticalTableResource);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Open in App</span>
            </button>
            <a
              href="/downloads/Statistical_Tables.pdf"
              download="Statistical_Tables_UNIZIK.pdf"
              className="py-2 px-3 rounded-xl bg-[#0d2246] text-slate-200 border border-blue-800/60 hover:border-blue-600 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Save Copy</span>
            </a>
          </div>
        </div>
      )}

      {/* Real-time Document Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search materials by course code, title, or topic..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition"
        />
      </div>

      {/* Category Filter Chips (Horizontal Scrollable) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              triggerHaptic();
              setSelectedCategory(cat.id);
            }}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
              selectedCategory === cat.id
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Documents List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Available Documents ({filteredResources.length})
          </span>
          <span className="text-[10px] text-slate-400">Instant Offline Access</span>
        </div>

        {loading ? (
          <div className="text-center py-10 text-xs text-slate-400">
            Loading course resources...
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
            <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">No resources found</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Try adjusting your search query or category filter.
            </p>
          </div>
        ) : (
          filteredResources.map((res) => {
            const isBookmarked = bookmarkedResources.includes(res.id);

            const previewImg = res.preview_image || (res.file_path && /\.(jpg|jpeg|png|webp)$/i.test(res.file_path) ? res.file_path : null);

            return (
              <div
                key={res.id}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-2.5"
              >
                {/* Past Question Little Preview Image at Top */}
                {previewImg && (
                  <div
                    onClick={() => {
                      triggerHaptic();
                      setActiveResource(res);
                    }}
                    className="w-full h-36 rounded-xl overflow-hidden relative bg-[#091e42] border border-slate-750 cursor-pointer group shadow-inner"
                    title={`Click to preview ${res.course_code || ''} question paper`}
                  >
                    <img
                      src={previewImg}
                      alt={res.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex items-end justify-between p-2">
                      <span className="text-[10px] font-extrabold text-amber-400 bg-[#091e42]/90 border border-amber-500/40 px-2 py-0.5 rounded shadow-sm">
                        {res.course_code || 'STA'}
                      </span>
                      <span className="text-[10px] font-bold text-white bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                        <Eye className="w-3 h-3 text-amber-400 group-hover:text-slate-950" />
                        Preview
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    {!previewImg && (
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.2 rounded">
                          {res.course_code || 'STA'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {res.resource_type.toUpperCase().replace('_', ' ')}
                        </span>
                        {res.file_size && (
                          <span className="text-[10px] text-slate-500">· {res.file_size}</span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-white line-clamp-2">
                        {res.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {res.course_code ? `${res.course_code} · ` : ''}{res.resource_type === 'past_question' ? 'Past Examination Paper' : (res.resource_type === 'textbook' ? 'Textbook & Compendium' : 'Lecture Material')}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleBookmarkResource(res.id)}
                    className={`p-1 rounded-md transition ${
                      isBookmarked ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    aria-label="Bookmark resource"
                  >
                    <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      setActiveResource(res);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 text-[11px] font-semibold flex items-center justify-center gap-1 active:scale-95 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>View</span>
                  </button>

                  <a
                    href={res.file_path || res.download_url}
                    download={res.file_name}
                    className="py-1.5 px-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center justify-center gap-1 active:scale-95 transition"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    <span>Save</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
