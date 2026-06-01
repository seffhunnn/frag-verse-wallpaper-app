export const MOODS = [
  { id: 'cozy', label: 'Cozy', emoji: '☕', description: 'Warm, soft, comforting spaces', query: 'cozy aesthetic', color: '#b45309' },
  { id: 'dreamy', label: 'Dreamy', emoji: '🌙', description: 'Soft light and surreal tones', query: 'dreamy aesthetic', color: '#a855f7' },
  { id: 'cyberpunk', label: 'Cyberpunk', emoji: '⚡', description: 'Neon cities and digital nights', query: 'cyberpunk', color: '#06b6d4' },
  { id: 'minimal', label: 'Minimal', emoji: '◻️', description: 'Clean lines and calm space', query: 'minimal wallpaper', color: '#6b7280' },
  { id: 'rainy', label: 'Rainy', emoji: '🌧️', description: 'Moody rain and glass reflections', query: 'rainy mood', color: '#60a5fa' },
  { id: 'night-drive', label: 'Night Drive', emoji: '🚗', description: 'Highways under city lights', query: 'night drive aesthetic', color: '#6366f1' },
  { id: 'calm', label: 'Calm', emoji: '🍃', description: 'Quiet scenes for focus', query: 'calm nature', color: '#10b981' },
  { id: 'dark', label: 'Dark', emoji: '🌑', description: 'Deep tones and low light', query: 'dark aesthetic', color: '#374151' },
  { id: 'anime', label: 'Anime', emoji: '🎌', description: 'Illustrated worlds and characters', query: 'anime wallpaper', color: '#f59e0b' },
  { id: 'productivity', label: 'Productivity', emoji: '💻', description: 'Desk setups and focus vibes', query: 'desk setup aesthetic', color: '#3b82f6' },
];

export const COLLECTIONS = [
  { id: 'editors', title: "Editor's Picks", subtitle: 'Hand-selected standouts' },
  { id: 'trending', title: 'Trending Wallpapers', subtitle: 'What everyone is saving' },
  { id: 'downloaded', title: 'Most Downloaded', subtitle: 'Community favorites' },
  { id: 'minimal-setups', title: 'Minimal Setups', subtitle: 'Clean desk & workspace' },
  { id: 'gaming', title: 'Gaming Essentials', subtitle: 'RGB, rigs, and arenas' },
];

export const CATEGORY_SECTIONS = [
  {
    id: 'featured',
    title: 'Featured',
    subtitle: 'Start with these aesthetics',
    categories: ['Dreamy', 'Purple Aesthetic', 'Night Drive', 'Calm'],
  },
  {
    id: 'trending',
    title: 'Trending moods',
    subtitle: 'Popular right now',
    categories: ['Cozy', 'Cyberpunk', 'Dark', 'Anime'],
  },
  {
    id: 'moods',
    title: 'Moods',
    subtitle: 'Browse by feeling',
    categories: ['Rainy', 'Minimal', 'Productivity', 'Dreamy'],
  },
  {
    id: 'popular',
    title: 'Popular aesthetics',
    subtitle: 'Community-loved styles',
    categories: ['Gaming', 'Study', 'Night Drive', 'Calm'],
  },
];

export const MOOD_CATEGORY_META = {
  'Cozy': { emoji: '☕', description: 'Warm blankets, soft light, and quiet corners', color: '#b45309' },
  'Dreamy': { emoji: '🌙', description: 'Ethereal palettes and soft glow', color: '#a855f7' },
  'Cyberpunk': { emoji: '⚡', description: 'Neon streets and futuristic mood', color: '#06b6d4' },
  'Minimal': { emoji: '◻️', description: 'Less noise, more clarity', color: '#6b7280' },
  'Rainy': { emoji: '🌧️', description: 'Wet windows and grey skies', color: '#60a5fa' },
  'Night Drive': { emoji: '🚗', description: 'Roads, headlights, and midnight air', color: '#6366f1' },
  'Calm': { emoji: '🍃', description: 'Peaceful scenes for slow days', color: '#10b981' },
  'Dark': { emoji: '🌑', description: 'Shadow-rich, low-light aesthetics', color: '#374151' },
  'Anime': { emoji: '🎌', description: 'Illustrated worlds and characters', color: '#f59e0b' },
  'Productivity': { emoji: '💻', description: 'Focus-friendly desk energy', color: '#3b82f6' },
  'Purple Aesthetic': { emoji: '💜', description: 'Lavender tones and violet light', color: '#8b5cf6' },
  'Gaming': { emoji: '🎮', description: 'Battle stations and game worlds', color: '#84cc16' },
  'Study': { emoji: '📚', description: 'Libraries, desks, and focus', color: '#0ea5e9' },
};

export function getMoodMeta(label) {
  return MOOD_CATEGORY_META[label] || {
    emoji: '✦',
    description: 'Explore this aesthetic',
    color: '#7C3AED',
  };
}

export function createSeededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function getPreviewWallpapers(wallpapers, label, count = 3) {
  if (!wallpapers?.length) return [];
  const q = label.toLowerCase();
  const matches = wallpapers.filter(
    (w) =>
      w != null &&
      ((w.category && w.category.toLowerCase().includes(q)) ||
       (w.title && w.title.toLowerCase().includes(q)))
  );
  const pool = (matches.length >= count ? matches : wallpapers).filter(w => w != null && w.id != null);
  
  // 5-hour timestamp block + label character hash as seed
  const fiveHoursMs = 5 * 60 * 60 * 1000;
  const seedBlock = Math.floor(Date.now() / fiveHoursMs);
  const labelHash = label.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rng = createSeededRandom(seedBlock + labelHash);
  
  const shuffled = shuffleArray(pool, rng);
  return shuffled.slice(0, count);
}

export function shuffleArray(arr, randomFn = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
