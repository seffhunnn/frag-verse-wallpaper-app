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
  loadMore,
  hasMore,
}) => {
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '200px' // Trigger load 200px before reaching the bottom
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadMore, hasMore, loading]);

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
          <select className="bg-dark-700 border border-white/8 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer">
            <option>Trending</option>
            <option>Newest</option>
            <option>Most Liked</option>
            <option>Most Downloaded</option>
          </select>
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
          {/* Initial loading skeletons */}
          {loading && wallpapers.length === 0 && 
            Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          }

          {/* Real wallpaper cards */}
          {wallpapers.map((wallpaper, i) => (
            <WallpaperCard
              key={`${wallpaper.id}-${i}`} // Ensure unique keys even if id repeats
              wallpaper={wallpaper}
              index={i}
              onCardClick={onCardClick}
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

        {/* ── Intersection Observer Target ── */}
        <div 
          ref={observerTarget} 
          className="w-full h-32 mt-8 flex flex-col items-center justify-center border-t border-white/5"
        >
          {loading && wallpapers.length > 0 && (
            <div className="flex flex-col items-center gap-3 text-purple-400">
               <div className="w-8 h-8 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
               <span className="text-sm font-medium animate-pulse">Fetching more wallpapers...</span>
            </div>
          )}
          {!hasMore && wallpapers.length > 0 && (
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <span className="text-xl">🌌</span>
              <p className="text-sm italic font-medium">You've reached the end of the galaxy</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WallpaperGrid;
