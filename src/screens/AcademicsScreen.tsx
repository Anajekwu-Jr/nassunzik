import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StatsAPI } from '../services/api';
import { Course, TimetableSlot, AcademicLevel, SemesterNumber } from '../types';
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Search,
  ChevronRight,
  Clock,
  MapPin,
  Bookmark,
  Sparkles,
  FileText,
  UserCheck
} from 'lucide-react';

export const AcademicsScreen: React.FC = () => {
  const {
    selectedLevel,
    setSelectedLevel,
    selectedSemester,
    setSelectedSemester,
    setActiveCourse,
    setSamOpen,
    setSamInitialCourse,
    bookmarkedCourses,
    toggleBookmarkCourse,
    triggerHaptic
  } = useApp();

  const [activeSection, setActiveSection] = useState<'courses' | 'timetable' | 'programmes'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAcademicData() {
      setLoading(true);
      const [courseData, ttData] = await Promise.all([
        StatsAPI.getCourses(selectedLevel, selectedSemester),
        StatsAPI.getTimetable(selectedLevel, selectedSemester)
      ]);
      setCourses(courseData);
      setTimetable(ttData);
      setLoading(false);
    }
    loadAcademicData();
  }, [selectedLevel, selectedSemester]);

  const filteredCourses = courses.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.code.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      (c.lecturer && c.lecturer.toLowerCase().includes(q))
    );
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const daySchedule = timetable.filter((t) => t.day === selectedDay);

  return (
    <div className="flex-1 pb-20 px-4 pt-3 space-y-4">
      {/* Segmented Top Section Control */}
      <div className="bg-[#061226] p-1 rounded-xl border border-blue-900/50 flex items-center shadow-sm">
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            setActiveSection('courses');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeSection === 'courses'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Courses
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            setActiveSection('timetable');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeSection === 'timetable'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Timetable
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            setActiveSection('programmes');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeSection === 'programmes'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Degrees & Careers
        </button>
      </div>

      {/* Level & Semester Switchers (Shown for Courses & Timetable) */}
      {activeSection !== 'programmes' && (
        <div className="space-y-2">
          {/* Level Switcher */}
          <div className="grid grid-cols-4 gap-1.5">
            {[100, 200, 300, 400].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setSelectedLevel(lvl as AcademicLevel);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition border ${
                  selectedLevel === lvl
                    ? 'bg-[#0d2246] text-amber-300 border-amber-500/50 shadow-sm'
                    : 'bg-[#061226]/80 text-slate-400 border-blue-900/40 hover:border-blue-700'
                }`}
              >
                {lvl} Level
              </button>
            ))}
          </div>

          {/* Semester Filter */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setSelectedSemester(1);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${
                selectedSemester === 1
                  ? 'bg-slate-800 text-white border-slate-600'
                  : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:text-slate-300'
              }`}
            >
              Harmattan (First) Semester
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setSelectedSemester(2);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${
                selectedSemester === 2
                  ? 'bg-slate-800 text-white border-slate-600'
                  : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:text-slate-300'
              }`}
            >
              Rain (Second) Semester
            </button>
          </div>
        </div>
      )}

      {/* 1. COURSES TAB */}
      {activeSection === 'courses' && (
        <div className="space-y-3">
          {/* In-page Course Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${selectedLevel}L courses (code, title, lecturer)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition"
            />
          </div>

          {/* Courses List */}
          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400">
              Loading {selectedLevel} Level courses...
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
              <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-300">No courses found</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                No courses match the selected filters or search keyword.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredCourses.map((c) => {
                const isBookmarked = bookmarkedCourses.includes(c.id);

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      triggerHaptic();
                      setActiveCourse(c);
                    }}
                    role="button"
                    tabIndex={0}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-[0.99] transition cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-md">
                          {c.code}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {c.units} Units · Semester {c.semester}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmarkCourse(c.id);
                        }}
                        className={`p-1 rounded-md transition ${
                          isBookmarked
                            ? 'text-amber-400'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                        aria-label="Bookmark course"
                      >
                        <Bookmark
                          className="w-4 h-4"
                          fill={isBookmarked ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                        {c.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {c.description}
                      </p>
                    </div>

                    <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                        {c.lecturer || 'Faculty Staff'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerHaptic();
                            setSamInitialCourse(c.code);
                            setSamOpen(true);
                          }}
                          className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full hover:bg-amber-500/25 transition"
                          title={`Discuss ${c.code} with Sam AI`}
                        >
                          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                          <span>Ask Sam</span>
                        </button>
                        <span className="flex items-center gap-0.5 text-amber-400 font-medium">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. TIMETABLE TAB */}
      {activeSection === 'timetable' && (
        <div className="space-y-3">
          {/* Day of Week Selector */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setSelectedDay(day);
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                  selectedDay === day
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Schedule Slots */}
          {daySchedule.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
              <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-300">
                No lectures scheduled for {selectedDay}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Free day or self-directed laboratory study for {selectedLevel} Level.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {daySchedule.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">
                      {slot.course_code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {slot.start_time} – {slot.end_time}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-white">
                    {slot.course_title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {slot.venue}
                    </span>
                    <span className="text-slate-300 font-medium">{slot.lecturer}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. PROGRAMMES & CAREERS TAB */}
      {activeSection === 'programmes' && (
        <div className="space-y-4">
          {/* Degree Offerings */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-0.5">
              Academic Programmes
            </h3>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Undergraduate
              </span>
              <h4 className="text-xs font-bold text-white">
                B.Sc. Statistics (4 Years Standard / 3 Years Direct Entry)
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Comprehensive training spanning mathematical foundations, probability calculus, experimental design, and practical software computing (R, Python, SPSS). Fully accredited by the National Universities Commission (NUC).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Postgraduate
              </span>
              <h4 className="text-xs font-bold text-white">
                PGD, M.Sc. & Ph.D. in Statistics
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Advanced research specializations in Time Series Analysis, Biostatistics, Operations Research, Econometric Modeling, and Extreme Value Distribution Theory.
              </p>
            </div>
          </div>

          {/* Statistics Career Pathways */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-0.5">
              Modern Career Pathways
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-amber-400 block mb-0.5">
                  Data Science & AI
                </span>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Machine learning, predictive algorithms, Big Data pipelines.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-amber-400 block mb-0.5">
                  Biostatistics
                </span>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Clinical trials, epidemiology, genomic analysis, WHO/CDC roles.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-amber-400 block mb-0.5">
                  Actuarial Science
                </span>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Insurance risk modeling, pensions, quantitative financial analysis.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-amber-400 block mb-0.5">
                  Econometrics
                </span>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Macroeconomic forecasting, central banking policy, pricing analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
