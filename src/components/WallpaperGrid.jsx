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

  const skeletonCount = 8; // Fewer for appending

  return (
    <section className="pb-16 animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Initial loading skeletons (Show if fetching first batch or searching) */}
          {loading && (wallpapers.length < 5) && 
            Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          }

          {/* Real wallpaper cards */}
          {wallpapers.map((wallpaper, i) => (
            <WallpaperCard
              key={`${wallpaper.id}-${i}`} // Ensure unique keys even if id repeats
              ref={i === wallpapers.length - 1 ? lastWallpaperRef : null}
              wallpaper={wallpaper}
              index={i}
              onCardClick={onCardClick}
              onDelete={onDeleteWallpaper}
              onToggleFavorite={onToggleFavorite}
              isFavorited={favoriteIds.includes(wallpaper.id)}
              isAdmin={isAdmin}
            />
          ))}

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
