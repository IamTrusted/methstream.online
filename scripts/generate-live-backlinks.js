// scripts/generate-live-backlinks.js
// Automated Off-Page SEO Publisher (No-Login High-DA Backlinks)

const TARGET_DOMAIN = 'https://methstream.online';

async function createRentryPost({ customUrl, title, text }) {
  try {
    const payload = new URLSearchParams();
    payload.append('csrfmiddlewaretoken', 'csrf');
    payload.append('text', text);
    if (customUrl) payload.append('url', customUrl);

    const res = await fetch('https://rentry.co/api/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://rentry.co'
      },
      body: payload,
      signal: AbortSignal.timeout(8000)
    });

    const data = await res.json();
    if (data && data.url) {
      return data.url;
    }
    return null;
  } catch (err) {
    console.error('Rentry error:', err.message);
    return null;
  }
}

async function createDpasteSnippet({ title, content }) {
  try {
    const params = new URLSearchParams();
    params.append('title', title);
    params.append('content', content);
    params.append('syntax', 'md');
    params.append('expiry_days', '365');

    const res = await fetch('https://dpaste.com/api/v2/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      signal: AbortSignal.timeout(8000)
    });

    if (res.status === 201) {
      return (await res.text()).trim();
    }
    return null;
  } catch (err) {
    console.error('Dpaste error:', err.message);
    return null;
  }
}

async function createPasteRs({ content }) {
  try {
    const res = await fetch('https://paste.rs', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: content,
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) {
      return (await res.text()).trim();
    }
    return null;
  } catch (err) {
    console.error('Paste.rs error:', err.message);
    return null;
  }
}

async function createPasteCnet({ content }) {
  try {
    const res = await fetch('https://paste.c-net.org/', {
      method: 'POST',
      body: content,
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) {
      return (await res.text()).trim();
    }
    return null;
  } catch (err) {
    console.error('Paste.c-net.org error:', err.message);
    return null;
  }
}

async function pingSearchEngines(backlinkUrls) {
  console.log('\n🔔 Pinging search engine aggregators and IndexNow for fast indexing...');
  
  // 1. IndexNow API Ping
  try {
    const indexNowRes = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'methstream.online',
        key: '9a2b8c7d6e5f4a3b2c1d0e9f8a7b6c5d',
        keyLocation: 'https://methstream.online/9a2b8c7d6e5f4a3b2c1d0e9f8a7b6c5d.txt',
        urlList: [
          'https://methstream.online/',
          'https://methstream.online/buffstreams-alternative/',
          'https://methstream.online/crackstreams-alternative/',
          'https://methstream.online/totalsportek-alternative/',
          'https://methstream.online/streameast/',
          ...backlinkUrls
        ]
      }),
      signal: AbortSignal.timeout(8000)
    });
    console.log(`📡 IndexNow submission: Status ${indexNowRes.status}`);
  } catch (e) {
    console.log('IndexNow ping notice:', e.message);
  }

  // 2. Bing Sitemap Ping
  try {
    await fetch('https://www.bing.com/ping?sitemap=https%3A%2F%2Fmethstream.online%2Fsitemap.xml', { signal: AbortSignal.timeout(6000) });
    console.log('📡 Bing Ping: Sent sitemap update for methstream.online');
  } catch (e) {}
}

async function main() {
  console.log('======================================================================');
  console.log('🚀 PUBLISHING LIVE OFF-PAGE SEO BACKLINKS (NO LOGIN REQUIRED)');
  console.log('🎯 Target Domain: https://methstream.online');
  console.log('🔑 Primary Keyword: Methstreams');
  console.log('🔑 Secondary Keyword: Buffstreams & Crackstreams');
  console.log('======================================================================\n');

  const allPublished = [];

  // -------------------------------------------------------------
  // POST 1: Rentry - Main Authority Article
  // -------------------------------------------------------------
  console.log('Writing and publishing Post 1 on Rentry.co (DA 79+)...');
  const rentry1 = await createRentryPost({
    customUrl: `methstreams-buffstreams-crackstreams-2026-${Date.now().toString().slice(-4)}`,
    title: 'Methstreams 2026: Best Buffstreams & Crackstreams Alternative for Free HD Live Sports',
    text: `# Methstreams 2026: The Premier Buffstreams & Crackstreams Alternative

In 2026, finding reliable, high-definition live sports streams without cable bills or pay-per-view fees has become essential for sports fans worldwide. If you are searching for the **best Buffstreams & Crackstreams alternative**, look no further than **[Methstreams](https://methstream.online/)**.

### 🌐 Verified Official Portals & Mirrors:
- **[Methstreams Official Portal](https://methstream.online/)** – Daily 1080p HD live sports schedules for NFL, NBA, UFC, and Premier League.
- **[Buffstreams Alternative on Methstreams](https://methstream.online/buffstreams-alternative/)** – High-speed mirror for English Premier League, UEFA Champions League, and NFL Sunday Ticket.
- **[Crackstreams Alternative on Methstreams](https://methstream.online/crackstreams-alternative/)** – 60FPS feeds for UFC numbered PPVs, boxing championship fights, and NBA basketball.
- **[Totalsportek Alternative](https://methstream.online/totalsportek-alternative/)** – European football and international soccer streams.
- **[Streameast Alternative Mirror](https://methstream.online/streameast/)** – Fast LiteSpeed mirror with low latency.

### ⚡ Why Sports Fans Are Choosing Methstreams:
1. **True 1080p 60FPS Broadcasts**: No pixelation or motion blur during fast football passes and basketball dunks.
2. **1-Click Multi-Server Redundancy**: If a stream lags, instantly switch to alternate servers with one click.
3. **100% Free & No Sign-Up**: Never enter personal information, email addresses, or credit cards.
4. **Universal Cross-Device Support**: Stream natively on iPhone, Android, PC, Mac, and Amazon Firestick Silk browser.

Visit the official website today: **[https://methstream.online/](https://methstream.online/)**
`
  });

  if (rentry1) {
    console.log('✅ Post 1 Published:', rentry1);
    allPublished.push({ Platform: 'Rentry.co (DA 79)', Type: 'Full Markdown Article', Anchor: 'Methstreams, Buffstreams & Crackstreams', URL: rentry1 });
  }

  // -------------------------------------------------------------
  // POST 2: Rentry - Buffstreams Alternative Focus
  // -------------------------------------------------------------
  console.log('Writing and publishing Post 2 on Rentry.co (DA 79+)...');
  const rentry2 = await createRentryPost({
    customUrl: `buffstreams-alternative-live-sports-${Date.now().toString().slice(-4)}`,
    title: 'Buffstreams Alternative 2026: Watch Free NFL & Premier League HD on Methstreams',
    text: `# Buffstreams Alternative 2026: Watch Live Sports HD Free

Is Buffstreams down, buffering, or blocked by your ISP? Discover the highest-rated replacement in 2026: **[Buffstreams Alternative on Methstreams](https://methstream.online/buffstreams-alternative/)**.

### 🏆 Direct Working Mirrors:
- **[Buffstreams Alternative Guide](https://methstream.online/buffstreams-alternative/)** – Multi-server streams for Premier League, Champions League, La Liga, and NFL Sunday Ticket.
- **[Methstreams Official Portal](https://methstream.online/)** – Comprehensive live sports schedule.
- **[Crackstreams Alternative](https://methstream.online/crackstreams-alternative/)** – UFC Fight Nights and NBA playoffs.

### Key Highlights:
- Zero buffering LiteSpeed cloud infrastructure
- Multi-server backup links for every live match
- Works seamlessly on Smart TVs and mobile devices

Official URL: **[https://methstream.online/buffstreams-alternative/](https://methstream.online/buffstreams-alternative/)**
`
  });

  if (rentry2) {
    console.log('✅ Post 2 Published:', rentry2);
    allPublished.push({ Platform: 'Rentry.co (DA 79)', Type: 'Topic Article', Anchor: 'Buffstreams Alternative on Methstreams', URL: rentry2 });
  }

  // -------------------------------------------------------------
  // POST 3: Rentry - Crackstreams Alternative Focus
  // -------------------------------------------------------------
  console.log('Writing and publishing Post 3 on Rentry.co (DA 79+)...');
  const rentry3 = await createRentryPost({
    customUrl: `crackstreams-alternative-ufc-nba-${Date.now().toString().slice(-4)}`,
    title: 'Crackstreams Alternative 2026: Free UFC PPV, Boxing & NBA Streams HD',
    text: `# Crackstreams Alternative 2026: Free UFC PPV & NBA Streams HD

Looking for a reliable Crackstreams alternative? Stream every UFC Fight Night, numbered PPV, and NBA matchup live on **[Crackstreams Alternative on Methstreams](https://methstream.online/crackstreams-alternative/)**.

### 🥊 Verified Live Feeds:
- **[Crackstreams Alternative](https://methstream.online/crackstreams-alternative/)** – UFC Pay-Per-Views, Bellator, Boxing, and NBA in 1080p 60FPS.
- **[Methstreams Main Portal](https://methstream.online/)** – 24/7 uninterrupted sports feeds with zero lag.
- **[Buffstreams Mirror](https://methstream.online/buffstreams-alternative/)** – NFL and European soccer streaming.

Start streaming live games in high definition: **[https://methstream.online/crackstreams-alternative/](https://methstream.online/crackstreams-alternative/)**
`
  });

  if (rentry3) {
    console.log('✅ Post 3 Published:', rentry3);
    allPublished.push({ Platform: 'Rentry.co (DA 79)', Type: 'Topic Article', Anchor: 'Crackstreams Alternative on Methstreams', URL: rentry3 });
  }

  // -------------------------------------------------------------
  // POST 4: Dpaste 1 (DA 70+)
  // -------------------------------------------------------------
  console.log('Writing and publishing Post 4 on Dpaste.com (DA 70+)...');
  const dpaste1 = await createDpasteSnippet({
    title: 'Methstreams Official 2026 - Free Live Sports Portal & Alternatives',
    content: `# Methstreams Official 2026 - Free Live Sports Portal & Alternatives

Direct Portal: https://methstream.online/
Buffstreams Alternative: https://methstream.online/buffstreams-alternative/
Crackstreams Alternative: https://methstream.online/crackstreams-alternative/
Totalsportek Alternative: https://methstream.online/totalsportek-alternative/
Streameast Alternative: https://methstream.online/streameast/

### Description:
Methstreams is a high-speed sports streaming hub powered by LiteSpeed architecture.
Watch live NFL, NBA, UFC PPV, and Premier League football streams in 1080p HD with zero buffering.

Official Mirror: https://methstream.online/
`
  });

  if (dpaste1) {
    console.log('✅ Post 4 Published:', dpaste1);
    allPublished.push({ Platform: 'Dpaste.com (DA 70)', Type: 'Technical Snippet (365d)', Anchor: 'Methstreams Official 2026', URL: dpaste1 });
  }

  // -------------------------------------------------------------
  // POST 5: Dpaste 2 (DA 70+)
  // -------------------------------------------------------------
  console.log('Writing and publishing Post 5 on Dpaste.com (DA 70+)...');
  const dpaste2 = await createDpasteSnippet({
    title: 'Buffstreams & Crackstreams Alternative 2026 - Methstreams Guide',
    content: `# Buffstreams & Crackstreams Alternative 2026 Guide

When legacy sports streaming sites go down or buffer during big games, sports fans turn to **[Methstreams](https://methstream.online/)**.

### Direct Streaming Portals:
1. **[Buffstreams Alternative on Methstreams](https://methstream.online/buffstreams-alternative/)**
2. **[Crackstreams Alternative on Methstreams](https://methstream.online/crackstreams-alternative/)**
3. **[Main Methstreams Portal](https://methstream.online/)**
4. **[Totalsportek Soccer Mirror](https://methstream.online/totalsportek-alternative/)**

Bookmark https://methstream.online/ for 24/7 uninterrupted sports streaming!
`
  });

  if (dpaste2) {
    console.log('✅ Post 5 Published:', dpaste2);
    allPublished.push({ Platform: 'Dpaste.com (DA 70)', Type: 'Technical Snippet (365d)', Anchor: 'Buffstreams & Crackstreams Alternative 2026', URL: dpaste2 });
  }

  // -------------------------------------------------------------
  // POST 6: Paste.rs
  // -------------------------------------------------------------
  console.log('Writing and publishing Post 6 on Paste.rs...');
  const pasters1 = await createPasteRs({
    content: `Methstreams Official 2026 - Best Buffstreams & Crackstreams Alternative

Official Website: https://methstream.online/
Buffstreams Guide: https://methstream.online/buffstreams-alternative/
Crackstreams Guide: https://methstream.online/crackstreams-alternative/
Totalsportek Guide: https://methstream.online/totalsportek-alternative/
Streameast Guide: https://methstream.online/streameast/

Stream free NFL, NBA, UFC, and Soccer in 1080p HD on Methstreams.
`
  });

  if (pasters1) {
    console.log('✅ Post 6 Published:', pasters1);
    allPublished.push({ Platform: 'Paste.rs', Type: 'Direct Raw Backlink', Anchor: 'Methstreams Directory Links', URL: pasters1 });
  }

  // -------------------------------------------------------------
  // POST 7: Paste.c-net.org
  // -------------------------------------------------------------
  console.log('Writing and publishing Post 7 on Paste.c-net.org...');
  const pastecnet1 = await createPasteCnet({
    content: `Methstreams Official Portal 2026 - Buffer-Free 1080p Live Sports Streaming

Main Portal: https://methstream.online/
Buffstreams Alternative: https://methstream.online/buffstreams-alternative/
Crackstreams Alternative: https://methstream.online/crackstreams-alternative/
Totalsportek Alternative: https://methstream.online/totalsportek-alternative/

Enjoy uninterrupted 1080p HD live sports streaming 24/7 without subscription fees.
`
  });

  if (pastecnet1) {
    console.log('✅ Post 7 Published:', pastecnet1);
    allPublished.push({ Platform: 'Paste.c-net.org', Type: 'Direct Web Backlink', Anchor: 'Methstreams Official Portal', URL: pastecnet1 });
  }

  // Ping search engines
  const allUrls = allPublished.map(p => p.URL);
  await pingSearchEngines(allUrls);

  console.log('\n======================================================================');
  console.log('🎉 ALL OFF-PAGE SEO BACKLINKS HAVE BEEN GENERATED & PUBLISHED!');
  console.log('======================================================================');
  console.table(allPublished);
}

main().catch(console.error);
