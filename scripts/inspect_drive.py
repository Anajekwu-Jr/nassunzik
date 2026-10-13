import urllib.request
import re
import json

folder_id = "1TDg6SyVEHcL759t5dFab-Yq69uU74fen"
url = f"https://drive.google.com/drive/folders/{folder_id}"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"})

try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode("utf-8", errors="ignore")
    print(f"HTML length: {len(html)}")
    
    with open("drive_folder.html", "w", encoding="utf-8") as f:
        f.write(html)
        
    print("Saved drive_folder.html")
except Exception as e:
    print("Error fetching folder:", e)
