import { db } from './database.js';

let lastCheckedMinute = '';

export function startNotificationScheduler() {
  console.log('[Notification Scheduler] Automated daily push broadcast engine started.');

  // Check every 30 seconds
  setInterval(() => {
    try {
      const now = new Date();
      // Current date YYYY-MM-DD
      const currentDateStr = now.toISOString().split('T')[0];
      // Format current time HH:MM in 24h
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;

      // Avoid double checking same minute
      if (lastCheckedMinute === `${currentDateStr}_${currentTimeStr}`) {
        return;
      }
      lastCheckedMinute = `${currentDateStr}_${currentTimeStr}`;

      // Query active campaigns covering today
      const activeCampaigns = db.prepare(`
        SELECT * FROM scheduled_notifications
        WHERE is_active = 1
          AND date(start_date) <= date(?)
          AND date(end_date) >= date(?)
      `).all(currentDateStr, currentDateStr);

      for (const campaign of activeCampaigns) {
        let times = [];
        try {
          times = typeof campaign.times_of_day === 'string'
            ? JSON.parse(campaign.times_of_day)
            : campaign.times_of_day;
        } catch (_) {}

        if (Array.isArray(times) && times.includes(currentTimeStr)) {
          console.log(`[Notification Scheduler] Dispatched scheduled broadcast: "${campaign.title}" at ${currentTimeStr}`);

          // Publish announcement so it immediately appears in all students' In-App Notification Center
          db.prepare(`
            INSERT INTO announcements (title, content, priority, is_active, updated_at)
            VALUES (?, ?, ?, 1, datetime('now'))
          `).run(
            `[Broadcast ${currentTimeStr}] ${campaign.title}`,
            campaign.content,
            campaign.priority || 'IMPORTANT'
          );

          // Update counter
          db.prepare(`
            UPDATE scheduled_notifications
            SET dispatch_count = dispatch_count + 1,
                last_dispatched_at = datetime('now'),
                updated_at = datetime('now')
            WHERE id = ?
          `).run(campaign.id);
        }
      }
    } catch (err) {
      console.error('[Notification Scheduler] Check error:', err.message);
    }
  }, 30000);
}
