import urllib.request
import os
import sys
import json
import re

with open('extracted_drive_files.json', 'r', encoding='utf-8') as f:
    drive_files = json.load(f)

os.makedirs('resources/materials', exist_ok=True)
os.makedirs('public/resources/materials', exist_ok=True)

# Mapping original filename to clean storage name
clean_name_map = {
    "1.pdf": "sta331_regression_module_4.pdf",
    "BIO 102 General Biology 2-1.pdf": "bio102_general_biology_2.pdf",
    "BIO 102 General Biology 2.pdf": "bio102_general_biology_notes.pdf",
    "BIO 102 Lecture note by Dr. Okolie.pdf": "bio102_okolie_lecture_notes.pdf",
    "BIO 102 MODE OF RESPIRATION IN ANIMALS AND PLANTS_101023(2)(1).pdf": "bio102_respiration_animals_plants.pdf",
    "BIO 102 NOTE-VIRUS.pdf": "bio102_virus_notes.pdf",
    "BIO 102 Note-1.pdf": "bio102_comprehensive_notes.pdf",
    "BIO 102 lecture note Ecological Adaptations and Mode of Nutrition(1).pdf": "bio102_ecological_adaptations.pdf",
    "BIO MERGED.pdf": "bio102_merged_handbook.pdf",
    "BIO102 Iweze (1)_compressed.pdf": "bio102_iweze_compressed.pdf",
    "BUA102_Notes.pdf": "bua102_introduction_to_business.pdf",
    "Bio102 Mr Chisom(1).pdf": "bio102_chisom_lecture_notes.pdf",
    "CLASSIFICATION OF BACTERIA AND FUNGI-BY CHUKWUEBUKA EZEOKOLI.pdf": "bio102_bacteria_and_fungi_classification.pdf",
    "COS 102 - INTRODUCTION TO PROBLEM SOLVING.pdf": "cos102_introduction_to_problem_solving.pdf",
    "Culture.pdf": "bio102_cell_culture_techniques.pdf",
    "ENT312_1-15.pdf": "ent312_entrepreneurship.pdf",
    "ENT_211_FOR_GS_NEW_TEXT_PACKAKED_FOR_DIRECTOR_2024.pdf": "ent211_entrepreneurship_textbook_2024.pdf",
    "GEN.BIO 102(1)(1).pdf": "bio102_general_biology_study_pack.pdf",
    "GST312_Complete_12_Chapters_Master_Summary.pdf": "gst312_peace_conflict_summary.pdf",
    "INDEX NUMBERS IN R.pdf": "sta231_index_numbers_in_r.pdf",
    "LIMITS_NOTE_1.pdf": "mth231_limits_note_part1.pdf",
    "Lecture Notes on Conics Section.pdf": "mat102_conics_section_lecture_notes.pdf",
    "MAT 102 LECTURE NOTE-merged.pdf": "mat102_calculus_coordinate_geometry.pdf",
    "MAT 201 past question(2021-2022).pdf": "mat201_past_question.pdf",
    "MAT 202 note compressed.pdf": "mat202_mathematical_methods_notes.pdf",
    "MTH204_LECTURE_NOTE_2.pdf": "mth204_lecture_note_part2.pdf",
    "MTH204_LECTURE_NOTE_3.pdf": "mth204_lecture_note_part3.pdf",
    "MTH204_Lecture_Note_1.pdf": "mth204_lecture_note_part1.pdf",
    "MTH231 LIMITS_NOTE.pdf": "mth231_limits_note.pdf",
    "MTH231_LECTURE_NOTE_2024_2025.pdf": "mth231_lecture_note_2024_2025.pdf",
    "PHY102TextBook.pdf": "phy102_general_physics_textbook.pdf",
    "Peace and Conflict Resolution GST 312 CBT Questions.pdf": "gst312_cbt_practice_questions.pdf",
    "Physics pdf.pdf": "phy102_electricity_magnetism_notes.pdf",
    "S PART.docx": "sta312_order_statistics_module.docx",
    "ST331_391_L2.pdf": "sta331_regression_module_2.pdf",
    "ST331_391_L3.pdf": "sta331_regression_module_3.pdf",
    "ST331_391_L4-1.pdf": "sta331_regression_module_4_supplement.pdf",
    "ST331_391_L4.pdf": "sta331_regression_module_4_main.pdf",
    "ST331_391_L5.pdf": "sta331_regression_module_5.pdf",
    "ST331_391_L6.pdf": "sta331_regression_module_6.pdf",
    "Schaums Probability.pdf": "schaums_probability.pdf",
    "csc202 past question.pdf": "csc202_past_question.pdf",
    "s Outline- Statistics.pdf": "schaums_outline_statistics.pdf",
    "s).pdf": "sta312_advanced_distribution_notes.pdf",
    "u0026 CLASSIFICATION OF BACTERIA AND FUNGI-BY CHUKWUEBUKA EZEOKOLI.pdf": "bio102_bacteria_and_fungi.pdf",
    "u0026 Culture.pdf": "bio102_culture_notes.pdf"
}

def download_file(file_id, dest_path):
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 1000:
        print(f"Already exists: {dest_path} ({os.path.getsize(dest_path)} bytes)")
        return True

    url = f'https://drive.google.com/uc?export=download&id={file_id}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read()
            if b'Google Drive - Virus scan warning' in content or b'download_warning' in content:
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

print(f"Processing {len(drive_files)} drive files...")
for original_name, fid in drive_files.items():
    clean_name = clean_name_map.get(original_name, re.sub(r'[^a-zA-Z0-9_.]+', '_', original_name.lower()))
    dest = os.path.join('resources/materials', clean_name)
    download_file(fid, dest)
    # Also sync to public/resources/materials
    pub_dest = os.path.join('public/resources/materials', clean_name)
    if os.path.exists(dest) and not os.path.exists(pub_dest):
        import shutil
        shutil.copy2(dest, pub_dest)

print("Done downloading all drive materials.")
