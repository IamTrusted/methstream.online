// src/utils/api.js

export const API_BASE_URL = import.meta.env.API || import.meta.env.PUBLIC_API_URL || "https://streamed.pk";

export const ENDPOINTS = {
  SPORTS: `${API_BASE_URL}/api/sports`,
  MATCHES_ALL: `${API_BASE_URL}/api/matches/all`,
  MATCHES_TODAY: `${API_BASE_URL}/api/matches/all-today`,
  MATCHES_LIVE: `${API_BASE_URL}/api/matches/live`,
  MATCHES_POPULAR: `${API_BASE_URL}/api/matches/all/popular`,
  STREAM: (source, id) => `${API_BASE_URL}/api/stream/${source}/${id}`,
  BADGE: (id) => `${API_BASE_URL}/api/images/badge/${id}.webp`,
  POSTER: (badge1, badge2) => `${API_BASE_URL}/api/images/poster/${badge1}/${badge2}.webp`,
  PROXY: (poster) => `${API_BASE_URL}/api/images/proxy/${poster}.webp`,
};

// In-memory cache to prevent repeated slow network roundtrips and timeouts
const cache = new Map();

async function fetchWithTimeout(url, timeoutMs = 20000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      }
    });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function fetchCached(url, ttlMs = 60000, timeoutMs = 20000, retries = 2) {
  const cached = cache.get(url);
  const now = Date.now();

  // Return fresh cache if available
  if (cached && (now - cached.timestamp < ttlMs)) {
    return cached.data;
  }

  // Try fetching with retries
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, timeoutMs);
      if (res.ok) {
        const data = await res.json();
        if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
          cache.set(url, { timestamp: now, data });
          return data;
        }
      }
    } catch (err) {
      // If we have stale cache, use it after last retry
      if (attempt === retries && cached) {
        console.warn(`API fetch failed for ${url}, using stale cache`);
        return cached.data;
      }
      // Wait before retry (except last attempt)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  // Final fallback: return stale cache or empty array
  return cached ? cached.data : [];
}

export const fetchSports = async () => {
  return await fetchCached(ENDPOINTS.SPORTS, 180000, 20000, 2);
};

export const fetchMatches = async (type = 'all') => {
  let url = ENDPOINTS.MATCHES_ALL;
  if (type === 'today') url = ENDPOINTS.MATCHES_TODAY;
  if (type === 'live') url = ENDPOINTS.MATCHES_LIVE;
  return await fetchCached(url, 60000, 20000, 2);
};

export const fetchStreams = async (source, id) => {
  return await fetchCached(ENDPOINTS.STREAM(source, id), 30000, 15000, 1);
};

