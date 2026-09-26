// scripts/create-rentry.js
async function createRentryPost({ url, text, editCode }) {
  try {
    const homeRes = await fetch('https://rentry.co');
    const cookieHeader = homeRes.headers.get('set-cookie');
    const homeHtml = await homeRes.text();
    const csrfMatch = homeHtml.match(/csrfmiddlewaretoken"\s+value="([^"]+)"/);
    const csrfToken = csrfMatch ? csrfMatch[1] : null;

    if (!csrfToken) {
      console.log('Failed to extract CSRF token from rentry.co');
      return null;
    }

    const cookiePart = cookieHeader ? cookieHeader.split(';')[0] : '';
    const postBody = new URLSearchParams();
    postBody.append('csrfmiddlewaretoken', csrfToken);
    postBody.append('text', text);
    if (url) postBody.append('url', url);
    postBody.append('edit_code', editCode || 'vision2026');

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
    return resJson;
  } catch (err) {
    console.error('Error posting to rentry:', err.message);
    return null;
  }
}

async function run() {
  console.log('Generating Rentry articles...');
  
  const posts = [
    {
      url: 'buffstreams-alternative-live-sports-2026',
      text: `# Buffstreams Alternative 2026: Watch Free Sports HD on Methstreams

If Buffstreams is down or buffering, switch to the highest-rated mirror: **[Buffstreams Alternative on Methstreams](https://methstream.online/buffstreams-alternative/)**.

### Direct Mirrors & Streaming Hubs
- **[Buffstreams Alternative](https://methstream.online/buffstreams-alternative/)** - Premier League, Champions League, NFL Sunday Ticket.
- **[Methstreams Official](https://methstream.online/)** - Daily sports schedules & 1080p feeds.
- **[Crackstreams Mirror](https://methstream.online/crackstreams-alternative/)** - UFC, Boxing, and NBA games.

Official Website: https://methstream.online/
`
    },
    {
      url: 'crackstreams-alternative-ufc-nba-2026',
      text: `# Crackstreams Alternative 2026: Free UFC PPV & NBA Streams HD

Looking for a reliable Crackstreams alternative? Stream every UFC Fight Night, numbered PPV, and NBA matchup live on **[Crackstreams Alternative on Methstreams](https://methstream.online/crackstreams-alternative/)**.

### Verified Working Portals
- **[Crackstreams Alternative](https://methstream.online/crackstreams-alternative/)** - UFC PPVs, Bellator, Boxing, NBA in 60FPS.
- **[Methstreams Home](https://methstream.online/)** - 24/7 sports streaming portal with zero buffering.
- **[Buffstreams Mirror](https://methstream.online/buffstreams-alternative/)** - European Soccer & NFL streaming.

Official Website: https://methstream.online/
`
    }
  ];

  for (const post of posts) {
    const res = await createRentryPost(post);
    console.log(`Created ${post.url}:`, res ? res.url : 'Failed');
    await new Promise(r => setTimeout(r, 2000));
  }
}

run();
