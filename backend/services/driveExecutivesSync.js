import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

export const NASS_EXECS_DRIVE_FOLDER_ID = '1MkzqmRZR2NxPFdO48d2i0MrrUkl9ZWHF';
export const NASS_EXECS_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${NASS_EXECS_DRIVE_FOLDER_ID}`;

const FOLDER_TTL_MS = 5 * 60 * 1000; // Refresh folder listing every 5 minutes
const PHOTO_TTL_MS = 10 * 60 * 1000; // Cache Drive image buffer in memory for 10 minutes
const TMP_CACHE_DIR = '/tmp/nass_drive_exec_cache';

const DEFAULT_DRIVE_FILE_IDS = {
  'president': '1sbosrFA0k6wQinDtW5wv21mfds6uGUj3',
  'vice president': '1HfayfvaInv6Tg0STALyCtYfP0vsSnHUB',
  'secretary general': '15ffzBJW7sonbh8WphCphk1llvKOSnGpB',
  'director of academics': '1DH3yNQckAVwMyp6uON4efWS1OaSYihOi',
  'financial secretary': '1vgDOb9de1IQSiIGHk4ohOPtgAHPpebiv',
  'treasurer': '172Zt8TFZoBHLLB98LPVrYuyBu0r9_qJL',
  'director of sports': '1TbuJP8t_utrF0PITAC-n0c8xU3oPDSLX',
  'director of socials': '1OBrRz3aXw_XTi_zsMCkoyKbGNvoFetTK'
};

let folderCache = {
  fetchedAt: 0,
  entries: { ...DEFAULT_DRIVE_FILE_IDS },
  rawList: [],
  lastError: null
};

const photoBufferCache = new Map();

function decodeHtmlEntities(str) {
  return String(str || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function normalizeRoleKey(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchExecutiveRoleKey(officeOrName) {
  const s = normalizeRoleKey(officeOrName);
  if (!s) return null;
  // IMPORTANT: Check 'vice president' before 'president'
  if (s.includes('vice president') || s === 'vp') return 'vice president';
  if (s.includes('president')) return 'president';
  if (s.includes('secretary general') || s.includes('sec gen')) return 'secretary general';
  if (s.includes('academics') || s.includes('academic')) return 'director of academics';
  if (s.includes('financial')) return 'financial secretary';
  if (s.includes('treasurer')) return 'treasurer';
  if (s.includes('sports') || s.includes('sport')) return 'director of sports';
  if (s.includes('socials') || s.includes('social')) return 'director of socials';
  return null;
}

export async function getDriveExecutiveFolderMap(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && folderCache.fetchedAt > 0 && now - folderCache.fetchedAt < FOLDER_TTL_MS) {
    return folderCache;
  }

  try {
    const url = `https://drive.google.com/embeddedfolderview?id=${NASS_EXECS_DRIVE_FOLDER_ID}#list`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NASS-UNIZIK-Portal/1.0)'
      },
      signal: AbortSignal.timeout(4500)
    });

    if (!res.ok) {
      throw new Error(`Google Drive folder HTTP ${res.status}`);
    }

    const html = await res.text();
    const regex = /id="entry-([A-Za-z0-9_-]+)"[\s\S]*?flip-entry-title">([^<]+)</g;
    const nextEntries = { ...DEFAULT_DRIVE_FILE_IDS };
    const rawList = [];
    let match;

    while ((match = regex.exec(html)) !== null) {
      const fileId = match[1];
      const title = decodeHtmlEntities(match[2]);
      const roleKey = matchExecutiveRoleKey(title);
      rawList.push({ fileId, title, roleKey });
      if (roleKey) {
        nextEntries[roleKey] = fileId;
      }
    }

    if (rawList.length > 0) {
      folderCache = {
        fetchedAt: now,
        entries: nextEntries,
        rawList,
        lastError: null
      };
    } else {
      folderCache = {
        ...folderCache,
        fetchedAt: now,
        lastError: 'No files parsed from embedded folder view; using fallback IDs'
      };
    }
  } catch (err) {
    folderCache = {
      ...folderCache,
      fetchedAt: now - FOLDER_TTL_MS + 60 * 1000, // Retry sooner on transient failure (1 min)
      lastError: err?.message || 'Drive folder check failed'
    };
  }

  return folderCache;
}

export function resolveDriveFileIdForExecutive(exec, entriesMap = folderCache.entries) {
  if (!exec) return null;
  const roleKey = matchExecutiveRoleKey(exec.office || exec.portfolio || exec.role || exec.name);
  if (!roleKey) return null;
  return entriesMap[roleKey] || DEFAULT_DRIVE_FILE_IDS[roleKey] || null;
}

export function shouldUseDrivePhoto(photoUrl) {
  if (!photoUrl) return true;
  const clean = String(photoUrl).trim();
  // Preserve manually uploaded admin photos (/uploads/...) or explicit external URLs
  if (clean.startsWith('/uploads/') || clean.startsWith('http://') || clean.startsWith('https://')) {
    return false;
  }
  return (
    clean.startsWith('/resources/images/executives/') ||
    clean.startsWith('/resources/images/exco_') ||
    clean.startsWith('/resources/images/exec_') ||
    clean.startsWith('/api/executives/drive-photo/')
  );
}

function detectImageMime(buffer, headerContentType) {
  if (!buffer || buffer.length < 12) return null;
  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'image/png';
  // WEBP
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
    return 'image/webp';
  }
  // GIF
  if (buffer.subarray(0, 3).toString('ascii') === 'GIF') return 'image/gif';

  if (headerContentType && headerContentType.startsWith('image/')) {
    return headerContentType.split(';')[0].trim();
  }
  return null;
}

export async function fetchDrivePhoto(fileId, forceRefresh = false) {
  if (!/^[A-Za-z0-9_-]{15,80}$/.test(String(fileId || ''))) {
    return null;
  }

  const now = Date.now();
  const cached = photoBufferCache.get(fileId);
  if (!forceRefresh && cached && now - cached.fetchedAt < PHOTO_TTL_MS) {
    return cached;
  }

  // Check /tmp disk cache if not forcing refresh
  const tmpFile = path.join(TMP_CACHE_DIR, `${fileId}.bin`);
  const tmpMeta = path.join(TMP_CACHE_DIR, `${fileId}.json`);
  if (!forceRefresh && fs.existsSync(tmpFile) && fs.existsSync(tmpMeta)) {
    try {
      const meta = JSON.parse(fs.readFileSync(tmpMeta, 'utf-8'));
      if (now - meta.fetchedAt < PHOTO_TTL_MS) {
        const buffer = fs.readFileSync(tmpFile);
        const entry = { buffer, contentType: meta.contentType, fetchedAt: meta.fetchedAt };
        photoBufferCache.set(fileId, entry);
        return entry;
      }
    } catch (_) {}
  }

  const downloadUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
  try {
    const res = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NASS-UNIZIK-Portal/1.0)'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000)
    });

    if (!res.ok) {
      throw new Error(`Drive download HTTP ${res.status}`);
    }

    const arrayBuf = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);
    const contentType = detectImageMime(buffer, res.headers.get('content-type'));

    if (!contentType) {
      throw new Error('Drive response is not a valid image');
    }

    const entry = { buffer, contentType, fetchedAt: now };
    photoBufferCache.set(fileId, entry);

    try {
      fs.mkdirSync(TMP_CACHE_DIR, { recursive: true });
      fs.writeFileSync(tmpFile, buffer);
      fs.writeFileSync(tmpMeta, JSON.stringify({ contentType, fetchedAt: now }));
    } catch (_) {}

    return entry;
  } catch (err) {
    if (cached) return cached;
    console.warn(`Drive photo fetch failed for ${fileId}:`, err?.message || err);
    return null;
  }
}

export function resolveLocalFallbackPath(fallbackQuery) {
  if (!fallbackQuery) return null;
  const cleanRel = String(fallbackQuery).split('?')[0].replace(/^\/+/, '');
  if (!cleanRel.startsWith('resources/images/')) return null;

  const candidates = [
    path.resolve(ROOT_DIR, cleanRel),
    path.resolve(ROOT_DIR, 'public', cleanRel)
  ];

  for (const candidate of candidates) {
    if (candidate.startsWith(ROOT_DIR) && fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

export function clearDriveCaches() {
  folderCache.fetchedAt = 0;
  photoBufferCache.clear();
}
