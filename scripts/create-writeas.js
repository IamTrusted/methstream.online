// scripts/create-writeas.js
async function createWriteAsPost({ title, body }) {
  try {
    const res = await fetch('https://write.as/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title,
        body: body
      })
    });
    const data = await res.json();
    if (data.code === 201 && data.data) {
      const postUrl = `https://write.as/${data.data.id}`;
      return postUrl;
    }
    console.error('Failed to create post:', data);
    return null;
  } catch (err) {
    console.error('Error creating Write.as post:', err.message);
    return null;
  }
}

async function run() {
  console.log('Creating Write.as backlinks...');

  const posts = [
    {
      title: 'Methstreams Official Portal 2026: Watch Free Sports HD Feeds',
      body: `## Watch Live Sports Without Cable on Methstreams

Looking for the official **[Methstreams](https://methstream.online/)** mirror? Access uninterrupted 1080p HD streams for NFL, NBA, UFC, Premier League, and more.

### Verified Official Links:
- **[Methstreams Official Portal](https://methstream.online/)** - Daily match schedules and 24/7 sports channels.
- **[Buffstreams Alternative Guide](https://methstream.online/buffstreams-alternative/)** - High-speed mirror for football and European soccer.
- **[Crackstreams Alternative Mirror](https://methstream.online/crackstreams-alternative/)** - UFC Fight Nights and NBA playoffs with 60FPS feeds.
- **[Totalsportek Alternative](https://methstream.online/totalsportek-alternative/)** - UEFA Champions League and EPL matches.

### Key Streaming Features:
- Ultra-low latency LiteSpeed streaming architecture
- Multi-server redundancy for every live match
- Full cross-device compatibility across PC, iPhone, Android, and Firestick Silk browser

Official URL: https://methstream.online/
`
    },
    {
      title: 'Buffstreams Alternative 2026: Free NFL & Premier League HD Streams',
      body: `## Best Working Buffstreams Alternative

If Buffstreams is down, buffering, or blocked by your ISP, switch to the #1 alternative: **[Buffstreams Alternative on Methstreams](https://methstream.online/buffstreams-alternative/)**.

### Fast Streaming Links:
- **[Buffstreams Alternative Portal](https://methstream.online/buffstreams-alternative/)** - NFL Sunday Ticket, Premier League, La Liga, and NHL.
- **[Methstreams Main Portal](https://methstream.online/)** - Comprehensive live sports directory.
- **[Crackstreams MMA & NBA Feeds](https://methstream.online/crackstreams-alternative/)** - MMA, Boxing, and UFC PPV coverage.

Enjoy smooth HD sports streams with zero subscription fees: https://methstream.online/
`
    },
    {
      title: 'Crackstreams Alternative 2026: UFC, Boxing & NBA Live Streams HD',
      body: `## Free Combat Sports & Basketball Streams

Looking for a reliable Crackstreams alternative? Stream every UFC Fight Night, numbered PPV, and NBA matchup live on **[Crackstreams Alternative on Methstreams](https://methstream.online/crackstreams-alternative/)**.

### Instant Access Mirrors:
- **[Crackstreams Alternative](https://methstream.online/crackstreams-alternative/)** - UFC Pay-Per-Views, Boxing, and NBA in 1080p 60FPS.
- **[Methstreams Home](https://methstream.online/)** - 24/7 uninterrupted sports feeds.
- **[Buffstreams Soccer Feeds](https://methstream.online/buffstreams-alternative/)** - International soccer and NFL streams.

Visit the official website: https://methstream.online/
`
    }
  ];

  const results = [];
  for (const post of posts) {
    const url = await createWriteAsPost(post);
    if (url) {
      console.log(`Created: ${url}`);
      results.push({ title: post.title, url });
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\nAll Write.as posts created:');
  console.table(results);
}

run();

