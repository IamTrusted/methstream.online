import { getAllSports, createSport, deleteSport, deleteAllSports, getPageCountBySport } from '../../../utils/manualStore.js';

export const prerender = false;

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function btoaSafe(str) {
  try {
    if (typeof btoa === 'function') return btoa(str);
  } catch (_) {}
  let out = '', i = 0, len = str.length;
  while (i < len) {
    const c1 = str.charCodeAt(i++) & 0xff;
    if (i === len) { out += CHARS.charAt(c1 >> 2); out += CHARS.charAt((c1 & 0x3) << 4); out += '=='; break; }
    const c2 = str.charCodeAt(i++);
    if (i === len) { out += CHARS.charAt(c1 >> 2); out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4)); out += CHARS.charAt((c2 & 0xf) << 2); out += '='; break; }
    const c3 = str.charCodeAt(i++);
    out += CHARS.charAt(c1 >> 2);
    out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
    out += CHARS.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6));
    out += CHARS.charAt(c3 & 0x3f);
  }
  return out;
}

function envGet(platform, key, fallback) {
  try {
    const candidates = [
      import.meta.env[key],
      platform?.env?.[key],
      platform?.runtime?.env?.[key],
      platform?.[key],
    ];
    try {
      if (globalThis?.process?.env?.[key]) candidates.push(globalThis.process.env[key]);
    } catch (_) {}
    for (const v of candidates) {
      if (typeof v === 'string' && v.length > 0) return v;
    }
  } catch (_) {}
  return fallback;
}

function checkAuth(request, platform) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const tokenMatch = cookie.match(/admin_token=([^;]+)/);
    if (!tokenMatch) return false;
    const token = tokenMatch[1];
    const u = envGet(platform, 'ADMIN_USERNAME', 'admin');
    const p = envGet(platform, 'ADMIN_PASSWORD', 'admin123');
    const expected = btoaSafe(`${u}:${p}`);
    return token === expected;
  } catch (_) {
    return false;
  }
}

// Helper: extract platform from Astro context (locals.runtime for @astrojs/cloudflare v12)
function getPlatform(ctx) {
  try { if (ctx.locals?.runtime) return ctx.locals.runtime; } catch (_) {}
  try { if (ctx.platform) return ctx.platform; } catch (_) {}
  try { if (ctx.locals) return ctx.locals; } catch (_) {}
  return null;
}

export async function GET({ request, url, locals, platform }) {
  const plat = getPlatform({ locals, platform });
  const isDiag = url && url.searchParams && url.searchParams.get('diag') === '1';
  const diag = {};
  try { diag.platformType = typeof plat; } catch (_) {}
  try { diag.platformKeys = plat ? Object.keys(plat).slice(0, 30) : []; } catch (_) {}
  try { diag.hasEnvObj = !!plat?.env; } catch (_) {}
  try { diag.envKeys = plat?.env ? Object.keys(plat.env).slice(0, 30) : []; } catch (_) {}
  try { diag.hasManualPages = !!(plat?.env?.MANUAL_PAGES || plat?.MANUAL_PAGES); } catch (_) {}
  try { diag.hasSession = !!(plat?.env?.SESSION || plat?.SESSION); } catch (_) {}
  try { diag.adminUserFromImportMeta = typeof import.meta.env.ADMIN_USERNAME === 'string' ? import.meta.env.ADMIN_USERNAME.substring(0, 3) + '...' : 'undefined'; } catch (_) {}
  try { diag.adminUserFromPlatform = plat?.env && typeof plat.env.ADMIN_USERNAME === 'string' ? plat.env.ADMIN_USERNAME.substring(0, 3) + '...' : 'undefined'; } catch (_) {}
  try { diag.authOk = checkAuth(request, plat); } catch (_) { diag.authOk = false; }
  try { diag.btoaExists = typeof btoa === 'function'; } catch (_) {}

  if (isDiag) {
    return new Response(JSON.stringify(diag, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!checkAuth(request, plat)) {
    return new Response(JSON.stringify({ error: 'Unauthorized', diag }), { status: 401 });
  }
  const sports = await getAllSports({ platform: plat });
  const sportsWithCount = [];
  for (const s of sports) {
    const pageCount = await getPageCountBySport({ sportId: s.id, platform: plat });
    sportsWithCount.push({ ...s, pageCount });
  }
  return new Response(JSON.stringify({ sports: sportsWithCount }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request, locals, platform }) {
  const plat = getPlatform({ locals, platform });
  if (!checkAuth(request, plat)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  try {
    const body = await request.json();
    if (body.action === 'deleteAll') {
      await deleteAllSports({ platform: plat });
      return new Response(JSON.stringify({ ok: true }));
    }
    const { name } = body;
    if (!name) return new Response(JSON.stringify({ error: 'Name required' }), { status: 400 });
    const trimmed = String(name).trim();
    if (trimmed.length === 0) return new Response(JSON.stringify({ error: 'Invalid name (empty)' }), { status: 400 });

    const sport = await createSport({ name: trimmed, platform: plat });
    if (!sport) {
      return new Response(JSON.stringify({ error: 'Sport could not be created (empty result)' }), { status: 500 });
    }
    return new Response(JSON.stringify({ sport }));
  } catch (e) {
    const msg = e?.message || String(e);
    const stack = e?.stack || '';
    return new Response(JSON.stringify({ error: msg, detail: stack }), { status: 500 });
  }
}

export async function DELETE({ request, url, locals, platform }) {
  const plat = getPlatform({ locals, platform });
  if (!checkAuth(request, plat)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const sportId = url.searchParams.get('id');
  if (!sportId) return new Response(JSON.stringify({ error: 'ID required' }), { status: 400 });
  await deleteSport({ sportId, platform: plat });
  return new Response(JSON.stringify({ ok: true }));
}
