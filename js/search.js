/**
 * NASS Portal - Global Search Component
 * Supports keyboard shortcut (Ctrl+K or /), categorized real-time results, and direct linking
 * All downloadable files, documents, PDFs, courses, staff, executives, SIWES, and information
 * can be found instantly by searching by name or keywords.
 */

(function() {
  function initGlobalSearch() {
    let modalBackdrop = document.getElementById('searchModalBackdrop');

    // Create modal DOM if not already in HTML
    if (!modalBackdrop) {
      modalBackdrop = document.createElement('div');
      modalBackdrop.id = 'searchModalBackdrop';
      modalBackdrop.className = 'search-modal-backdrop';
      modalBackdrop.innerHTML = `
        <div class="search-modal-container" role="dialog" aria-modal="true" aria-label="Portal Search">
          <div class="search-input-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              id="globalSearchInput" 
              class="search-input-field" 
              placeholder="Search files (e.g. Statistical Tables, STA 312, C++), staff, SIWES, news..." 
              autocomplete="off"
            />
            <button type="button" class="search-close-btn" id="searchCloseBtn" aria-label="Close search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="search-results-area" id="searchResultsArea">
            <div style="padding: 24px 12px; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
              Type at least 2 characters to search across all files, PDFs, course materials, staff, executives, SIWES, and portal information.
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalBackdrop);
    }

    const searchInput = document.getElementById('globalSearchInput');
    const searchCloseBtn = document.getElementById('searchCloseBtn');
    const resultsArea = document.getElementById('searchResultsArea');

    function openSearch() {
      modalBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        searchInput.focus();
        searchInput.select();
      }, 50);
    }

    function closeSearch() {
      modalBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }

    // Attach trigger buttons
    document.querySelectorAll('.search-trigger-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openSearch();
      });
    });

    if (searchCloseBtn) {
      searchCloseBtn.addEventListener('click', closeSearch);
    }

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeSearch();
      }
    });

    // Keyboard shortcuts (Ctrl+K, Cmd+K, or slash when not typing)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (modalBackdrop.classList.contains('open')) {
          closeSearch();
        } else {
          openSearch();
        }
      } else if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
        closeSearch();
      } else if (e.key === '/' && !modalBackdrop.classList.contains('open')) {
        const activeEl = document.activeElement;
        const isInputField = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
        if (!isInputField) {
          e.preventDefault();
          openSearch();
        }
      }
    });

    // Debounced search logic
    let debounceTimeout = null;
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      clearTimeout(debounceTimeout);

      if (q.length < 2) {
        resultsArea.innerHTML = `
          <div style="padding: 24px 12px; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
            Type at least 2 characters to search across all files, PDFs, course materials, staff, executives, SIWES, and portal information.
          </div>
        `;
        return;
      }

      resultsArea.innerHTML = `
        <div style="padding: 24px 12px; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
          Searching...
        </div>
      `;

      debounceTimeout = setTimeout(async () => {
        try {
          const res = await window.NassAPI.search(q);
          renderResults(res, q);
        } catch (err) {
          resultsArea.innerHTML = `
            <div style="padding: 20px; text-align: center; color: var(--danger-color); font-size: 0.875rem;">
              An error occurred while searching. Please try again.
            </div>
          `;
        }
      }, 250);
    });

    function renderResults(data, query) {
      if (!data || data.total === 0) {
        resultsArea.innerHTML = `
          <div style="padding: 36px 16px; text-align: center;">
            <p style="font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">No matching results found</p>
            <p style="font-size: 0.875rem; color: var(--text-secondary);">
              We couldn't find anything matching "<strong>${escapeHtml(query)}</strong>". Try checking course codes (e.g. STA 111, STA 312, STA 331), document names (e.g. Statistical Tables, C++ Notes), staff names, or keywords like "SIWES", "Project", or "Timetable".
            </p>
          </div>
        `;
        return;
      }

      let html = '';
      const categoryLabels = {
        course_resources: 'Downloadable Files & PDFs',
        courses: 'Courses & Curriculum',
        staff: 'Academic & Non-Academic Staff',
        executives: 'NASS Departmental Executives',
        siwes: 'SIWES Industrial Training',
        projects: 'Final Year Projects',
        timetable: 'Lecture Timetable',
        gallery: 'Photo & Media Gallery',
        news: 'Departmental News',
        events: 'Academic & Association Events',
        faqs: 'Frequently Asked Questions (FAQs)',
        contacts: 'Administration & Help Contacts'
      };

      // Prioritize course_resources (Downloadable Files & PDFs) at the very top!
      const orderedKeys = [
        'course_resources',
        'courses',
        'staff',
        'executives',
        'siwes',
        'projects',
        'timetable',
        'gallery',
        'news',
        'events',
        'faqs',
        'contacts'
      ];

      for (const catKey of orderedKeys) {
        const items = data.categories[catKey];
        if (!items || items.length === 0) continue;
        const catTitle = categoryLabels[catKey] || catKey.toUpperCase();

        html += `
          <div class="search-category-group" style="margin-bottom: 20px;">
            <div class="search-category-title" style="display: flex; align-items: center; justify-content: space-between; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid var(--border-color);">
              <span>${catTitle}</span>
              <span class="badge" style="font-size: 0.65rem; background: rgba(12, 35, 64, 0.08); color: var(--text-primary);">${items.length}</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${items.map(item => {
                const isFile = Boolean(item.isDownloadable || item.downloadUrl);
                const isPdf = item.file_name && item.file_name.toLowerCase().endsWith('.pdf');
                return `
                  <div class="search-result-item" style="display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 14px; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: var(--radius-sm); transition: all 0.2s ease;">
                    <a href="${item.url}" style="flex: 1; min-width: 0; text-decoration: none; color: inherit; display: block;" onclick="document.getElementById('searchModalBackdrop').classList.remove('open');">
                      <div class="search-result-title" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        ${isFile ? `
                          <span class="badge" style="background: #0c2340; color: #ffffff; font-size: 0.65rem; font-weight: 800; padding: 2px 6px; border-radius: 3px;">
                            ${isPdf ? 'PDF' : 'FILE'}
                          </span>
                        ` : ''}
                        <strong style="color: var(--text-primary); font-size: 0.9rem;">${escapeHtml(item.title)}</strong>
                      </div>
                      <div class="search-result-subtitle" style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">
                        ${escapeHtml(item.subtitle)}
                      </div>
                      ${item.description ? `<div class="search-result-desc" style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px; line-height: 1.4;">${escapeHtml(item.description)}</div>` : ''}
                    </a>
                    ${isFile ? `
                      <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                        <a href="${item.downloadUrl}" download="${item.file_name || 'document.pdf'}" class="btn btn-sm btn-primary" style="padding: 5px 12px; font-size: 0.75rem; font-weight: 700; gap: 5px; background: #0c2340; border-color: #0c2340;" title="Direct Download">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          <span>Download</span>
                        </a>
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      resultsArea.innerHTML = html;
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalSearch);
  } else {
    initGlobalSearch();
  }
})();
