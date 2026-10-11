import re

with open('academia.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the course resources section inside course-card
old_pattern = r'<div>\s*\$\{c\.resources && c\.resources\.length > 0 \? `[\s\S]*?`\s*:\s*`[\s\S]*?`\}\s*</div>\s*</div>\s*`\)\.join\(\'\'\);'

new_template = '''<!-- COURSE MATERIALS & DOWNLOADABLE PDFS (DIRECTLY BELOW THIS COURSE) -->
            <div class="course-materials-section" style="margin-top: 14px; padding-top: 14px; border-top: 1.5px solid var(--border-color);">
              ${c.resources && c.resources.length > 0 ? `
                <div style="margin-bottom: 4px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 0.78rem; font-weight: 800; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.04em; display: inline-flex; align-items: center; gap: 6px;">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                      Course Materials & PDFs (${c.resources.length})
                    </span>
                    <span class="badge" style="background: rgba(2, 132, 199, 0.1); color: #0284c7; font-weight: 700; font-size: 0.6875rem;">
                      Direct Downloads
                    </span>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${c.resources.map(r => `
                      <div class="course-material-card" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: var(--surface-muted); border: 1px solid var(--border-color); border-radius: var(--radius-sm); gap: 10px; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 8px; min-width: 170px; flex: 1;">
                          <span class="badge" style="background: #0c2340; color: #ffffff; font-size: 0.65rem; font-weight: 800; padding: 3px 6px; border-radius: 3px;">
                            ${r.file_name && r.file_name.toLowerCase().endsWith('.pdf') ? 'PDF' : (r.resource_type === 'past_question' ? 'PQ' : 'DOC')}
                          </span>
                          <div style="overflow: hidden;">
                            <div style="font-size: 0.8125rem; font-weight: 700; color: var(--text-primary); line-height: 1.35;">
                              ${escapeHtml(r.title)}
                            </div>
                            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; font-family: var(--font-mono);">
                              ${r.file_name ? escapeHtml(r.file_name) : ''} ${r.file_size ? `· ${formatFileSize(r.file_size)}` : ''}
                            </div>
                          </div>
                        </div>
                        <div style="display: flex; gap: 6px; align-items: center; flex-shrink: 0;">
                          <a href="${r.file_path}" download="${r.file_name || 'course_material.pdf'}" class="btn btn-sm btn-primary" style="padding: 4px 10px; font-size: 0.72rem; font-weight: 700; gap: 4px; background: #0c2340; border-color: #0c2340;" title="Download PDF to device">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            <span>Download PDF</span>
                          </a>
                          <a href="${r.file_path}" target="_blank" class="btn btn-sm btn-outline" style="padding: 4px 8px; font-size: 0.72rem; font-weight: 600;" title="View PDF Online">
                            View
                          </a>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : `
                <div style="padding: 10px 12px; background: rgba(12, 35, 64, 0.03); border: 1px dashed var(--border-color); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
                  <div>
                    <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                      <span>Accredited Academic Curriculum</span>
                    </div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">
                      Official examination papers & lecture notes archived in departmental repository.
                    </div>
                  </div>
                  ${c.code.includes('STA') || c.code.includes('MTH') || c.code.includes('MAT') ? `
                    <a href="/resources/documents/Statistical_Tables.pdf" download="Statistical_Tables_UNIZIK.pdf" class="btn btn-sm btn-outline" style="padding: 4px 10px; font-size: 0.72rem; gap: 4px; font-weight: 600;" title="Download Official Statistical Tables for this course">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      <span>Statistical Tables (PDF)</span>
                    </a>
                  ` : `
                    <a href="/past-questions.html" class="btn btn-sm btn-outline" style="padding: 4px 10px; font-size: 0.72rem; gap: 4px; font-weight: 600;">
                      <span>Past Questions</span>
                    </a>
                  `}
                </div>
              `}
            </div>
          </div>
        `).join('');'''

if re.search(old_pattern, content):
    content = re.sub(old_pattern, new_template, content, count=1)
    with open('academia.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("PATTERN NOT MATCHED")
