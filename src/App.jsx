import { useState, useCallback } from 'react';
import Navbar          from './components/Navbar';
import HeroSection     from './components/HeroSection';
import Categories      from './components/Categories';
import WallpaperGrid   from './components/WallpaperGrid';
import WallpaperModal  from './components/WallpaperModal';
import useWallpapers   from './hooks/useWallpapers';

function App() {
  const { wallpapers, loading, error, query, search, loadMore, hasMore } = useWallpapers();

  const [activeCategory,    setActiveCategory]    = useState(null);
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);

  // ── Category tab clicked ─────────────────────────────────────────
  const handleCategorySelect = (categoryLabel) => {
    setActiveCategory(categoryLabel);
    search(categoryLabel ?? '');
  };

  // ── Navbar search typed ──────────────────────────────────────────
  const handleSearch = (q) => {
    if (q) setActiveCategory(null);
    search(q);
  };

  // ── Modal open / close ───────────────────────────────────────────
  const handleCardClick = useCallback((wallpaper) => {
    setSelectedWallpaper(wallpaper);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedWallpaper(null);
  }, []);

  // ── Dynamic grid heading ─────────────────────────────────────────
  const gridTitle = activeCategory
    ? `${activeCategory} Wallpapers`
    : query
    ? `Results for "${query}"`
    : 'Trending Wallpapers';

  const gridSubtitle = loading
    ? 'Loading…'
    : wallpapers.length > 0
    ? `${wallpapers.length} wallpaper${wallpapers.length !== 1 ? 's' : ''} found`
    : 'Hand-picked by the community';

  return (
    <div className="dark min-h-screen bg-dark-900">
      <Navbar onSearch={handleSearch} />
      <main>
        <HeroSection onSearch={handleSearch} />
        <Categories
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
        />
        <WallpaperGrid
          wallpapers={wallpapers}
          loading={loading}
          error={error}
          title={gridTitle}
          subtitle={gridSubtitle}
          onCardClick={handleCardClick}
          loadMore={loadMore}
          hasMore={hasMore}
        />
      </main>

      {/* Fullscreen modal – rendered via portal-like pattern at the root */}
      <WallpaperModal
        wallpaper={selectedWallpaper}
        onClose={handleModalClose}
      />
    </div>
  );
}

export default App;
