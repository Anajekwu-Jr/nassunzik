import urllib.request
import os
import json
import re

with open("past_questions_drive_folder.html", "r", encoding="utf-8") as f:
    html = f.read()

matches = re.findall(r'<tr[^>]*data-id="([^"]+)"[^>]*>(.*?)</tr>', html, re.DOTALL)
print(f"Processing {len(matches)} files from Google Drive...")

os.makedirs("public/resources/past_questions", exist_ok=True)
os.makedirs("resources/past_questions", exist_ok=True)

downloaded = []
for idx, (did, inner) in enumerate(matches, 1):
    labels = re.findall(r'(?:aria-label|title)="([^"]+)"', inner)
    name_label = labels[0] if labels else f"PQ_{did}"
    
    # Extract course code (e.g. "STA 311", "STA 312", etc.)
    code_match = re.search(r'\b(STA\s*\d{3})\b', name_label, re.I)
    if code_match:
        course_code = code_match.group(1).upper().replace(" ", " ")
        if not " " in course_code:
            course_code = course_code[:3] + " " + course_code[3:]
    else:
        course_code = "STA 300"
    
    # Download file from drive direct link
    url = f"https://drive.usercontent.google.com/download?id={did}&export=download"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read()
        
        # Check header
        ext = "jpg"
        if content.startswith(b"\x89PNG"):
            ext = "png"
        elif content.startswith(b"%PDF"):
            ext = "pdf"
        elif content.startswith(b"\xff\xd8"):
            ext = "jpg"
        elif content.startswith(b"RIFF") and b"WEBP" in content[:16]:
            ext = "webp"
            
        code_slug = course_code.replace(" ", "_").lower()
        safe_name = f"{code_slug}_past_question_{idx:02d}.{ext}"
        pub_path = os.path.join("public/resources/past_questions", safe_name)
        res_path = os.path.join("resources/past_questions", safe_name)
        
        with open(pub_path, "wb") as f_out:
            f_out.write(content)
        with open(res_path, "wb") as f_out:
            f_out.write(content)
            
        print(f"[{idx:02d}/29] Saved {safe_name} ({len(content)} bytes) - Course: {course_code} - Orig: {name_label}")
        downloaded.append({
            "idx": idx,
            "drive_id": did,
            "label": name_label,
            "course_code": course_code,
            "file_name": safe_name,
            "file_path": f"/resources/past_questions/{safe_name}",
            "preview_url": f"/resources/past_questions/{safe_name}",
            "file_size": len(content),
            "ext": ext
        })
    except Exception as e:
        print(f"[{idx:02d}/29] Error downloading {did} ({name_label}): {e}")

with open("downloaded_pq_manifest.json", "w", encoding="utf-8") as f:
    json.dump(downloaded, f, indent=2)

print(f"\nSuccessfully downloaded and saved {len(downloaded)} past questions to public/resources/past_questions and resources/past_questions!")
