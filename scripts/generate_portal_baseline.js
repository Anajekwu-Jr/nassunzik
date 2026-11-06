import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const backupFile = path.join(rootDir, 'data', 'portal_state_backup.json');
const state = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

// Build timetable mapping for course lecturers
const lecturerMap = {};
for (const tt of state.timetable) {
  const norm = tt.course_code.toUpperCase().replace(/\s+/g, '').replace('NAU-', '');
  if (!lecturerMap[norm]) lecturerMap[norm] = tt.lecturer;
  const full = tt.course_code.toUpperCase().trim();
  if (!lecturerMap[full]) lecturerMap[full] = tt.lecturer;
}

const courses = state.courses.map(c => {
  const norm = (c.code || '').toUpperCase().replace(/\s+/g, '').replace('NAU-', '');
  const full = (c.code || '').toUpperCase().trim();
  return {
    id: c.id,
    code: c.code,
    title: c.title,
    level: c.level,
    semester: c.semester,
    units: c.credit_units || 3,
    credit_units: c.credit_units || 3,
    description: c.description || '',
    outline: c.outline || '',
    lecturer: lecturerMap[norm] || lecturerMap[full] || 'Department Faculty',
    resources_count: (state.course_resources || []).filter(r => r.course_id === c.id).length
  };
});

const staff = state.staff.map(s => ({
  id: s.id,
  name: s.name,
  title: s.title,
  role_category: s.role_category,
  qualifications: s.qualifications || '',
  specialization: s.specialization || '',
  email: s.email || '',
  phone: s.phone || '',
  office: s.office || '',
  photo_url: s.photo_url || '/resources/images/staff_default.jpg',
  bio: s.bio || '',
  display_order: s.display_order
}));

const timetable = state.timetable.map(t => ({
  id: t.id,
  level: t.level,
  semester: t.semester,
  day: t.day,
  start_time: t.start_time,
  end_time: t.end_time,
  course_code: t.course_code,
  course_title: t.course_title,
  venue: t.venue,
  lecturer: t.lecturer
}));

const executives = state.executives.map(e => ({
  id: e.id,
  name: e.name,
  office: e.office,
  level: e.level,
  phone: e.phone || '',
  email: e.email || '',
  photo_url: e.photo_url || '/resources/images/exco_default.jpg',
  bio: e.bio || '',
  tenure: e.tenure || '2026/2027',
  display_order: e.display_order
}));

const events = state.events.map(ev => ({
  id: ev.id,
  title: ev.title,
  date: ev.date || '',
  time: ev.time || '',
  venue: ev.venue || '',
  description: ev.description || '',
  organizer: ev.organizer || 'Department of Statistics',
  photo_url: ev.photo_url || '/resources/images/event_default.jpg',
  is_upcoming: Boolean(ev.is_upcoming)
}));

const announcements = state.announcements.map(a => ({
  id: a.id,
  title: a.title,
  content: a.content || '',
  priority: a.priority === 'urgent' || a.priority === 'high' ? 'high' : 'normal',
  date: a.date || 'Oct 2026',
  author: a.author || 'Department of Statistics'
}));

const resources = state.course_resources.map(r => ({
  id: r.id,
  course_id: r.course_id,
  course_code: r.course_code,
  course_title: r.course_title,
  title: r.title,
  resource_type: r.resource_type,
  file_name: r.file_name,
  file_path: r.file_path,
  file_size: r.file_size,
  level: r.level,
  semester: r.semester,
  academic_year: r.academic_year,
  download_url: r.file_path
}));

const fileContent = `// Auto-generated baseline dataset from official UNIZIK Department of Statistics database
import {
  Course,
  CourseResource,
  StaffMember,
  Executive,
  TimetableSlot,
  EventItem,
  Announcement
} from '../types';

export const DEFAULT_COURSES: Course[] = ${JSON.stringify(courses, null, 2)};

export const DEFAULT_STAFF: StaffMember[] = ${JSON.stringify(staff, null, 2)};

export const DEFAULT_TIMETABLE: TimetableSlot[] = ${JSON.stringify(timetable, null, 2)};

export const DEFAULT_EXECUTIVES: Executive[] = ${JSON.stringify(executives, null, 2)};

export const DEFAULT_EVENTS: EventItem[] = ${JSON.stringify(events, null, 2)};

export const DEFAULT_ANNOUNCEMENTS: Announcement[] = ${JSON.stringify(announcements, null, 2)};

export const DEFAULT_RESOURCES: CourseResource[] = ${JSON.stringify(resources, null, 2)};
`;

const destFile = path.join(rootDir, 'src', 'data', 'portalBaseline.ts');
fs.writeFileSync(destFile, fileContent, 'utf8');
console.log('Successfully wrote src/data/portalBaseline.ts with all official portal data!');
