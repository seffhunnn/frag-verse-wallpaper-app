import { useMemo, memo } from 'react';
import { Search } from 'lucide-react';
import WallpaperCard from '../WallpaperCard';
import { InitialSkeletonGrid } from '../WallpaperGridSkeleton';
import useColumnCount from '../../hooks/useColumnCount';
import { createSeededRandom } from '../../constants/discovery';

const FALLBACK_RATIOS = ['4/5', '3/4', '4/5', '2/3', '4/5', '3/4', '16/10', '4/5', '3/4', '1/1'];

const getEstimatedHeightRatio = (wallpaper) => {
  const { width, height } = wallpaper || {};
  // All clamped cards render at 4/3 landscape (WallpaperCard clampAspect always → '4 / 3').
  // Items without real dimensions also get 4/3, so column balancing matches exactly.
  if (!width || !height || height <= 0) {
    return 0.75; // 4/3 landscape → height-ratio = 3/4 = 0.75
  }
  const r = width / height;
  // Mirror WallpaperCard: all clamped cards → 4/3 regardless of orientation
  return 0.75;
};



const distributeByEstimatedHeight = (items, columnCount, seed = 0) => {
  const cols = Array.from({ length: columnCount }, () => []);
  const heights = Array(columnCount).fill(0);

  // Initial jitter to vary which column gets picked first on reload
  const jitterRng = createSeededRandom(seed + 777);
  for (let i = 0; i < columnCount; i++) {
    heights[i] = jitterRng() * 0.05;
  }

  items.forEach((wallpaper, globalIndex) => {
    if (wallpaper == null || wallpaper.id == null) return; // skip corrupt items
    let targetCol = 0;
    for (let c = 1; c < columnCount; c++) {
      if (heights[c] < heights[targetCol]) targetCol = c;
    }
    cols[targetCol].push({ wallpaper, globalIndex });
    heights[targetCol] += getEstimatedHeightRatio(wallpaper);
  });

  return cols;
};


const MasonryWallpaperGrid = memo(({
  wallpapers = [],
  loading = false,
  error = null,
  title = 'Discover',
  subtitle = '',
  onCardClick,
  onDeleteWallpaper,
  onToggleFavorite,
  favoriteIds = [],
  isAdmin = false,
  lastWallpaperRef,
  emptyMessage = 'No wallpapers found',
  isReloading = false,
  sessionSeed = 0,
  activeCategory = null,
  loadMore = null,
  hasMore = false,
}) => {
  // Reduced column count by 1 to remove the last column and fill empty space gaps
  const numCols = Math.max(1, useColumnCount(5) - 1);

  const activeCols = useMemo(() => {
    if (wallpapers.length === 0) return numCols;
    // Ensure at least 2 items per column so the bottom row never has empty gaps.
    // e.g. 11 items on a 5-col screen → cap at 5 (floor(11/2)=5, still ok since 10/5=2 remainder=1 col gets 3).
    // For very sparse loads (< numCols*2 items), reduce columns to prevent visible empty slots.
    const maxCols = Math.max(1, Math.floor(wallpapers.length / 2));
    return Math.min(numCols, maxCols);
  }, [wallpapers.length, numCols]);

  // Height-aware distribution keeps shorter masonry columns from running dry.
  const columns = useMemo(() => {
    const safe = wallpapers.filter(w => w != null && w.id != null);
    return distributeByEstimatedHeight(safe, activeCols, sessionSeed);
  }, [wallpapers, activeCols, sessionSeed]);



  const showSkeletons = loading && wallpapers.length < 4;

  return (
    <section className="fv-section pb-14 sm:pb-16 animate-fade-in">
      <div className="fv-page-container">

        {/* Section header */}
        <div className="flex items-baseline justify-between gap-3 mb-3 pt-1">
          <div>
            <h2 className="text-[20px] font-bold text-[var(--text-primary)]">{title}</h2>
            {subtitle && (
              <p className="text-sm text-[var(--text-muted)] mt-1">{subtitle}</p>
            )}
          </div>
          {wallpapers.length > 0 && (
            <span className="text-xs font-medium text-[var(--text-muted)] tabular-nums">
              {wallpapers.length} shown
            </span>
          )}
        </div>

        {/* Error state */}
        {error && wallpapers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Something went wrong</p>
            <p className="text-sm text-[var(--text-muted)] max-w-xs">{error}</p>
          </div>
        )}

        {/* JS-distributed flex columns — GPU composited, no layout reflow */}
        <div className={`fv-masonry-flex flex w-full gap-2 sm:gap-2.5 items-start ${isReloading ? 'pointer-events-none' : ''}`}>
          {showSkeletons
            ? <InitialSkeletonGrid numCols={numCols} />
            : columns.map((col, ci) => (
                <div
                  key={`col-${ci}`}
                  className="flex-1 flex flex-col gap-2 sm:gap-2.5 min-w-0"
                  style={{ willChange: 'transform' }}
                >
                  {col.map(({ wallpaper, globalIndex }) => {
                    const staggerMs = globalIndex < 20 ? Math.min(globalIndex * 22, 350) : 0;
                    return (
                      <div
                        key={wallpaper.id}
                        className="fv-card-reveal"
                        style={{ animationDelay: `${staggerMs}ms` }}
                      >
                        <WallpaperCard
                          wallpaper={wallpaper}
                          layout="masonry"
                          onCardClick={onCardClick}
                          onDelete={onDeleteWallpaper}
                          onToggleFavorite={onToggleFavorite}
                          isFavorited={favoriteIds.includes(wallpaper.id)}
                          isAdmin={isAdmin}
                          clampAspect={true}
                        />
                      </div>
                    );
                  })}
                </div>
              ))
          }
        </div>

        {/* Empty state */}
        {!loading && !error && wallpapers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <div className="w-14 h-14 rounded-[18px] bg-[var(--surface-2)] flex items-center justify-center">
              <Search className="w-6 h-6 text-[var(--text-muted)]" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{emptyMessage}</p>
            <p className="text-sm text-[var(--text-muted)]">Try another mood or search term.</p>
          </div>
        )}


        {/* Loading more indicator — only when there are more items to fetch */}
        {loading && wallpapers.length >= 4 && (
          <div className="fv-load-more-indicator">
            <div className="fv-load-more-spinner" />
            <span className="fv-load-more-label">Loading more wallpapers…</span>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && wallpapers.length > 0 && (
          <div className="flex justify-center mt-8 mb-4">
            <button
              type="button"
              onClick={loadMore}
              className="fv-btn-primary shadow-sm hover:shadow-md transition-all duration-200"
            >
              Load More Wallpapers
            </button>
          </div>
        )}

        {lastWallpaperRef && (
          <div
            ref={lastWallpaperRef}
            aria-hidden="true"
            className="h-px w-full"
          />
        )}
      </div>
    </section>
  );
});

export default MasonryWallpaperGrid;
