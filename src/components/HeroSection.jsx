import { useMemo, memo } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────
// Background wallpaper thumbnails for the scrolling preview rows
// ─────────────────────────────────────────────────────────────────
const BG_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=70&w=300',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=70&w=300',
  'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=70&w=300',
  'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?auto=format&fit=crop&q=70&w=300',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=70&w=300',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=70&w=300',
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&q=70&w=300',
  'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=70&w=300',
];

// Infinite scrolling row of wallpaper thumbnails
const ScrollRow = memo(({ images, direction = 1, speed = 30 }) => {
  // Quadruple to ensure it fully covers ultra-wide screens without showing empty space
  const items = useMemo(() => [...images, ...images, ...images, ...images], [images]);

  return (
    <div className="flex gap-2 overflow-hidden select-none pointer-events-none py-0.5">
      <motion.div
        animate={{ x: direction > 0 ? ['-25%', '0%'] : ['0%', '-25%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
        className="flex gap-2 flex-shrink-0"
        style={{ willChange: 'transform' }}
      >
        {items.map((img, i) => (
          <div
            key={i}
            className="w-40 h-28 sm:w-44 sm:h-[7.5rem] rounded-[12px] overflow-hidden flex-shrink-0
                       bg-[var(--surface-2)]"
          >
            <img
              src={img}
              alt=""
              className="w-full h-full object-cover opacity-50 dark:opacity-30
                         transition-opacity duration-300"
              loading="lazy"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────
// HeroSection — minimal, content-neutral, wallpaper-first
// ─────────────────────────────────────────────────────────────────
const HeroSection = memo(({ onSearch, searchQuery, setSearchQuery }) => {

  const handleSearch = () => {
    if (onSearch) onSearch(searchQuery.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <section id="homepage-hero" className="relative overflow-hidden pt-10 sm:pt-12 pb-8 sm:pb-9 min-h-[320px] sm:min-h-[360px] flex items-center justify-center">

      {/* ── Scrolling wallpaper backdrop ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Fade gradient overlays (Not rotated, stays horizontal/vertical) */}
        <div className="absolute inset-0 z-10
          bg-gradient-to-b from-[var(--bg)] via-transparent to-[var(--bg)]
          opacity-90" />
        <div className="absolute inset-0 z-10
          bg-gradient-to-r from-[var(--bg)] via-transparent to-[var(--bg)]
          opacity-70" />

        {/* Rotated background images container */}
        <div className="absolute inset-0 z-0 -rotate-6 scale-110 translate-y-[-12%]">
          <div className="flex flex-col gap-2 translate-y-[-10%]">
            <ScrollRow images={BG_IMAGES.slice(0, 5)} direction={1}  speed={35} />
            <ScrollRow images={BG_IMAGES.slice(3, 8)} direction={-1} speed={45} />
            <ScrollRow images={BG_IMAGES.slice(1, 6)} direction={1}  speed={40} />
            <ScrollRow images={BG_IMAGES.slice(4, 8)} direction={-1} speed={48} />
            <ScrollRow images={BG_IMAGES.slice(2, 7)} direction={1}  speed={32} />
          </div>
        </div>
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-10 z-10">
        <div className="flex flex-col items-center text-center gap-5 sm:gap-6">

          {/* Overline label */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.5 }}
            className="text-xs font-semibold tracking-[0.18em] uppercase
                       text-[var(--accent)] select-none"
          >
            Wallpaper Platform
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="text-[36px] sm:text-[52px] lg:text-[64px]
                       font-black leading-[1.05] tracking-[-0.02em]
                       text-[var(--text-primary)]"
          >
            Find what
            <br />
            <span style={{ color: 'var(--accent)' }}>feels</span>
            {' '}like you.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.5 }}
            className="text-sm sm:text-base text-[var(--text-secondary)]
                       max-w-md leading-relaxed font-normal"
          >
            Discover beautiful wallpapers curated by the community.
          </motion.p>

          {/* Search input */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full max-w-xl"
          >
            <div className="relative flex items-center">
              <Search
                className="absolute left-4 w-5 h-5 text-[var(--text-muted)] pointer-events-none z-10"
              />
              <input
                id="hero-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Try "neon city", "anime sunset", "galaxy"…'
                className="
                  fv-input-focus w-full
                  bg-[var(--surface)] dark:bg-[var(--surface)]
                  border border-[var(--border)]
                  rounded-[14px] pl-11 pr-32 py-3
                  text-[15px] text-[var(--text-primary)]
                  placeholder:text-[var(--text-muted)]
                  shadow-card
                  transition-all duration-250
                "
              />
              <button
                id="hero-search-btn"
                onClick={handleSearch}
                className="fv-btn-primary absolute right-2 text-sm"
              >
                Search
              </button>
            </div>
          </motion.div>

          {/* Bottom hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-[11px] tracking-[0.3em] uppercase font-semibold
                       text-[var(--text-muted)] select-none"
          >
            Your wallpaper defines you.
          </motion.p>
        </div>
      </div>
    </section>
  );
});

export default HeroSection;
