import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StatsAPI } from '../services/api';
import { StaffMember, Executive } from '../types';
import {
  Users,
  GraduationCap,
  Landmark,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Search,
  Award,
  BookOpen,
  Building,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';

export const DepartmentScreen: React.FC = () => {
  const { setActiveStaff, triggerHaptic } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'staff' | 'executives' | 'about' | 'contact'>('staff');
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [execList, setExecList] = useState<Executive[]>([]);
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('all');
  const [staffSearch, setStaffSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [staff, execs] = await Promise.all([
        StatsAPI.getStaff(),
        StatsAPI.getExecutives()
      ]);
      setStaffList(staff);
      setExecList(execs);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredStaff = staffList.filter((s) => {
    if (staffRoleFilter !== 'all') {
      if (staffRoleFilter === 'prof' && !s.title.toLowerCase().includes('prof') && s.role_category !== 'HOD') return false;
      if (staffRoleFilter === 'senior' && s.role_category !== 'SENIOR_LECTURER') return false;
      if (staffRoleFilter === 'hod' && s.role_category !== 'HOD') return false;
    }
    if (staffSearch.trim()) {
      const q = staffSearch.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.specialization.toLowerCase().includes(q) ||
        s.office.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 pb-20 px-4 pt-3 space-y-4">
      {/* Sub-tab Navigation */}
      <div className="bg-[#061226] p-1 rounded-xl border border-blue-900/50 flex items-center shadow-sm">
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            setActiveSubTab('staff');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeSubTab === 'staff'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Staff
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            setActiveSubTab('executives');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeSubTab === 'executives'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          NASS Exco
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            setActiveSubTab('about');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeSubTab === 'about'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          About & History
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            setActiveSubTab('contact');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeSubTab === 'contact'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Contact
        </button>
      </div>

      {/* 1. STAFF DIRECTORY */}
      {activeSubTab === 'staff' && (
        <div className="space-y-3">
          {/* Staff Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search faculty by name or research field..."
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition"
            />
          </div>

          {/* Role Filter Chips */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'All Faculty' },
              { id: 'hod', label: 'HOD' },
              { id: 'prof', label: 'Professors' },
              { id: 'senior', label: 'Senior Lecturers' }
            ].map((rf) => (
              <button
                key={rf.id}
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setStaffRoleFilter(rf.id);
                }}
                className={`py-1 px-2.5 rounded-lg text-xs font-medium border transition ${
                  staffRoleFilter === rf.id
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {rf.label}
              </button>
            ))}
          </div>

          {/* Staff List */}
          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400">
              Loading faculty directory...
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
              <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-300">No staff found</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Try a different search keyword or filter.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredStaff.map((staff) => (
                <div
                  key={staff.id}
                  onClick={() => {
                    triggerHaptic();
                    setActiveStaff(staff);
                  }}
                  role="button"
                  tabIndex={0}
                  className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-[0.99] transition cursor-pointer space-y-2"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={staff.photo_url || '/resources/images/staff_default.jpg'}
                      alt={staff.name}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/resources/images/staff_default.jpg';
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.2 rounded">
                          {staff.role_category === 'HOD' ? 'HEAD OF DEPT' : staff.title}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white truncate">
                        {staff.name}
                      </h4>

                      <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                        {staff.specialization}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 self-center" />
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[200px] flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      {staff.office}
                    </span>

                    <div className="flex items-center gap-2">
                      {staff.phone && (
                        <a
                          href={`tel:${staff.phone.replace(/[^+\d]/g, '')}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition"
                          title="Call Staff"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {staff.email && (
                        <a
                          href={`mailto:${staff.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 flex items-center justify-center transition"
                          title="Email Staff"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. NASS STUDENT EXECUTIVES */}
      {activeSubTab === 'executives' && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-white">NASS UNIZIK Chapter</span>
            <span className="text-amber-400 font-bold">2026/2027 Executive Council</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {execList.map((exec) => (
              <div
                key={exec.id}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={exec.photo_url || '/resources/images/exec_default.jpg'}
                    alt={exec.name}
                    className="w-14 h-14 rounded-xl object-cover ring-1 ring-amber-500/30 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/resources/images/staff_default.jpg';
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.2 rounded inline-block mb-1">
                      {exec.office}
                    </span>

                    <h4 className="text-xs font-bold text-white truncate">
                      {exec.name}
                    </h4>

                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {exec.level} Level · Tenure {exec.tenure}
                    </div>
                  </div>
                </div>

                {exec.bio && (
                  <p className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-slate-800/80">
                    {exec.bio}
                  </p>
                )}

                {/* Direct Tap Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                  {exec.phone && (
                    <a
                      href={`tel:${exec.phone.replace(/[^+\d]/g, '')}`}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call {exec.phone}</span>
                    </a>
                  )}

                  {exec.email && (
                    <a
                      href={`mailto:${exec.email}`}
                      className="py-1.5 px-3 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition"
                      title="Email Executive"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ABOUT & HISTORY */}
      {activeSubTab === 'about' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Department Profile
            </span>
            <h3 className="text-sm font-bold text-white">
              Department of Statistics, Nnamdi Azikiwe University
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Established within the Faculty of Physical Sciences, the Department of Statistics at Nnamdi Azikiwe University is a premier center of excellence in mathematical statistics, computational data analytics, operations research, and empirical decision sciences.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Vision & Mission
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong className="text-white">Motto:</strong> <em>"Facts from Figures"</em>
              </p>
              <p>
                <strong className="text-white">Vision:</strong> To produce world-class statistical scientists capable of transforming complex stochastic data into actionable intelligence for science, industry, governance, and technology.
              </p>
              <p>
                <strong className="text-white">Mission:</strong> To provide rigorous education in probability calculus, statistical modeling, algorithmic computing in R and Python, and interdisciplinary research.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Accreditation & Standards
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              The Department holds Full Accreditation status from the National Universities Commission (NUC). Our undergraduate curriculum integrates modern data science competencies with international statistical body guidelines (Chartered Institute of Statisticians of Nigeria - CISON, Professional Statisticians Society of Nigeria - PSSN).
            </p>
          </div>
        </div>
      )}

      {/* 4. CONTACT & SECRETARIAT */}
      {activeSubTab === 'contact' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Department Secretariat</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Faculty of Physical Sciences Complex (Statistics Wing), Nnamdi Azikiwe University Main Campus, Awka, Anambra State, Nigeria.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-slate-800">
              <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Official Correspondence</h4>
                <a
                  href="mailto:statistics@unizik.edu.ng"
                  className="text-xs text-amber-400 hover:underline block mt-0.5"
                >
                  statistics@unizik.edu.ng
                </a>
                <a
                  href="mailto:help@nass-unizik.org"
                  className="text-xs text-slate-400 hover:underline block"
                >
                  help@nass-unizik.org (Student Helpdesk)
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-slate-800">
              <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">HOD & Administrative Line</h4>
                <a
                  href="tel:+2348033421190"
                  className="text-xs text-slate-300 hover:text-amber-400 block mt-0.5"
                >
                  +234 803 342 1190
                </a>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-white">Helpdesk Hours</h4>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Monday – Friday:</span>
                <span className="text-slate-200">8:00 AM – 4:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Weekends & Public Holidays:</span>
                <span className="text-slate-500">Closed</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
