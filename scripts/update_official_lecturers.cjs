const { DatabaseSync } = require("node:sqlite");
const fs = require("fs");
const path = require("path");

const db = new DatabaseSync("data/nass_portal.db");

// Official 2026/2027 First Semester Course Distribution mapping from HOD Prof. F.C. Eze
const lecturerMapping = {
  // 100 Level
  "STA 111": "Uzuke, Okoye, Anabike, Eriobu, Chukwunenye",
  "STA 121": "Obiora-Ilouno, Ibeakuzie and Obulezi",

  // 200 Level
  "STA 201": "Awopeju, Ikediuwa, Odum, Omoruyi, Aforka, Eriobu, Oladimeji",
  "STA 211": "G. A. Osuji and C. I. Nnabude",
  "STA 221": "V. C. Chukwunenye and C. E. Onyenekwe",
  "STA 231": "H. O. Etaga and Orji G. O",

  // 300 Level
  "STA 311": "J. O. Obulezi and C. C. Nnanatu",
  "STA 321": "E. U. Umeh and C. I. Nnabude",
  "STA 331": "L. O. Ngonadi, Enogwe and I. F. Okpala",
  "NAU-STA 341": "H. O. Etaga and K. F. Aforka",
  "STA 341": "H. O. Etaga and K. F. Aforka",
  "NAU-STA 351": "L. O. Ngonadi and V. C. Chukwunenye",
  "STA 351": "L. O. Ngonadi and V. C. Chukwunenye",
  "NAU-STA 361": "C. A. Uzuke and G. C. Okoye",
  "STA 361": "C. A. Uzuke and G. C. Okoye",
  "NAU-STA 371": "H. O. Obiora-Ilouno and S. Enogwe",
  "STA 371": "H. O. Obiora-Ilouno and S. Enogwe",
  "NAU-STA 381": "P. O. Ibeakuzie and C. E. Onyenekwe",
  "STA 381": "P. O. Ibeakuzie and C. E. Onyenekwe",

  // 400 Level
  "STA 411": "G. A Osuji and C. I. Anabike",
  "STA 413": "E. U. Umeh and A. K. Abidemi",
  "NAU-STA 421": "U. C. Ikediuwa and J. O. Odum",
  "STA 421": "U. C. Ikediuwa and J. O. Odum",
  "NAU-STA 441": "C. H. Nwankwo and A. K. Abidemi",
  "STA 441": "C. H. Nwankwo and A. K. Abidemi",
  "NAU-STA 451": "F. C. Eze and L. O. Ngonadi",
  "STA 451": "F. C. Eze and L. O. Ngonadi",
  "NAU-STA 461": "S. I. Onyeagu and C. I Nnabude",
  "STA 461": "S. I. Onyeagu and C. I Nnabude",
  "NAU-STA 471": "H. O. Obiora-Ilouno and S. Enogwe",
  "STA 471": "H. O. Obiora-Ilouno and S. Enogwe",
  "NAU-STA 481": "H. O. Etaga and K. F. Aforka",
  "STA 481": "H. O. Etaga and K. F. Aforka",
  "NAU-STA 491": "C. E. Onyenekwe",
  "STA 491": "C. E. Onyenekwe"
};

// Title updates per official sheet
const titleMapping = {
  "STA 201": "Statistics for Agricultural & Biological Sciences",
  "NAU-STA 451": "Design And Analysis of Experiments",
  "STA 451": "Design And Analysis of Experiments"
};

// Update Database
const updateStmt = db.prepare(`
  UPDATE timetable
  SET lecturer = ?, venue = ?, updated_at = datetime('now')
  WHERE id = ?
`);

const updateTitleStmt = db.prepare(`
  UPDATE timetable
  SET course_title = ?, updated_at = datetime('now')
  WHERE course_code = ? AND id = ?
`);

const allSlots = db.prepare("SELECT * FROM timetable").all();
let updatedCount = 0;

for (const slot of allSlots) {
  const code = (slot.course_code || '').trim();
  const lecturer = lecturerMapping[code];
  if (lecturer) {
    const isComputing = code === 'STA 231' || code === 'STA 331' || (slot.course_title && slot.course_title.toLowerCase().includes('computing'));
    const venue = isComputing ? 'STAT LAB' : 'STAT Hall';
    updateStmt.run(lecturer, venue, slot.id);
    updatedCount++;

    if (titleMapping[code]) {
      updateTitleStmt.run(titleMapping[code], code, slot.id);
    }
  }
}

console.log(`Updated ${updatedCount} timetable slots in SQLite database.`);

// Also update backup json
const backupPath = "data/portal_state_backup.json";
if (fs.existsSync(backupPath)) {
  const backup = JSON.parse(fs.readFileSync(backupPath, "utf8"));
  if (Array.isArray(backup.timetable)) {
    backup.timetable = backup.timetable.map(slot => {
      const code = (slot.course_code || '').trim();
      const lecturer = lecturerMapping[code];
      if (lecturer) {
        const isComputing = code === 'STA 231' || code === 'STA 331' || (slot.course_title && slot.course_title.toLowerCase().includes('computing'));
        return {
          ...slot,
          course_title: titleMapping[code] || slot.course_title,
          lecturer: lecturer,
          venue: isComputing ? 'STAT LAB' : 'STAT Hall',
          updated_at: new Date().toISOString()
        };
      }
      return slot;
    });
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    console.log("Updated data/portal_state_backup.json successfully.");
  }
}

// Print verification table
const verified = db.prepare("SELECT id, level, day, start_time, end_time, course_code, course_title, lecturer, venue FROM timetable WHERE course_code LIKE '%STA%' ORDER BY level, day, start_time").all();
console.table(verified);
