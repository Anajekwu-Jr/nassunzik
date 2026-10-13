import re
import json

with open("drive_folder.html", "r", encoding="utf-8") as f:
    html = f.read()

# In Google Drive folder HTML, file entries are typically present in a JSON structure
# or data attributes. Let us look for patterns of filenames and IDs.
# Common pattern: ["ID", ["filename", ...]] or similar
# Let us search for strings ending in .pdf, .docx, .png, etc.

# Search for any string ending in .pdf, .docx, .doc, .zip, .xlsx, .ppt, .pptx
file_matches = re.findall(r'(\b[a-zA-Z0-9_\-\.\s\(\)]+\.(?:pdf|docx|doc|zip|rar|xlsx|pptx))\b', html, re.I)
unique_files = sorted(list(set([f.strip() for f in file_matches if len(f.strip()) > 4 and not f.endswith(".js")])))
print(f"Found {len(unique_files)} potential file names:")
for f in unique_files:
    print(" -", f)

# Now let us find the file IDs associated with these names
# Usually: ["file_id", ..., "filename.pdf"] or ["filename.pdf", ... "file_id"]
# Or 33-char drive IDs: [a-zA-Z0-9_-]{33}
drive_ids = re.findall(r'[a-zA-Z0-9_-]{28,35}', html)
print(f"Total potential IDs found: {len(drive_ids)}")

# Let us search around each file name to find its Google Drive ID
file_to_id = {}
for fname in unique_files:
    # Look within a window around fname in html
    pos = 0
    while True:
        idx = html.find(fname, pos)
        if idx == -1:
            break
        window = html[max(0, idx - 400):min(len(html), idx + 400)]
        # Find candidates for ID
        cands = re.findall(r'["\']([a-zA-Z0-9_-]{28,35})["\']', window)
        for c in cands:
            if c != "1TDg6SyVEHcL759t5dFab-Yq69uU74fen" and not c.startswith("application") and not c.startswith("drive_folder"):
                file_to_id[fname] = c
                break
        pos = idx + len(fname)

print("\nMapped files to IDs:")
for fname, fid in file_to_id.items():
    print(f"  '{fname}' -> '{fid}'")

with open("extracted_drive_files.json", "w", encoding="utf-8") as f:
    json.dump(file_to_id, f, indent=2)
