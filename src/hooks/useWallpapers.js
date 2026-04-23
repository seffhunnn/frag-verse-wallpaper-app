import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchTrendingWallpapers, searchWallpapers } from '../services/unsplashApi';
import { fetchSupabaseWallpapers } from '../services/supabaseApi';

const FRAGVERSE_SLOT_PROBABILITY = 0.05;
const FRAGVERSE_COOLDOWN_MIN = 8;
const FRAGVERSE_COOLDOWN_MAX = 12;
const FRAGVERSE_RECENT_STORAGE_KEY = 'fragverse_recent_ids_v1';
const RECENT_FRAGVERSE_CACHE_SIZE = 120;

function loadRecentFragverseIds() {
  try {
    const raw = localStorage.getItem(FRAGVERSE_RECENT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(String);
  } catch {
    return [];
  }
}

function persistRecentFragverseIds(ids) {
  try {
    const trimmed = ids.slice(-RECENT_FRAGVERSE_CACHE_SIZE);
    localStorage.setItem(FRAGVERSE_RECENT_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore storage write issues (private mode/quota).
  }
}

function ensureRecentFragverseIdsSet(recentRef) {
  if (recentRef.current instanceof Set) return;
  const cur = recentRef.current;
  recentRef.current = new Set(
    Array.isArray(cur) ? cur.map(String) : []
  );
}

function isFragverseWallpaper(w) {
  return w && (w.source === 'user' || w.isSupabase === true);
}

function randomCooldownSlots() {
  return (
    Math.floor(Math.random() * (FRAGVERSE_COOLDOWN_MAX - FRAGVERSE_COOLDOWN_MIN + 1)) +
    FRAGVERSE_COOLDOWN_MIN
  );
}

// ── Shuffle Helper (Fisher-Yates) ────────────────────────────────
function shuffleArray(array, randomFn = Math.random) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─────────────────────────────────────────────────────────────────
// useWallpapers – custom hook
//
// Returns:
//   wallpapers  {array}    – normalized photo objects
//   loading     {boolean}  – true while fetching
//   error       {string|null} – error message or null
//   search      {function} – call with a query string to search
//   clearSearch {function} – resets back to trending
//   query       {string}   – current active search query
// ─────────────────────────────────────────────────────────────────
const useWallpapers = () => {
  const [userWallpapers,    setUserWallpapers]    = useState([]);
  const [displayWallpapers, setDisplayWallpapers] = useState([]);
  const [searchResults,     setSearchResults]     = useState([]);
  const [loading,           setLoading]           = useState(false);
  const [error,             setError]             = useState(null);
  const [query,             setQuery]             = useState('');
  const [page,              setPage]              = useState(1);
  const [hasMore,           setHasMore]           = useState(true);
  
  const requestIdRef = useRef(0);
  const isFetchingRef = useRef(false);
  const userWallpapersRef = useRef([]); // Ref for stable access inside callbacks
  const shownIdsRef = useRef(new Set());
  const shownFragverseInFeedRef = useRef(new Set());
  const fragverseCooldownRemainingRef = useRef(0);
  const recentFragverseIdsRef = useRef(new Set(loadRecentFragverseIds()));

  // Sync ref with state
  useEffect(() => {
    userWallpapersRef.current = userWallpapers;
  }, [userWallpapers]);

  const getUniqueById = useCallback((items) => {
    return Array.from(new Map(items.map(item => [item.id, item])).values());
  }, []);

  const buildMixedFeed = useCallback((unsplashItems, fragverseItems, targetSize) => {
    const totalTarget = Math.max(1, targetSize || unsplashItems.length || 20);
    const uniqueUnsplash = getUniqueById(unsplashItems);
    const uniqueFragverse = getUniqueById(fragverseItems).filter(isFragverseWallpaper);

    if (uniqueUnsplash.length === 0 && uniqueFragverse.length > 0) {
      const fallback = shuffleArray(
        uniqueFragverse.filter(w => !shownFragverseInFeedRef.current.has(w.id))
      ).slice(0, totalTarget);
      fallback.forEach(w => {
        shownFragverseInFeedRef.current.add(w.id);
        shownIdsRef.current.add(w.id);
      });
      return fallback;
    }

    const maxFragverseInBatch = Math.min(3, Math.max(0, Math.floor(totalTarget / 10)));
    let fragInBatch = 0;
    let cooldown = fragverseCooldownRemainingRef.current;

    let unsplashPool = shuffleArray(
      uniqueUnsplash.filter(u => !shownIdsRef.current.has(u.id))
    );
    if (unsplashPool.length === 0) {
      unsplashPool = shuffleArray([...uniqueUnsplash]);
    }
    let uIdx = 0;

    const fragPool = shuffleArray(
      uniqueFragverse.filter(w => !shownFragverseInFeedRef.current.has(w.id))
    );
    let fragIdx = 0;

    const takeUnsplash = () => {
      while (uIdx >= unsplashPool.length) {
        unsplashPool = shuffleArray(
          uniqueUnsplash.filter(u => !shownIdsRef.current.has(u.id))
        );
        if (unsplashPool.length === 0) {
          unsplashPool = shuffleArray([...uniqueUnsplash]);
        }
        uIdx = 0;
      }
      const w = unsplashPool[uIdx++];
      shownIdsRef.current.add(w.id);
      return w;
    };

    const result = [];
    for (let slot = 0; slot < totalTarget; slot++) {
      let pick = null;

      if (cooldown > 0) {
        cooldown--;
        pick = takeUnsplash();
      } else if (
        fragInBatch < maxFragverseInBatch &&
        fragIdx < fragPool.length &&
        Math.random() < FRAGVERSE_SLOT_PROBABILITY
      ) {
        pick = fragPool[fragIdx++];
        fragInBatch++;
        shownFragverseInFeedRef.current.add(pick.id);
        shownIdsRef.current.add(pick.id);
        cooldown = randomCooldownSlots();
      } else {
        pick = takeUnsplash();
      }

      result.push(pick);
    }

    fragverseCooldownRemainingRef.current = cooldown;
    return result;
  }, [getUniqueById]);

  // 3. Wallpaper fetching and weighted mixing
  const loadPhotos = useCallback(async (searchQuery = '', pageNum = 1) => {
    // 1. NON-REACTIVE FETCHING LOCK
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    const currentRequestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const shouldRefreshFragverse = pageNum === 1;
      const [apiData, supabaseData] = await Promise.all([
        searchQuery.trim()
          ? searchWallpapers(searchQuery, pageNum)
          : fetchTrendingWallpapers(pageNum),
        shouldRefreshFragverse
          ? fetchSupabaseWallpapers()
          : Promise.resolve(userWallpapersRef.current)
      ]);
      
      // ABORT IF STALE
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      let currentUserWallpapers = userWallpapersRef.current;
      if (shouldRefreshFragverse) {
        currentUserWallpapers = shuffleArray(supabaseData || []);
        setUserWallpapers(currentUserWallpapers);
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const localMatches = currentUserWallpapers.filter(w => (
          (w.title && w.title.toLowerCase().includes(q)) ||
          (w.category && w.category.toLowerCase().includes(q)) ||
          (w.author && w.author.toLowerCase().includes(q))
        ));

        const mixedBatch = buildMixedFeed(apiData, localMatches, apiData.length || 20);

        setSearchResults(prev => {
          if (pageNum === 1) return mixedBatch;
          return getUniqueById([...prev, ...mixedBatch]);
        });
      } else {
        const mixedBatch = buildMixedFeed(apiData, currentUserWallpapers, apiData.length || 20);
        setDisplayWallpapers(prev => {
          if (pageNum === 1) return mixedBatch;
          return getUniqueById([...prev, ...mixedBatch]);
        });
      }
      
      setHasMore(apiData.length > 0);
    } catch (err) {
      if (currentRequestId === requestIdRef.current) {
        setError(err.message || 'Failed to load wallpapers.');
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
        isFetchingRef.current = false;
      }
    }
  }, [buildMixedFeed, getUniqueById]); // Stable callback

  // 5. FIX FETCH TIMING (Paginate when page state increases)
  useEffect(() => {
    if (page > 1) {
      loadPhotos(query, page);
    }
  }, [page, loadPhotos, query]);

  // RESET ON NEW SEARCH
  useEffect(() => {
    setPage(1);
    setSearchResults([]);
    setHasMore(true);
    if (query.trim()) {
      loadPhotos(query, 1);
    }
  }, [query, loadPhotos]);

  // Load Unsplash on mount (only for API part)
  useEffect(() => {
    loadPhotos('', 1);
  }, [loadPhotos]);

  // Combined List for UI (Minimalistic Memo)
  const wallpapers = useMemo(() => {
    return query.trim() ? searchResults : displayWallpapers;
  }, [query, searchResults, displayWallpapers]);

  // Search or category change resets everything
  const search = useCallback((q) => {
    setQuery(q);
  }, []);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setPage(prev => prev + 1);
  }, [loading, hasMore]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setPage(1);
    setHasMore(true);
    loadPhotos('', 1);
  }, [loadPhotos]);

  // ── Prepend an uploaded wallpaper ──
  const prependWallpaper = useCallback((wallpaper) => {
    ensureRecentFragverseIdsSet(recentFragverseIdsRef);
    recentFragverseIdsRef.current.add(String(wallpaper.id));
    const arr = Array.from(recentFragverseIdsRef.current).slice(-RECENT_FRAGVERSE_CACHE_SIZE);
    recentFragverseIdsRef.current = new Set(arr);
    persistRecentFragverseIds(arr);
    shownIdsRef.current.add(wallpaper.id);
    shownFragverseInFeedRef.current.add(wallpaper.id);
    setUserWallpapers(prev => [wallpaper, ...prev]);
    setDisplayWallpapers(prev => [wallpaper, ...prev]);
    setSearchResults(prev => [wallpaper, ...prev]);
  }, []);

  // ── Remove a deleted wallpaper ──
  const removeWallpaper = useCallback((id) => {
    ensureRecentFragverseIdsSet(recentFragverseIdsRef);
    shownIdsRef.current.delete(id);
    shownFragverseInFeedRef.current.delete(id);
    recentFragverseIdsRef.current.delete(String(id));
    const filteredRecent = Array.from(recentFragverseIdsRef.current);
    persistRecentFragverseIds(filteredRecent);
    setUserWallpapers(prev => prev.filter(w => w.id !== id));
    setDisplayWallpapers(prev => prev.filter(w => w.id !== id));
    setSearchResults(prev => prev.filter(w => w.id !== id));
  }, []);
  


  return { 
    wallpapers,
    userWallpapers,
    loading, error, query, search, clearSearch, loadMore, hasMore, 
    prependWallpaper, removeWallpaper
  };
};

export default useWallpapers;
