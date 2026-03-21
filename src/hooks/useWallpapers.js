import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchTrendingWallpapers, searchWallpapers } from '../services/unsplashApi';
import { fetchSupabaseWallpapers } from '../services/supabaseApi';

// ── Shuffle Helper (Fisher-Yates) ────────────────────────────────
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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
  const [apiWallpapers,     setApiWallpapers]     = useState([]);
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
  const isSearching = query.trim().length > 0;

  // Sync ref with state
  useEffect(() => {
    userWallpapersRef.current = userWallpapers;
  }, [userWallpapers]);

  // 1. Initial Load: user-uploaded wallpapers from Supabase (Once)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await fetchSupabaseWallpapers();
        // REQUIREMENT: Randomize uploaded wallpapers on refresh
        const randomized = shuffleArray(data || []);
        setUserWallpapers(randomized);
      } catch (sErr) {
      }
    };
    fetchUser();
  }, []);

  // 2. Local Filter for User Wallpapers (Memoized to prevent loops)
  const filteredUserWallpapers = useMemo(() => {
    return userWallpapers.filter(w => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        (w.title && w.title.toLowerCase().includes(q)) ||
        (w.category && w.category.toLowerCase().includes(q)) ||
        (w.author && w.author.toLowerCase().includes(q))
      );
    });
  }, [userWallpapers, query]);

  // 3. Unsplash Fetching
  const loadPhotos = useCallback(async (searchQuery = '', pageNum = 1, isAppend = false) => {
    // 1. NON-REACTIVE FETCHING LOCK
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    const currentRequestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const data = searchQuery.trim()
        ? await searchWallpapers(searchQuery, pageNum)
        : await fetchTrendingWallpapers(pageNum);
      
      // ABORT IF STALE
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      // REQUIREMENT: Randomize when page is refreshed manually (apply on page 1 load)
      let finalBatch = data;
      if (pageNum === 1 && !searchQuery.trim()) {
        finalBatch = shuffleArray(data);
      }

      if (searchQuery.trim()) {
        // ── STABLE SEARCH DISPLAY LOGIC ──
        if (pageNum === 1) {
          // Perform local filtering INSIDE the callback to avoid closure staleness
          const q = searchQuery.toLowerCase();
          const localMatches = userWallpapersRef.current.filter(w => (
            (w.title && w.title.toLowerCase().includes(q)) ||
            (w.category && w.category.toLowerCase().includes(q)) ||
            (w.author && w.author.toLowerCase().includes(q))
          ));

          // Merge matches from local + remote and shuffle ONCE
          const combined = [...localMatches, ...data];
          const unique = Array.from(new Map(combined.map(i => [i.id, i])).values());
          setSearchResults(shuffleArray(unique));
        } else {
          // Just append new search results to the end
          setSearchResults(prev => {
            const combined = [...prev, ...data];
            return Array.from(new Map(combined.map(i => [i.id, i])).values());
          });
        }
      } else {
        setApiWallpapers(data); 
        
        // ── STABLE TRENDING DISPLAY LOGIC ──
        if (pageNum === 1) {
          // Merge with current user wallpapers and shuffle ONCE
          const combo = [...userWallpapers, ...data];
          const unique = Array.from(new Map(combo.map(i => [i.id, i])).values());
          setDisplayWallpapers(shuffleArray(unique));
        } else {
          // Just append new results to the existing shuffled mass
          setDisplayWallpapers(prev => {
            const combined = [...prev, ...data];
            return Array.from(new Map(combined.map(i => [i.id, i])).values());
          });
        }
      }
      
      setHasMore(data.length > 0);
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
  }, [userWallpapers]); // Stable callback

  // 5. FIX FETCH TIMING (Paginate when page state increases)
  useEffect(() => {
    if (page > 1) {
      loadPhotos(query, page, true);
    }
  }, [page]);

  // RESET ON NEW SEARCH
  useEffect(() => {
    setPage(1);
    setSearchResults([]);
    setHasMore(true);
    if (query.trim()) {
      loadPhotos(query, 1, false);
    }
  }, [query]);

  // Load Unsplash on mount (only for API part)
  useEffect(() => {
    loadPhotos('', 1, false);
  }, [loadPhotos]);

  // 7. Initial merge when userWallpapers arrive (if Unsplash Page 1 is already there)
  useEffect(() => {
    if (userWallpapers.length > 0 && displayWallpapers.length > 0 && !query.trim()) {
      setDisplayWallpapers(prev => {
        const hasUser = prev.some(w => w.source === 'user');
        if (hasUser) return prev; 
        
        const combined = [...userWallpapers, ...prev];
        const unique = Array.from(new Map(combined.map(i => [i.id, i])).values());
        return shuffleArray(unique);
      });
    }
  }, [userWallpapers, query, displayWallpapers.length]);

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
    loadPhotos('', 1, false);
  }, [loadPhotos]);

  // ── Prepend an uploaded wallpaper ──
  const prependWallpaper = useCallback((wallpaper) => {
    setUserWallpapers(prev => [wallpaper, ...prev]);
    setDisplayWallpapers(prev => [wallpaper, ...prev]);
    setSearchResults(prev => [wallpaper, ...prev]);
  }, []);

  // ── Remove a deleted wallpaper ──
  const removeWallpaper = useCallback((id) => {
    setUserWallpapers(prev => prev.filter(w => w.id !== id));
    setDisplayWallpapers(prev => prev.filter(w => w.id !== id));
    setSearchResults(prev => prev.filter(w => w.id !== id));
  }, []);
  


  return { 
    wallpapers, loading, error, query, search, clearSearch, loadMore, hasMore, 
    prependWallpaper, removeWallpaper
  };
};

export default useWallpapers;
