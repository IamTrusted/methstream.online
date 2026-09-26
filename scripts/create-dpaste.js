// scripts/create-dpaste.js
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
      body: params.toString()
    });

    if (res.status === 201) {
      const url = (await res.text()).trim();
      return url;
    }
    const errText = await res.text();
    console.error('Dpaste error:', res.status, errText);
    return null;
  } catch (err) {
    console.error('Dpaste fetch error:', err.message);
    return null;
  }
}

async function run() {
  console.log('Generating dpaste.com backlinks (365 days retention)...');

  const snippets = [
    {
      title: 'Methstreams Official 2026 - Free Live Sports Portal & Alternatives',
      content: `# Methstreams Official 2026 - Free Live Sports Portal

Direct Portal: https://methstream.online/
Buffstreams Alternative: https://methstream.online/buffstreams-alternative/
Crackstreams Alternative: https://methstream.online/crackstreams-alternative/
Totalsportek Alternative: https://methstream.online/totalsportek-alternative/

### Description:
Methstreams is a high-speed sports streaming hub powered by LiteSpeed architecture.
Watch live NFL, NBA, UFC PPV, and Premier League football streams in 1080p HD with zero buffering.

Official Mirror: https://methstream.online/
`
    },
    {
      title: 'Buffstreams Alternative 2026 - Live NFL & Soccer Streams',
      content: `# Buffstreams Alternative 2026

Official Working Mirror: https://methstream.online/buffstreams-alternative/
Main Website: https://methstream.online/
Crackstreams Feed: https://methstream.online/crackstreams-alternative/

### Features:
- Watch English Premier League, UEFA Champions League, and NFL Sunday Ticket free
- Multi-server backup streams
- Zero buffering and fast loading

Access now: https://methstream.online/buffstreams-alternative/
`
    },
    {
      title: 'Crackstreams Alternative 2026 - Free UFC & NBA Streams',
      content: `# Crackstreams Alternative 2026

Direct Mirror: https://methstream.online/crackstreams-alternative/
Main Website: https://methstream.online/
Buffstreams Mirror: https://methstream.online/buffstreams-alternative/

### Combat Sports & Basketball Feeds:
- UFC Fight Nights and Pay-Per-View live cards
- NBA Regular Season and Playoffs in 60FPS
- Boxing Championship matches

Stream live: https://methstream.online/crackstreams-alternative/
`
    }
  ];

  const results = [];
  for (const s of snippets) {
    const url = await createDpasteSnippet(s);
    if (url) {
      console.log(`Created: ${url} (${s.title})`);
      results.push({ title: s.title, url });
    }
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\nAll Dpaste snippets created:');
  console.table(results);
}

run();

