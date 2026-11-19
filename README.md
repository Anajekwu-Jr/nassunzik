# NASS UNIZIK Departmental Portal

> **Official Departmental Web Portal & Academic Information System**  
> National Association Of Statistics Students (NASS),  
> Department of Statistics, Faculty of Physical Sciences,  
> Nnamdi Azikiwe University (UNIZIK), Awka, Anambra State, Nigeria.  
> *Motto: "Facts from Figures"*

---

## 1. Architectural Overview & Design Philosophy

This project is engineered strictly under principles of **human readability, ease of manual editing, low operational overhead, and long-term student association ownership**.

Instead of heavy frontend build chains (which break over successive years when student developers inherit outdated npm locks), this portal relies on:
- **Clean Semantic HTML5 & CSS3**: Modular stylesheets (`style.css`, `components.css`, `responsive.css`, `admin.css`) with consistent CSS custom properties.
- **Vanilla JavaScript**: Zero frontend framework lock-in. Direct, robust DOM manipulation and standard fetch API clients (`js/api.js`, `js/search.js`, `js/nav.js`, `js/admin.js`).
- **Production Node.js & Express Backend**: Lightweight REST API endpoints with parameterized queries, JWT authentication, and bcrypt password hashing.
- **Embedded SQLite Database (`node:sqlite`)**: Single-file relational storage requiring zero cloud database provisioning costs, zero external database credentials, and instant migration via simple file backups.

---

## 2. Directory Structure

```text
├── admin/
│   ├── dashboard.html           # Admin CMS Dashboard & Management View
│   └── login.html               # Secure Administrative Login Page
├── backend/
│   ├── auth.js                  # Password hashing & JWT token verification
│   ├── db.js                    # SQLite connection & database initialization
│   ├── middleware/
│   │   ├── auth.js              # Token extraction & role guards
│   │   └── upload.js            # Multer file upload handler
│   ├── routes/                  # Modular CRUD API route handlers
│   │   ├── announcements.js
│   │   ├── auth.js
│   │   ├── contacts.js
│   │   ├── courses.js
│   │   ├── events.js
│   │   ├── executives.js
│   │   ├── gallery.js
│   │   ├── news.js
│   │   ├── projects.js
│   │   ├── search.js
│   │   ├── siwes.js
│   │   ├── staff.js
│   │   ├── stats.js
│   │   ├── timetable.js
│   │   └── uploads.js
│   ├── seed.js                  # Database initial seeding script
│   └── server.js                # Primary Express server application
├── css/
│   ├── admin.css                # Admin CMS layout & form controls
│   ├── components.css           # UI blocks, cards, badges, buttons, modal, toast
│   ├── responsive.css           # Mobile breakpoints & drawer animations
│   └── style.css                # Institutional theme variables, typography, reset
├── js/
│   ├── admin.js                 # Admin CMS CRUD interactions & modal management
│   ├── api.js                   # Unified window.NassAPI client
│   ├── nav.js                   # Mobile drawer and navigation active state
│   └── search.js                # Global search dialog (Ctrl+K shortcut)
├── resources/
│   ├── documents/               # SIWES, project, and past question PDF attachments
│   └── images/                  # NASS logo and departmental photography
├── about.html                   # History, vision, mission, and accreditation
├── academia.html                # 100L - 400L course catalog, outlines, and downloads
├── administration.html          # Head of Department, academic & non-academic staff
├── archive.html                 # Historical tenures, gallery, and past question archive
├── contacts.html                # Academic advisers, course representatives, and offices
├── events.html                  # Upcoming & past conferences, bootcamps, and dinners
├── index.html                   # Homepage with noticeboard, HOD welcome, and stats
├── news.html                    # News articles, bulletins, category filters, and reader
├── projects.html                # Final year thesis manual, chapters 1-5, tools, and topics
├── siwes.html                   # SIWES industrial training manual, 4-phase protocol, logbook
├── timetable.html               # Harmonized lecture timetable with level/semester filters
└── package.json                 # Project dependencies and operational scripts
```

---

## 3. Administrative CMS & Authentication

### Default Admin Credentials
- **Login URL**: `/admin/login.html`
- **Username**: `admin`
- **Password**: `nassAdmin2026!`

*(Advisable to change this via password update endpoint or updating the SQLite `users` table upon deployment).*

### Available Management Modules
1. **Course Catalog & Outlines**: Add, edit, or delete courses (100L to 400L), assign credit units, topics, and upload past exam papers.
2. **Lecture Timetable**: Update weekly lecture schedules, hall venues, and lecturer assignments by level and semester.
3. **Staff Directory**: Maintain faculty records, qualifications, research specializations, office numbers, and emails.
4. **NASS Executive Council**: Update executive portfolios, phone numbers, and academic levels for each tenure.
5. **Departmental News**: Publish articles with category tagging (Academic, Association, Workshop, General) and mark featured articles.
6. **Events & Seminars**: Schedule upcoming seminars, workshops, and manage past event statuses.
7. **SIWES Guidelines**: Upload new industrial training manuals, acceptance letter templates, and logbook instructions.
8. **Final Year Projects**: Publish research guides, proposal templates, and sample R scripts.
9. **Photo Gallery**: Upload event photos, assign captions, and highlight annual milestones.
10. **Key Contacts**: Update level academic advisers, class course representatives, and grievance contacts.
11. **Announcements**: Broadcast urgent noticeboard bulletins directly to the homepage and search index.

---

## 4. How Manual Edits Are Done

The application was purposefully designed so that non-technical department secretaries or future student developers can edit content without rebuilding complex JavaScript bundles:

1. **Editing Existing Content Directly in Code**:
   - To update static information (such as contact addresses or the HOD welcome address), simply edit the respective `.html` file in any text editor.
   - All text content uses semantic tags (`<h1>`, `<p>`, `<ul class="guide-checklist">`).
2. **Editing Database Records via Database**:
   - The database file is located at `database.sqlite` at the project root.
   - You can inspect, query, or edit it using standard tools like [DB Browser for SQLite](https://sqlitebrowser.org/) or the CLI `sqlite3 database.sqlite`.
3. **Adding New Pages**:
   - Create a new `.html` file at the root (e.g., `internships.html`).
   - Include the standard headers, `css/style.css`, `css/components.css`, `css/responsive.css`.
   - Add the script tags:
     ```html
     <script src="/js/api.js"></script>
     <script src="/js/search.js"></script>
     <script src="/js/nav.js"></script>
     ```
   - In `backend/server.js`, clean URLs are automatically handled, or you can add a route rewrite if desired.

---

## 5. Global Search Feature (Ctrl + K)

A global search index is available across every page:
- Keyboard Shortcut: `Ctrl + K` (or `Cmd + K` on macOS), or clicking the search bar in the header.
- Searches in real-time across:
  - Course catalog codes and titles (e.g., "STA 311", "Time Series")
  - Staff names, research specializations, and offices
  - Executive council members and portfolios
  - SIWES and Final Year Project resource documents
  - News bulletins and announcements
  - Calendar events and venues

---

## 6. Environment Variables

Create a `.env` file in the root directory (based on `.env.example`) for local Express development or external Node backend hosting:

### Frontend / Cloudflare Pages Variables (`VITE_*`)
- `VITE_API_BASE_URL` *(Optional)*: Full base URL of an externally hosted Express API (e.g., `https://api.example.com/api`). Leave unset for static Cloudflare Pages deployments, which default to `/api` and automatically fall back to offline/static JSON snapshots (`/data/portal_state_backup.json`, `/data/official_cirs_staff.json`, `/data/career_pathways.json`).
- **Firebase Status**: This codebase currently uses Express + SQLite (`sql.js`) + static JSON snapshots and does **not** use Firebase SDKs, Firestore, or Firebase Auth. If Firebase is integrated in the future, configure public client settings strictly using `VITE_FIREBASE_*` environment variables and never expose Firebase Admin private credentials in frontend code.

### Backend-Only Variables (Express Server — NEVER expose via `VITE_*`)
```env
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="MY_APP_URL"
JWT_SECRET="super_secure_nass_unizik_jwt_secret_key_2026_change_in_production"
PORT=3000
```

---

## 7. Deployment Guide

### A. Cloudflare Pages Production Deployment (Recommended)

- **GitHub Repository**: `https://github.com/Anajekwu-Jr/nass-unizik`
- **Production Branch**: `main`
- **Framework Preset**: Vite (or None / Custom)
- **Build Command**: `npm run build`
- **Build Output Directory**: `dist`
- **Node.js Version**: `22` (matches `"engines": { "node": "22.x" }` in `package.json`)

#### Cloudflare Pages Configuration Details
1. **Routing & SPA Fallback (`public/_redirects` -> `dist/_redirects`)**:
   - Clean extensionless URLs (`/academia`, `/past-questions`, `/staff`, `/nass`, `/traditional-council`, `/news`, `/events`, `/siwes`, `/projects`, `/timetable`, `/archive`, `/contacts`, `/about`, `/admin`, `/privacy`, `/terms`, `/website`, `/home`, `/portal`) rewrite directly with `200` status to their corresponding `.html` pages.
   - Legacy `/careers*` URLs redirect `301` to `/about.html#where-statistics-can-take-you`.
   - The React Mobile Application (`/app` and `/app/*`) uses SPA fallback routing to `/app.html` (`200`) so direct navigation and browser refreshes on nested app routes resolve reliably.
   - Download aliases (`/NASS_UNIZIK.apk`, `/NASS_UNIZIK.mobileconfig`, `/NASS_UNIZIK_Software_Package.zip`, `/Statistical_Tables.pdf`) and large Google Drive-hosted PDFs under `/resources/materials/` route via `302` redirects.
   - `/api/*` requests are intentionally **not** hijacked by an SPA catch-all so static client helpers (`js/api.js` and `src/services/api.ts`) seamlessly serve bundled static JSON fallbacks when no external API server is configured.
2. **Headers (`public/_headers` -> `dist/_headers`)**:
   - Sets proper `Content-Type` and `Content-Disposition` headers for `.apk`, `.mobileconfig`, `.zip`, `/manifest.json`, and `/sw.js` (`Service-Worker-Allowed: /`), alongside `X-Content-Type-Options: nosniff` and `Referrer-Policy`.
3. **25 MiB File Size Compliance & Public Snapshot Sanitization**:
   - Large (>2.5 MB) course textbooks redirect to official Google Drive links (`data/drive_materials_map.json`).
   - `npm run build` automatically validates that every single file inside `dist/` is strictly under Cloudflare Pages' **25 MiB** per-file limit and strips admin user password hashes (`users`, `scheduled_notifications`) from `dist/data/portal_state_backup.json`.
4. **GitHub Synchronization & Lockfile (`bun.lock`)**:
   - Push changes directly to the `main` branch (`git push origin main`). Cloudflare Pages runs `bun install --frozen-lockfile` automatically when `bun.lock` is present, so always commit the updated `bun.lock` alongside `package.json` (run `bun install` if dependencies change). Cloudflare Pages will then run `npm run build` and deploy `dist/` without modifying existing Git history.

### B. Local Development
```bash
# 1. Install dependencies
npm install

# 2. Run production build verification into dist/
npm run build

# 3. Start full-stack Express + Vite dev server on port 3000
npm run dev
# Server accessible at http://localhost:3000
```

### C. Ubuntu / Debian VPS Deployment (Systemd + Nginx)
1. Clone the repository into `/var/www/nass-portal`.
2. Run `npm install`.
3. Build static bundle: `npm run build`.
4. Run Express server via `node backend/server.js` behind Nginx reverse proxy routing port 80/443 to `http://127.0.0.1:3000`.

---

## 8. Maintenance Guide for Future Student Executives

1. **Database Backups**:
   - To back up all portal data (courses, staff, news, logs), copy `database.sqlite` to a flash drive or secure cloud storage.
   - Restoring data is as simple as replacing `database.sqlite`.
2. **Uploading Large Past Questions or Documents**:
   - Upload directly through the **Portal Editor** at `/admin` (drag-and-drop or select PDF), or place PDFs inside `/resources/documents/`.
   - Documents are immediately served and linked for student downloads.
3. **Academic Year Turnover & Portal Administration**:
   - Access the full Portal Editor via `/admin` (Default: `admin` / `thenextstandard27!`).
   - When a new executive council is elected, click **NASS Executives** to update names, portfolios, and phone numbers.
   - For course changes or curriculum revisions, navigate to **Courses & Syllabi** to modify credit units or syllabi.
   - For staff changes or HOD messages, navigate to **Staff & Lecturers** or **General & Write-ups**.

---

## 9. Attribution & Ownership
- **Institution**: Department of Statistics, Nnamdi Azikiwe University (UNIZIK), Awka.
- **Created by**: PhanCore
- **License**: Proprietary to the National Association Of Statistics Students (NASS).
