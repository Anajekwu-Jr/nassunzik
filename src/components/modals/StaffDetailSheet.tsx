import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Phone, Mail, Building, Award, BookOpen, ExternalLink, Calendar } from 'lucide-react';
import { DEFAULT_TIMETABLE } from '../../data/portalBaseline';

export const StaffDetailSheet: React.FC = () => {
  const { activeStaff, setActiveStaff, triggerHaptic } = useApp();

  if (!activeStaff) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end">
      <div
        className="w-full max-w-md mx-auto bg-[#061226] rounded-t-3xl border-t border-blue-900/60 max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200"
      >
        {/* Header */}
        <div className="p-4 pb-2 border-b border-blue-900/40 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={activeStaff.photo_url || '/resources/images/staff_default.jpg'}
              alt={activeStaff.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-500/40"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/resources/images/staff_default.jpg';
              }}
            />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 border border-amber-600/50 px-2 py-0.5 rounded-md inline-block mb-1">
                {activeStaff.role_category === 'HOD' ? 'HEAD OF DEPARTMENT' : activeStaff.title}
              </span>
              <h2 className="text-sm font-bold text-white leading-snug">
                {activeStaff.name}
              </h2>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {activeStaff.specialization}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setActiveStaff(null);
            }}
            className="p-2 rounded-xl border border-blue-900/50 text-slate-400 hover:text-white hover:bg-blue-900/30 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons Bar (Call / Email) */}
        <div className="p-4 pt-3 pb-2 flex items-center gap-2 border-b border-blue-900/40">
          {activeStaff.phone && (
            <a
              href={`tel:${activeStaff.phone.replace(/[^+\d]/g, '')}`}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Office</span>
            </a>
          )}

          {activeStaff.email && (
            <a
              href={`mailto:${activeStaff.email}`}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Staff</span>
            </a>
          )}
        </div>

        {/* Scrollable Details */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Office Location */}
          <div className="p-3 rounded-xl bg-[#040b17] border border-blue-900/50 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-amber-400" />
              Department Office
            </span>
            <p className="text-slate-200 font-medium">{activeStaff.office}</p>
          </div>

          {/* Academic Qualifications */}
          {activeStaff.qualifications && (
            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Academic Qualifications
              </h3>
              <p className="text-slate-300 bg-[#040b17] p-3 rounded-xl border border-blue-900/50 leading-relaxed">
                {activeStaff.qualifications}
              </p>
            </div>
          )}

          {/* Scholarly Biography */}
          {activeStaff.bio && (
            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                Scholarly Biography & Research Profile
              </h3>
              <p className="text-slate-300 bg-[#040b17] p-3 rounded-xl border border-blue-900/50 leading-relaxed whitespace-pre-line">
                {activeStaff.bio}
              </p>
            </div>
          )}

          {/* Assigned Lecture Slots from Official Timetable */}
          {(() => {
            const nameParts = (activeStaff.name || '').split(' ');
            const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
            const assigned = DEFAULT_TIMETABLE.filter(t => 
              t.lecturer && surname && t.lecturer.toLowerCase().includes(surname.toLowerCase())
            );
            if (assigned.length === 0) return null;
            return (
              <div className="space-y-2">
                <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Harmonized Lecture Allocations ({assigned.length})
                </h3>
                <div className="space-y-1.5">
                  {assigned.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-2.5 rounded-xl bg-[#040b17] border border-blue-900/50 flex items-center justify-between gap-2 text-[11px]"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold text-amber-400">{slot.course_code}</span>
                          <span className="text-[10px] text-slate-400">· {slot.day} {slot.start_time}–{slot.end_time}</span>
                        </div>
                        <p className="text-white font-medium truncate">{slot.course_title}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-blue-300 bg-blue-950/80 border border-blue-800/40 px-2 py-0.5 rounded shrink-0">
                        {slot.venue}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
