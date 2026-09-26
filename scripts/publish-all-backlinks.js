const TARGET_DOMAIN = 'https://methstream.online';

// --- 1. TELEGRAPH (DA 91+) PUBLISHER ---
async function publishTelegraph({ title, authorName, authorUrl, contentNodes }) {
  try {
    // Create anonymous account
    const accRes = await fetch('https://api.telegra.ph/createAccount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        short_name: 'StreamEastLive',
        author_name: authorName || 'Methstreams Official',
        author_url: authorUrl || `${TARGET_DOMAIN}/`
      })
    });
    const accData = await accRes.json();
    if (!accData.ok) {
      console.error('Telegraph account error:', accData);
      return null;
    }

    const token = accData.result.access_token;

    // Create page
    const pageRes = await fetch('https://api.telegra.ph/createPage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: token,
        title: title,
        author_name: authorName || 'Methstreams Official',
        author_url: authorUrl || `${TARGET_DOMAIN}/`,
        content: contentNodes,
        return_content: false
      })
    });
    const pageData = await pageRes.json();
    if (pageData.ok && pageData.result) {
      return pageData.result.url;
    }
    console.error('Telegraph page error:', pageData);
    return null;
  } catch (err) {
    console.error('Telegraph error:', err.message);
    return null;
  }
}

// --- 2. DPASTE (DA 70+) PUBLISHER ---
async function publishDpaste({ title, content }) {
  try {
    const params = new URLSearchParams();
    params.append('title', title);
    params.append('content', content);
    params.append('syntax', 'md');
    params.append('expiry_days', '365');

    const res = await fetch('https://dpaste.com/api/v2/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (res.status === 201) {
      const url = (await res.text()).trim();
      return url;
    }
    return null;
  } catch (err) {
    console.error('Dpaste error:', err.message);
    return null;
  }
}

// --- 3. WRITE.AS (DA 75+) PUBLISHER ---
async function publishWriteAs({ title, body }) {
  try {
    const res = await fetch('https://write.as/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body })
    });
    const data = await res.json();
    if (data.code === 201 && data.data) {
      return `https://write.as/${data.data.id}`;
    }
    return null;
  } catch (err) {
    console.error('Write.as error:', err.message);
    return null;
  }
}

// --- 4. PASTE.RS PUBLISHER ---
async function publishPasteRs({ content }) {
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
    console.error('Paste.rs error:', err.message);
    return null;
  }
}

async function main() {
  console.log('===========================================================');
  console.log('🚀 Starting Automated Off-Page SEO Backlink Publishing...');
  console.log('🎯 Target Domain:', TARGET_DOMAIN);
  console.log('🔑 Primary Keyword: Methstreams');
  console.log('🔑 Secondary Keyword: Buffstreams & Crackstreams');
  console.log('===========================================================\n');

  const publishedBacklinks = [];

  // ==========================================
  // ARTICLE 1: Comprehensive Main Guide (Telegraph)
  // ==========================================
  console.log('1. Publishing Article 1 on Telegraph (DA 91+)...');
  const telegraph1 = await publishTelegraph({
    title: 'Methstreams 2026: The Premier Buffstreams & Crackstreams Alternative for Free HD Live Sports',
    authorName: 'Methstreams Official Guide',
    authorUrl: `${TARGET_DOMAIN}/`,
    contentNodes: [
      { tag: 'h3', children: ['Why Millions of Fans Choose Methstreams in 2026'] },
      {
        tag: 'p',
        children: [
          'Live sports streaming has become increasingly difficult with heavy paywalls, broken streaming links, and endless popups on older platforms. If you are searching for the best ',
          { tag: 'a', attrs: { href: `${TARGET_DOMAIN}/` }, children: ['Methstreams official mirror'] },
          ', you have arrived at the premier destination. Serving as the top-rated ',
          { tag: 'a', attrs: { href: `${TARGET_DOMAIN}/buffstreams-alternative/` }, children: ['Buffstreams alternative'] },
          ' and ',
          { tag: 'a', attrs: { href: `${TARGET_DOMAIN}/crackstreams-alternative/` }, children: ['Crackstreams alternative'] },
          ', Methstreams offers buffer-free 1080p HD live sports broadcasts at 60FPS.'
        ]
      },
      { tag: 'h4', children: ['Direct Verified Access Links:'] },
      {
        tag: 'ul',
        children: [
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${TARGET_DOMAIN}/` }, children: ['Methstreams Official Home'] },
              ' - Daily schedules for NFL, NBA, UFC, Premier League, and NHL.'
            ]
          },
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${TARGET_DOMAIN}/buffstreams-alternative/` }, children: ['Buffstreams Alternative Hub'] },
              ' - Multi-server feeds for European soccer and NFL Sunday Ticket.'
            ]
          },
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${TARGET_DOMAIN}/crackstreams-alternative/` }, children: ['Crackstreams Alternative Portal'] },
              ' - 60FPS live feeds for UFC PPVs, Boxing title fights, and NBA games.'
            ]
          },
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${TARGET_DOMAIN}/totalsportek-alternative/` }, children: ['Totalsportek Alternative Mirror'] },
              ' - Complete UEFA Champions League and EPL football coverage.'
            ]
          },
          {
            tag: 'li',
            children: [
              { tag: 'a', attrs: { href: `${TARGET_DOMAIN}/streameast/` }, children: ['Streameast Alternative'] },
              ' - High-speed mirror with instant LiteSpeed loading.'
            ]
          }
        ]
      },
      { tag: 'h4', children: ['Why Upgrade to Methstreams?'] },
      {
        tag: 'p',
        children: [
          '1. True 1080p 60FPS Video Quality with zero motion blur.\n',
          '2. 1-Click Multi-Server Redundancy to easily bypass ISP throttling.\n',
          '3. 100% Free with zero sign-ups, subscriptions, or credit card requirements.\n',
          '4. Universal compatibility on iPhone, Android, PC, and Amazon Firestick Silk browser.'
        ]
      },
      {
        tag: 'p',
        children: [
          'Visit the official website to start watching free live sports: ',
          { tag: 'a', attrs: { href: `${TARGET_DOMAIN}/` }, children: [`${TARGET_DOMAIN}/`] }
        ]
      }
    ]
  });

  if (telegraph1) {
    console.log('✅ Telegraph Post 1 Created:', telegraph1);
    publishedBacklinks.push({ Platform: 'Telegra.ph (DA 91)', Anchor: 'Methstreams, Buffstreams & Crackstreams', URL: telegraph1 });
  }

  // ==========================================
  // ARTICLE 2: Buffstreams Alternative (Telegraph)
  // ==========================================
  console.log('2. Publishing Article 2 on Telegraph (DA 91+)...');
  const telegraph2 = await publishTelegraph({
    title: 'Buffstreams Down? Discover Methstreams - The #1 Working Alternative 2026',
    authorName: 'Sports Streaming Directory',
    authorUrl: `${TARGET_DOMAIN}/buffstreams-alternative/`,
    contentNodes: [
      { tag: 'h3', children: ['How to Watch Free Live Soccer & NFL Without Buffering'] },
      {
        tag: 'p',
        children: [
          'Is Buffstreams buffering, throwing error codes, or blocked in your region? Switch to the highest-rated mirror: ',
          { tag: 'a', attrs: { href: `${TARGET_DOMAIN}/buffstreams-alternative/` }, children: ['Buffstreams Alternative on Methstreams'] },
          '. Enjoy uninterrupted 1080p HD feeds for English Premier League, UEFA Champions League, La Liga, and NFL.'
        ]
      },
      {
        tag: 'p',
        children: [
          'Access the primary website here: ',
          { tag: 'a', attrs: { href: `${TARGET_DOMAIN}/` }, children: ['Methstreams Live Sports'] }
        ]
      }
    ]
  });

  if (telegraph2) {
    console.log('✅ Telegraph Post 2 Created:', telegraph2);
    publishedBacklinks.push({ Platform: 'Telegra.ph (DA 91)', Anchor: 'Buffstreams Alternative on Methstreams', URL: telegraph2 });
  }

  // ==========================================
  // ARTICLE 3: Crackstreams Alternative (Telegraph)
  // ==========================================
  console.log('3. Publishing Article 3 on Telegraph (DA 91+)...');
  const telegraph3 = await publishTelegraph({
    title: 'Crackstreams Alternative 2026: Watch UFC PPV, Boxing & NBA Free HD on Methstreams',
    authorName: 'Combat Sports Hub',
    authorUrl: `${TARGET_DOMAIN}/crackstreams-alternative/`,
    contentNodes: [
      { tag: 'h3', children: ['Free 60FPS Live Feeds for UFC, Boxing, and Basketball'] },
      {
        tag: 'p',
        children: [
          'Looking for a reliable Crackstreams alternative? Stream all UFC Fight Nights, numbered PPVs, Boxing, and NBA games in 1080p HD on ',
          { tag: 'a', attrs: { href: `${TARGET_DOMAIN}/crackstreams-alternative/` }, children: ['Crackstreams Alternative on Methstreams'] },
          '. Never pay expensive PPV fees again.'
        ]
      },
      {
        tag: 'p',
        children: [
          'Official portal: ',
          { tag: 'a', attrs: { href: `${TARGET_DOMAIN}/` }, children: ['https://methstream.online/'] }
        ]
      }
    ]
  });

  if (telegraph3) {
    console.log('✅ Telegraph Post 3 Created:', telegraph3);
    publishedBacklinks.push({ Platform: 'Telegra.ph (DA 91)', Anchor: 'Crackstreams Alternative on Methstreams', URL: telegraph3 });
  }

  // ==========================================
  // ARTICLE 4: Dpaste 1 (DA 70+)
  // ==========================================
  console.log('4. Publishing Article 4 on Dpaste (DA 70+)...');
  const dpaste1 = await publishDpaste({
    title: 'Methstreams Official 2026: Top Buffstreams & Crackstreams Alternative',
    content: `# Methstreams Official 2026 - Free Live Sports HD Portal

Looking for high-speed, reliable live sports streaming without subscriptions or cable packages?
**[Methstreams](https://methstream.online/)** is the internet's #1 **[Buffstreams & Crackstreams Alternative](https://methstream.online/)**.

### 🌟 Verified High-Speed Mirrors:
- **[Methstreams Official Portal](https://methstream.online/)** - Live 1080p HD sports feeds for NFL, NBA, UFC, Soccer, and MLB.
- **[Buffstreams Alternative Guide](https://methstream.online/buffstreams-alternative/)** - Reliable soccer and NFL Sunday Ticket feeds.
- **[Crackstreams Alternative Mirror](https://methstream.online/crackstreams-alternative/)** - 60FPS feeds for UFC PPVs and NBA matchups.
- **[Totalsportek Alternative](https://methstream.online/totalsportek-alternative/)** - Premier League & Champions League football.
- **[Streameast Mirror](https://methstream.online/streameast/)** - Ultra-fast LiteSpeed streaming.

### Key Advantages:
- 1080p Full HD @ 60FPS resolution
- Multi-server backup feeds for every game
- Zero account registration or credit card needed
- Optimized for mobile, desktop, and Firestick Silk browser

Official Website: https://methstream.online/
`
  });

  if (dpaste1) {
    console.log('✅ Dpaste Post 1 Created:', dpaste1);
    publishedBacklinks.push({ Platform: 'Dpaste.com (DA 70)', Anchor: 'Methstreams & Buffstreams Alternative', URL: dpaste1 });
  }

  // ==========================================
  // ARTICLE 5: Dpaste 2 (DA 70+)
  // ==========================================
  console.log('5. Publishing Article 5 on Dpaste (DA 70+)...');
  const dpaste2 = await publishDpaste({
    title: 'Buffstreams & Crackstreams Alternative 2026 - Methstreams Guide',
    content: `# Buffstreams & Crackstreams Alternative 2026 Guide

When legacy sports streaming sites go down or buffer during big games, fans turn to **[Methstreams](https://methstream.online/)**.

### Direct Streaming Portals:
1. **[Buffstreams Alternative on Methstreams](https://methstream.online/buffstreams-alternative/)**
2. **[Crackstreams Alternative on Methstreams](https://methstream.online/crackstreams-alternative/)**
3. **[Main Methstreams Portal](https://methstream.online/)**

Bookmark https://methstream.online/ for 24/7 uninterrupted sports streaming!
`
  });

  if (dpaste2) {
    console.log('✅ Dpaste Post 2 Created:', dpaste2);
    publishedBacklinks.push({ Platform: 'Dpaste.com (DA 70)', Anchor: 'Buffstreams & Crackstreams Alternative 2026', URL: dpaste2 });
  }

  // ==========================================
  // ARTICLE 6: Write.as 1 (DA 75+)
  // ==========================================
  console.log('6. Publishing Article 6 on Write.as (DA 75+)...');
  const writeas1 = await publishWriteAs({
    title: 'Methstreams: The Ultimate Buffstreams & Crackstreams Replacement 2026',
    body: `## Watch 1080p HD Live Sports on Methstreams

Are you tired of broken links and endless redirect loops on older streaming sites?
Switch to **[Methstreams](https://methstream.online/)**, the verified **[Buffstreams & Crackstreams Alternative](https://methstream.online/)** built on ultra-fast LiteSpeed cloud infrastructure.

### Verified Fast Mirrors:
- **[Methstreams Main Portal](https://methstream.online/)** - Daily match schedules for NFL, NBA, UFC, and Soccer.
- **[Buffstreams Alternative Guide](https://methstream.online/buffstreams-alternative/)** - Premier League and NFL feeds.
- **[Crackstreams Alternative Hub](https://methstream.online/crackstreams-alternative/)** - UFC Pay-Per-Views in 60FPS.
- **[Totalsportek Alternative](https://methstream.online/totalsportek-alternative/)** - Champions League soccer.

Enjoy buffer-free streaming today: https://methstream.online/
`
  });

  if (writeas1) {
    console.log('✅ Write.as Post 1 Created:', writeas1);
    publishedBacklinks.push({ Platform: 'Write.as (DA 75)', Anchor: 'Methstreams: Buffstreams & Crackstreams Replacement', URL: writeas1 });
  }

  // ==========================================
  // ARTICLE 7: Paste.rs
  // ==========================================
  console.log('7. Publishing Article 7 on Paste.rs...');
  const pasters1 = await publishPasteRs({
    content: `Methstreams Official 2026 - Best Buffstreams & Crackstreams Alternative

Main Portal: https://methstream.online/
Buffstreams Alternative: https://methstream.online/buffstreams-alternative/
Crackstreams Alternative: https://methstream.online/crackstreams-alternative/
Totalsportek Alternative: https://methstream.online/totalsportek-alternative/

Stream free NFL, NBA, UFC, and Soccer in 1080p HD on Methstreams.
`
  });

  if (pasters1) {
    console.log('✅ Paste.rs Post Created:', pasters1);
    publishedBacklinks.push({ Platform: 'Paste.rs', Anchor: 'Methstreams Directory Links', URL: pasters1 });
  }

  // Summary Table
  console.log('\n===========================================================');
  console.log('🎉 ALL OFF-PAGE SEO BACKLINKS PUBLISHED SUCCESSFULLY!');
  console.log('===========================================================');
  console.table(publishedBacklinks);

  return publishedBacklinks;
}

main().catch(console.error);
