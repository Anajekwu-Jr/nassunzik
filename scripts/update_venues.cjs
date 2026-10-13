const { DatabaseSync } = require("node:sqlite");
const fs = require("fs");

const db = new DatabaseSync("data/nass_portal.db");

// Update SQLite database: STAT LAB for practical computing
const updateLab = db.prepare(`
  UPDATE timetable 
  SET venue = 'STAT LAB', updated_at = datetime('now')
  WHERE course_code LIKE '%STA%' AND (
    course_code IN ('STA 231', 'STA 331') OR 
    course_title LIKE '%computing%' OR 
    course_title LIKE '%practical%'
  )
`);
updateLab.run();

// Update SQLite database: STAT Hall for all other STA courses
const updateHall = db.prepare(`
  UPDATE timetable 
  SET venue = 'STAT Hall', updated_at = datetime('now')
  WHERE course_code LIKE '%STA%' AND venue != 'STAT LAB'
`);
updateHall.run();

// Verify
const allRows = db.prepare("SELECT id, level, semester, day, start_time, end_time, course_code, course_title, lecturer, venue FROM timetable ORDER BY id").all();
console.log("Total entries in DB:", allRows.length);
allRows.filter(r => r.course_code.includes("STA")).forEach(r => {
  console.log(`[${r.course_code}] ${r.course_title} -> ${r.venue} (${r.lecturer})`);
});

// Update portal_state_backup.json
const backupPath = "data/portal_state_backup.json";
if (fs.existsSync(backupPath)) {
  const backup = JSON.parse(fs.readFileSync(backupPath, "utf8"));
  if (Array.isArray(backup.timetable)) {
    backup.timetable = backup.timetable.map(slot => {
      if (slot.course_code && slot.course_code.includes("STA")) {
        const isComputing = (slot.course_code === "STA 231" || slot.course_code === "STA 331" || 
                             (slot.course_title && slot.course_title.toLowerCase().includes("computing")));
        return {
          ...slot,
          venue: isComputing ? "STAT LAB" : "STAT Hall"
        };
      }
      return slot;
    });
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    console.log("Updated portal_state_backup.json successfully!");
  }
}
