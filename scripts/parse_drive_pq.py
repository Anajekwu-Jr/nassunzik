import re
import json

with open("drive_past_questions.html", "r", encoding="utf-8") as f:
    html = f.read()

# Search for filenames
filenames = re.findall(r'([a-zA-Z0-9_\-\. ]+\.(?:jpg|jpeg|png|pdf|docx?|zip))', html, re.IGNORECASE)
print(f"Filenames found: {len(set(filenames))}")
for fn in sorted(set(filenames)):
    print(" -", fn)

# Let's inspect where filenames appear and get their surrounding IDs
results = {}
for fn in set(filenames):
    idx = html.find(fn)
    if idx != -1:
        start = max(0, idx - 400)
        end = min(len(html), idx + 400)
        snippet = html[start:end]
        # Look for 33-char drive IDs in snippet
        ids = re.findall(r'[a-zA-Z0-9_-]{28,35}', snippet)
        results[fn] = [i for i in ids if i != fn and len(i) == 33]

print("\n--- Files and potential IDs ---")
for fn, ids in sorted(results.items()):
    print(f"{fn} -> {ids[:3]}")

with open("extracted_drive_pq.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)
