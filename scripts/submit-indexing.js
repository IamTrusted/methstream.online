// scripts/submit-indexing.js
async function main() {
  console.log('1. Fetching all URLs from live sitemap...');
  const res = await fetch('https://methstream.online/sitemap.xml');
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  console.log(`Found ${urls.length} URLs in sitemap.`);

  // 2. IndexNow Submission
  console.log('2. Submitting to IndexNow API (Bing, Yandex, etc.)...');
  const indexNowPayload = {
    host: 'methstream.online',
    key: '9a2b8c7d6e5f4a3b2c1d0e9f8a7b6c5d',
    keyLocation: 'https://methstream.online/9a2b8c7d6e5f4a3b2c1d0e9f8a7b6c5d.txt',
    urlList: urls
  };

  try {
    const indexNowRes = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(indexNowPayload)
    });
    console.log(`IndexNow Response: ${indexNowRes.status} ${indexNowRes.statusText}`);
  } catch (err) {
    console.error('IndexNow error:', err.message);
  }

  // 3. Ping Bing & Yandex
  console.log('3. Triggering search engine ping requests...');
  const pingServices = [
    `https://www.bing.com/ping?sitemap=https%3A%2F%2Fmethstream.online%2Fsitemap.xml`
  ];

  for (const p of pingServices) {
    try {
      const r = await fetch(p);
      console.log(`Ping ${p.split('?')[0]}: status ${r.status}`);
    } catch(e) {
      // Ignored
    }
  }

  console.log('Completed automated indexing submission process!');
}

main();

