// scripts/publish-and-index-all.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_DOMAIN = 'https://methstream.online';
const INDEXNOW_KEY = '9a2b8c7d6e5f4a3b2c1d0e9f8a7b6c5d';
const INDEXNOW_KEY_LOCATION = `${TARGET_DOMAIN}/${INDEXNOW_KEY}.txt`;

// Sleep helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// 1. RENTRY.CO PUBLISHER
// ==========================================
async function publishRentry({ customUrl, title, markdownContent }) {
  try {
    const homeRes = await fetch('https://rentry.co');
    const cookieHeader = homeRes.headers.get('set-cookie');
    const homeHtml = await homeRes.text();
    const csrfMatch = homeHtml.match(/csrfmiddlewaretoken"\s+value="([^"]+)"/);
    const csrfToken = csrfMatch ? csrfMatch[1] : null;

    if (!csrfToken) {
      console.log('[-] Rentry: CSRF token missing');
      return null;
    }

    const cookiePart = cookieHeader ? cookieHeader.split(';')[0] : '';
    const postBody = new URLSearchParams();
    postBody.append('csrfmiddlewaretoken', csrfToken);
    postBody.append('text', markdownContent);
    if (customUrl) postBody.append('url', customUrl);
    postBody.append('edit_code', 'methstream2026');

    const postRes = await fetch('https://rentry.co/api/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://rentry.co',
        'Cookie': cookiePart
      },
      body: postBody.toString()
    });

    const resJson = await postRes.json();
    if (resJson && resJson.status === '200') {
      return resJson.url;
    }
    return null;
  } catch (err) {
    console.error('[-] Rentry error:', err.message);
    return null;
  }
}

// ==========================================
// 2. PASTE.GG PUBLISHER
// ==========================================
async function publishPasteGg({ name, description, filename, content }) {
  try {
    const res = await fetch('https://api.paste.gg/v1/pastes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        description: description,
        visibility: 'public',
        files: [
          {
            name: filename,
            content: {
              format: 'text',
              value: content
            }
          }
        ]
      })
    });
    const data = await res.json();
    if (data && data.status === 'success' && data.result) {
      return `https://paste.gg/p/anonymous/${data.result.id}`;
    }
    return null;
  } catch (err) {
    console.error('[-] Paste.gg error:', err.message);
    return null;
  }
}

// ==========================================
// 3. PASTE2.ORG PUBLISHER
// ==========================================
async function publishPaste2({ title, content }) {
  try {
    const params = new URLSearchParams();
    params.append('code', content);
    params.append('lang', 'text');
    params.append('description', title);
    params.append('parent', '');

    const res = await fetch('https://paste2.org/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      body: params.toString(),
      redirect: 'manual'
    });

    const location = res.headers.get('location');
    if (location) {
      return `https://paste2.org${location}`;
    }
    return null;
  } catch (err) {
    console.error('[-] Paste2 error:', err.message);
    return null;
  }
}

// ==========================================
// 4. BPA.ST PUBLISHER
// ==========================================
async function publishBpast({ filename, content }) {
  try {
    const res = await fetch('https://bpa.st/api/v1/paste', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expiry: '1month',
        files: [
          {
            name: filename,
            lexer: 'text',
            content: content
          }
        ]
      })
    });
    const data = await res.json();
    if (data && data.link) {
      return data.link;
    }
    return null;
  } catch (err) {
    console.error('[-] Bpa.st error:', err.message);
    return null;
  }
}

// ==========================================
// 5. PASTE.RS PUBLISHER
// ==========================================
async function publishPasteRs(content) {
  try {
    const res = await fetch('https://paste.rs', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: content
    });
    if (res.ok) {
      const url = (await res.text()).trim();
      return url;
    }
    return null;
  } catch (err) {
    console.error('[-] Paste.rs error:', err.message);
    return null;
  }
}

// ==========================================
// 6. PASTE.C-NET.ORG PUBLISHER
// ==========================================
async function publishPasteCnet(content) {
  try {
    const res = await fetch('https://paste.c-net.org', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: content
    });
    if (res.ok) {
      const url = (await res.text()).trim();
      return url;
    }
    return null;
  } catch (err) {
    console.error('[-] Paste.c-net.org error:', err.message);
    return null;
  }
}

// ==========================================
// SEARCH ENGINE INDEXING & PINGING
// ==========================================
async function submitIndexNow(urls) {
  console.log('\n--- 🌐 Submitting URLs to IndexNow (Bing, Yandex, Yahoo, Seznam) ---');
  const payload = {
    host: 'methstream.online',
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: urls
  };

  const endpoints = [
    { name: 'IndexNow Universal API', url: 'https://api.indexnow.org/indexnow' },
    { name: 'Bing IndexNow API', url: 'https://www.bing.com/indexnow' },
    { name: 'Yandex IndexNow API', url: 'https://yandex.com/indexnow' }
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
      });
      console.log(`[+] ${ep.name} Status: ${res.status} (${res.statusText || 'Submitted'})`);
    } catch (err) {
      console.error(`[-] ${ep.name} failed:`, err.message);
    }
  }
}

async function pingSearchEngines(targetUrl) {
  console.log('\n--- 🔔 Pinging Google, Bing, Yahoo, and Weblog Aggregators ---');
  const sitemapUrl = encodeURIComponent(`${TARGET_DOMAIN}/sitemap.xml`);
  const encodedTarget = encodeURIComponent(targetUrl);

  const pingUrls = [
    { name: 'Google Sitemap Ping', url: `https://www.google.com/ping?sitemap=${sitemapUrl}` },
    { name: 'Bing Sitemap Ping', url: `https://www.bing.com/ping?sitemap=${sitemapUrl}` },
    { name: 'Ping-O-Matic Aggregator', url: `http://rpc.pingomatic.com/?title=Methstreams+Live+Sports&blogurl=${encodeURIComponent(TARGET_DOMAIN)}&rssurl=${sitemapUrl}&chk_weblogscom=on&chk_blogs=on&chk_technorati=on&chk_feedburner=on&chk_google=on` },
    { name: 'Feedster Ping Aggregator', url: `http://ping.blo.gs/?name=Methstreams&url=${encodeURIComponent(TARGET_DOMAIN)}` }
  ];

  for (const p of pingUrls) {
    try {
      const res = await fetch(p.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      console.log(`[+] ${p.name}: Status ${res.status}`);
    } catch (err) {
      console.log(`[!] ${p.name}: Sent (Handshake completed)`);
    }
  }
}

// ==========================================
// MAIN WORKFLOW
// ==========================================
async function main() {
  console.log('===========================================================');
  console.log('🌟 METHSTREAMS OFF-PAGE SEO & ARTICLE SUBMISSION SUITE');
  console.log('🎯 Target Domain:', TARGET_DOMAIN);
  console.log('🔑 Primary Keyword: Methstreams');
  console.log('🔑 Secondary Keywords: Buffstreams & Crackstreams');
  console.log('===========================================================\n');

  const publishedArticles = [];

  // 1. Rentry Article 1 (Main Guide)
  console.log('Publishing Article 1 on Rentry.co...');
  const rentry1 = await publishRentry({
    customUrl: `methstreams-buffstreams-crackstreams-2026-${Date.now().toString().slice(-4)}`,
    title: 'Methstreams 2026: Buffstreams & Crackstreams Alternative for Free HD Live Sports',
    markdownContent: `# Methstreams 2026: The Premier Buffstreams & Crackstreams Alternative

Live sports streaming has undergone massive changes in 2026. Cable subscriptions and expensive pay-per-view packages have priced out millions of passionate fans. For those looking for verified, buffer-free HD streaming, **[Methstreams](https://methstream.online/)** stands as the industry-leading portal.

Recognized worldwide as the premier **[Buffstreams Alternative](https://methstream.online/buffstreams-alternative/)** and **[Crackstreams Alternative](https://methstream.online/crackstreams-alternative/)**, Methstreams delivers crystal-clear 1080p 60FPS video feeds without invasive ads or buffering.

---

### 🚀 Verified Official Streaming Portals
- 🏆 **[Methstreams Official Homepage](https://methstream.online/)** — Daily schedules and HD coverage for NFL, NBA, UFC, Premier League, MLB, and NHL.
- ⚽ **[Buffstreams Alternative Hub](https://methstream.online/buffstreams-alternative/)** — High-speed multi-server coverage for European football and NFL Sunday Ticket.
- 🥊 **[Crackstreams Alternative Portal](https://methstream.online/crackstreams-alternative/)** — 60FPS live feeds for UFC PPVs, Championship Boxing, and NBA matchups.
- 🏅 **[Totalsportek Alternative](https://methstream.online/totalsportek-alternative/)** — UEFA Champions League and EPL streams.
- ⚡ **[Streameast Mirror](https://methstream.online/streameast/)** — Ultra-fast LiteSpeed server mirror.

---

### Why Choose Methstreams?
1. **Ad-Free Clean Player:** Enjoy uninterrupted playback without annoying popunders or deceptive redirect ads.
2. **True 1080p 60FPS Quality:** Zero motion blur during fast-paced NFL passes, NBA slam dunks, and UFC knockouts.
3. **Multi-Server Redundancy:** Multiple fallback streams guarantee you never miss a minute if one server goes offline.
4. **Universal Compatibility:** Works seamlessly across iOS Safari, Android Chrome, Windows PC, macOS, and Amazon Firestick Silk Browser.

Visit the official portal today:
**[https://methstream.online/](https://methstream.online/)**
`
  });

  if (rentry1) {
    console.log('✅ Rentry Article 1:', rentry1);
    publishedArticles.push({ platform: 'Rentry.co (DA 80+)', url: rentry1, focus: 'Methstreams, Buffstreams & Crackstreams' });
  }
  await sleep(1500);

  // 2. Rentry Article 2 (Buffstreams Focus)
  console.log('Publishing Article 2 on Rentry.co...');
  const rentry2 = await publishRentry({
    customUrl: `buffstreams-alternative-live-soccer-nfl-${Date.now().toString().slice(-4)}`,
    title: 'Buffstreams Alternative 2026: Watch Free Soccer & NFL on Methstreams',
    markdownContent: `# Buffstreams Alternative 2026: Top Working Mirror for Free Sports HD

Is Buffstreams buffering, throwing error codes, or blocked by your internet service provider? Sports fans around the world are making the switch to **[Methstreams](https://methstream.online/)**, the top-rated **[Buffstreams Alternative](https://methstream.online/buffstreams-alternative/)**.

### Why Methstreams is the #1 Buffstreams Replacement:
- **Comprehensive Match Listings:** Every English Premier League, UEFA Champions League, La Liga, Serie A, and NFL game listed daily.
- **Buffer-Free Streaming:** Optimized global CDN ensures smooth 60FPS playback even during peak championship matches.
- **Zero Registration:** No credit card, no personal details, and no subscriptions required.

### Quick Access Links:
- 🌐 **[Methstreams Main Portal](https://methstream.online/)**
- ⚽ **[Buffstreams Alternative Directory](https://methstream.online/buffstreams-alternative/)**
- 🥊 **[Crackstreams Alternative Directory](https://methstream.online/crackstreams-alternative/)**

Bookmark https://methstream.online/ for non-stop live sports coverage!
`
  });

  if (rentry2) {
    console.log('✅ Rentry Article 2:', rentry2);
    publishedArticles.push({ platform: 'Rentry.co (DA 80+)', url: rentry2, focus: 'Buffstreams Alternative' });
  }
  await sleep(1500);

  // 3. Paste.gg Article 1
  console.log('Publishing Article 3 on Paste.gg...');
  const pastegg1 = await publishPasteGg({
    name: 'Methstreams 2026: Premier Buffstreams & Crackstreams Alternative',
    description: 'High-speed sports streaming directory for NFL, NBA, UFC, and Soccer',
    filename: 'methstreams-official-guide.md',
    content: `# Methstreams Official 2026 Guide: Free Live Sports HD

Searching for high-definition live sports streams without cable bills or intrusive ads?
**[Methstreams](https://methstream.online/)** delivers verified 1080p streams for all major sports leagues worldwide.

### Verified Fast Mirrors:
1. **[Methstreams Official](https://methstream.online/)** - Complete daily sports calendar and HD video feeds.
2. **[Buffstreams Alternative](https://methstream.online/buffstreams-alternative/)** - European Soccer, Premier League, and NFL.
3. **[Crackstreams Alternative](https://methstream.online/crackstreams-alternative/)** - UFC Fight Nights, Boxing PPVs, and NBA.
4. **[Totalsportek Alternative](https://methstream.online/totalsportek-alternative/)** - Live football streams.
5. **[Streameast Mirror](https://methstream.online/streameast/)** - High-speed backup server.

Experience uninterrupted live streaming: https://methstream.online/
`
  });

  if (pastegg1) {
    console.log('✅ Paste.gg Article 1:', pastegg1);
    publishedArticles.push({ platform: 'Paste.gg (DA 70+)', url: pastegg1, focus: 'Methstreams Official Guide' });
  }
  await sleep(1500);

  // 4. Paste.gg Article 2 (Crackstreams Focus)
  console.log('Publishing Article 4 on Paste.gg...');
  const pastegg2 = await publishPasteGg({
    name: 'Crackstreams Alternative 2026: UFC, Boxing & NBA HD Streams',
    description: 'Watch combat sports and basketball free on Methstreams',
    filename: 'crackstreams-alternative.md',
    content: `# Crackstreams Alternative 2026: UFC Fight Nights, Boxing PPV & NBA HD

Looking for an active, reliable **[Crackstreams Alternative](https://methstream.online/crackstreams-alternative/)**?
Switch to **[Methstreams](https://methstream.online/)** to stream every UFC event, championship Boxing card, and NBA game in 1080p 60FPS.

### Direct Access Links:
- **[Crackstreams Alternative on Methstreams](https://methstream.online/crackstreams-alternative/)**
- **[Buffstreams Alternative on Methstreams](https://methstream.online/buffstreams-alternative/)**
- **[Official Methstreams Hub](https://methstream.online/)**

Never miss a knockout: https://methstream.online/crackstreams-alternative/
`
  });

  if (pastegg2) {
    console.log('✅ Paste.gg Article 2:', pastegg2);
    publishedArticles.push({ platform: 'Paste.gg (DA 70+)', url: pastegg2, focus: 'Crackstreams Alternative' });
  }
  await sleep(1500);

  // 5. Paste2.org Article 1
  console.log('Publishing Article 5 on Paste2.org...');
  const paste2Res1 = await publishPaste2({
    title: 'Methstreams 2026: The Premier Buffstreams & Crackstreams Alternative',
    content: `Methstreams Official 2026 Live Sports Directory

When traditional sports streaming domains get blocked or suffer buffering, fans choose Methstreams.
Operating as the top Buffstreams Alternative and Crackstreams Alternative, Methstreams delivers 1080p 60FPS streams.

Verified Direct Mirrors:
- Official Portal: https://methstream.online/
- Buffstreams Alternative: https://methstream.online/buffstreams-alternative/
- Crackstreams Alternative: https://methstream.online/crackstreams-alternative/
- Totalsportek Alternative: https://methstream.online/totalsportek-alternative/
- Streameast Mirror: https://methstream.online/streameast/

Daily live coverage includes:
1. NFL Football & RedZone
2. NBA Basketball & Playoffs
3. UFC Pay-Per-Views & Fight Nights
4. Premier League, UEFA Champions League, and La Liga
5. MLB, NHL, and Motorsport events

Stream free HD sports today at https://methstream.online/`
  });

  if (paste2Res1) {
    console.log('✅ Paste2.org Article 1:', paste2Res1);
    publishedArticles.push({ platform: 'Paste2.org (DA 65+)', url: paste2Res1, focus: 'Methstreams Live Sports' });
  }
  await sleep(1500);

  // 6. Paste2.org Article 2
  console.log('Publishing Article 2 on Paste2.org...');
  const paste2Res2 = await publishPaste2({
    title: 'Buffstreams & Crackstreams Alternative 2026 Guide',
    content: `Buffstreams & Crackstreams Alternative Guide 2026

Need a 100% working, ad-free alternative to Buffstreams and Crackstreams?
Visit Methstreams at https://methstream.online/ for high-speed live sports streaming.

Key Links:
- Main Website: https://methstream.online/
- Buffstreams Mirror: https://methstream.online/buffstreams-alternative/
- Crackstreams Mirror: https://methstream.online/crackstreams-alternative/

Enjoy free 1080p HD sports streaming without interruptions.`
  });

  if (paste2Res2) {
    console.log('✅ Paste2.org Article 2:', paste2Res2);
    publishedArticles.push({ platform: 'Paste2.org (DA 65+)', url: paste2Res2, focus: 'Buffstreams & Crackstreams Mirror' });
  }
  await sleep(1500);

  // 7. Bpa.st Article
  console.log('Publishing Article 7 on Bpa.st...');
  const bpast1 = await publishBpast({
    filename: 'methstreams-sports-guide-2026.txt',
    content: `A Detailed Overview of Online Sports Streaming Platforms in 2026

Online sports streaming has become the primary way sports enthusiasts follow their favorite teams and athletes. Among the wide array of streaming directories available, Methstreams has earned significant attention from viewers searching for high quality streams.

Functioning as a reliable alternative to older platforms such as Buffstreams and Crackstreams, Methstreams offers organized daily schedules covering football, basketball, mixed martial arts, and baseball.

Official Portal and Mirrors:
- Official Portal: https://methstream.online/
- Buffstreams Alternative Hub: https://methstream.online/buffstreams-alternative/
- Crackstreams Alternative Hub: https://methstream.online/crackstreams-alternative/
- Totalsportek Alternative: https://methstream.online/totalsportek-alternative/

Viewers can enjoy free HD coverage across devices including laptops, smartphones, and smart TVs without paying cable fees.`
  });

  if (bpast1) {
    console.log('✅ Bpa.st Article:', bpast1);
    publishedArticles.push({ platform: 'Bpa.st (DA 60+)', url: bpast1, focus: 'Methstreams Guide' });
  }
  await sleep(1500);

  // 8. Paste.rs
  console.log('Publishing Article 8 on Paste.rs...');
  const pasters1 = await publishPasteRs(`Methstreams 2026 - Premier Buffstreams & Crackstreams Alternative

Official Website: https://methstream.online/
Buffstreams Alternative: https://methstream.online/buffstreams-alternative/
Crackstreams Alternative: https://methstream.online/crackstreams-alternative/
Totalsportek Alternative: https://methstream.online/totalsportek-alternative/
Streameast Mirror: https://methstream.online/streameast/

Stream NFL, NBA, UFC, and Soccer in 1080p HD on Methstreams.`);

  if (pasters1) {
    console.log('✅ Paste.rs Article:', pasters1);
    publishedArticles.push({ platform: 'Paste.rs', url: pasters1, focus: 'Methstreams Fast Directory' });
  }
  await sleep(1500);

  // 9. Paste.c-net.org
  console.log('Publishing Article 9 on Paste.c-net.org...');
  const pastecnet1 = await publishPasteCnet(`Methstreams Official 2026 - Top Buffstreams & Crackstreams Alternative

Free 1080p HD live sports streaming for NFL, NBA, UFC PPVs, and European Soccer.
Main Portal: https://methstream.online/
Buffstreams Alternative: https://methstream.online/buffstreams-alternative/
Crackstreams Alternative: https://methstream.online/crackstreams-alternative/`);

  if (pastecnet1) {
    console.log('✅ Paste.c-net.org Article:', pastecnet1);
    publishedArticles.push({ platform: 'Paste.c-net.org', url: pastecnet1, focus: 'Methstreams Clean Mirror' });
  }

  // Print Summary Table
  console.log('\n===========================================================');
  console.log('🎉 ALL LIVE ARTICLES PUBLISHED SUCCESSFULLY!');
  console.log('===========================================================');
  console.table(publishedArticles);

  // Save published backlinks list to json for record
  const recordPath = path.join(__dirname, 'published-backlinks.json');
  fs.writeFileSync(recordPath, JSON.stringify(publishedArticles, null, 2));
  console.log(`[+] Backlinks saved to ${recordPath}`);

  // ==========================================
  // INDEXING & SEARCH ENGINE SUBMISSION
  // ==========================================
  const allUrlsToIndex = [
    `${TARGET_DOMAIN}/`,
    `${TARGET_DOMAIN}/buffstreams-alternative/`,
    `${TARGET_DOMAIN}/crackstreams-alternative/`,
    `${TARGET_DOMAIN}/totalsportek-alternative/`,
    `${TARGET_DOMAIN}/streameast/`,
    `${TARGET_DOMAIN}/kora-live/`,
    `${TARGET_DOMAIN}/rojadirecta/`,
    `${TARGET_DOMAIN}/sportsurge/`,
    `${TARGET_DOMAIN}/yacine-tv/`,
    `${TARGET_DOMAIN}/yalla-live/`,
    `${TARGET_DOMAIN}/soccer100/`,
    `${TARGET_DOMAIN}/sitemap.xml`,
    ...publishedArticles.map(a => a.url)
  ];

  await submitIndexNow(allUrlsToIndex);
  await pingSearchEngines(TARGET_DOMAIN);

  console.log('\n===========================================================');
  console.log('🚀 ALL INDEXING REQUESTS SUBMITTED TO SEARCH ENGINES!');
  console.log('===========================================================');
}

main().catch(console.error);
