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

  async request(endpoint, options = {}) {
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

    try {
      const res = await fetch(`${this.baseUrl}${finalEndpoint}`, config);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`);
      }
      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
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
