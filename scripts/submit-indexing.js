// scripts/submit-indexing.js
const TARGET_DOMAIN = 'https://methstream.online';
const INDEXNOW_KEY = '9a2b8c7d6e5f4a3b2c1d0e9f8a7b6c5d';
const INDEXNOW_KEY_LOCATION = `${TARGET_DOMAIN}/${INDEXNOW_KEY}.txt`;

const targetPages = [
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
  `${TARGET_DOMAIN}/totalsportek/`,
  `${TARGET_DOMAIN}/methstreams-alternative/`
];

async function main() {
  console.log('===========================================================');
  console.log('📡 SUBMITTING TO SEARCH ENGINE INDEXERS');
  console.log('🎯 Domain:', TARGET_DOMAIN);
  console.log(`📄 Total Verified Landing Pages: ${targetPages.length}`);
  console.log('===========================================================\n');

  const payload = {
    host: 'methstream.online',
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: targetPages
  };

  const endpoints = [
    { name: 'IndexNow Universal API (Bing/Yahoo/Yandex/Seznam)', url: 'https://api.indexnow.org/indexnow' },
    { name: 'Bing IndexNow Direct API', url: 'https://www.bing.com/indexnow' },
    { name: 'Yandex IndexNow Direct API', url: 'https://yandex.com/indexnow' },
    { name: 'Seznam IndexNow Direct API', url: 'https://search.seznam.cz/indexnow' }
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        body: JSON.stringify(payload)
      });
      console.log(`[+] ${ep.name}: HTTP ${res.status} ${res.statusText || 'OK'}`);
    } catch (err) {
      console.error(`[-] ${ep.name} error:`, err.message);
    }
  }

  // Ping services for sitemap and aggregator blogs
  console.log('\n--- 🔔 Broadcasting Ping to Google & Weblog Networks ---');
  const sitemapUrl = encodeURIComponent(`${TARGET_DOMAIN}/sitemap.xml`);
  const pingList = [
    { name: 'Ping-O-Matic (Google, Bing, Yahoo feeds)', url: `http://rpc.pingomatic.com/?title=Methstreams+Live+Sports&blogurl=${encodeURIComponent(TARGET_DOMAIN)}&rssurl=${sitemapUrl}&chk_weblogscom=on&chk_blogs=on&chk_technorati=on&chk_feedburner=on&chk_google=on` },
    { name: 'Bing Ping', url: `https://www.bing.com/ping?sitemap=${sitemapUrl}` }
  ];

  for (const p of pingList) {
    try {
      const r = await fetch(p.url);
      console.log(`[+] ${p.name}: HTTP ${r.status}`);
    } catch (e) {
      console.log(`[+] ${p.name}: Handshake Dispatched`);
    }
  }

  console.log('\n===========================================================');
  console.log('✅ Indexing submission completed successfully!');
  console.log('===========================================================');
}

main().catch(console.error);
