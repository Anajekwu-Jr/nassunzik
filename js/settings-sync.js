/**
 * NASS Departmental Portal - Dynamic Content & Settings Reactive Synchronization
 * Loads site settings from the admin-managed API, hydrates content across all pages,
 * and listens for live updates from the admin portal to re-sync public views in real time.
 */
(function () {
  async function syncSiteSettings() {
    try {
      const res = await fetch('/api/settings?_t=' + Date.now());
      if (!res.ok) return;
      const settings = await res.json();
      window.NassSettings = settings;

      // Handle key aliases
      if (settings.dept_name && !settings.department_name) settings.department_name = settings.dept_name;
      if (settings.department_name && !settings.dept_name) settings.dept_name = settings.department_name;
      if (settings.accreditation && !settings.stat_accreditation) settings.stat_accreditation = settings.accreditation;
      if (settings.stat_accreditation && !settings.accreditation) settings.accreditation = settings.stat_accreditation;

      // 1. Update elements with data-setting="<key>"
      document.querySelectorAll('[data-setting]').forEach(el => {
        const key = el.getAttribute('data-setting');
        const val = settings[key];
        if (val !== undefined && val !== '') {
          if (el.tagName === 'IMG') {
            el.src = val;
          } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.value = val;
          } else if (el.tagName === 'A') {
            if (el.href.startsWith('mailto:')) {
              el.href = 'mailto:' + val;
              if (el.textContent.includes('@')) el.textContent = val;
            } else if (el.href.startsWith('tel:')) {
              el.href = 'tel:' + val.replace(/[^0-9+]/g, '');
              if (/[0-9]/.test(el.textContent)) el.textContent = val;
            } else if (key.includes('url') || key.includes('link')) {
              el.href = val;
            } else {
              el.textContent = val;
            }
          } else {
            // If the element has multiple paragraphs or newlines in setting, render paragraphs
            if (typeof val === 'string' && val.includes('\n\n')) {
              el.innerHTML = val.split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
            } else if (typeof val === 'string' && val.includes('\n')) {
              el.innerHTML = val.replace(/\n/g, '<br>');
            } else {
              el.textContent = val;
            }
          }
        }
      });

      // 2. Hydrate specific recognized elements by ID if present
      const map = {
        'hodWelcomeText': settings.hod_welcome,
        'hodNameDisplay': settings.hod_name,
        'hodTitleDisplay': settings.hod_title,
        'hodImageDisplay': settings.hod_image,
        'heroMottoDisplay': settings.motto,
        'academicSessionDisplay': settings.session,
        'academicSemesterDisplay': settings.semester,
        'heroCurrentSession': settings.session,
        'heroCurrentSemester': settings.semester,
        'barCurrentSession': settings.session,
        'barCurrentSemester': settings.semester,
        'adminTopSession': settings.session,
        'adminTopSemester': settings.semester,
        'aboutHistoryDisplay': settings.about_history,
        'aboutVisionDisplay': settings.about_vision,
        'aboutMissionDisplay': settings.about_mission,
        'aboutPhilosophyDisplay': settings.about_philosophy,
        'aboutFacilitiesDisplay': settings.about_facilities,
        'statStudentsDisplay': settings.stat_students,
        'statFacultyDisplay': settings.stat_faculty,
        'statCoursesDisplay': settings.stat_courses,
        'statGraduatesDisplay': settings.stat_graduates,
        'officeHoursDisplay': settings.office_hours,
        'officeLocationDisplay': settings.office_location,
        'contactEmailDisplay': settings.email,
        'contactPhoneDisplay': settings.phone
      };

      for (const [id, val] of Object.entries(map)) {
        if (!val) continue;
        const target = document.getElementById(id);
        if (target) {
          if (target.tagName === 'IMG') {
            target.src = val;
          } else if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            target.value = val;
          } else if (typeof val === 'string' && val.includes('\n\n')) {
            target.innerHTML = val.split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
          } else if (typeof val === 'string' && val.includes('\n')) {
            target.innerHTML = val.replace(/\n/g, '<br>');
          } else {
            target.textContent = val;
          }
        }
      }
    } catch (err) {
      console.warn('Could not sync dynamic site settings:', err);
    }
  }

  // Function to refresh current page's dynamic content
  function refreshPageData(module) {
    syncSiteSettings();

    // Trigger page-specific loaders if available on current window
    if (typeof window.loadHomeData === 'function') {
      window.loadHomeData();
    }
    if (typeof window.loadCourses === 'function' && (!module || module === 'courses' || module === 'materials')) {
      window.loadCourses();
    }
    if (typeof window.loadTimetable === 'function' && (!module || module === 'timetable')) {
      window.loadTimetable();
    }
    if (typeof window.loadStaff === 'function' && (!module || module === 'staff')) {
      window.loadStaff();
    }
    if (typeof window.loadExecutives === 'function' && (!module || module === 'executives')) {
      window.loadExecutives();
    }
    if (typeof window.loadNews === 'function' && (!module || module === 'news')) {
      window.loadNews();
    }
    if (typeof window.loadEvents === 'function' && (!module || module === 'events')) {
      window.loadEvents();
    }
    if (typeof window.loadContacts === 'function' && (!module || module === 'contacts')) {
      window.loadContacts();
    }
    if (typeof window.loadGallery === 'function' && (!module || module === 'gallery')) {
      window.loadGallery();
    }
    if (typeof window.loadSiwes === 'function' && (!module || module === 'siwes')) {
      window.loadSiwes();
    }
    if (typeof window.loadProjects === 'function' && (!module || module === 'projects')) {
      window.loadProjects();
    }
  }

  // Expose globally
  window.syncSiteSettings = syncSiteSettings;
  window.refreshNassData = refreshPageData;

  // Listen to cross-tab updates from Admin Portal
  window.addEventListener('storage', (e) => {
    if (e.key === 'nass_data_updated' || e.key === 'nass_settings_updated') {
      let mod = null;
      try {
        const payload = JSON.parse(e.newValue);
        mod = payload.module;
      } catch (_) {}
      refreshPageData(mod);
    }
  });

  // Listen to in-window custom events
  window.addEventListener('nass:data_updated', (e) => {
    const mod = e.detail ? e.detail.module : null;
    refreshPageData(mod);
  });

  // Re-sync when user returns to tab
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncSiteSettings();
    }
  });

  window.addEventListener('focus', () => {
    syncSiteSettings();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncSiteSettings);
  } else {
    syncSiteSettings();
  }
})();
