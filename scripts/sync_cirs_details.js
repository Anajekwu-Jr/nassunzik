import fs from 'node:fs';
import path from 'node:path';

function clean(t) {
  return t
    ? t
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim()
    : '';
}

export function parseCirsHtml(html) {
  if (!html) return {};

  const tables = [...html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi)];

  // Helper to extract rows
  function getTableRows(tableHtml) {
    if (!tableHtml) return [];
    const rows = [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    return rows
      .map(r => {
        return [...r[1].matchAll(/<(?:td|th)[^>]*>([\s\S]*?)(?:<\/(?:td|th)>|(?=<(?:td|th))|$)/gi)]
          .map(c => clean(c[1]))
          .filter(Boolean);
      })
      .filter(r => r.length > 0);
  }

  // 1. Interest Areas
  let interestAreas = '';
  const interestMatch = html.match(/Interest Areas\s*<\/h[2-5]>([\s\S]*?)(?:<h[2-5]|<div class="m-portlet|<table|$)/i);
  if (interestMatch) {
    interestAreas = clean(interestMatch[1]);
  }

  // 2. Personal / Contact Info from Table 1
  let cirsEmail = '';
  let cirsPhone = '';
  let cirsAddress = '';
  if (tables[1]) {
    const rows = getTableRows(tables[1][1]);
    for (const r of rows) {
      const text = r.join(' ');
      if (/Email:/i.test(text)) {
        const m = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (m) cirsEmail = m[1];
      }
      if (/Phone:/i.test(text)) {
        const m = text.match(/(\+?[0-9\s-]{9,})/);
        if (m) cirsPhone = m[1].trim();
      }
      if (/Address:/i.test(text)) {
        cirsAddress = text.replace(/Address:/i, '').trim();
      }
    }
  }

  // 3. Qualifications from Table 2
  const qualifications = [];
  if (tables[2]) {
    const rows = getTableRows(tables[2][1]);
    for (const r of rows) {
      if (r.length >= 2 && /^\d+$/.test(r[0])) {
        qualifications.push(r[1]);
      } else if (r.length === 1 && !r[0].toLowerCase().includes('degrees / basic')) {
        qualifications.push(r[0]);
      }
    }
  }

  // 4. Experience from Table 3
  const experience = [];
  if (tables[3]) {
    const rows = getTableRows(tables[3][1]);
    for (const r of rows) {
      if (r.length >= 2 && /^\d+$/.test(r[0])) {
        experience.push(r[1]);
      } else if (r.length === 1 && !r[0].includes('-->')) {
        experience.push(r[0]);
      }
    }
  }

  // 5. Creative Output (Books, Journals, Conferences) from Table 4
  const publications = [];
  if (tables[4]) {
    const rows = getTableRows(tables[4][1]);
    let currentCategory = 'Publications';
    for (const r of rows) {
      if (r.length === 1 && !/^\d+$/.test(r[0])) {
        currentCategory = r[0];
      } else if (r.length >= 2 && /^\d+$/.test(r[0])) {
        publications.push({ category: currentCategory, citation: r[1] });
      }
    }
  }

  // 6. Leadership & Project Supervisions from Table 5
  const leadership = [];
  if (tables[5]) {
    const rows = getTableRows(tables[5][1]);
    let currentCategory = 'Supervisions & Leadership';
    for (const r of rows) {
      if (r.length === 1 && !/^\d+$/.test(r[0])) {
        currentCategory = r[0];
      } else if (r.length >= 2 && /^\d+$/.test(r[0])) {
        leadership.push({ category: currentCategory, title: r[1] });
      }
    }
  }

  // 7. Memberships from Table 6
  const memberships = [];
  if (tables[6]) {
    const rows = getTableRows(tables[6][1]);
    for (const r of rows) {
      if (r.length >= 2 && /^\d+$/.test(r[0])) {
        memberships.push(r[1]);
      } else if (r.length === 1 && !r[0].includes('-->')) {
        memberships.push(r[0]);
      }
    }
  }

  // 8. Conferences / Events Attended from Table 7
  const eventsAttended = [];
  if (tables[7]) {
    const rows = getTableRows(tables[7][1]);
    for (const r of rows) {
      if (r.length >= 2 && /^\d+$/.test(r[0])) {
        eventsAttended.push(r[1]);
      } else if (r.length === 1 && !r[0].toLowerCase().includes('events')) {
        eventsAttended.push(r[0]);
      }
    }
  }

  return {
    interestAreas,
    cirsEmail,
    cirsPhone,
    cirsAddress,
    qualifications,
    experience,
    publications,
    leadership,
    memberships,
    eventsAttended
  };
}

async function fetchWithTimeout(url, ms = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    clearTimeout(id);
    return null;
  }
}

async function run() {
  const staffFile = path.resolve('data/official_cirs_staff.json');
  if (!fs.existsSync(staffFile)) {
    console.error('Staff file missing!');
    process.exit(1);
  }

  const staff = JSON.parse(fs.readFileSync(staffFile, 'utf-8'));
  console.log(`Loaded ${staff.length} staff members. Commencing CIRS detail extraction...`);

  const cirsDetails = {};
  const batchSize = 6;

  for (let i = 0; i < staff.length; i += batchSize) {
    const batch = staff.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(staff.length / batchSize)} (Staff ${i + 1} to ${Math.min(i + batchSize, staff.length)})...`);

    await Promise.all(
      batch.map(async (s) => {
        const cirsId = (s.cirs_id || '').toUpperCase();
        if (!cirsId) return;

        const url = `https://profile.unizik.edu.ng/${cirsId.toLowerCase()}`;
        try {
          const html = await fetchWithTimeout(url, 10000);
          if (html) {
            const parsed = parseCirsHtml(html);
            cirsDetails[cirsId] = parsed;
            console.log(`  ✓ ${cirsId} (${s.name}): ${parsed.qualifications.length} quals, ${parsed.publications.length} pubs, ${parsed.experience.length} exp`);
          } else {
            console.log(`  - ${cirsId} (${s.name}): CIRS page unreachable or empty`);
          }
        } catch (err) {
          console.log(`  x ${cirsId} error:`, err.message);
        }
      })
    );
  }

  const outFile = path.resolve('data/official_cirs_details.json');
  fs.writeFileSync(outFile, JSON.stringify(cirsDetails, null, 2), 'utf-8');
  console.log(`Extracted CIRS profile details for ${Object.keys(cirsDetails).length} staff members saved to ${outFile}!`);
}

// If executed directly
if (process.argv[1].endsWith('sync_cirs_details.js')) {
  run();
}
