import express from 'express';
import { db } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth(), (req, res) => {
  try {
    const totalCourses = db.prepare('SELECT COUNT(*) as count FROM courses').get().count;
    const totalCourseResources = db.prepare('SELECT COUNT(*) as count FROM course_resources').get().count;
    const totalStaff = db.prepare('SELECT COUNT(*) as count FROM staff').get().count;
    const totalExecutives = db.prepare('SELECT COUNT(*) as count FROM executives').get().count;
    const totalTimetable = db.prepare('SELECT COUNT(*) as count FROM timetable').get().count;
    const totalNews = db.prepare('SELECT COUNT(*) as count FROM news').get().count;
    const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get().count;
    const upcomingEvents = db.prepare("SELECT COUNT(*) as count FROM events WHERE status = 'UPCOMING'").get().count;
    const totalSIWES = db.prepare('SELECT COUNT(*) as count FROM siwes_resources').get().count;
    const totalProjects = db.prepare('SELECT COUNT(*) as count FROM project_resources').get().count;
    const totalGallery = db.prepare('SELECT COUNT(*) as count FROM gallery').get().count;
    const totalContacts = db.prepare('SELECT COUNT(*) as count FROM contacts').get().count;
    const totalAnnouncements = db.prepare('SELECT COUNT(*) as count FROM announcements').get().count;

    const recentNews = db.prepare('SELECT id, title, category, published_at FROM news ORDER BY published_at DESC LIMIT 5').all();
    const upcomingEventsList = db.prepare("SELECT id, title, event_date, event_time, venue FROM events WHERE status = 'UPCOMING' ORDER BY event_date ASC LIMIT 4").all();

    res.json({
      counts: {
        courses: totalCourses,
        courseResources: totalCourseResources,
        staff: totalStaff,
        executives: totalExecutives,
        timetable: totalTimetable,
        news: totalNews,
        events: totalEvents,
        upcomingEvents,
        siwes: totalSIWES,
        projects: totalProjects,
        gallery: totalGallery,
        contacts: totalContacts,
        announcements: totalAnnouncements
      },
      recentNews,
      upcomingEventsList
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
