import os
import re

new_address = 'Statistics Admintrative Office, Ground floor, New Physical Sciences Building, science village, Unizik, Awka'

html_files = [f for f in os.listdir('.') if f.endswith('.html')]
print(f"Processing {len(html_files)} HTML files...")

mobile_btn_pattern = re.compile(
    r'\s*<li>\s*<button[^>]*id="mobilePwaInstallBtn"[^>]*>[\s\S]*?<\/button>\s*<\/li>',
    re.IGNORECASE
)

desktop_btn_pattern = re.compile(
    r'\s*<!--\s*In-App PWA Install Button\s*-->\s*<button[^>]*id="pwaInstallBtn"[^>]*>[\s\S]*?<\/button>',
    re.IGNORECASE
)

bare_desktop_btn_pattern = re.compile(
    r'\s*<button[^>]*id="pwaInstallBtn"[^>]*>[\s\S]*?<\/button>',
    re.IGNORECASE
)

footer_address_pattern = re.compile(
    r'<span data-setting="office_location">[\s\S]*?<\/span>',
    re.IGNORECASE
)

new_footer_span = f'<span data-setting="office_location">{new_address}</span>'

for filename in html_files:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    original_len = len(content)

    # 1. Remove mobile install button from menu
    content = mobile_btn_pattern.sub('', content)

    # 2. Remove desktop install button from header actions
    content = desktop_btn_pattern.sub('', content)
    content = bare_desktop_btn_pattern.sub('', content)

    # 3. Update footer address
    content = footer_address_pattern.sub(new_footer_span, content)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Updated {filename} (len diff: {len(content) - original_len})")

print("All HTML files updated successfully.")
