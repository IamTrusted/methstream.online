import { getAds, saveAds } from '../../../utils/manualStore.js';

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
  const pub = url.searchParams.get('pub') === '1';
  if (!pub && !checkAuth(request, plat)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const ads = await getAds({ platform: plat });
  return new Response(JSON.stringify({ ads }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}

export async function POST({ request, locals, platform }) {
  const plat = getPlatform({ locals, platform });
  if (!checkAuth(request, plat)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  try {
    const body = await request.json();
    const { ads } = body;
    if (!ads || typeof ads !== 'object') {
      return new Response(JSON.stringify({ error: 'ads object required' }), { status: 400 });
    }
    const ALLOWED = ['head', 'playerTop', 'playerBottom', 'leftSidebar', 'rightSidebar', 'belowContent', 'popunder'];
    const clean = {};
    for (const k of ALLOWED) { clean[k] = typeof ads[k] === 'string' ? ads[k] : ''; }
    await saveAds({ ads: clean, platform: plat });
    return new Response(JSON.stringify({ ok: true, ads: clean }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500 });
  }
}
