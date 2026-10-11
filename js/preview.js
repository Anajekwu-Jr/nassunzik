/**
 * NASS Departmental Portal - Public Media & PDF Previewer
 * Enables instant, interactive lightbox modal previews for:
 * - Event flyers and banner posters
 * - Announcement circulars and notices
 * - News article featured photography
 * - Course past questions and examination compendiums in PDF
 */
(function () {
  let modalBackdrop = null;
  let modalTitle = null;
  let modalBody = null;

  function ensureModal() {
    if (modalBackdrop) return;

    modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'nassPreviewModal';
    modalBackdrop.className = 'nass-preview-backdrop';
    modalBackdrop.innerHTML = `
      <div class="nass-preview-card" id="nassPreviewCard">
        <div class="nass-preview-header">
          <h3 class="nass-preview-title" id="nassPreviewTitle">Preview</h3>
          <div style="display:flex; align-items:center; gap:8px;">
            <a id="nassPreviewDownload" href="#" download target="_blank" class="btn btn-sm btn-outline" style="padding:4px 10px; font-size:0.75rem;">
              ⬇️ Download File
            </a>
            <button type="button" class="nass-preview-close" id="nassPreviewClose" aria-label="Close modal">&times;</button>
          </div>
        </div>
        <div class="nass-preview-body" id="nassPreviewBody" style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:300px; padding:16px;">
        </div>
      </div>
    `;

    document.body.appendChild(modalBackdrop);

    modalTitle = document.getElementById('nassPreviewTitle');
    modalBody = document.getElementById('nassPreviewBody');

    // Close handlers
    document.getElementById('nassPreviewClose').addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
        closeModal();
      }
    });
  }

  function openModal() {
    ensureModal();
    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
    // Clear iframe/image src when closed to halt memory/rendering
    setTimeout(() => {
      if (modalBody) modalBody.innerHTML = '';
    }, 200);
  }

  function showImage(imageUrl, title = 'Image Preview', caption = '') {
    ensureModal();
    modalTitle.textContent = title;

    const downloadBtn = document.getElementById('nassPreviewDownload');
    downloadBtn.href = imageUrl;
    downloadBtn.download = (title || 'image').toLowerCase().replace(/[^a-z0-9]/g, '_') + '.jpg';
    downloadBtn.style.display = 'inline-flex';

    modalBody.innerHTML = `
      <div style="width:100%; display:flex; flex-direction:column; align-items:center; justify-content:center;">
        <img src="${imageUrl}" alt="${title}" style="max-width:100%; max-height:70vh; object-fit:contain; border-radius:4px; box-shadow:0 4px 16px rgba(0,0,0,0.25);" onerror="this.src='/resources/images/event_default.jpg'">
        ${caption ? `<div style="margin-top:14px; font-size:0.875rem; color:var(--text-secondary); text-align:center; max-width:650px; line-height:1.5;">${caption}</div>` : ''}
      </div>
    `;

    openModal();
  }

  function showPdf(pdfUrl, title = 'Course Material / Past Question (PDF)') {
    ensureModal();
    modalTitle.textContent = title;

    const downloadBtn = document.getElementById('nassPreviewDownload');
    downloadBtn.href = pdfUrl;
    downloadBtn.download = (title || 'document').toLowerCase().replace(/[^a-z0-9]/g, '_') + '.pdf';
    downloadBtn.style.display = 'inline-flex';

    modalBody.innerHTML = `
      <div style="width:100%; height:70vh; display:flex; flex-direction:column;">
        <iframe src="${pdfUrl}#toolbar=1" style="width:100%; height:100%; border:1px solid var(--border-color); border-radius:4px; background:#fff;">
          <div style="text-align:center; padding:40px;">
            <p>Your browser does not support embedded PDF viewing.</p>
            <a href="${pdfUrl}" target="_blank" class="btn btn-primary" download>Click to Download PDF Document</a>
          </div>
        </iframe>
      </div>
    `;

    openModal();
  }

  window.NassPreview = {
    image: showImage,
    pdf: showPdf,
    close: closeModal
  };
})();
