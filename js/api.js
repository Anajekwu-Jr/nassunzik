/**
 * NASS Portal API Client
 * Clean Vanilla JavaScript API helper for all departmental portal endpoints
 */

const API = {
  baseUrl: '/api',

  getToken() {
    return localStorage.getItem('nass_auth_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('nass_auth_token', token);
    } else {
      localStorage.removeItem('nass_auth_token');
    }
  },

  getUser() {
    const userStr = localStorage.getItem('nass_auth_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser(user) {
    if (user) {
      localStorage.setItem('nass_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nass_auth_user');
    }
  },

  _snapshot: null,
  _snapshotPromise: null,

  async fetchBackupSnapshot() {
    if (this._snapshot) return this._snapshot;
    if (this._snapshotPromise) return this._snapshotPromise;
    this._snapshotPromise = (async () => {
      try {
        const res = await fetch('/data/portal_state_backup.json');
        if (res.ok) {
          const json = await res.json();
          this._snapshot = json;
          return json;
        }
      } catch (_) {}
      return null;
    })();
    return this._snapshotPromise;
  },

  getFallback(endpoint) {
    const clean = endpoint.split('?')[0].replace(/^\/api/, '');
    if (clean === '/executives' || clean === '/excos') {
      return [
        {
          id: 1,
          name: "Comr. Anajekwu Chidera Patrick (PhanCore)",
          office: "President & Executive Lead",
          portfolio: "President & Executive Lead",
          role: "President & Executive Lead",
          level: 400,
          phone: "08087955696",
          email: "cp.anajekwu@stu.unizik.edu.ng",
          photo_url: "/resources/images/executives/president.png?v=2",
          bio: "Leading the Executive Administration with dedication to student welfare, academic excellence, data skills development, and industrial linkages.",
          tenure: "2026/2027",
          display_order: 1
        },
        {
          id: 2,
          name: "Comr. Obunadike Vivian Chiemerie",
          office: "Vice President",
          portfolio: "Vice President",
          role: "Vice President",
          level: 400,
          phone: "+234 916 664 5452",
          email: "cv.obunadike@stu.unizik.edu.ng",
          photo_url: "/resources/images/executives/vice_president.jpg?v=2",
          bio: "Vice President of NASS UNIZIK Chapter, leading executive committee oversight, student welfare coordination, and collaborative departmental development.",
          tenure: "2026/2027",
          display_order: 2
        },
        {
          id: 3,
          name: "Comr. Chidozie Rejoice Ogochukwu",
          office: "Secretary General",
          portfolio: "Secretary General",
          role: "Secretary General",
          level: 400,
          phone: "07043119361",
          email: "ro.chidozie@stu.unizik.edu.ng",
          photo_url: "/resources/images/executives/secretary_general.jpg?v=2",
          bio: "Managing administrative correspondence, official secretarial records, meeting archives, and departmental notifications.",
          tenure: "2026/2027",
          display_order: 3
        },
        {
          id: 4,
          name: "Comr. Ejefonye Mmesoma Stephanie",
          office: "Director of Academics",
          portfolio: "Director of Academics",
          role: "Director of Academics",
          level: 300,
          phone: "07062399227",
          email: "m.ejefonye@stu.unizik.edu.ng",
          photo_url: "/resources/images/executives/director_of_academics.jpg?v=2",
          bio: "Directing academic affairs and scholastic development for statistics undergraduates. Coordinating course study circles, syllabus coverage, tutorial classes, and past question archives.",
          tenure: "2026/2027",
          display_order: 4
        },
        {
          id: 5,
          name: "Comr. Chinedu Chidinma Veronica",
          office: "Financial Secretary",
          portfolio: "Financial Secretary",
          role: "Financial Secretary",
          level: 400,
          phone: "09022372647",
          email: "vc.chinedu@stu.unizik.edu.ng",
          photo_url: "/resources/images/executives/financial_secretary.jpg?v=2",
          bio: "Responsible for departmental association dues records, fiscal receipts, statutory accounting, and financial transparency.",
          tenure: "2026/2027",
          display_order: 5
        },
        {
          id: 6,
          name: "Comr. Ezenwelu Chiamaka Princess",
          office: "Treasurer",
          portfolio: "Treasurer",
          role: "Treasurer",
          level: 400,
          phone: "09071473090",
          email: "cp.ezenwelu@stu.unizik.edu.ng",
          photo_url: "/resources/images/executives/treasurer.jpg?v=2",
          bio: "Custodian of association funds, managing treasury disbursements, banking transactions, and financial custody.",
          tenure: "2026/2027",
          display_order: 6
        },
        {
          id: 7,
          name: "Comr. Ugochukwu Franklin",
          office: "Director of Sports",
          portfolio: "Director of Sports",
          role: "Director of Sports",
          level: 400,
          phone: "08165607073",
          email: "f_878.ugochukwu@stu.unizik.edu.ng",
          photo_url: "/resources/images/executives/director_of_sports.jpg?v=2",
          bio: "Coordinating departmental athletic events, Dean Cup championships, inter-level football fixtures, and student fitness activities.",
          tenure: "2026/2027",
          display_order: 7
        },
        {
          id: 8,
          name: "Comr. Offorkee Chidera Elvis",
          office: "Director of Socials",
          portfolio: "Director of Socials",
          role: "Director of Socials",
          level: 300,
          phone: "08144016159",
          email: "",
          photo_url: "/resources/images/executives/director_of_socials.jpg?v=2",
          bio: "Coordinator of social activities in the department.",
          tenure: "2026/2027",
          display_order: 8
        }
      ];
    }
    if (clean === '/gallery') {
      const items = [
        {
          id: 8,
          title: "NASS - Probix Class of 2026",
          year: 2026,
          event_name: "Class Sets & Graduands",
          image_url: "/resources/images/gallery/probix_class_2026.jpg",
          description: "Official cohort portrait of the graduating Probix Class of 2026, Department of Statistics, Nnamdi Azikiwe University, Awka."
        },
        {
          id: 9,
          title: "NASS - Vantora Class of 2027",
          year: 2026,
          event_name: "Class Sets & Cohorts",
          image_url: "/resources/images/gallery/vantora_class_2027.jpg",
          description: "The energetic Vantora Class of 2027 during departmental assembly and academic orientation at the Faculty of Physical Sciences."
        },
        {
          id: 10,
          title: "NASS HOD Cup Runner Up 2025/2026",
          year: 2026,
          event_name: "Sports & Competitions",
          image_url: "/resources/images/gallery/hod_cup_runner_up_2025_2026.jpg",
          description: "Statistics departmental football team celebrating their runner-up triumph at the annual HOD Cup championship tournament."
        },
        {
          id: 11,
          title: "Prof Osuji with Vantora'27 after First SIWES Defense",
          year: 2026,
          event_name: "Academic Defense & Milestones",
          image_url: "/resources/images/gallery/prof_osuji_vantora27_siwes_defense_2026.jpg",
          description: "Prof. George A. Osuji alongside 300L Vantora Class of 2027 students following the successful conclusion of their 1st SIWES departmental oral defense."
        }
      ];
      const years = [2026];
      const grouped = { 2026: items };
      return { items, grouped, availableYears: years };
    }
    if (clean === '/events') {
      return [
        {
          id: 4,
          title: "Resumption of New Students & Lectures Begin",
          event_date: "2026-10-12",
          event_time: "08:00 AM - 04:00 PM",
          venue: "Department of Statistics & Faculty Lecture Theatres",
          description: "New students continue clearance, documentation, and introductory lectures begin for the 2026/2027 academic session.",
          category: "Resumption",
          status: "UPCOMING",
          registration_url: "#",
          banner_image: "/resources/images/event_orientation.jpg",
          is_featured: 1
        },
        {
          id: 5,
          title: "Resumption of Returning Students & Course Enrolment",
          event_date: "2026-10-14",
          event_time: "08:00 AM - 05:00 PM",
          venue: "Department of Statistics Building, UNIZIK Main Campus",
          description: "Old students return to campus. Payment of school charges, course registration, and full lectures commence.",
          category: "Resumption",
          status: "UPCOMING",
          registration_url: "#",
          banner_image: "/resources/images/event_workshop.jpg",
          is_featured: 1
        },
        {
          id: 6,
          title: "2024/2025 & 2025/2026 Convocation Ceremonies",
          event_date: "2026-11-15",
          event_time: "09:00 AM - 04:00 PM",
          venue: "UNIZIK Convocation Arena, Awka",
          description: "University convocation ceremonies celebrating graduating classes of the 2024/2025 and 2025/2026 academic sessions (Nov 15-20, 2026).",
          category: "Ceremony",
          status: "UPCOMING",
          registration_url: "#",
          banner_image: "/resources/images/event_siwes.jpg",
          is_featured: 0
        },
        {
          id: 7,
          title: "University-Wide Continuous Assessment Quiz",
          event_date: "2026-11-30",
          event_time: "09:00 AM - 03:00 PM",
          venue: "Classrooms & University CBT Center",
          description: "Mid-semester assessment test for all regular undergraduate courses across all levels.",
          category: "Examination",
          status: "UPCOMING",
          registration_url: "#",
          banner_image: "/resources/images/event_workshop.jpg",
          is_featured: 0
        }
      ];
    }
    if (clean === '/news') {
      return [
        {
          id: 7,
          title: "First Semester Examination Dates Announced: Monday, February 22 to Friday, March 19, 2027",
          category: "Examinations",
          author: "Department of Statistics / Examinations Committee",
          published_at: "2026-10-12",
          summary: "Official schedule for the First Semester Degree Examinations (both CBE and PBE) has been confirmed following academic revision week.",
          featured_image: "/resources/images/event_siwes.jpg",
          is_featured: 1
        },
        {
          id: 6,
          title: "Harmattan Semester 2026/2027 Lectures Officially Commence Across All Levels",
          category: "Academic",
          author: "HOD Office & Timetable Officer",
          published_at: "2026-10-12",
          summary: "Academic activities for the 2026/2027 session are in full swing at STAT Hall and STAT LAB following new student orientations.",
          featured_image: "/resources/images/event_orientation.jpg",
          is_featured: 1
        }
      ];
    }
    if (clean === '/settings') {
      return {
        department_name: "Department of Statistics",
        university: "Nnamdi Azikiwe University (UNIZIK)",
        faculty: "Faculty of Physical Sciences",
        current_session: "2026/2027",
        current_semester: "First Semester",
        hod_name: "Dr. Okechukwu Jeremiah Obulezi",
        staff_adviser: "Dr. Awopeju Kabiru Abidemi"
      };
    }
    if (clean === '/faqs') {
      return [
        {
          id: 1,
          question: "How do I register for my statistics courses this semester?",
          answer: "Log into the UNIZIK student portal, select your semester courses as specified in the NASS course directory, pay the appropriate departmental and faculty dues, and present your signed course form to your Course Adviser for endorsement.",
          category: "Registration"
        },
        {
          id: 2,
          question: "Who is my Course Adviser and where can I find them?",
          answer: "Each undergraduate level (100L through 400L) is assigned a dedicated Academic Staff Adviser. You can find their full contact details, office locations, and office consultation hours in the Departmental Directory or Administration section.",
          category: "Academic"
        },
        {
          id: 3,
          question: "What are the requirements for SIWES industrial training?",
          answer: "Students undergo 3-month industrial training twice: after 200L second semester and after 300L second semester. Pick up your official introduction letter from the SIWES Coordinator and submit your placement form to the departmental general office.",
          category: "SIWES"
        }
      ];
    }
    return null;
  },

  async getAsyncFallback(endpoint) {
    const clean = endpoint.split('?')[0].replace(/^\/api/, '');
    const sync = this.getFallback(endpoint);
    if (sync !== null) return sync;

    try {
      const snapshot = this._snapshot || (await this.fetchBackupSnapshot());
      if (snapshot) {
        if (clean === '/staff') {
          if (Array.isArray(snapshot.staff) && snapshot.staff.length > 0) return snapshot.staff;
        }
        if (clean === '/timetable') {
          if (Array.isArray(snapshot.timetable) && snapshot.timetable.length > 0) return snapshot.timetable;
        }
        if (clean === '/courses') {
          if (Array.isArray(snapshot.courses) && snapshot.courses.length > 0) {
            const resources = Array.isArray(snapshot.course_resources) ? snapshot.course_resources : [];
            return snapshot.courses.map(c => ({
              ...c,
              resources: resources.filter(r => r.course_id === c.id)
            }));
          }
        }
        if (clean === '/contacts') {
          if (Array.isArray(snapshot.contacts) && snapshot.contacts.length > 0) return snapshot.contacts;
        }
        if (clean === '/announcements') {
          if (Array.isArray(snapshot.announcements) && snapshot.announcements.length > 0) return snapshot.announcements;
        }
        if (clean === '/gallery') {
          if (Array.isArray(snapshot.gallery) && snapshot.gallery.length > 0) {
            const items = snapshot.gallery;
            const years = [...new Set(items.map(i => i.year))].sort((a, b) => b - a);
            const grouped = {};
            years.forEach(y => { grouped[y] = items.filter(i => i.year === y); });
            return { items, grouped, availableYears: years };
          }
        }
        if (clean === '/materials') {
          if (Array.isArray(snapshot.course_resources) && snapshot.course_resources.length > 0) {
            const courses = Array.isArray(snapshot.courses) ? snapshot.courses : [];
            const courseMap = new Map(courses.map(c => [c.id, c]));
            let list = snapshot.course_resources.map(cr => {
              const c = courseMap.get(cr.course_id) || {};
              return {
                ...cr,
                course_code: c.code || '',
                course_title: c.title || '',
                course_level: c.level || null,
                course_semester: c.semester || null,
                course_credit_units: c.credit_units || null
              };
            });
            // Parse query filters
            try {
              const searchParams = new URL(endpoint, 'http://localhost').searchParams;
              const resType = searchParams.get('resource_type');
              const level = searchParams.get('level');
              const semester = searchParams.get('semester');
              const search = searchParams.get('search');
              if (resType) list = list.filter(m => m.resource_type === resType);
              if (level) list = list.filter(m => String(m.course_level) === level);
              if (semester) list = list.filter(m => String(m.course_semester) === semester);
              if (search) {
                const q = search.toLowerCase().trim();
                list = list.filter(m => (m.title || '').toLowerCase().includes(q) || (m.course_code || '').toLowerCase().includes(q));
              }
            } catch (_) {}
            return list;
          }
        }
        if (clean === '/careers') {
          if (Array.isArray(snapshot.careers) && snapshot.careers.length > 0) {
            return snapshot.careers;
          }
        }
      }
    } catch (_) {}

    // Special fallback for careers from static data file
    if (clean === '/careers') {
      try {
        const res = await fetch('/data/career_pathways.json');
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) return list;
        }
      } catch (_) {}
    }

    // Special fallback for staff from official CIRS staff json
    if (clean === '/staff') {
      try {
        const res = await fetch('/data/official_cirs_staff.json');
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) return list;
        }
      } catch (_) {}
    }

    return null;
  },

  async request(endpoint, options = {}, retries = 2) {
    const headers = options.headers || {};
    const token = this.getToken();

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const isGet = !options.method || options.method.toUpperCase() === 'GET';
    const separator = endpoint.includes('?') ? '&' : '?';
    const finalEndpoint = isGet ? `${endpoint}${separator}_t=${Date.now()}` : endpoint;

    const config = {
      cache: 'no-cache',
      ...options,
      headers
    };

    let attempt = 0;
    while (attempt <= retries) {
      try {
        const res = await fetch(`${this.baseUrl}${finalEndpoint}`, config);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (isGet) {
            // Check cache first
            try {
              const cacheKey = `nass_api_cache_${endpoint}`;
              const cached = localStorage.getItem(cacheKey);
              if (cached) {
                console.warn(`[NassAPI] Server returned ${res.status}, serving cached data for ${endpoint}`);
                return JSON.parse(cached);
              }
            } catch (_) {}

            // Check async snapshot / built-in fallback
            const fallback = await this.getAsyncFallback(endpoint);
            if (fallback !== null) {
              console.warn(`[NassAPI] Server returned ${res.status}, serving resilient fallback for ${endpoint}`);
              return fallback;
            }
          }
          throw new Error(data.error || `Request failed with status ${res.status}`);
        }

        // Cache successful GET responses in localStorage for instant offline access
        if (isGet && data) {
          try {
            const cacheKey = `nass_api_cache_${endpoint}`;
            localStorage.setItem(cacheKey, JSON.stringify(data));
          } catch (_) {}
        }

        return data;
      } catch (err) {
        attempt++;
        if (attempt <= retries && isGet) {
          // Retry momentarily on connection / network glitch
          await new Promise(r => setTimeout(r, attempt * 200));
          continue;
        }

        // On failure for GET, serve cached copy if available
        if (isGet) {
          try {
            const cacheKey = `nass_api_cache_${endpoint}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
              console.warn(`[NassAPI] Serving cached data for ${endpoint}:`, err.message || err);
              return JSON.parse(cached);
            }
          } catch (_) {}

          // Built-in / async fallback
          const fallback = await this.getAsyncFallback(endpoint);
          if (fallback !== null) {
            console.warn(`[NassAPI] Serving offline fallback for ${endpoint}:`, err.message || err);
            return fallback;
          }
        }

        console.warn(`[NassAPI] Request notice [${endpoint}]:`, err.message || err);
        throw err;
      }
    }
  },

  // Auth
  login(firstArg, secondArg) {
    let payload;
    if (typeof firstArg === 'object' && firstArg !== null) {
      payload = firstArg;
    } else if (secondArg !== undefined) {
      payload = { username: firstArg, password: secondArg };
    } else {
      // Single argument is password
      payload = { password: firstArg };
    }
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getMe() {
    return this.request('/auth/me');
  },

  // Site Settings & General Info
  getSettings() {
    return this.request('/settings');
  },

  updateSettings(data) {
    return this.request('/settings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Courses
  getCourses(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/courses${query ? '?' + query : ''}`);
  },

  getCourse(id) {
    return this.request(`/courses/${id}`);
  },

  createCourse(courseData) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  },

  updateCourse(id, courseData) {
    return this.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    });
  },

  deleteCourse(id) {
    return this.request(`/courses/${id}`, { method: 'DELETE' });
  },

  addCourseResource(courseId, resourceData) {
    return this.request(`/courses/${courseId}/resources`, {
      method: 'POST',
      body: JSON.stringify(resourceData)
    });
  },

  deleteCourseResource(resourceId) {
    return this.request(`/courses/resources/${resourceId}`, { method: 'DELETE' });
  },

  // Timetable
  getTimetable(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/timetable${query ? '?' + query : ''}`);
  },

  createTimetable(data) {
    return this.request('/timetable', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateTimetable(id, data) {
    return this.request(`/timetable/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteTimetable(id) {
    return this.request(`/timetable/${id}`, { method: 'DELETE' });
  },

  // Staff
  getStaff(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/staff${query ? '?' + query : ''}`);
  },

  createStaff(data) {
    return this.request('/staff', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateStaff(id, data) {
    return this.request(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteStaff(id) {
    return this.request(`/staff/${id}`, { method: 'DELETE' });
  },

  // Executives
  getExecutives(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/executives${query ? '?' + query : ''}`);
  },

  createExecutive(data) {
    return this.request('/executives', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateExecutive(id, data) {
    return this.request(`/executives/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteExecutive(id) {
    return this.request(`/executives/${id}`, { method: 'DELETE' });
  },

  // News
  getNews(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/news${query ? '?' + query : ''}`);
  },

  getNewsItem(idOrSlug) {
    return this.request(`/news/${idOrSlug}`);
  },

  createNews(data) {
    return this.request('/news', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateNews(id, data) {
    return this.request(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteNews(id) {
    return this.request(`/news/${id}`, { method: 'DELETE' });
  },

  // Events
  getEvents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/events${query ? '?' + query : ''}`);
  },

  createEvent(data) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateEvent(id, data) {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteEvent(id) {
    return this.request(`/events/${id}`, { method: 'DELETE' });
  },

  // SIWES
  getSiwes(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/siwes${query ? '?' + query : ''}`);
  },

  createSiwes(data) {
    return this.request('/siwes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateSiwes(id, data) {
    return this.request(`/siwes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteSiwes(id) {
    return this.request(`/siwes/${id}`, { method: 'DELETE' });
  },

  // Projects
  getProjects(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/projects${query ? '?' + query : ''}`);
  },

  createProject(data) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateProject(id, data) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteProject(id) {
    return this.request(`/projects/${id}`, { method: 'DELETE' });
  },

  // Gallery
  getGallery(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/gallery${query ? '?' + query : ''}`);
  },

  createGallery(data) {
    return this.request('/gallery', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateGallery(id, data) {
    return this.request(`/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteGallery(id) {
    return this.request(`/gallery/${id}`, { method: 'DELETE' });
  },

  // Contacts
  getContacts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/contacts${query ? '?' + query : ''}`);
  },

  createContact(data) {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateContact(id, data) {
    return this.request(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteContact(id) {
    return this.request(`/contacts/${id}`, { method: 'DELETE' });
  },

  // Announcements
  getAnnouncements(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/announcements${query ? '?' + query : ''}`);
  },

  createAnnouncement(data) {
    return this.request('/announcements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateAnnouncement(id, data) {
    return this.request(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteAnnouncement(id) {
    return this.request(`/announcements/${id}`, { method: 'DELETE' });
  },

  // Search
  search(query) {
    return this.request(`/search?q=${encodeURIComponent(query)}`);
  },

  // Stats
  getStats() {
    return this.request('/stats');
  },

  // Materials (Course resources)
  getMaterials(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/materials${query ? '?' + query : ''}`);
  },

  createMaterial(data) {
    return this.request('/materials', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateMaterial(id, data) {
    return this.request(`/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteMaterial(id) {
    return this.request(`/materials/${id}`, { method: 'DELETE' });
  },

  // FAQs
  getFaqs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/faqs${query ? '?' + query : ''}`);
  },

  createFaq(data) {
    return this.request('/faqs', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateFaq(id, data) {
    return this.request(`/faqs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteFaq(id) {
    return this.request(`/faqs/${id}`, { method: 'DELETE' });
  },

  // File Upload
  uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/upload', {
      method: 'POST',
      body: formData
    });
  }
};

// Listen for real-time portal updates from Admin editor
if (typeof window !== 'undefined') {
  function clearApiCache() {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('nass_api_cache_')) {
          localStorage.removeItem(key);
        }
      }
    } catch (_) {}
  }

  if ('BroadcastChannel' in window) {
    try {
      const channel = new BroadcastChannel('nass_portal_channel');
      channel.onmessage = function() {
        clearApiCache();
      };
    } catch (_) {}
  }

  window.addEventListener('storage', function(e) {
    if (e.key === 'nass_data_updated' || e.key === 'nass_settings_updated' || e.key === 'nass_portal_last_synced') {
      clearApiCache();
    }
  });

  window.addEventListener('nass:data_updated', function() {
    clearApiCache();
  });
}

window.NassAPI = API;
