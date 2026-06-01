import { memo } from 'react';
import WallpaperCard from '../WallpaperCard';

// ─────────────────────────────────────────────────────────────────────────────
// TodaysPicks — FIXED-SIZE UNIFORM GRID (not masonry)
// Each card sits in an equal aspect-ratio cell → clean horizontal "lines"/rows.
// Uses layout="grid-fixed" so WallpaperCard fills its parent cell absolutely.
// ─────────────────────────────────────────────────────────────────────────────
const TodaysPicks = memo(({
  wallpapers = [],
  onCardClick,
  onToggleFavorite,
  favoriteIds = [],
  isAdmin,
  onDeleteWallpaper,
}) => {
  const picks = wallpapers.slice(0, 12);
  if (!picks.length) return null;

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-10 border-t border-[var(--border)]">
      {/* Section header */}
      <div className="mb-6 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)] mb-1.5">
          Curated daily
        </p>
        <h2 className="text-2xl sm:text-[28px] font-extrabold text-[var(--text-primary)] tracking-tight">
          Today&apos;s Picks
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">
          Handpicked wallpapers curated for today&apos;s mood.
        </p>
      </div>

      {/*
        Uniform fixed-size grid — every cell is aspect-[4/3].
        Cards sit in perfect horizontal "lines" with no gaps.
        layout="grid-fixed" → card renders as absolute inset-0 (fills cell).
      */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {picks.map((wallpaper, i) => (
          <div
            key={`pick-${wallpaper.id}-${i}`}
            className="relative aspect-[4/3] rounded-[16px] overflow-hidden fv-card-reveal"
            style={{ animationDelay: `${Math.min(i * 20, 300)}ms` }}
          >
            <WallpaperCard
              wallpaper={wallpaper}
              layout="grid-fixed"
              onCardClick={onCardClick}
              onDelete={onDeleteWallpaper}
              onToggleFavorite={onToggleFavorite}
              isFavorited={favoriteIds.includes(wallpaper.id)}
              isAdmin={isAdmin}
            />
          </div>
        ))}
      </div>
    </section>
  );
});

export default TodaysPicks;
