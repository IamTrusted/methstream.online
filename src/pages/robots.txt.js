export const prerender = false;

export const GET = (context) => {
  const PUBLIC_BASE_URL = (import.meta.env.PUBLIC_BASE_URL || context.site?.toString() || "https://methstream.online").replace(/\/$/, "");

  const body = `User-agent: *
Allow: /
Disallow: 

Sitemap: ${PUBLIC_BASE_URL}/sitemap.xml
Sitemap: ${PUBLIC_BASE_URL}/sitemap-index.xml`;

  return new Response(body.trim(), {
    headers: {
      "Content-Type": "text/plain",
    },
  });
};