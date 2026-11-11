import os
import re
import urllib.request

html_files = [
    'index.html', 'website.html', 'academia.html', 'past-questions.html',
    'administration.html', 'nass.html', 'traditional-council.html', 'news.html',
    'events.html', 'timetable.html', 'projects.html', 'siwes.html',
    'archive.html', 'contacts.html', 'about.html'
]

link_regex = re.compile(r'href=["\']([^"\'#][^"\']*)["\']')

broken = []
checked = set()

for hf in html_files:
    if not os.path.exists(hf):
        continue
    with open(hf, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    links = link_regex.findall(text)
    for link in links:
        if link.startswith(('http://', 'https://', 'mailto:', 'tel:', 'javascript:')) or '${' in link:
            continue
        clean_path = link.split('?')[0].split('#')[0]
        if not clean_path:
            continue
        if clean_path in checked:
            continue
        checked.add(clean_path)

        url = f'http://127.0.0.1:3000{clean_path}'
        try:
            req = urllib.request.Request(url, method='GET')
            with urllib.request.urlopen(req, timeout=3) as resp:
                if resp.status >= 400:
                    broken.append((hf, link, resp.status))
        except Exception as e:
            broken.append((hf, link, str(e)))

print(f'Total unique actual links checked: {len(checked)}')
print(f'Broken links: {len(broken)}')
for c in sorted(checked):
    print('  ✓ Valid route:', c)
if broken:
    for b in broken:
        print('  ✗ Broken route:', b)
