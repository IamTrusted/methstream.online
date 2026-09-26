export const prerender = false;

import slugify from "../utils/slugify";
import { fetchMatches } from "../utils/api";

export const GET = async (context) => {
  const PUBLIC_BASE_URL = (import.meta.env.PUBLIC_BASE_URL || context.site?.toString() || "https://methstream.online").replace(/\/$/, "");

  const now = new Date().toISOString();

  // Static pages (built-in)
  const staticPages = [
    { loc: "/", lastmod: now, priority: 1 },
    { loc: "/blog/", lastmod: now, priority: 0.8 },
  ];

  const footerPages = [
    { loc: "/contact-us/", lastmod: now, priority: 0.3 },
    { loc: "/privacy-policy/", lastmod: now, priority: 0.3 },
    { loc: "/dmca/", lastmod: now, priority: 0.3 },
  ];

  // Initialize dynamicPages before using it
  let dynamicPages = [];

  // Landing pages
  const landingPages = [
    "/methstreams-alternative/",
    "/buffstreams-alternative/",
    "/crackstreams-alternative/",
    "/totalsportek-alternative/",
    "/streameast/",
    "/yacine-tv/",
    "/yalla-live/",
    "/kora-live/",
    "/rojadirecta/",
    "/soccer100/",
    "/sportsurge/",
    "/totalsportek/",
    "/sitemap-links/",
  ];

  landingPages.forEach((loc) => {
    dynamicPages.push({ loc, lastmod: now, priority: 0.75 });
  });

  // Blog posts
  const blogPosts = [
    "streameast-2026-best-free-sports-streams",
    "footybite-alternative-top-free-soccer-streams-2026",
    "methstreams-alternative-watch-sports-free-hd-2026",
    "yacine-tv-free-sports-streams-2026",
    "yalla-live-alternative-soccer-streams-2026",
    "kora-live-free-football-streams-2026",
    "rojadirecta-alternative-free-streams-2026",
    "soccer100-free-football-streams-2026",
    "sportsurge-alternative-live-streams-2026",
    "totalsportek-free-soccer-streams-2026",
  ];

  blogPosts.forEach(slug => {
    dynamicPages.push({
      loc: `/blog/${slug}/`,
      lastmod: now, priority: 0.7,
    });
  });

  // Dynamic SSR pages (fetch from API)
  try {
    const matchesData = await fetchMatches('all');
    if (matchesData.length > 0) {
      matchesData.forEach(match => {
        dynamicPages.push({
          loc: `/live/${slugify(match.category)}/${slugify(`${match.title}`)}/${match.id}/`,
          lastmod: now, priority: 0.8,
        });
      });
    }
  } catch (error) {
    console.error("Error fetching sitemap dynamic pages:", error);
  }

  const urls = [...staticPages, ...footerPages, ...dynamicPages];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
      .map(
        (url) => `
  <url>
    <loc>${PUBLIC_BASE_URL}${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""}
    <changefreq>daily</changefreq>
    ${url.priority ? `<priority>${url.priority}</priority>` : ""}
  </url>
`,
      )
      .join("")}
</urlset>`;

  return new Response(body.trim(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
