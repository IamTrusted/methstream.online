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

function getPlatform(ctx) {
  try { if (ctx.locals?.runtime) return ctx.locals.runtime; } catch (_) {}
  try { if (ctx.platform) return ctx.platform; } catch (_) {}
  try { if (ctx.locals) return ctx.locals; } catch (_) {}
  return null;
}

export async function POST({ request, locals, platform }) {
  const plat = getPlatform({ locals, platform });
  try {
    const body = await request.json();
    const { username, password } = body;

    const expectedUser = envGet(plat, 'ADMIN_USERNAME', 'admin');
    const expectedPass = envGet(plat, 'ADMIN_PASSWORD', 'admin123');

    if (username === expectedUser && password === expectedPass) {
      const token = btoaSafe(`${username}:${password}`);
      return new Response(JSON.stringify({ ok: true, token }), {
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
        }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e && e.message) || String(e) }), { status: 400 });
  }
}

export async function GET({ request, locals, platform }) {
  const plat = getPlatform({ locals, platform });
  try {
    const cookie = request.headers.get('cookie') || '';
    const tokenMatch = cookie.match(/admin_token=([^;]+)/);
    if (!tokenMatch) {
      return new Response(JSON.stringify({ loggedIn: false }));
    }
    const token = tokenMatch[1];
    const u = envGet(plat, 'ADMIN_USERNAME', 'admin');
    const p = envGet(plat, 'ADMIN_PASSWORD', 'admin123');
    const expected = btoaSafe(`${u}:${p}`);
    return new Response(JSON.stringify({ loggedIn: token === expected }));
  } catch (_) {
    return new Response(JSON.stringify({ loggedIn: false }));
  }
}
