import {
  Course,
  CourseResource,
  StaffMember,
  Executive,
  TimetableSlot,
  EventItem,
  Announcement,
  SearchResultItem,
  AcademicLevel,
  SemesterNumber
} from '../types';
import {
  DEFAULT_COURSES,
  DEFAULT_STAFF,
  DEFAULT_TIMETABLE,
  DEFAULT_EXECUTIVES,
  DEFAULT_EVENTS,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_RESOURCES
} from '../data/portalBaseline';

export {
  DEFAULT_COURSES,
  DEFAULT_STAFF,
  DEFAULT_TIMETABLE,
  DEFAULT_EXECUTIVES,
  DEFAULT_EVENTS,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_RESOURCES
};

const API_BASE = '/api';
const CACHE_KEY = 'nass_unizik_mobile_cache_v8';

// Clear legacy cached data from prior versions with fake data
try {
  const legacyKeys = ['nass_unizik_mobile_cache_v1', 'nass_unizik_mobile_cache_v2', 'nass_unizik_mobile_cache_v3', 'nass_unizik_mobile_cache_v4', 'nass_unizik_mobile_cache_v5', 'nass_unizik_mobile_cache_v6', 'nass_unizik_mobile_cache_v7'];
  for (const k of legacyKeys) {
    localStorage.removeItem(k);
  }
} catch (_) {}

function getLocalCache<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    return (data[key] as T) || fallback;
  } catch {
    return fallback;
  }
}

function setLocalCache(key: string, value: any) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[key] = value;
    data._timestamp = Date.now();
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Cache write warning:', e);
  }
}

export const StatsAPI = {
  async getCourses(level?: AcademicLevel, semester?: SemesterNumber): Promise<Course[]> {
    try {
      const params = new URLSearchParams();
      if (level) params.append('level', level.toString());
      if (semester) params.append('semester', semester.toString());
      
      const res = await fetch(`${API_BASE}/courses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Course[] = data.map((c: any) => ({
            ...c,
            units: c.units || c.credit_units || 3,
            credit_units: c.credit_units || c.units || 3,
            lecturer: c.lecturer || 'Department Faculty'
          }));
          setLocalCache('courses', mapped);
          return mapped;
        }
      }
    } catch (err) {
      console.warn('Using cached courses:', err);
    }
    const cached = getLocalCache<Course[]>('courses', DEFAULT_COURSES);
    return cached.filter(c => (!level || c.level === level) && (!semester || c.semester === semester));
  },

  async getCourseDetails(id: number | string): Promise<Course | null> {
    try {
      const res = await fetch(`${API_BASE}/courses/${id}`);
      if (res.ok) {
        const c = await res.json();
        return {
          ...c,
          units: c.units || c.credit_units || 3,
          credit_units: c.credit_units || c.units || 3,
          lecturer: c.lecturer || 'Department Faculty'
        };
      }
    } catch (err) {
      console.warn('Course detail fetch error:', err);
    }
    const courses = getLocalCache<Course[]>('courses', DEFAULT_COURSES);
    return courses.find(c => c.id === Number(id) || c.code === id) || null;
  },

  async getTimetable(level?: AcademicLevel, semester?: SemesterNumber): Promise<TimetableSlot[]> {
    try {
      const params = new URLSearchParams();
      if (level) params.append('level', level.toString());
      if (semester) params.append('semester', semester.toString());
      const res = await fetch(`${API_BASE}/timetable?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocalCache(`timetable_${level || 'all'}_${semester || 'all'}`, data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Using cached timetable:', err);
    }
    const cached = getLocalCache<TimetableSlot[]>(`timetable_${level || 'all'}_${semester || 'all'}`, DEFAULT_TIMETABLE);
    return cached.filter(t => (!level || t.level === level) && (!semester || t.semester === semester));
  },

  async getStaff(): Promise<StaffMember[]> {
    try {
      const res = await fetch(`${API_BASE}/staff`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocalCache('staff', data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Using cached staff:', err);
    }
    return getLocalCache<StaffMember[]>('staff', DEFAULT_STAFF);
  },

  async getExecutives(): Promise<Executive[]> {
    try {
      const res = await fetch(`${API_BASE}/executives`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocalCache('executives', data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Using cached executives:', err);
    }
    return getLocalCache<Executive[]>('executives', DEFAULT_EXECUTIVES);
  },

  async getResources(category?: string, level?: AcademicLevel, semester?: SemesterNumber): Promise<CourseResource[]> {
    try {
      const res = await fetch(`${API_BASE}/materials`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocalCache('resources', data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Using cached resources:', err);
    }
    const cached = getLocalCache<CourseResource[]>('resources', DEFAULT_RESOURCES);
    return cached.filter(r => {
      if (category && category !== 'all' && r.resource_type !== category) return false;
      if (level && r.level && r.level !== level) return false;
      if (semester && r.semester && r.semester !== semester) return false;
      return true;
    });
  },

  async getEvents(): Promise<EventItem[]> {
    try {
      const res = await fetch(`${API_BASE}/events`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocalCache('events', data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Using cached events:', err);
    }
    return getLocalCache<EventItem[]>('events', DEFAULT_EVENTS);
  },

  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const res = await fetch(`${API_BASE}/announcements`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Announcement[] = data.map((item: any, idx: number) => {
            const isUrgent = (item.priority && item.priority.toLowerCase() === 'urgent') || item.priority === 'IMPORTANT' || item.priority === 'high';
            return {
              id: item.id || idx + 1,
              title: item.title,
              content: item.content,
              priority: isUrgent ? 'high' : 'normal',
              date: item.date || (item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Oct 2026'),
              author: item.author || (isUrgent ? 'Head of Department' : 'Academic Directorate')
            };
          });
          setLocalCache('announcements', mapped);
          return mapped;
        }
      }
    } catch (err) {
      console.warn('Using cached announcements:', err);
    }
    return getLocalCache<Announcement[]>('announcements', DEFAULT_ANNOUNCEMENTS);
  },

  async searchGlobal(query: string): Promise<SearchResultItem[]> {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          return data.results.map((item: any) => ({
            id: item.id || Math.random(),
            type: item.type || 'resource',
            title: item.title || item.name || '',
            subtitle: item.subtitle || item.code || item.role || '',
            details: item.details || item.description || '',
            actionPayload: item
          }));
        }
      }
    } catch {
      // Fallback local search
    }

    const courses = getLocalCache<Course[]>('courses', DEFAULT_COURSES);
    const resources = getLocalCache<CourseResource[]>('resources', DEFAULT_RESOURCES);
    const staff = getLocalCache<StaffMember[]>('staff', DEFAULT_STAFF);
    const execs = getLocalCache<Executive[]>('executives', DEFAULT_EXECUTIVES);
    const events = getLocalCache<EventItem[]>('events', DEFAULT_EVENTS);

    const matches: SearchResultItem[] = [];

    courses.forEach(c => {
      if (c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
        matches.push({
          id: `c-${c.id}`,
          type: 'course',
          title: `${c.code}: ${c.title}`,
          subtitle: `${c.level} Level · ${c.units || c.credit_units} Units · Semester ${c.semester}`,
          details: c.description,
          actionPayload: c
        });
      }
    });

    resources.forEach(r => {
      if (r.title.toLowerCase().includes(q) || r.file_name.toLowerCase().includes(q) || (r.course_code && r.course_code.toLowerCase().includes(q))) {
        matches.push({
          id: `r-${r.id}`,
          type: 'resource',
          title: r.title,
          subtitle: `${r.course_code || 'General'} · ${r.resource_type.toUpperCase()} · ${r.file_size || ''}`,
          details: r.file_name,
          actionPayload: r
        });
      }
    });

    staff.forEach(s => {
      if (s.name.toLowerCase().includes(q) || s.specialization.toLowerCase().includes(q) || s.office.toLowerCase().includes(q)) {
        matches.push({
          id: `s-${s.id}`,
          type: 'staff',
          title: s.name,
          subtitle: `${s.title} · ${s.role_category}`,
          details: s.specialization,
          actionPayload: s
        });
      }
    });

    execs.forEach(e => {
      if (e.name.toLowerCase().includes(q) || e.office.toLowerCase().includes(q)) {
        matches.push({
          id: `e-${e.id}`,
          type: 'executive',
          title: e.name,
          subtitle: `${e.office} · ${e.level} Level`,
          details: e.bio,
          actionPayload: e
        });
      }
    });

    events.forEach(ev => {
      if (ev.title.toLowerCase().includes(q) || ev.description.toLowerCase().includes(q)) {
        matches.push({
          id: `ev-${ev.id}`,
          type: 'event',
          title: ev.title,
          subtitle: `${ev.date} · ${ev.venue}`,
          details: ev.description,
          actionPayload: ev
        });
      }
    });

    return matches;
  }
};
