import { getAllPages, getPagesBySport, getPageById, createPage, createMultiplePages, updatePage, deletePage } from '../../../utils/manualStore.js';

export const prerender = false;

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function btoaSafe(str) {
  try { if (typeof btoa === 'function') return btoa(str); } catch (_) {}
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
    const candidates = [import.meta.env[key], platform?.env?.[key], platform?.runtime?.env?.[key], platform?.[key]];
    try { if (globalThis?.process?.env?.[key]) candidates.push(globalThis.process.env[key]); } catch (_) {}
    for (const v of candidates) { if (typeof v === 'string' && v.length > 0) return v; }
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
    return token === btoaSafe(`${u}:${p}`);
  } catch (_) { return false; }
}

function getPlatform(ctx) {
  try { if (ctx.locals?.runtime) return ctx.locals.runtime; } catch (_) {}
  try { if (ctx.platform) return ctx.platform; } catch (_) {}
  try { if (ctx.locals) return ctx.locals; } catch (_) {}
  return null;
}

export async function GET({ request, url, locals, platform }) {
  const plat = getPlatform({ locals, platform });
  if (!checkAuth(request, plat)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const sportId = url.searchParams.get('sportId');
  const pageId = url.searchParams.get('id');

  if (pageId) {
    const page = await getPageById({ pageId, platform: plat });
    return new Response(JSON.stringify({ page }), { headers: { 'Content-Type': 'application/json' } });
  }
  if (sportId) {
    const pages = await getPagesBySport({ sportId, platform: plat });
    return new Response(JSON.stringify({ pages }), { headers: { 'Content-Type': 'application/json' } });
  }
  const pages = await getAllPages({ platform: plat });
  return new Response(JSON.stringify({ pages }), { headers: { 'Content-Type': 'application/json' } });
}

export async function POST({ request, locals, platform }) {
  const plat = getPlatform({ locals, platform });
  if (!checkAuth(request, plat)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  try {
    const body = await request.json();
    const { sportId, title, iframe, count, action } = body;
    if (!sportId) return new Response(JSON.stringify({ error: 'sportId required' }), { status: 400 });

    if (action === 'bulkCreate') {
      const numCount = parseInt(count);
      if (!numCount || numCount < 1 || numCount > 5000) {
        return new Response(JSON.stringify({ error: 'Invalid count (1-5000)' }), { status: 400 });
      }
      const pages = await createMultiplePages({ sportId, count: numCount, platform: plat });
      return new Response(JSON.stringify({ pages, count: pages.length }));
    }

    const page = await createPage({ sportId, title: title || '', iframe: iframe || '', platform: plat });
    return new Response(JSON.stringify({ page }));
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || String(e), detail: e?.stack || '' }), { status: 500 });
  }
}

export async function PUT({ request, locals, platform }) {
  const plat = getPlatform({ locals, platform });
  if (!checkAuth(request, plat)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  try {
    const body = await request.json();
    const { id, title, iframe } = body;
    if (!id) return new Response(JSON.stringify({ error: 'ID required' }), { status: 400 });
    const page = await updatePage({ pageId: id, title: title || '', iframe: iframe || '', platform: plat });
    return new Response(JSON.stringify({ page }));
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || String(e), detail: e?.stack || '' }), { status: 500 });
  }
}

export async function DELETE({ request, url, locals, platform }) {
  const plat = getPlatform({ locals, platform });
  if (!checkAuth(request, plat)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const pageId = url.searchParams.get('id');
  if (!pageId) return new Response(JSON.stringify({ error: 'ID required' }), { status: 400 });
  const page = await deletePage({ pageId, platform: plat });
  return new Response(JSON.stringify({ ok: true, page }));
}
