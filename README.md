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

Create a `.env` file in the root directory (based on `.env.example`):

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Security & Authentication
JWT_SECRET=super_secure_nass_unizik_jwt_secret_key_2026_change_in_production
ADMIN_DEFAULT_PASSWORD=nassAdmin2026!

# Upload Settings
MAX_FILE_SIZE_MB=15
```

---

## 7. Deployment Guide

### A. Local Development
```bash
# 1. Install dependencies
npm install

# 2. Run initial database migration & seeding
node backend/seed.js

# 3. Start development server
npm run dev
# Server accessible at http://localhost:3000
```

### B. Ubuntu / Debian VPS Deployment (Systemd + Nginx)
1. Clone the repository into `/var/www/nass-portal`.
2. Run `npm install --production`.
3. Seed the database: `node backend/seed.js`.
4. Create a systemd service `/etc/systemd/system/nass-portal.service`:
   ```ini
   [Unit]
   Description=NASS UNIZIK Departmental Portal
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/nass-portal
   ExecStart=/usr/bin/node backend/server.js
   Restart=on-failure
   Environment=NODE_ENV=production PORT=3000

   [Install]
   WantedBy=multi-user.target
   ```
5. Enable & start service:
   ```bash
   sudo systemctl enable --now nass-portal
   ```
6. Set up Nginx reverse proxy routing port 80/443 to `http://127.0.0.1:3000`.

### C. Docker Deployment
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN node backend/seed.js
EXPOSE 3000
CMD ["node", "backend/server.js"]
```

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
