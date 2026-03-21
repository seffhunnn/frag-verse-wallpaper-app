// ─────────────────────────────────────────────────────────────────
// Unsplash API Service
// Docs: https://unsplash.com/documentation
// Set your key in .env → VITE_UNSPLASH_KEY
// ─────────────────────────────────────────────────────────────────

const API_KEY  = import.meta.env.VITE_UNSPLASH_KEY;
const BASE_URL = 'https://api.unsplash.com';

// Common headers for every request
const headers = {
  Authorization: `Client-ID ${API_KEY}`,
  'Accept-Version': 'v1',
};

// ── Internal helper: normalise Unsplash photo → app shape ──────────
const normalizePhoto = (photo) => ({
  id:          photo.id,
  image:       photo.urls?.regular ?? photo.urls?.small,
  thumb:       photo.urls?.small,
  fullImage:   photo.urls?.full,
  title:       photo.alt_description ?? photo.description ?? 'Untitled',
  author:      photo.user?.name ?? 'Unknown',
  authorImage:   photo.user?.profile_image?.medium,
  authorLink:  photo.user?.links?.html,
  category:    photo.topic_submissions
                 ? Object.keys(photo.topic_submissions)[0] ?? 'General'
                 : 'General',
  likes:       photo.likes ?? 0,
  downloads:   photo.downloads ?? 0,
  color:       photo.color ?? '#1a1a2e',
  width:       photo.width,
  height:      photo.height,
  source:      'unsplash'
});

// ── 1. Fetch trending / editorial wallpapers ───────────────────────
export const fetchTrendingWallpapers = async (page = 1, perPage = 20) => {
  const res = await fetch(
    `${BASE_URL}/photos?page=${page}&per_page=${perPage}&order_by=popular&orientation=landscape`,
    { headers }
  );

  if (!res.ok) {
    throw new Error(`Unsplash error ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  return data.map(normalizePhoto);
};

// ── 2. Search wallpapers by query ─────────────────────────────────
export const searchWallpapers = async (query, page = 1, perPage = 20) => {
  if (!query?.trim()) return fetchTrendingWallpapers(page, perPage);

  const res = await fetch(
    `${BASE_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`,
    { headers }
  );

  if (!res.ok) {
    throw new Error(`Unsplash error ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  return data.results.map(normalizePhoto);
};
