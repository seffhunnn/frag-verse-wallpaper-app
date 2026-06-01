import { useMemo, useState, useRef, useCallback, useEffect, memo } from 'react';
import ExploreHero from '../components/explore/ExploreHero';
import MoodStrip from '../components/explore/MoodStrip';
import TodaysPicks from '../components/explore/TodaysPicks';
import StickySearchBar from '../components/explore/StickySearchBar';
import MasonryWallpaperGrid from '../components/explore/MasonryWallpaperGrid';
import { MOODS, getPreviewWallpapers, createSeededRandom, shuffleArray } from '../constants/discovery';

const getShuffleScore = (id, seed) => {
  let hash = seed;
  const strId = String(id);
  for (let i = 0; i < strId.length; i++) {
    hash = (hash << 5) - hash + strId.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

const ExplorePage = memo(({
  exploreWallpapers = [],
  userWallpapers = [],
  loading,
  error,
  searchQuery,
  setSearchQuery,
  onSearch,
  activeCategory,
  onMoodSelect,
  viewMode,
  setViewMode,
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
  const [activeMood, setActiveMood] = useState(activeCategory);
  const masonryRef = useRef(null);

  useEffect(() => {
    setActiveMood(activeCategory);
  }, [activeCategory]);

  const activeFeedWallpapers = useMemo(() => {
    const feed = viewMode === 'fragverse' ? userWallpapers : exploreWallpapers;
    return feed.filter(w => w != null && w.id != null);
  }, [viewMode, userWallpapers, exploreWallpapers]);

  const sortedWallpapers = useMemo(() => {
    const list = [...activeFeedWallpapers];
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

    // 'latest' in 'fragverse' mode: shuffle them slightly so same wallpapers don't always appear first,
    // but keep a general sense of recency by shuffling within the session.
    if (viewMode === 'fragverse' && sort === 'latest') {
      return list.sort((a, b) => {
        const scoreA = getShuffleScore(a.id, shuffleSeed);
        const scoreB = getShuffleScore(b.id, shuffleSeed);
        return scoreA - scoreB;
      });
    }

    if (viewMode === 'fragverse') {
      return list.sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (timeA !== timeB) return timeB - timeA;
        return String(b.id).localeCompare(String(a.id));
      });
    }
    // 'all' mode — keep the interleaved feed order intact
    return list;
  }, [activeFeedWallpapers, sort, shuffleSeed, viewMode]);

  const heroFallback = useMemo(
    () => exploreWallpapers.filter((w) => w != null && (w.image || w.thumb)).slice(0, 12),
    [exploreWallpapers]
  );

  const todaysPicks = useMemo(() => {
    const fiveHoursMs = 5 * 60 * 60 * 1000;
    const seedBlock = Math.floor(Date.now() / fiveHoursMs);
    const rng = createSeededRandom(seedBlock + 98765);
    const safe = exploreWallpapers.filter(w => w != null && w.id != null);
    const shuffled = shuffleArray([...safe], rng);
    return shuffled.slice(0, 12);
  }, [exploreWallpapers]);

  const moodPreviewsMap = useMemo(() => {
    const map = {};
    MOODS.forEach((mood) => {
      const preview = getPreviewWallpapers(exploreWallpapers, mood.label, 1)[0];
      map[mood.id] = preview ? (preview.thumb || preview.image) : null;
    });
    return map;
  }, [exploreWallpapers]);

  const handleMood = useCallback(
    (mood) => {
      if (!mood) {
        setActiveMood(null);
        onMoodSelect(null);
        return;
      }
      setActiveMood(mood.label);
      onMoodSelect(mood.label);
      masonryRef.current?.scrollIntoView({ behavior: 'smooth' });
    },
    [onMoodSelect]
  );

  const scrollToMasonry = () => {
    masonryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <StickySearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={onSearch}
        activeMood={activeMood}
        onMoodSelect={handleMood}
      />
      <div className="animate-fade-in pb-8">
        <ExploreHero
          fallbackWallpapers={heroFallback}
          onExplore={scrollToMasonry}
          onMoodExplore={() => {
            document.getElementById('mood-strip')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <div id="mood-strip">
          <MoodStrip
            bgImages={moodPreviewsMap}
            activeMood={activeMood}
            onMoodSelect={handleMood}
          />
        </div>

        <TodaysPicks
          wallpapers={todaysPicks}
          onCardClick={onCardClick}
          onToggleFavorite={onToggleFavorite}
          favoriteIds={favoriteIds}
          isAdmin={isAdmin}
          onDeleteWallpaper={onDeleteWallpaper}
        />

      <div className="w-full px-4 sm:px-6 lg:px-10 py-3 flex items-center gap-2 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={() => setViewMode('all')}
          className={`fv-chip flex-shrink-0 ${viewMode === 'all' ? 'active' : ''}`}
        >
          ✦ All Wallpapers
        </button>
        <button
          type="button"
          onClick={() => setViewMode('fragverse')}
          className={`fv-chip flex-shrink-0 ${viewMode === 'fragverse' ? 'active' : ''}`}
        >
          🖼 FragVerse Community
        </button>
      </div>

      <div ref={masonryRef}>
        <MasonryWallpaperGrid
          wallpapers={sortedWallpapers}
          loading={loading}
          error={error}
          title={activeMood ? `${activeMood} wallpapers` : 'Endless discovery'}
          subtitle={
            loading
              ? 'Loading…'
              : 'Click Load More below to discover more wallpapers'
          }
          onCardClick={onCardClick}
          onToggleFavorite={onToggleFavorite}
          favoriteIds={favoriteIds}
          onDeleteWallpaper={onDeleteWallpaper}
          isAdmin={isAdmin}
          lastWallpaperRef={null}
          isReloading={isReloading}
          sessionSeed={sessionSeed}
          activeCategory={activeMood}
          loadMore={loadMore}
          hasMore={hasMore}
        />
      </div>
      </div>
    </>
  );
});

export default ExplorePage;
