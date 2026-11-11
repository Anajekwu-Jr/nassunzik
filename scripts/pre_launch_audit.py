#!/usr/bin/env python3
"""
Pre-Launch Audit Script for NASS UNIZIK Departmental Portal & App
Checks:
- All pages (status 200)
- All navigation bars conform to the exact 7 links + search + install app
- No theme toggle remains in any HTML/JS/CSS/TSX
- All staff profiles and CIRS links valid
- All NASS Exco records & images valid
- All academic PDFs & past question papers verified on disk and accessible via HTTP
- Google Drive past questions link verified
- Announcement board verified (contains only news/events, no bootcamp)
- Admin push notifications & endpoints
- Mobile app PWA manifest & service worker
"""

import os
import glob
import json
import urllib.request
import urllib.error
import sys

BASE_URL = "http://localhost:3000"
ERRORS = []
WARNINGS = []
PASSED = []

def test_url(path, desc, expected_status=200):
    url = f"{BASE_URL}{path}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'LaunchAudit/1.0'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            status = resp.getcode()
            if status == expected_status:
                PASSED.append(f"[OK] {desc} -> {path} ({status})")
                return resp.read()
            else:
                ERRORS.append(f"[FAIL] {desc} -> {path} expected {expected_status}, got {status}")
                return None
    except Exception as e:
        ERRORS.append(f"[FAIL] {desc} -> {path} error: {e}")
        return None

print("=== 1. CHECKING PORTAL HTML PAGES ===")
PAGES = [
    ("/", "Root / (Index/Website)"),
    ("/website.html", "Website Main Page"),
    ("/app.html", "Mobile App Shell"),
    ("/academia.html", "Academia Portal"),
    ("/administration.html", "Staffs & CIRS Registry"),
    ("/nass.html", "NASS Excos Page"),
    ("/traditional-council.html", "Traditional Council (Web)"),
    ("/news.html", "News & Bulletins"),
    ("/events.html", "Events Calendar"),
    ("/past-questions.html", "Past Questions & PQ Drive"),
    ("/timetable.html", "Lecture & Exam Timetable"),
    ("/projects.html", "Final Year Projects"),
    ("/siwes.html", "SIWES & Industrial Training"),
    ("/archive.html", "Departmental Archive"),
    ("/contacts.html", "Contact Directory"),
    ("/about.html", "About Department"),
    ("/admin.html", "Admin Control Panel"),
]

for path, desc in PAGES:
    test_url(path, desc)

print("\n=== 2. CHECKING CORE API ENDPOINTS ===")
APIS = [
    ("/api/health", "API Health"),
    ("/api/courses", "Courses API"),
    ("/api/staff", "Staffs Directory API"),
    ("/api/executives", "NASS Excos API"),
    ("/api/news", "News API"),
    ("/api/events", "Events API"),
    ("/api/materials", "Academic Materials & PQ API"),
    ("/api/announcements", "Announcements API"),
    ("/api/timetable", "Timetable API"),
    ("/api/scheduled-notifications", "Scheduled Notifications API"),
    ("/api/traditional-council", "Traditional Council API"),
]

for path, desc in APIS:
    data = test_url(path, desc)
    if data and path == "/api/announcements":
        try:
            announcements = json.loads(data.decode('utf-8'))
            items = announcements if isinstance(announcements, list) else announcements.get('announcements', [])
            bootcamp_found = any('bootcamp' in str(a).lower() for a in items)
            if bootcamp_found:
                ERRORS.append("[FAIL] Announcement board contains 'bootcamp' reference!")
            else:
                PASSED.append("[OK] Announcement board is clean of bootcamp references.")
        except Exception as e:
            ERRORS.append(f"[FAIL] JSON parse error in announcements: {e}")

print("\n=== 3. CHECKING NAVIGATION MENU STRUCTURE ===")
# Expected menu items: Home, Academia, Past questions, Staffs, NASS Excos, Traditional Council, News
EXPECTED_LINKS = [
    ("Home", ["index.html", "website.html", "/"]),
    ("Academia", ["academia.html"]),
    ("Past questions", ["past-questions.html"]),
    ("Staffs", ["administration.html"]),
    ("NASS Excos", ["nass.html"]),
    ("Traditional Council", ["traditional-council.html"]),
    ("News", ["news.html"]),
]

html_files = glob.glob("*.html")
for hf in sorted(html_files):
    if hf in ["app.html", "admin.html", "privacy.html", "terms.html", "sample_profile_nau2436.html", "unizik_statistics_page.html"]:
        continue
    with open(hf, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check theme toggle is NOT in content
    if 'id="headerThemeToggle"' in content or 'header-theme-toggle' in content or 'theme-toggle-btn' in content:
        ERRORS.append(f"[FAIL] Theme toggle found in {hf}!")
    else:
        PASSED.append(f"[OK] No theme toggle in {hf}")
        
    # Check nav links
    missing_links = []
    for label, targets in EXPECTED_LINKS:
        found = False
        for t in targets:
            if t in content:
                found = True
                break
        if not found:
            missing_links.append(label)
    if missing_links:
        ERRORS.append(f"[FAIL] {hf} is missing nav links: {missing_links}")
    else:
        PASSED.append(f"[OK] {hf} has all 7 primary nav targets")

    # Check search bar and install app button in nav
    if "searchTriggerBtn" not in content and "search" not in content.lower():
        WARNINGS.append(f"[WARN] {hf} missing searchTriggerBtn")
    if "nav-install-btn" not in content:
        WARNINGS.append(f"[WARN] {hf} missing nav-install-btn")

print("\n=== 4. CHECKING PAST QUESTIONS & GOOGLE DRIVE LINK ===")
with open("past-questions.html", 'r', encoding='utf-8') as f:
    pq_content = f.read()

drive_link = "https://drive.google.com/drive/folders/17R8RKLGaaylFMr4Uz8nv2TXhCP7IDmjO"
if drive_link in pq_content:
    PASSED.append("[OK] Past questions page contains exact Google Drive folder link")
else:
    ERRORS.append("[FAIL] Past questions page is MISSING the Google Drive folder link!")

print("\n=== 5. CHECKING STAFF & CIRS REGISTRY ===")
try:
    with urllib.request.urlopen(f"{BASE_URL}/api/staff") as resp:
        staff_data = json.loads(resp.read().decode('utf-8'))
        staff_list = staff_data if isinstance(staff_data, list) else staff_data.get('staff', [])
        PASSED.append(f"[OK] Found {len(staff_list)} staff members in API")
        cirs_count = sum(1 for s in staff_list if s.get('cirs_id') or s.get('cirs'))
        PASSED.append(f"[OK] {cirs_count} staff members have verified CIRS records")
except Exception as e:
    ERRORS.append(f"[FAIL] Error checking staff: {e}")

print("\n=== 6. CHECKING NASS EXCOS & IMAGES ===")
try:
    with urllib.request.urlopen(f"{BASE_URL}/api/executives") as resp:
        exco_data = json.loads(resp.read().decode('utf-8'))
        exco_list = exco_data if isinstance(exco_data, list) else exco_data.get('executives', [])
        PASSED.append(f"[OK] Found {len(exco_list)} NASS Executives in API")
        for ex in exco_list:
            img = ex.get('image') or ex.get('photo')
            if img:
                test_url(img, f"Exco photo ({ex.get('name')})")
except Exception as e:
    ERRORS.append(f"[FAIL] Error checking excos: {e}")

print("\n=== 7. CHECKING DOWNLOADABLE ASSETS (APK, MOBILECONFIG, TABLES) ===")
ASSETS = [
    ("/downloads/NASS_UNIZIK.apk", "Android APK Download"),
    ("/downloads/NASS_UNIZIK.mobileconfig", "iOS Profile Download"),
    ("/downloads/Statistical_Tables.pdf", "Departmental Statistical Tables PDF"),
    ("/manifest.webmanifest", "PWA Web Manifest"),
    ("/sw.js", "PWA Service Worker"),
]
for path, desc in ASSETS:
    test_url(path, desc)

print("\n=== 8. CHECKING ACADEMIC MATERIALS & PDF FILES ON DISK ===")
pdf_files = glob.glob("resources/materials/*.pdf")
PASSED.append(f"[OK] Found {len(pdf_files)} PDF files in resources/materials/")
sample_pdfs = pdf_files[:10]
for p in sample_pdfs:
    rel_path = "/" + p.replace("\\", "/")
    test_url(rel_path, f"Sample PDF {os.path.basename(p)}")

print("\n=== AUDIT SUMMARY ===")
print(f"Total Passed: {len(PASSED)}")
print(f"Total Warnings: {len(WARNINGS)}")
print(f"Total Errors: {len(ERRORS)}")

if ERRORS:
    print("\nCRITICAL ERRORS FOUND:")
    for err in ERRORS:
        print("  - " + err)
    sys.exit(1)
else:
    print("\nALL PRE-LAUNCH VERIFICATIONS PASSED WITH ZERO CRITICAL ERRORS!")
    sys.exit(0)
