import { useEffect, useRef } from 'react';
import WallpaperCard from './WallpaperCard';
import SkeletonCard  from './SkeletonCard';

// ─────────────────────────────────────────────────────────────────
// WallpaperGrid
// Props:
//   wallpapers {array}    – array of normalized wallpaper objects
//   loading    {boolean}  – show skeleton cards when true
//   error      {string}   – error message to display (or null)
//   title      {string}   – section heading
//   subtitle   {string}   – subtext
//   onCardClick {function} – called when a card is clicked
//   loadMore    {function} – called to fetch more data
//   hasMore     {boolean}  – if more data exists
// ─────────────────────────────────────────────────────────────────
const WallpaperGrid = ({
  wallpapers = [],
  loading    = false,
  error      = null,
  title      = 'Trending Wallpapers',
  subtitle   = 'Hand-picked by the community',
  onCardClick,
  onDeleteWallpaper,
  onToggleFavorite,
  favoriteIds = [],
  loadMore,
  hasMore,
  isAdmin = false,
  lastWallpaperRef,
}) => {

  const sessionSalt = useRef(Math.floor(Math.random() * 10000)).current;
  const skeletonCount = 8; // Fewer for appending

  return (
    <section className="pb-16 animate-fade-in">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors duration-500">{title}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* ── Error state ── */}
        {error && wallpapers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <span className="text-4xl">⚠️</span>
            <p className="text-slate-300 font-semibold">Something went wrong</p>
            <p className="text-sm text-slate-500 max-w-sm">{error}</p>
          </div>
        )}

        {/* ── Grid: cards and skeletons ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 grid-flow-dense">
          {/* Initial loading skeletons (Show if fetching first batch or searching) */}
          {loading && (wallpapers.length < 5) && 
            Array.from({ length: 14 }).map((_, i) => {
              const feat = i === 0 || i === 7;
              return (
                <div key={i} className={feat ? 'sm:col-span-2 sm:row-span-2' : ''}>
                  <SkeletonCard isFeatured={feat} />
                </div>
              );
            })
          }

          {/* Real wallpaper cards */}
          {wallpapers.map((wallpaper, i) => {
            // Hash-like logic to determine if this card is featured
            // Deterministic per session (via salt) and wallpaper ID
            const charSum = (wallpaper.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const isFeatured = (charSum + sessionSalt) % 10 === 0; 
              
              return (
                <div 
                  key={`${wallpaper.id}-${i}`}
                  className={isFeatured ? 'sm:col-span-2 sm:row-span-2' : ''}
                >
                  <WallpaperCard
                    ref={i === wallpapers.length - 1 ? lastWallpaperRef : null}
                    wallpaper={wallpaper}
                    index={i}
                    onCardClick={onCardClick}
                    onDelete={onDeleteWallpaper}
                    onToggleFavorite={onToggleFavorite}
                    isFavorited={favoriteIds.includes(wallpaper.id)}
                    isAdmin={isAdmin}
                    isFeatured={isFeatured}
                  />
                </div>
            );
          })}

          {/* Append skeletons while loading more */}
          {loading && wallpapers.length > 0 && 
            Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={`more-${i}`} />
            ))
          }
        </div>

        {/* ── Empty state after search ── */}
        {!loading && !error && wallpapers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <span className="text-4xl">🔍</span>
            <p className="text-slate-300 font-semibold">No wallpapers found</p>
            <p className="text-sm text-slate-500">Try a different search term.</p>
          </div>
        )}

      </div>
    </section>
  );
};

export default WallpaperGrid;
