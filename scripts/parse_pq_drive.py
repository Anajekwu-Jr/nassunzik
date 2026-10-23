import re
import json

with open("past_questions_drive_folder.html", "r", encoding="utf-8") as f:
    html = f.read()

# Look for JavaScript data arrays in Drive folders: Drive embeds `_DRIVE_ivd` or JSON-like arrays
# First let's find all chunks that look like file metadata
print("HTML size:", len(html))

# Let's inspect potential filenames with various extensions
extensions = ["pdf", "jpg", "jpeg", "png", "docx", "doc", "webp"]
ext_regex = r'([a-zA-Z0-9_\-\.\s\(\)]+\.(?:' + '|'.join(extensions) + r'))'
file_matches = re.findall(ext_regex, html, re.I)
unique_files = sorted(list(set([f.strip() for f in file_matches if len(f.strip()) > 3 and not f.endswith(".js")])))
print(f"Found {len(unique_files)} potential file names:")
for f in unique_files:
    print(" -", f)

folder_id = "17R8RKLGaaylFMr4Uz8nv2TXhCP7IDmjO"

# Let's also look for Google Drive JSON patterns: e.g. [..., "file_id", "filename", ...]
# Pattern in Drive initial data: ["<id>",["<name>", ...]]
pairs = re.findall(r'\["([a-zA-Z0-9_-]{28,40})",\["([^"]+)"', html)
print(f"\nFound {len(pairs)} direct (id, name) pairs via JSON regex:")
file_to_id = {}
for fid, fname in pairs:
    if any(fname.lower().endswith("." + ext) for ext in extensions):
        file_to_id[fname] = fid
        print(f" Direct: '{fname}' -> '{fid}'")

# Also for files that didn't match the strict regex above:
for fname in unique_files:
    if fname in file_to_id:
        continue
    pos = 0
    while True:
        idx = html.find(fname, pos)
        if idx == -1:
            break
        window = html[max(0, idx - 500):min(len(html), idx + 500)]
        cands = re.findall(r'["\']([a-zA-Z0-9_-]{28,35})["\']', window)
        for c in cands:
            if c != folder_id and not c.startswith("application") and not c.startswith("drive_folder"):
                file_to_id[fname] = c
                print(f" Window: '{fname}' -> '{c}'")
                break
        pos = idx + len(fname)

print(f"\nTotal mapped files: {len(file_to_id)}")
with open("extracted_past_questions.json", "w", encoding="utf-8") as f:
    json.dump(file_to_id, f, indent=2)
