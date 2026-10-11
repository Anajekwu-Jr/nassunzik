export type AcademicLevel = 100 | 200 | 300 | 400;
export type SemesterNumber = 1 | 2;

export interface Course {
  id: number;
  code: string;
  title: string;
  level: AcademicLevel;
  semester: SemesterNumber;
  units: number;
  description: string;
  outline: string;
  lecturer?: string;
  resources_count?: number;
}

export type ResourceType = 'past_question' | 'lecture_note' | 'table' | 'syllabus' | 'siwes' | 'form' | 'document';

export interface CourseResource {
  id: number;
  course_id?: number;
  course_code?: string;
  course_title?: string;
  title: string;
  resource_type: ResourceType;
  file_name: string;
  file_path: string;
  file_size?: string;
  level?: AcademicLevel;
  semester?: SemesterNumber;
  academic_year?: string;
  download_url?: string;
}

export interface StaffMember {
  id: number;
  name: string;
  title: string;
  role_category: 'HOD' | 'PROFESSOR' | 'SENIOR_LECTURER' | 'LECTURER' | 'ACADEMIC' | 'TECHNICAL' | 'NON_ACADEMIC';
  qualifications: string;
  specialization: string;
  email: string;
  phone: string;
  office: string;
  photo_url: string;
  bio: string;
  display_order?: number;
  publications?: Array<{
    citation: string;
    year?: string;
    journal?: string;
  }>;
}

export interface Executive {
  id: number;
  name: string;
  office: string;
  level: AcademicLevel;
  phone: string;
  email: string;
  photo_url: string;
  bio: string;
  tenure: string;
  display_order?: number;
}

export interface TimetableSlot {
  id: number;
  level: AcademicLevel;
  semester: SemesterNumber;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  start_time: string;
  end_time: string;
  course_code: string;
  course_title: string;
  venue: string;
  lecturer: string;
}

export interface EventItem {
  id: number;
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  organizer: string;
  photo_url: string;
  is_upcoming: boolean;
  registration_link?: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: 'high' | 'normal' | 'low';
  date: string;
  author: string;
  attachment_url?: string;
}

export interface ContactEntry {
  id: number;
  name: string;
  role: string;
  category: 'EXECUTIVE' | 'COURSE_REP' | 'HELPDESK' | 'ACADEMIC';
  email: string;
  phone: string;
  location: string;
}

export interface SearchResultItem {
  id: number | string;
  type: 'course' | 'staff' | 'executive' | 'resource' | 'event' | 'announcement';
  title: string;
  subtitle: string;
  details?: string;
  actionPayload?: any;
}
