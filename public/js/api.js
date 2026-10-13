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

  getFallback(endpoint) {
    const clean = endpoint.split('?')[0].replace(/^\/api/, '');
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
          throw new Error(data.error || `Request failed with status ${res.status}`);
        }

        // Cache successful GET responses in localStorage for instant offline access
        if (isGet && data) {
          try {
            const cacheKey = `nass_api_cache_${endpoint.split('?')[0]}`;
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
            const cacheKey = `nass_api_cache_${endpoint.split('?')[0]}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
              console.warn(`[NassAPI] Serving cached data for ${endpoint}:`, err.message || err);
              return JSON.parse(cached);
            }
          } catch (_) {}

          // Built-in fallback
          const fallback = this.getFallback(endpoint);
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

window.NassAPI = API;
