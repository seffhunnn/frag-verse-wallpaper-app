import { useMemo, useState, memo } from 'react';
import CategoriesDiscovery from '../components/categories/CategoriesDiscovery';
import MasonryWallpaperGrid from '../components/explore/MasonryWallpaperGrid';
const getShuffleScore = (id, seed) => {
  let hash = seed;
  const strId = String(id);
  for (let i = 0; i < strId.length; i++) {
    hash = (hash << 5) - hash + strId.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

const CategoriesPage = memo(({
  wallpapers,
  previewWallpapers,
  loading,
  error,
  activeCategory,
  onCategorySelect,
  onClearCategory,
  searchQuery,
  setSearchQuery,
  onSearch,
  onCardClick,
  onToggleFavorite,
  favoriteIds,
  loadMore,
  hasMore,
  lastWallpaperRef,
  onDeleteWallpaper,
  isAdmin,
  isReloading = false,
  sessionSeed = 0,
}) => {
  const [sort, setSort] = useState('latest');
  const [shuffleSeed] = useState(() => sessionSeed || Math.floor(Math.random() * 1000000));

  const sortedWallpapers = useMemo(() => {
    const list = [...wallpapers];
    const PAGE_SIZE = 20;

    const sortChunk = (chunk) => {
      if (sort === 'random') {
        return chunk.sort((a, b) => {
          const scoreA = getShuffleScore(a.id, shuffleSeed);
          const scoreB = getShuffleScore(b.id, shuffleSeed);
          return scoreA - scoreB;
        });
      }
      if (sort === 'popular') {
        return chunk.sort((a, b) => {
          const scoreA = (a.likes || 0) + (a.downloads || 0) * 1.5;
          const scoreB = (b.likes || 0) + (b.downloads || 0) * 1.5;
          if (scoreA !== scoreB) return scoreB - scoreA;
          return String(b.id).localeCompare(String(a.id));
        });
      }
      return chunk;
    };

    if (sort === 'random' || sort === 'popular') {
      const chunks = [];
      for (let i = 0; i < list.length; i += PAGE_SIZE) {
        chunks.push(list.slice(i, i + PAGE_SIZE));
      }
      const processed = chunks.flatMap(sortChunk);
      return processed;
    }

    return list;
  }, [wallpapers, sort, shuffleSeed]);

  return (
    <div className="animate-fade-in">
      <CategoriesDiscovery
        wallpapers={previewWallpapers}
        activeCategory={activeCategory}
        onCategorySelect={onCategorySelect}
        onClearCategory={onClearCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={onSearch}
        sort={sort}
        onSortChange={setSort}
      />

      {activeCategory && (
        <div className="w-full px-4 sm:px-6 lg:px-10 mt-2 mb-2">
          <button
            type="button"
            onClick={onClearCategory}
            className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors text-sm font-medium"
          >
            <span>←</span> Clear {activeCategory} filter
          </button>
        </div>
      )}

      <MasonryWallpaperGrid
        wallpapers={sortedWallpapers}
        loading={loading}
        error={error}
        title={activeCategory ? `${activeCategory} collection` : 'All moods'}
        subtitle={
          activeCategory
            ? `Wallpapers matching ${activeCategory.toLowerCase()}`
            : 'Select a category above or search to filter'
        }
        onCardClick={onCardClick}
        onToggleFavorite={onToggleFavorite}
        favoriteIds={favoriteIds}
        onDeleteWallpaper={onDeleteWallpaper}
        isAdmin={isAdmin}
        lastWallpaperRef={null}
        emptyMessage={activeCategory ? `No wallpapers for ${activeCategory}` : 'Pick a mood to begin'}
        isReloading={isReloading}
        sessionSeed={sessionSeed}
        activeCategory={activeCategory}
        loadMore={loadMore}
        hasMore={hasMore}
      />
    </div>
  );
});

export default CategoriesPage;
