import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]
print(f"Cleaning PWA from {len(html_files)} HTML files...")

manifest_regex = re.compile(r'\s*<link rel="manifest"[^>]*>', re.IGNORECASE)
pwa_script_regex = re.compile(r'\s*<script[^>]*src="\/js\/pwa\.js"[^>]*><\/script>', re.IGNORECASE)

for filename in html_files:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    orig_len = len(content)
    content = manifest_regex.sub('', content)
    content = pwa_script_regex.sub('', content)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Cleaned {filename}: len diff {len(content) - orig_len}")

print("PWA tags removed from all HTML files.")
