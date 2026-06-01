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
  heroImage:   photo.urls?.regular ?? photo.urls?.small,
  fullImage:   photo.urls?.full,
  unsplashLink: photo.links?.html,
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

// ── 2b. Fetch single wallpaper by ID ──────────────────────────────
export const fetchUnsplashPhotoById = async (id) => {
  if (!id) return null;
  const res = await fetch(`${BASE_URL}/photos/${id}`, { headers });
  if (!res.ok) {
    throw new Error(`Unsplash error ${res.status}: ${res.statusText}`);
  }
  const data = await res.json();
  return normalizePhoto(data);
};

const HERO_CURATED_QUERIES = [
  'minimal wallpaper',
  'cinematic landscape',
  'dreamy wallpaper',
  'dark aesthetic',
  'cyberpunk city',
  'architecture wallpaper',
  'moody landscape',
  'ultrawide wallpaper',
];

function isLandscapeWallpaper(photo) {
  const w = photo.width || 0;
  const h = photo.height || 0;
  return w > 0 && h > 0 && w >= h * 1.15;
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── 3. Curated hero slideshow pool (landscape, aesthetic queries) ──
export const fetchHeroSlideshowWallpapers = async () => {
  const queries = shuffleInPlace([...HERO_CURATED_QUERIES]).slice(0, 4);
  const byId = new Map();

  const batches = await Promise.allSettled(
    queries.map((q) => searchWallpapers(q, 1, 6))
  );

  batches.forEach((result) => {
    if (result.status !== 'fulfilled') return;
    result.value.forEach((photo) => {
      if (isLandscapeWallpaper(photo)) byId.set(photo.id, photo);
    });
  });

  if (byId.size < 6) {
    try {
      const trending = await fetchTrendingWallpapers(1, 20);
      trending.forEach((photo) => {
        if (isLandscapeWallpaper(photo)) byId.set(photo.id, photo);
      });
    } catch {
      // use whatever we have
    }
  }

  return shuffleInPlace([...byId.values()]).slice(0, 18);
};
