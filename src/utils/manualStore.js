const KV_KEY = 'data_v1';
const DEFAULT_DB = Object.freeze({ sports: [], pages: [], ads: {} });
const inMem = { db: null, dirty: false };
const META_URL = import.meta.url || '';

// Lazy-load Node modules — these are ONLY used as a local-dev fallback.
// Cloudflare Workers uses KV instead, so we must NOT import at the top level
// because a module-level import crash takes down the entire worker.
let _fsMod = null;
let _pathMod = null;
let _urlMod = null;
let _nodesLoaded = false;

function _loadNodeModules() {
  if (_nodesLoaded) return;
  _nodesLoaded = true;
  try {
    // eslint-disable-next-line no-undef
    const fs = require('fs');
    if (fs && typeof fs.readFileSync === 'function') _fsMod = fs;
  } catch (_) {}
  try {
    // eslint-disable-next-line no-undef
    const path = require('path');
    if (path && typeof path.join === 'function') _pathMod = path;
  } catch (_) {}
  try {
    // eslint-disable-next-line no-undef
    const url = require('url');
    if (url && typeof url.fileURLToPath === 'function') _urlMod = url;
  } catch (_) {}
}

let DB_PATH = '';
function _getDbPath() {
  if (DB_PATH) return DB_PATH;
  try {
    _loadNodeModules();
    if (_pathMod && _urlMod && META_URL) {
      const __dirname_val = _pathMod.dirname(_urlMod.fileURLToPath(META_URL));
      DB_PATH = _pathMod.join(__dirname_val, '../data/manual-pages.json');
    }
  } catch (_) { DB_PATH = ''; }
  return DB_PATH;
}

let cachedSeed = null;
function getSeedDB() {
  if (cachedSeed) return cachedSeed;
  try {
    _loadNodeModules();
    const dbPath = _getDbPath();
    if (_fsMod && dbPath) {
      try {
        const raw = _fsMod.readFileSync(dbPath, 'utf-8');
        cachedSeed = JSON.parse(raw);
        return cachedSeed;
      } catch (_) {}
    }
  } catch (_) {}
  try {
    cachedSeed = JSON.parse(JSON.stringify(DEFAULT_DB));
  } catch (_) {
    cachedSeed = { sports: [], pages: [] };
  }
  return cachedSeed;
}

function getKv(platform) {
  if (!platform) {
    try {
      if (globalThis && globalThis.__MANUAL_KV__) return globalThis.__MANUAL_KV__;
    } catch (_) {}
    return null;
  }
  const candidates = [];
  // Astro v5 + @astrojs/cloudflare v12: locals.runtime passed as platform
  try { if (platform && platform.env && platform.env.MANUAL_PAGES) candidates.push(platform.env.MANUAL_PAGES); } catch (_) {}
  try { if (platform && platform.MANUAL_PAGES) candidates.push(platform.MANUAL_PAGES); } catch (_) {}
  // Astro locals.runtime.env path
  try { if (platform && platform.runtime && platform.runtime.env && platform.runtime.env.MANUAL_PAGES) candidates.push(platform.runtime.env.MANUAL_PAGES); } catch (_) {}
  try { if (platform && platform.context && platform.context.env && platform.context.env.MANUAL_PAGES) candidates.push(platform.context.env.MANUAL_PAGES); } catch (_) {}
  try { if (platform && platform.cf && platform.cf.env && platform.cf.env.MANUAL_PAGES) candidates.push(platform.cf.env.MANUAL_PAGES); } catch (_) {}
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    try {
      if (c && typeof c.get === 'function' && typeof c.put === 'function') return c;
    } catch (_) {}
  }
  try {
    if (globalThis && globalThis.__MANUAL_KV__) return globalThis.__MANUAL_KV__;
  } catch (_) {}
  return null;
}

async function loadDB(platform) {
  const kv = getKv(platform);
  if (kv) {
    try {
      let raw = null;
      try {
        raw = await kv.get(KV_KEY, { type: 'json' });
      } catch (_) {
        try {
          const text = await kv.get(KV_KEY);
          if (text && typeof text === 'string') raw = JSON.parse(text);
        } catch (_) {}
      }
      try {
        if (raw && raw.sports && Array.isArray(raw.sports)) return raw;
      } catch (_) {}
      try {
        const seed = getSeedDB();
        await kv.put(KV_KEY, JSON.stringify(seed));
      } catch (_) {}
      return getSeedDB();
    } catch (e) {
      try { return getSeedDB(); } catch (_) { return { sports: [], pages: [] }; }
    }
  }
  try {
    if (inMem.db && inMem.db.sports && Array.isArray(inMem.db.sports)) return inMem.db;
  } catch (_) {}
  try {
    _loadNodeModules();
    const dbPath = _getDbPath();
    if (_fsMod && dbPath) {
      try {
        const raw = _fsMod.readFileSync(dbPath, 'utf-8');
        inMem.db = JSON.parse(raw);
        return inMem.db;
      } catch (e) {
        inMem.db = { sports: [], pages: [] };
        return inMem.db;
      }
    }
  } catch (_) {}
  try {
    inMem.db = JSON.parse(JSON.stringify(getSeedDB()));
  } catch (_) {
    inMem.db = { sports: [], pages: [] };
  }
  return inMem.db;
}

async function saveDB(db, platform) {
  const kv = getKv(platform);
  if (kv) {
    try {
      await kv.put(KV_KEY, JSON.stringify(db));
      return true;
    } catch (e) {
      try { inMem.db = db; inMem.dirty = true; } catch (_) {}
      return true;
    }
  }
  try {
    _loadNodeModules();
    const dbPath = _getDbPath();
    if (_fsMod && dbPath) {
      try {
        _fsMod.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
        return true;
      } catch (e) {
        try { inMem.db = db; } catch (_) {}
        return true;
      }
    }
  } catch (_) {}
  try {
    inMem.db = db;
  } catch (_) {}
  return true;
}

function withPlatform(fn) {
  return async function(arg) {
    let platform = null;
    try { platform = arg && arg.platform ? arg.platform : null; } catch (_) { platform = null; }
    try {
      return await fn(arg || {}, platform);
    } catch (e) {
      try { return fn(arg || {}, null); } catch (_) {
        return null;
      }
    }
  };
}

export const getAllSports = withPlatform(async function(_, platform) {
  const db = await loadDB(platform);
  try { return db && db.sports ? db.sports : []; } catch (_) { return []; }
});

export const createSport = withPlatform(async function({ name }, platform) {
  const db = await loadDB(platform);
  try {
    const trimmed = (name || '').toString().trim();
    if (!trimmed) return null;
    const id = trimmed.toUpperCase().charAt(0);
    if (!db.sports || !Array.isArray(db.sports)) db.sports = [];
    let sport = db.sports.find(s => s && s.id === id);
    if (!sport) {
      sport = { id, name: trimmed, createdAt: Date.now() };
      db.sports.push(sport);
      await saveDB(db, platform);
    } else {
      sport.name = trimmed;
      await saveDB(db, platform);
    }
    return sport;
  } catch (_) {
    return null;
  }
});

export const deleteSport = withPlatform(async function({ sportId }, platform) {
  try {
    const db = await loadDB(platform);
    try { db.sports = (db.sports || []).filter(s => s && s.id !== sportId); } catch (_) {}
    try { db.pages = (db.pages || []).filter(p => p && p.sportId !== sportId); } catch (_) {}
    await saveDB(db, platform);
    return true;
  } catch (_) { return false; }
});

export const deleteAllSports = withPlatform(async function(_, platform) {
  try {
    const db = { sports: [], pages: [] };
    await saveDB(db, platform);
    return true;
  } catch (_) { return false; }
});

export const getAllPages = withPlatform(async function(_, platform) {
  const db = await loadDB(platform);
  try { return db && db.pages ? db.pages : []; } catch (_) { return []; }
});

export const getPagesBySport = withPlatform(async function({ sportId }, platform) {
  const db = await loadDB(platform);
  try {
    const arr = (db.pages || []).filter(p => p && p.sportId === sportId);
    try { arr.sort((a, b) => (a.number || 0) - (b.number || 0)); } catch (_) {}
    return arr;
  } catch (_) { return []; }
});

export const getPageById = withPlatform(async function({ pageId }, platform) {
  const db = await loadDB(platform);
  try {
    return (db.pages || []).find(p => p && p.id === pageId) || null;
  } catch (_) { return null; }
});

export const getPageCountBySport = withPlatform(async function({ sportId }, platform) {
  const db = await loadDB(platform);
  try {
    return (db.pages || []).filter(p => p && p.sportId === sportId).length;
  } catch (_) { return 0; }
});

export const createPage = withPlatform(async function({ sportId, title, iframe }, platform) {
  try {
    const db = await loadDB(platform);
    if (!db.pages || !Array.isArray(db.pages)) db.pages = [];
    const sportPages = (db.pages).filter(p => p && p.sportId === sportId);
    const maxNum = sportPages.reduce((max, p) => Math.max(max, p.number || 0), 0);
    const nextNum = maxNum + 1;
    const id = `${sportId}-${nextNum}`;
    const newPage = {
      id,
      sportId,
      number: nextNum,
      title: title || id,
      iframe: iframe || '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    db.pages.push(newPage);
    await saveDB(db, platform);
    return newPage;
  } catch (_) {
    return null;
  }
});

export const createMultiplePages = withPlatform(async function({ sportId, count }, platform) {
  try {
    const db = await loadDB(platform);
    const created = [];
    if (!db.pages || !Array.isArray(db.pages)) db.pages = [];
    let sportPages = db.pages.filter(p => p && p.sportId === sportId);
    let maxNum = sportPages.reduce((max, p) => Math.max(max, p.number || 0), 0);
    for (let i = 0; i < count; i++) {
      try {
        maxNum++;
        const id = `${sportId}-${maxNum}`;
        const page = {
          id, sportId, number: maxNum, title: id, iframe: '',
          createdAt: Date.now(), updatedAt: Date.now()
        };
        db.pages.push(page);
        created.push(page);
      } catch (_) {}
    }
    await saveDB(db, platform);
    return created;
  } catch (_) { return []; }
});

export const updatePage = withPlatform(async function({ pageId, title, iframe }, platform) {
  try {
    const db = await loadDB(platform);
    if (!db.pages) db.pages = [];
    const idx = db.pages.findIndex(p => p && p.id === pageId);
    if (idx === -1) return null;
    db.pages[idx].title = title;
    db.pages[idx].iframe = iframe;
    db.pages[idx].updatedAt = Date.now();
    await saveDB(db, platform);
    return db.pages[idx];
  } catch (_) {
    return null;
  }
});

export const deletePage = withPlatform(async function({ pageId }, platform) {
  try {
    const db = await loadDB(platform);
    if (!db.pages) db.pages = [];
    const page = db.pages.find(p => p && p.id === pageId);
    db.pages = db.pages.filter(p => p && p.id !== pageId);
    await saveDB(db, platform);
    return page || null;
  } catch (_) { return null; }
});

// ── Ads ────────────────────────────────────────────────────────────────────
// ads is a plain object: { head: '', playerTop: '', playerBottom: '',
//   leftSidebar: '', rightSidebar: '', belowContent: '', popunder: '' }

export const getAds = withPlatform(async function(_, platform) {
  try {
    const db = await loadDB(platform);
    return db.ads || {};
  } catch (_) { return {}; }
});

export const saveAds = withPlatform(async function({ ads }, platform) {
  try {
    const db = await loadDB(platform);
    db.ads = ads || {};
    await saveDB(db, platform);
    return true;
  } catch (_) { return false; }
});
