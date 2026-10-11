import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { StatsAPI } from '../../services/api';
import { CourseResource } from '../../types';
import {
  X,
  BookOpen,
  Bookmark,
  FileText,
  Download,
  Eye,
  UserCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const CourseDetailSheet: React.FC = () => {
  const {
    activeCourse,
    setActiveCourse,
    bookmarkedCourses,
    toggleBookmarkCourse,
    setActiveResource,
    triggerHaptic
  } = useApp();

  const [courseMaterials, setCourseMaterials] = useState<CourseResource[]>([]);

  useEffect(() => {
    async function loadMaterials() {
      if (!activeCourse) return;
      const allRes = await StatsAPI.getResources();
      // Match materials that reference this course code
      const matched = allRes.filter(
        (r) =>
          (r.course_code && r.course_code.toLowerCase().includes(activeCourse.code.toLowerCase())) ||
          r.title.toLowerCase().includes(activeCourse.code.toLowerCase()) ||
          (r.resource_type === 'table' && activeCourse.code.startsWith('STA'))
      );
      setCourseMaterials(matched);
    }
    loadMaterials();
  }, [activeCourse]);

  if (!activeCourse) return null;

  const isBookmarked = bookmarkedCourses.includes(activeCourse.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col justify-end">
      <div
        className="w-full max-w-md mx-auto bg-slate-900 rounded-t-3xl border-t border-slate-800 max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200"
      >
        {/* Sheet Grab Handle & Header */}
        <div className="p-4 pb-2 border-b border-slate-800">
          <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3" />

          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-800/40 px-2 py-0.5 rounded-md">
                  {activeCourse.code}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {activeCourse.level} Level · {activeCourse.units} Credit Units
                </span>
              </div>
              <h2 className="text-sm font-bold text-white leading-snug">
                {activeCourse.title}
              </h2>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => toggleBookmarkCourse(activeCourse.id)}
                className={`p-2 rounded-xl border border-slate-800 transition ${
                  isBookmarked
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-label="Bookmark course"
              >
                <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setActiveCourse(null);
                }}
                className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Metadata Row */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Semester</span>
              <span className="font-semibold text-slate-200">
                {activeCourse.semester === 1 ? 'Harmattan (First)' : 'Rain (Second)'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Instructor</span>
              <span className="font-semibold text-amber-300 truncate block">
                {activeCourse.lecturer || 'Department Faculty'}
              </span>
            </div>
          </div>

          {/* Course Description */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Course Description
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
              {activeCourse.description}
            </p>
          </div>

          {/* Weekly Syllabus Outline */}
          {activeCourse.outline && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Syllabus & Lecture Topics
              </h3>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {activeCourse.outline}
              </div>
            </div>
          )}

          {/* Course Handouts & Study PDFs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Course Handouts & Study PDFs ({courseMaterials.length})
              </h3>
            </div>

            {courseMaterials.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 text-center bg-slate-950/30 rounded-xl border border-slate-800/60">
                General lecture handouts available in the departmental resources tab.
              </p>
            ) : (
              <div className="space-y-2">
                {courseMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate">
                          {mat.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {mat.file_name} {mat.file_size ? `· ${mat.file_size}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic();
                          setActiveResource(mat);
                        }}
                        className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 active:scale-95 transition"
                      >
                        <Eye className="w-3 h-3 text-amber-400" />
                        <span>View</span>
                      </button>

                      <a
                        href={mat.file_path || mat.download_url}
                        download={mat.file_name}
                        className="py-1 px-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold flex items-center gap-1 active:scale-95 transition"
                        title="Save Copy"
                      >
                        <Bookmark className="w-3 h-3 text-amber-400" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
