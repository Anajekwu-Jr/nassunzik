import re
import json

with open("drive_past_questions.html", "r", encoding="utf-8") as f:
    html = f.read()

# Look for google-apps.folder
folder_matches = re.findall(r'\["([a-zA-Z0-9_-]{28,35})",\["([^"]+)"\],[^\]]*application/vnd\.google-apps\.folder', html)
print(f"Subfolders found: {len(folder_matches)}")
for fid, name in folder_matches:
    print(f"Folder: {name} (ID: {fid})")

# Look for all items in the folder structure
# Google Drive bootstrap data usually has data arrays containing [id, [title], ...]
raw_items = re.findall(r'\["([a-zA-Z0-9_-]{28,35})",\["([^"]+)"\]', html)
print(f"\nRaw ID-Title pairs found: {len(raw_items)}")
for fid, title in set(raw_items):
    print(f"Item: {title} (ID: {fid})")

# Search for any string that looks like a course code or filename
tokens = re.findall(r'\\x22([^\\]+?\\.(?:jpg|jpeg|png|pdf|docx?|zip))\\x22', html, re.IGNORECASE)
print(f"\nHex-escaped filenames: {len(set(tokens))}")
for t in set(tokens):
    print(f"Token: {t}")

# Look for all occurrences of 1eUGZTLTGO71J_RN8AFlu7T8WVc5cnmZR
idx = html.find("1eUGZTLTGO71J_RN8AFlu7T8WVc5cnmZR")
if idx != -1:
    print("\n--- Context of IMG_20261106_063747_389.jpg ID ---")
    print(html[idx-100:idx+300])
