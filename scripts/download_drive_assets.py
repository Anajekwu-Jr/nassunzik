import urllib.request
import os
import sys

def download_file(file_id, dest_path):
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    url = f'https://drive.google.com/uc?export=download&id={file_id}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read()
            # If Google Drive returns a virus scan warning HTML page for large files, parse confirm token
            if b'Google Drive - Virus scan warning' in content or b'download_warning' in content:
                import re
                match = re.search(r'confirm=([0-9A-Za-z_]+)', content.decode('utf-8', errors='ignore'))
                if match:
                    confirm_token = match.group(1)
                    confirm_url = f'{url}&confirm={confirm_token}'
                    with urllib.request.urlopen(urllib.request.Request(confirm_url, headers={'User-Agent': 'Mozilla/5.0'})) as resp2:
                        content = resp2.read()
            with open(dest_path, 'wb') as f:
                f.write(content)
        print(f"Downloaded: {dest_path} ({len(content)} bytes)")
        return True
    except Exception as e:
        print(f"Failed {dest_path} (ID: {file_id}): {e}")
        return False

# 1. Gallery
gallery_files = [
    ('1y1O68MmluuigddJx89stIvWgbxRfsP5Z', 'resources/images/gallery/probix_class_2026.jpg'),
    ('1ooWsqSjogwwUq3BBdzuWqXgZc19wVIwy', 'resources/images/gallery/vantora_class_2027.jpg'),
    ('18jPoRQW8YkxG7qFvZhgIgTlntZPe65GG', 'resources/images/gallery/hod_cup_runner_up_2025_2026.jpg'),
    ('1upseMe0h_sN-roG5xOp3GNYr4CvOy9d6', 'resources/images/gallery/prof_osuji_vantora27_siwes_defense_2026.jpg')
]

# 2. Executives (Folder: 1MkzqmRZR2NxPFdO48d2i0MrrUkl9ZWHF)
exec_files = [
    ('1ZjZOzpoaW-fOAhoPFXW9ewrqGL7uxhAr', 'resources/images/executives/president_chidera_anajekwu.jpg'),
    ('1HfayfvaInv6Tg0STALyCtYfP0vsSnHUB', 'resources/images/executives/vice_president_vivian_obunadike.jpg'),
    ('15ffzBJW7sonbh8WphCphk1llvKOSnGpB', 'resources/images/executives/secretary_general_rejoice_chidozie.jpg'),
    ('1DH3yNQckAVwMyp6uON4efWS1OaSYihOi', 'resources/images/executives/director_academics_mmesoma_ejefonye.jpg'),
    ('1vgDOb9de1IQSiIGHk4ohOPtgAHPpebiv', 'resources/images/executives/financial_secretary_chinedu_chidinma_veronica.jpg'),
    ('172Zt8TFZoBHLLB98LPVrYuyBu0r9_qJL', 'resources/images/executives/treasurer_chiamaka_ezenwelu.jpg'),
    ('1TbuJP8t_utrF0PITAC-n0c8xU3oPDSLX', 'resources/images/executives/director_sports_franklin_ugochukwu.jpg'),
    ('1OBrRz3aXw_XTi_zsMCkoyKbGNvoFetTK', 'resources/images/executives/director_socials_offorkee_chidera_elvis.jpg')
]

# 3. SIWES
siwes_files = [
    ('1JEnTJiNJyjrszUBxljgvYpxa8ramP8QS', 'resources/documents/siwes/siwes_placement_acceptance_letter_form.jpg'),
    ('1l5FcWkGhya9fJ6vf3rJPl33vgiSzLkB6', 'resources/documents/siwes/siwes_technical_report_guide.pdf')
]

# 4. Course Materials (Key items)
course_files = [
    ('1QZKYMQ6vVGWa2i1V9AU4_NG95uyh--64', 'resources/materials/sta111_probability_note.pdf'),
    ('18kDfcLLlL65DyBfbyiotzpMsgwIu9bvh', 'resources/materials/sta121_slides.pdf'),
    ('1Xhi29qNmbPusWecLtuesmWkrUlrHhVFd', 'resources/materials/sta214_note.pdf'),
    ('1xkdYoVtI2K_pGklvRUrjl5dTPJL47pwd', 'resources/materials/cos201_cpp_lecture_notes.pdf'),
    ('1ACUe256PIzUqccTJHUuvYzMhEWzXB-RD', 'resources/materials/csc202_past_question.pdf'),
    ('1QC_eGi7rgK5BnCq1RkVPip6zmvu1_qia', 'resources/materials/mat202_mathematical_methods_notes.pdf'),
    ('1PxcwYMCvPsxIeF1qywl2cv0JLogfMVkR', 'resources/materials/mat201_past_question.pdf'),
    ('17dS-9jsm2l7_0OdWto26cm1W0CVsXWhv', 'resources/materials/mth231_limits_note.pdf'),
    ('15V7qKaHWDsAq3xTlgAphA2plzyulxgTK', 'resources/materials/sta312_order_statistics.pdf'),
    ('1A5IwcsYCPNR0ST_dOxNtt7VKL4bjw0_w', 'resources/materials/sta312_bivariate_distribution.pdf'),
    ('1DVQ_Wv7T7-bCrBK3RUH_lPUneHexZVUv', 'resources/materials/sta312_lecture_module.pdf'),
    ('1zzFQT2g9CQ7GZAKDABgzAMbb6HcxFDsj', 'resources/materials/sta331_391_demography.pdf'),
    ('1J2wRAeQgZbLdGIuFDvpCAKCfw50tmCTW', 'resources/materials/sta371_operations_research_dr_ikediuwa.pdf'),
    ('1ZWhVZTqPtgM0ZOD7lV5yQGWwZ2mG2AHm', 'resources/materials/stat322_regression_analysis.pdf'),
    ('1Xihq1uf-Vo2Fjtpi6fJ99n-3qhXTc4nd', 'resources/materials/stat324_biometrics.pdf'),
    ('15mxQCmJb4ILTWufeZuZVJUl5zx0fZCG2', 'resources/materials/ent312_entrepreneurship.pdf'),
    ('1awqJ3C-fvqCP-00S7K9Ke9eyrx9pzLEK', 'resources/materials/gst312_peace_conflict_summary.pdf'),
    ('1tA1h7D08gQtV4_y7a-QpLOS5DxhHkqL0', 'resources/materials/schaums_outline_statistics.pdf'),
    ('1-FMtbOh6xO6QiUSlAfMBapYcl_xIoNnk', 'resources/materials/schaums_probability.pdf')
]

print("Starting download of Google Drive assets...")
for f_id, f_dest in gallery_files:
    download_file(f_id, f_dest)

for f_id, f_dest in exec_files:
    download_file(f_id, f_dest)

for f_id, f_dest in siwes_files:
    download_file(f_id, f_dest)

for f_id, f_dest in course_files:
    download_file(f_id, f_dest)

print("All asset downloads completed.")
