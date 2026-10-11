import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const aboutHtmlPath = path.join(rootDir, 'about.html');
const pathways = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/career_pathways.json'), 'utf8'));

// 1. Build Pathway HTML
function renderPathwayHtml(p) {
  return `
          <article class="pathway-card" id="pathway-${p.id}" data-domain="${p.domain}">
            <div class="pathway-header">
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap;">
                  <span class="pathway-number">${p.id}</span>
                  <span class="badge" style="background: rgba(12, 35, 64, 0.08); color: var(--primary-color); font-weight: 700; text-transform: uppercase;">${p.domain}</span>
                  <span class="badge" style="background: #fef3c7; color: #92400e; font-weight: 700;">${p.formula}</span>
                </div>
                <h3 class="pathway-title">${p.title}</h3>
                <div style="font-size: 0.95rem; color: var(--primary-color); font-weight: 600; font-style: italic;">${p.tagline}</div>
              </div>
              <a href="#pathway-${p.id}" class="btn btn-sm btn-outline" style="font-size: 0.75rem; padding: 4px 10px;" onclick="copyAboutPathwayLink('${p.id}')">
                Link
              </a>
            </div>

            <p style="font-size: 0.9375rem; line-height: 1.7; color: var(--text-secondary); margin-bottom: 14px;">
              ${p.overview}
            </p>

            ${p.reality_check ? `
              <div class="reality-check-box">
                <div style="font-weight: 800; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; margin-bottom: 4px; color: #b45309; display: flex; align-items: center; gap: 6px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  The Intellectual Reality Check
                </div>
                ${p.reality_check}
              </div>
            ` : ''}

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
              
              <!-- Left: UNIZIK Course Foundation -->
              <div>
                <h4 style="font-size: 0.8125rem; font-weight: 800; text-transform: uppercase; color: var(--text-primary); letter-spacing: 0.04em; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  UNIZIK Degree Foundation Courses
                </h4>
                <div class="course-pill-grid">
                  ${p.unizik_courses.map(c => `
                    <div class="course-pill">
                      <div style="font-weight: 800; color: var(--primary-color); font-size: 0.8125rem; margin-bottom: 2px;">${c.code} · ${c.title} (${c.level}L)</div>
                      <div style="font-size: 0.775rem; color: var(--text-secondary); line-height: 1.4;">${c.role}</div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Right: Skills & Roles -->
              <div>
                <h4 style="font-size: 0.8125rem; font-weight: 800; text-transform: uppercase; color: var(--text-primary); letter-spacing: 0.04em; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  Skills & Tools to Add Outside Curriculum
                </h4>
                <div class="skills-tag-list">
                  ${p.skills_to_add.map(s => `<span class="skill-tag">${s}</span>`).join('')}
                </div>

                <div style="margin-top: 14px;">
                  <h4 style="font-size: 0.8125rem; font-weight: 800; text-transform: uppercase; color: var(--text-primary); letter-spacing: 0.04em; margin-bottom: 6px;">
                    Target Job Titles
                  </h4>
                  <div>
                    ${p.potential_roles.map(r => `<span class="role-badge">${r}</span>`).join('')}
                  </div>
                </div>

                <div style="margin-top: 14px;">
                  <h4 style="font-size: 0.8125rem; font-weight: 800; text-transform: uppercase; color: var(--text-primary); letter-spacing: 0.04em; margin-bottom: 6px;">
                    Typical Employers & Workplaces
                  </h4>
                  <div style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5;">
                    ${p.workplaces.join(' · ')}
                  </div>
                </div>
              </div>

            </div>

            ${p.portfolio_projects && p.portfolio_projects.length > 0 ? `
              <div class="project-idea-box">
                <div style="font-size: 0.8125rem; font-weight: 800; text-transform: uppercase; color: #166534; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  Concrete Student Portfolio Projects You Can Build Today
                </div>
                <ul style="margin: 0; padding-left: 18px; font-size: 0.875rem; color: #14532d; line-height: 1.6;">
                  ${p.portfolio_projects.map(proj => `<li>${proj}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${p.progression ? `
              <div style="margin-top: 16px; padding-top: 10px; border-top: 1px dashed var(--border-color); font-size: 0.8125rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span style="font-weight: 700; color: var(--text-primary);">Career Ladder:</span>
                <span>${p.progression}</span>
              </div>
            ` : ''}

          </article>
  `;
}

// 2. 100L Roadmap Initial Content
const level100Courses = [
  { code: 'STA 111', title: 'Descriptive Statistics', relevant: 'Data Analytics, Biostatistics & Health Data, Tech Analytics' },
  { code: 'STA 121', title: 'Statistical Inference I', relevant: 'Data Analytics, Statistical Modeling' },
  { code: 'STA 112', title: 'Probability 1', relevant: 'Data Analytics, Actuarial Science, Machine Learning' },
  { code: 'STA 122', title: 'Statistical Computing 1', relevant: 'Data Analytics, Statistical Programming' },
  { code: 'ECO 111/112', title: 'Principles of Economics I & II', relevant: 'Econometrics, Finance & Risk, Banking' },
  { code: 'NAU-MAT 112', title: 'Intro to Actuarial Mathematics I', relevant: 'Actuarial Science & Insurance' },
  { code: 'NAU-BIO 101/102', title: 'General Biology I & II', relevant: 'Biostatistics, Genomics & Bioinformatics' }
];

const level100Unlocks = [
  { id: '01', title: 'Data Analytics', domain: 'Technology & Data' },
  { id: '04', title: 'Finance, Banking & Risk', domain: 'Finance & Risk' },
  { id: '05', title: 'Actuarial Science & Insurance', domain: 'Finance & Risk' },
  { id: '06', title: 'Biostatistics & Health Data', domain: 'Health & Biology' },
  { id: '07', title: 'Econometrics & Economic Analysis', domain: 'Economics & Policy' },
  { id: '08', title: 'Technology & Product Analytics', domain: 'Technology & Data' },
  { id: '09', title: 'Business Intelligence & Decision Science', domain: 'Business & Industry' },
  { id: '11', title: 'Government, Policy & Development', domain: 'Economics & Policy' },
  { id: '13', title: 'Agriculture & Environment', domain: 'Research & Earth' },
  { id: '14', title: 'Genomics & Bioinformatics', domain: 'Health & Biology' }
];

const level100Html = `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;" class="two-col-grid">
                <div>
                  <div style="font-size: 0.8125rem; font-weight: 800; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px;">
                    Key 100 Level Foundation Courses
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    ${level100Courses.map(c => `
                      <div style="background: var(--surface-muted); padding: 8px 10px; border-radius: 4px; border: 1px solid var(--border-color); font-size: 0.8125rem;">
                        <div style="font-weight: 700; color: var(--text-primary);">${c.code}: ${c.title}</div>
                        <div style="font-size: 0.75rem; color: var(--primary-color); margin-top: 2px;">
                          Unlocks: ${c.relevant}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <div>
                  <div style="font-size: 0.8125rem; font-weight: 800; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px;">
                    Direct Career Pathway Unlocks (${level100Unlocks.length})
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    ${level100Unlocks.map(p => `
                      <a href="#pathway-${p.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--surface-muted); border-radius: 4px; text-decoration: none; border: 1px solid var(--border-color); font-size: 0.8125rem;">
                        <span style="font-weight: 600; color: var(--text-primary);">${p.id} · ${p.title}</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${p.domain} &rarr;</span>
                      </a>
                    `).join('')}
                  </div>
                </div>
              </div>
`;

let aboutHtml = fs.readFileSync(aboutHtmlPath, 'utf8');

// Replace level output placeholder
aboutHtml = aboutHtml.replace(
  /<div id="aboutLevelOutput"[^>]*>[\s\S]*?<\/div>/,
  `<div id="aboutLevelOutput" style="background: var(--surface-color); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 18px;">${level100Html}</div>`
);

// Replace pathways container placeholder
const allPathwaysHtml = pathways.map(renderPathwayHtml).join('\n');
aboutHtml = aboutHtml.replace(
  /<div id="aboutPathwaysContainer">[\s\S]*?<\/div>\s*<!-- Grounding Mentorship/,
  `<div id="aboutPathwaysContainer">\n${allPathwaysHtml}\n          </div>\n\n          <!-- Grounding Mentorship`
);

fs.writeFileSync(aboutHtmlPath, aboutHtml, 'utf8');
console.log('Successfully pre-rendered pathways and 100L curriculum roadmap directly into about.html');
