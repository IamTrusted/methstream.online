// scripts/ping-services.js
async function pingServices() {
  const targetSite = 'https://methstream.online/';
  const sitemapUrl = 'https://methstream.online/sitemap.xml';
  const siteTitle = 'Methstreams - Best Buffstreams & Crackstreams Alternative';

  console.log(`Pinging search aggregators for ${targetSite}...`);

  // 1. Ping-o-matic XML-RPC
  const xmlRpcBody = `<?xml version="1.0"?>
<methodCall>
  <methodName>weblogUpdates.ping</methodName>
  <params>
    <param><value>${siteTitle}</value></param>
    <param><value>${targetSite}</value></param>
    <param><value>${sitemapUrl}</value></param>
  </params>
</methodCall>`;

  const xmlRpcEndpoints = [
    'http://rpc.pingomatic.com/',
    'http://ping.feedburner.com'
  ];

  for (const endpoint of xmlRpcEndpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml' },
        body: xmlRpcBody,
        signal: AbortSignal.timeout(8000)
      });
      console.log(`Ping ${endpoint}: Status ${res.status}`);
    } catch (e) {
      console.log(`Ping ${endpoint}: ${e.message}`);
    }
  }

  // 2. Submit sitemap to IndexNow (Bing, Yandex, Seznam, Naver)
  console.log('Submitting to IndexNow...');
  try {
    const sitemapRes = await fetch(sitemapUrl);
    const sitemapXml = await sitemapRes.text();
    const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

    const indexNowRes = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'methstream.online',
        key: '9a2b8c7d6e5f4a3b2c1d0e9f8a7b6c5d',
        keyLocation: 'https://methstream.online/9a2b8c7d6e5f4a3b2c1d0e9f8a7b6c5d.txt',
        urlList: urls
      }),
      signal: AbortSignal.timeout(8000)
    });
    console.log(`IndexNow: Status ${indexNowRes.status} (${urls.length} URLs submitted)`);
  } catch (e) {
    console.log(`IndexNow: ${e.message}`);
  }

  console.log('Ping services completed successfully!');
}

pingServices();

