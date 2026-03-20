import { useState, useEffect, useCallback } from 'react';
import { fetchTrendingWallpapers, searchWallpapers } from '../services/unsplashApi';

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
  const [wallpapers, setWallpapers]  = useState([]);
  const [loading, setLoading]        = useState(false);
  const [error, setError]            = useState(null);
  const [query, setQuery]            = useState('');
  const [page, setPage]              = useState(1);
  const [hasMore, setHasMore]        = useState(true);

  const loadPhotos = useCallback(async (searchQuery = '', pageNum = 1, isAppend = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = searchQuery.trim()
        ? await searchWallpapers(searchQuery, pageNum)
        : await fetchTrendingWallpapers(pageNum);
      
      if (isAppend) {
        setWallpapers(prev => {
          // Filter out duplicates just in case Unsplash sends some
          const newPhotos = data.filter(p => !prev.some(existing => existing.id === p.id));
          return [...prev, ...newPhotos];
        });
      } else {
        setWallpapers(data);
      }
      
      // If we got fewer results than requested, we've probably hit the end
      setHasMore(data.length > 0);
    } catch (err) {
      setError(err.message || 'Failed to load wallpapers.');
      if (!isAppend) setWallpapers([]); 
    } finally {
      setLoading(false);
    }
  }, []);

  // Load trending on mount
  useEffect(() => {
    loadPhotos('', 1, false);
  }, [loadPhotos]);

  // Search or category change resets everything
  const search = useCallback(
    (q) => {
      setQuery(q);
      setPage(1);
      setHasMore(true);
      loadPhotos(q, 1, false);
    },
    [loadPhotos]
  );

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadPhotos(query, nextPage, true);
  }, [loading, hasMore, page, query, loadPhotos]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setPage(1);
    setHasMore(true);
    loadPhotos('', 1, false);
  }, [loadPhotos]);

  return { wallpapers, loading, error, query, search, clearSearch, loadMore, hasMore };
};

export default useWallpapers;
