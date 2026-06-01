import { useMemo, memo } from 'react';
import { AlertTriangle, Heart, Search } from 'lucide-react';
import WallpaperCard from './WallpaperCard';
import { InitialSkeletonGrid } from './WallpaperGridSkeleton';
import useColumnCount from '../hooks/useColumnCount';
import { createSeededRandom } from '../constants/discovery';

const FALLBACK_RATIOS = ['4/5', '3/4', '4/5', '2/3', '4/5', '3/4', '16/10', '4/5', '3/4', '1/1'];

const getEstimatedHeightRatio = (wallpaper, seed = 0) => {
  const { id = '', width, height } = wallpaper || {};
  if (width && height && width > 0) return height / width;

  const hash = String(id).split('').reduce((sum, char) => sum + char.charCodeAt(0), seed);
  const [w, h] = FALLBACK_RATIOS[Math.abs(hash) % FALLBACK_RATIOS.length].split('/').map(Number);
  return h / w;
};

const distributeByEstimatedHeight = (items, columnCount, seed = 0) => {
  const safeCount = Math.max(1, columnCount || 1);
  const cols = Array.from({ length: safeCount }, () => []);
  const heights = Array(safeCount).fill(0);

  // Initial jitter to vary which column gets picked first on reload
  const jitterRng = createSeededRandom(seed + 777);
  for (let i = 0; i < safeCount; i++) {
    heights[i] = jitterRng() * 0.05;
  }

  items.forEach((wallpaper, globalIndex) => {
    if (wallpaper == null || wallpaper.id == null) return; // skip corrupt items
    let targetCol = 0;
    for (let c = 1; c < safeCount; c++) {
      if (heights[c] < heights[targetCol]) targetCol = c;
    }
    cols[targetCol].push({ wallpaper, globalIndex });
    heights[targetCol] += getEstimatedHeightRatio(wallpaper, seed);
  });

  return cols;
};

// ─────────────────────────────────────────────────────────────────
// WallpaperGrid — JS-distributed masonry (no CSS column-count gaps)
// ─────────────────────────────────────────────────────────────────
const WallpaperGrid = memo(({
  wallpapers    = [],
  loading       = false,
  error         = null,
  title         = 'Trending Wallpapers',
  subtitle      = '',
  onCardClick,
  onDeleteWallpaper,
  onToggleFavorite,
  favoriteIds   = [],
  loadMore,
  hasMore,
  isAdmin       = false,
  lastWallpaperRef,
  isReloading   = false,
  showStatusBadge = false,
  currentUserUid = null,
  sessionSeed   = 0,
  compactLayout = false,
  activeCategory = null,
}) => {
  const numCols = Math.max(1, useColumnCount(5) - 1);
  const showSkeletons = loading && wallpapers.length < 4;

  const activeCols = useMemo(() => {
    if (compactLayout && wallpapers.length > 0 && !showSkeletons) {
      return Math.min(numCols, wallpapers.length);
    }
    return numCols;
  }, [compactLayout, wallpapers.length, showSkeletons, numCols]);

  // Height-aware distribution keeps shorter masonry columns from running dry.
  const columns = useMemo(() => {
    const safe = wallpapers.filter(w => w != null && w.id != null);
    return distributeByEstimatedHeight(safe, activeCols, sessionSeed);
  }, [wallpapers, activeCols, sessionSeed]);


  const visibleWallpapers = useMemo(() => {
    return columns.flatMap(col => col.map(c => c.wallpaper)).filter(Boolean);
  }, [columns]);



  return (
    <section className="pb-20 animate-fade-in">
      <div className="w-full px-4 sm:px-6 lg:px-10">

        {/* ——— Section header ——— */}
        <div className="flex items-center justify-between mb-4 pt-6">
          <h2 className="text-[18px] font-bold text-[var(--text-primary)] leading-tight">
            {title}
          </h2>
        </div>

        {/* ——— Error state ——— */}
        {error && wallpapers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <div className="w-14 h-14 rounded-[18px] bg-[var(--surface-2)] flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-[var(--text-muted)]" strokeWidth={1.5} />
            </div>
            <p className="text-[var(--text-primary)] font-semibold text-sm">
              Something went wrong
            </p>
            <p className="text-[var(--text-muted)] text-sm max-w-xs">{error}</p>
          </div>
        )}

        {/* ——— JS-distributed flex columns ——— */}
        <div 
          className={`flex gap-2 sm:gap-2.5 items-start transition-opacity duration-300 ${
            isReloading ? 'opacity-40 pointer-events-none' : 'opacity-100'
          } ${compactLayout ? 'fv-grid-compact-container' : ''}`}
          style={compactLayout && wallpapers.length > 0 && !showSkeletons ? {
            maxWidth: `calc((${activeCols} / ${numCols}) * 100% - ((${numCols} - ${activeCols}) / ${numCols}) * var(--grid-gap))`
          } : undefined}
        >
          {showSkeletons
            ? <InitialSkeletonGrid numCols={numCols} />
            : columns.map((col, ci) => (
                <div key={`col-${ci}`} className="flex-1 flex flex-col gap-2 sm:gap-2.5 min-w-0">
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
                          showStatusBadge={showStatusBadge}
                          showDelete={isAdmin || (showStatusBadge && wallpaper.uploader_id === currentUserUid)}
                        />
                      </div>
                    );
                  })}
                </div>
              ))
          }
        </div>

        {/* Loading more indicator — only when there are more items to fetch */}
        {loading && wallpapers.length >= 4 && hasMore && (
          <div className="fv-load-more-indicator">
            <div className="fv-load-more-spinner" />
            <span className="fv-load-more-label">Loading more wallpapers…</span>
          </div>
        )}

        {hasMore && (
          <div
            ref={lastWallpaperRef}
            aria-hidden="true"
            className="h-px w-full"
          />
        )}

        {!loading && !error && wallpapers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-[20px] bg-[var(--surface-2)] flex items-center justify-center">
              {title.toLowerCase().includes('favorites')
                ? <Heart className="w-7 h-7 text-[var(--text-muted)]" strokeWidth={1.5} />
                : <Search className="w-7 h-7 text-[var(--text-muted)]" strokeWidth={1.5} />}
            </div>
            <p className="text-[var(--text-primary)] font-semibold text-sm">
              {title.toLowerCase().includes('favorites') ? 'No favorites yet' : 'No wallpapers found'}
            </p>
            <p className="text-[var(--text-muted)] text-sm">
              {title.toLowerCase().includes('favorites')
                ? 'Click the heart icon on any wallpaper to add it to your favorites.'
                : 'Try a different search term or category.'}
            </p>
          </div>
        )}

      </div>
    </section>
  );
});

export default WallpaperGrid;
