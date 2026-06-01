import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchTrendingWallpapers, searchWallpapers } from '../services/unsplashApi';
import { fetchSupabaseWallpapers } from '../services/supabaseApi';
import { shuffleArray, createSeededRandom } from '../constants/discovery';

const EXPLORE_QUERIES = [
  'minimalist desktop', 'neon cyberpunk', 'cinematic landscape',
  'cozy lofi', 'celestial space', 'dark urban', 'pastel gradient',
  'nature aesthetic', 'architecture clean', 'moody rainy',
  'abstract oil painting', 'retro wave synth', 'organic textures',
  'urban exploring', 'mountain peak', 'forest fog', 'ocean waves',
  'minimalist interior', 'cyberpunk girl', 'future tech',
  'vintage film', 'street photography', 'brutalist architecture'
];

const QUERY_MAPPING = {
  'architecture': 'architecture clean aesthetic',
  'city': 'city aesthetic landscape',
  'anime': 'anime wallpaper landscape',
  'minimal': 'minimalist desktop',
  'space': 'celestial space landscape',
  'cars': 'supercars landscape wallpaper',
  'cozy': 'cozy lofi aesthetic',
  'dreamy': 'dreamy wallpaper aesthetic',
  'gaming': 'gaming setup rgb desktop',
  'study': 'study lofi aesthetic',
  'night drive': 'night drive aesthetic'
};

const CATEGORIES_LIST = [
  'Anime', 'Nature', 'Minimal', 'Cars', 'Space', 'Architecture',
  'Cyberpunk', 'Dark', 'Dreamy', 'City', 'Cozy', 'Abstract',
  'Gaming', 'Formula 1', 'Rainy', 'Night Drive',
  // Additional categories from CategoriesDiscovery
  'Purple Aesthetic', 'Calm', 'Productivity', 'Study',
].map(c => c.toLowerCase());

const isCategoryQuery = (q) => q ? CATEGORIES_LIST.includes(q.toLowerCase().trim()) : false;

const useWallpapers = () => {
  const [sessionSeed]      = useState(() => Date.now() ^ Math.floor(Math.random() * 1000000));
  const searchCacheRef     = useRef({}); // In-memory cache for Unsplash search queries
  const [userWallpapers,    setUserWallpapers]    = useState([]);
  const [homeFeed,          setHomeFeed]          = useState([]);
  const [exploreFeed,       setExploreFeed]       = useState([]);
  const [categoriesFeed,    setCategoriesFeed]    = useState([]);
  const [searchResults,     setSearchResults]     = useState([]);
  
  const [loading,           setLoading]           = useState(false);
  const [homeLoading,       setHomeLoading]       = useState(false);
  const [exploreLoading,    setExploreLoading]    = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [error,             setError]             = useState(null);
  const [query,             setQuery]             = useState('');
  
  const [homePage,          setHomePage]          = useState(1);
  const [explorePage,       setExplorePage]       = useState(1);
  const [categoriesPage,    setCategoriesPage]    = useState(1);
  const [communityPage,     setCommunityPage]     = useState(1);
  const [searchHasMore,     setSearchHasMore]     = useState(true);
  const [communityHasMore,  setCommunityHasMore]  = useState(true);

  // ── Stable Refs to Prevent Infinite Loops & Race Conditions ──
  const userWallpapersRef = useRef([]);
  const homeFeedRef = useRef([]);
  const exploreFeedRef = useRef([]);
  const homePageRef = useRef(1);
  const explorePageRef = useRef(1);
  const categoriesPageRef = useRef(1);
  const communityPageRef = useRef(1);
  const categoriesRequestSeq = useRef(0);
  // Per-feed loading refs — prevent one feed's in-flight request from blocking another
  const homeLoadingRef       = useRef(false);
  const exploreLoadingRef    = useRef(false);
  const categoriesLoadingRef = useRef(false);
  const communityLoadingRef  = useRef(false);
  // Shared UI loading ref (for skeleton display gating)
  const loadingRef = useRef(false);

  const syncGlobalLoading = useCallback(() => {
    setLoading(
      homeLoadingRef.current ||
      exploreLoadingRef.current ||
      categoriesLoadingRef.current ||
      communityLoadingRef.current
    );
  }, []);

  useEffect(() => {
    userWallpapersRef.current = userWallpapers;
  }, [userWallpapers]);

  useEffect(() => {
    homeFeedRef.current = homeFeed;
  }, [homeFeed]);

  useEffect(() => {
    exploreFeedRef.current = exploreFeed;
  }, [exploreFeed]);

  const getUniqueById = useCallback((items) => {
    return Array.from(
      new Map(items.filter(item => item != null && item.id != null).map(item => [item.id, item])).values()
    );
  }, []);

  const getPopularScore = (w) => (w.likes || 0) + (w.downloads || 0) * 1.5;

  // ── 1. Load Home Feed (Curated, Popular + Recent) ───────────────────
  const loadHomeFeed = useCallback(async (pageNum = 1) => {
    if (homeLoadingRef.current) {
      return;
    }
    if (pageNum === 1) homePageRef.current = 1;
    homeLoadingRef.current = true;
    loadingRef.current = true;
    setHomeLoading(true);
    syncGlobalLoading();
    setError(null);
    try {
      const pageSize = 30;
      // Use sessionSeed to vary the starting page or order of trending wallpapers slightly
      const homeRng = createSeededRandom(sessionSeed + pageNum * 7);
      const unsplashPage = pageNum === 1 ? (Math.floor(homeRng() * 15) + 1) : pageNum;

      let unsplashData = [];
      let supabaseData = [];

      try {
        const [uData, sData] = await Promise.all([
          fetchTrendingWallpapers(unsplashPage, 20),
          fetchSupabaseWallpapers(null, pageNum, pageSize) // Increased batch size for more variety
        ]);
        unsplashData = uData;
        supabaseData = sData;
      } catch (apiErr) {
        console.error("Home feed Unsplash fetch failed, attempting Supabase fallback:", apiErr);
        supabaseData = await fetchSupabaseWallpapers(null, pageNum, pageSize);
        unsplashData = [];
      }

      // Update community pool with new Supabase data - always append uniquely to prevent race conditions
      setUserWallpapers(prev => getUniqueById([...prev, ...supabaseData]));
      setCommunityHasMore(supabaseData.length >= pageSize);

      // Shuffle Unsplash data slightly for more freshness
      let mixed = shuffleArray([...unsplashData], homeRng);

      if (mixed.length === 0) {
        // Fallback: If Unsplash failed, use community wallpapers
        mixed = shuffleArray([...supabaseData], homeRng).map(item => ({ ...item, status: 'approved' }));
      } else if (supabaseData.length > 0) {
        // Blending: Insert fewer community wallpapers (1 to 2) for Unsplash prominence and high randomization
        const communityRng = createSeededRandom(sessionSeed + pageNum * 127 + 555);
        
        // Use a mix of current batch and previously loaded wallpapers
        const pool = getUniqueById([...userWallpapersRef.current, ...supabaseData]);
        const shuffledPool = shuffleArray([...pool], communityRng);
        
        // Pick a randomized count of 1 to 2 community items
        const numInsertions = Math.min(shuffledPool.length, Math.floor(communityRng() * 2) + 1);
        const toInsert = shuffledPool.slice(0, numInsertions);
        
        // Randomize insertion positions (avoiding first 2 slots for Unsplash prominence)
        const positions = [];
        const posRng = createSeededRandom(sessionSeed + pageNum * 89 + 999);
        for (let i = 0; i < toInsert.length; i++) {
          const minPos = 2;
          const maxPos = mixed.length;
          const pos = minPos + Math.floor(posRng() * (maxPos - minPos));
          positions.push(pos);
        }
        // Sort descending to splice without shifting indices
        positions.sort((a, b) => b - a);
        
        positions.forEach((pos, idx) => {
          if (toInsert[idx]) {
            mixed.splice(pos, 0, { ...toInsert[idx], status: 'approved' });
          }
        });
      }

      setHomeFeed(prev => {
        const next = getUniqueById(pageNum === 1 ? mixed : [...prev, ...mixed]);
        return next;
      });
    } catch (err) {
      console.error("Home feed fetch error:", err);
      setError(err.message || 'Failed to load Home wallpapers.');
    } finally {
      homeLoadingRef.current = false;
      loadingRef.current = exploreLoadingRef.current || categoriesLoadingRef.current;
      setHomeLoading(false);
      syncGlobalLoading();
    }
  }, [getUniqueById, syncGlobalLoading, sessionSeed]);

  // ── 2. Load Explore Feed (Endless, Diverse, Balanced) ───────────────
  const loadExploreFeed = useCallback(async (pageNum = 1) => {
    if (exploreLoadingRef.current) {
      return;
    }
    if (pageNum === 1) explorePageRef.current = 1;
    exploreLoadingRef.current = true;
    loadingRef.current = true;
    setExploreLoading(true);
    syncGlobalLoading();
    setError(null);
    try {
      const pageSize = 30;
      // Create a shuffle of EXPLORE_QUERIES based on sessionSeed
      const queryRng = createSeededRandom(sessionSeed);
      const shuffledQueries = shuffleArray([...EXPLORE_QUERIES], queryRng);
      
      const queryIdx = (pageNum - 1) % shuffledQueries.length;
      const exploreQuery = shuffledQueries[queryIdx];

      const exploreRng = createSeededRandom(sessionSeed + pageNum * 31 + queryIdx * 17);
      const stableUnsplashPage = Math.floor(exploreRng() * 4) + 1;

      let unsplashData = [];
      let supabaseData = [];

      try {
        const [uData, sData] = await Promise.all([
          searchWallpapers(exploreQuery, stableUnsplashPage, 20),
          fetchSupabaseWallpapers(null, pageNum, pageSize) // Increased for more variety
        ]);
        unsplashData = uData;
        supabaseData = sData;
      } catch (apiErr) {
        console.error("Explore feed Unsplash fetch failed, using community fallback:", apiErr);
        unsplashData = [];
        supabaseData = await fetchSupabaseWallpapers(null, pageNum, pageSize);
      }

      // Update community pool with new Supabase data - always append uniquely
      setUserWallpapers(prev => getUniqueById([...prev, ...supabaseData]));
      setCommunityHasMore(supabaseData.length >= pageSize);

      let communityPool = pageNum === 1 ? supabaseData : userWallpapersRef.current;

      // Keep all Unsplash results — homeIds filtering was cutting ~20 results to ~8
      // Explore uses different search queries than Home so overlap is naturally minimal
      const mixed = shuffleArray([...unsplashData], exploreRng);

      // Interleave community items into the explore feed
      const existingExploreIds = new Set(exploreFeedRef.current.filter(w => w != null && w.id != null).map(w => w.id));
      const freshCommunity = supabaseData.filter(w => w != null && w.id != null && !existingExploreIds.has(w.id));
      const communityRng = createSeededRandom(sessionSeed + pageNum * 53);
      const shuffledCommunity = shuffleArray(freshCommunity, communityRng);

      let inserted = 0;
      let cIdx = 0;
      for (let i = 2 + Math.floor(exploreRng() * 2); i < mixed.length && cIdx < shuffledCommunity.length && inserted < 8; i += 3 + Math.floor(exploreRng() * 2)) {
        mixed.splice(i, 0, { ...shuffledCommunity[cIdx++], status: 'approved' });
        inserted++;
        i++;
      }
      // Append any remaining community items
      while (cIdx < shuffledCommunity.length && inserted < 8 && mixed.length < 28) {
        mixed.push({ ...shuffledCommunity[cIdx++], status: 'approved' });
        inserted++;
      }

      setExploreFeed(prev => {
        const next = getUniqueById(pageNum === 1 ? mixed : [...prev, ...mixed]);
        return next;
      });
    } catch (err) {
      console.error("Explore feed fetch error:", err);
      setError(err.message || 'Failed to load Explore wallpapers.');
    } finally {
      exploreLoadingRef.current = false;
      loadingRef.current = homeLoadingRef.current || categoriesLoadingRef.current;
      setExploreLoading(false);
      syncGlobalLoading();
    }
  }, [getUniqueById, syncGlobalLoading, sessionSeed]);

  // ── 3. Load Search/Mood Results (Paginated on request) ─────────────
  const loadSearchPhotos = useCallback(async (searchQuery = '', pageNum = 1) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    // Per-feed gate for categories
    if (categoriesLoadingRef.current && pageNum !== 1) {
      return;
    }
    const requestQuery = QUERY_MAPPING[searchQuery.toLowerCase()] || searchQuery;
    const cacheKey = `${requestQuery}_${pageNum}`;

    // Cache lookup
    if (searchCacheRef.current[cacheKey]) {
      const cached = searchCacheRef.current[cacheKey];
      
      setSearchResults(prev => {
        const next = pageNum === 1 ? cached.data : getUniqueById([...prev, ...cached.data]);
        return next;
      });
      setSearchHasMore(cached.hasMore);
      categoriesLoadingRef.current = false;
      setCategoriesLoading(false);
      syncGlobalLoading();
      return;
    }
    categoriesLoadingRef.current = true;
    loadingRef.current = true;
    setCategoriesLoading(true);
    syncGlobalLoading();
    setError(null);
    const requestSeq = pageNum === 1
      ? ++categoriesRequestSeq.current
      : categoriesRequestSeq.current;
    // Reset hasMore on a fresh search so switching moods doesn't permanently halt the observer
    if (pageNum === 1) setSearchHasMore(true);
    try {
      const pageSize = 30; // Standardized to 30 for Supabase consistency
      let apiData = [];
      let supabaseData = [];
      const isCat = isCategoryQuery(searchQuery);

      try {
        const [aData, sData] = await Promise.all([
          searchWallpapers(requestQuery, pageNum, 20),
          fetchSupabaseWallpapers(searchQuery, pageNum, pageSize, isCat)
        ]);
        apiData = aData;
        supabaseData = sData;
      } catch (apiErr) {
        console.error("Search Unsplash fetch failed, using community fallback:", apiErr);
        apiData = [];
        supabaseData = await fetchSupabaseWallpapers(searchQuery, pageNum, pageSize, isCat);
      }

      // Update community pool with new Supabase data - always append uniquely
      setUserWallpapers(prev => getUniqueById([...prev, ...supabaseData]));
      setCommunityHasMore(supabaseData.length >= pageSize);

      let mixed;
      if (pageNum === 1) {
        // Combine results. Supabase matches are prioritized or mixed.
        if (supabaseData.length > 0) {
          mixed = [...supabaseData, ...apiData];
        } else {
          mixed = apiData;
        }
      } else {
        // For subsequent pages, combine Supabase and Unsplash results
        mixed = [...supabaseData, ...apiData];
      }

      if (requestSeq !== categoriesRequestSeq.current) return;

      // Cache the computed result (including fallbacks or whatever was actually displayed)
      // Determine hasMore based on whether we got full pages from both sources
      const hasMoreSupabase = supabaseData.length === pageSize;
      const hasMoreUnsplash = apiData.length === 20;
      const hasMoreResults = hasMoreSupabase || hasMoreUnsplash;
      
      searchCacheRef.current[cacheKey] = {
        data: mixed,
        hasMore: hasMoreResults
      };

      setSearchResults(prev => {
        const next = getUniqueById(pageNum === 1 ? mixed : [...prev, ...mixed]);
        return next;
      });
      // Set hasMore based on whether we got full pages
      setSearchHasMore(hasMoreResults);
    } catch (err) {
      console.error("Search fetch error:", err);
      setError(err.message || 'Failed to search wallpapers.');
      setSearchHasMore(false);
    } finally {
      if (requestSeq !== categoriesRequestSeq.current) return;
      categoriesLoadingRef.current = false;
      loadingRef.current = homeLoadingRef.current || exploreLoadingRef.current;
      setCategoriesLoading(false);
      syncGlobalLoading();
    }
  }, [getUniqueById, syncGlobalLoading]);

  // ── 4. Load Community Wallpapers (FragVerse Filter) ────────────────
  const loadCommunityWallpapers = useCallback(async (pageNum = 1, searchQuery = '') => {
    if (communityLoadingRef.current) {
      return;
    }
    if (pageNum === 1) communityPageRef.current = 1;
    communityLoadingRef.current = true;
    loadingRef.current = true;
    setLoading(true);
    syncGlobalLoading();
    setError(null);
    try {
      const pageSize = 30;
      const isCat = isCategoryQuery(searchQuery);
      // Fetch wallpapers with category filter or general search from Supabase
      const supabaseData = await fetchSupabaseWallpapers(searchQuery || null, pageNum, pageSize, isCat);
      
      let processedBatch = [...supabaseData];
      
      // Shuffle the incoming batch for more variety in position (only for non-search views)
      if (pageNum === 1 && !searchQuery.trim()) {
        const communityRng = createSeededRandom(sessionSeed + pageNum * 211);
        processedBatch = shuffleArray(processedBatch, communityRng);
      }

      setUserWallpapers(prev => {
        // Always use getUniqueById to prevent duplicates and race conditions
        const next = getUniqueById([...prev, ...processedBatch]);
        return next;
      });
      
      // Update hasMore based on whether we got a full page from Supabase
      setCommunityHasMore(supabaseData.length >= pageSize);
    } catch (err) {
      console.error("Community wallpapers fetch error:", err);
      setError(err.message || 'Failed to load community wallpapers.');
      setCommunityHasMore(false);
    } finally {
      communityLoadingRef.current = false;
      loadingRef.current = homeLoadingRef.current || exploreLoadingRef.current || categoriesLoadingRef.current;
      setLoading(false);
      syncGlobalLoading();
    }
  }, [getUniqueById, syncGlobalLoading, sessionSeed]);

  // ── 5. Lifecycle Mount / Synchronization ───────────────────────────
  // Handle all initial mounts, search query changes, and search query clears in a single robust effect
  useEffect(() => {
    if (query.trim()) {
      setSearchResults([]);
      loadSearchPhotos(query, 1);
      // Also reset community feed for the new search
      setUserWallpapers([]);
      loadCommunityWallpapers(1, query);
    } else {
      setSearchResults([]);
      categoriesLoadingRef.current = false;
      setCategoriesLoading(false);
      syncGlobalLoading();
      loadHomeFeed(1);
      loadExploreFeed(1);
      loadCommunityWallpapers(1, '');
    }
  }, [query, loadSearchPhotos, loadHomeFeed, loadExploreFeed, loadCommunityWallpapers, syncGlobalLoading]);

  // ── 6. Expose Page-Aware Feed Decoupling ───────────────────────────
  const homeWallpapers = useMemo(() => {
    return query.trim() ? searchResults : homeFeed;
  }, [query, searchResults, homeFeed]);

  const exploreWallpapers = useMemo(() => {
    return query.trim() ? searchResults : exploreFeed;
  }, [query, searchResults, exploreFeed]);

  const categoriesWallpapers = useMemo(() => {
    return query.trim() ? searchResults : categoriesFeed;
  }, [query, searchResults, categoriesFeed]);

  const search = useCallback((q) => {
    setQuery(q);
    setHomePage(1);
    setExplorePage(1);
    setCategoriesPage(1);
    homePageRef.current = 1;
    explorePageRef.current = 1;
    categoriesPageRef.current = 1;
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setHomePage(1);
    setExplorePage(1);
    setCategoriesPage(1);
    homePageRef.current = 1;
    explorePageRef.current = 1;
    categoriesPageRef.current = 1;
    setSearchResults([]);
    categoriesLoadingRef.current = false;
    setCategoriesLoading(false);
    syncGlobalLoading();
  }, [syncGlobalLoading]);

  // Page-specific paginators — each uses its own per-feed loading ref
  const loadMoreHome = useCallback(() => {
    if (homeLoadingRef.current) {
      return;
    }
    const next = homePageRef.current + 1;
    homePageRef.current = next;
    setHomePage(next);
    if (query.trim()) {
      loadSearchPhotos(query, next);
    } else {
      loadHomeFeed(next);
    }
  }, [query, loadSearchPhotos, loadHomeFeed]);

  const loadMoreExplore = useCallback(() => {
    if (exploreLoadingRef.current) {
      return;
    }
    const next = explorePageRef.current + 1;
    explorePageRef.current = next;
    setExplorePage(next);
    if (query.trim()) {
      loadSearchPhotos(query, next);
    } else {
      loadExploreFeed(next);
    }
  }, [query, loadSearchPhotos, loadExploreFeed]);

  const loadMoreCategories = useCallback(() => {
    if (categoriesLoadingRef.current) {
      return;
    }
    if (!query.trim()) {
      return;
    }
    const next = categoriesPageRef.current + 1;
    categoriesPageRef.current = next;
    setCategoriesPage(next);
    loadSearchPhotos(query, next);
  }, [query, loadSearchPhotos]);

  const loadMoreCommunity = useCallback(() => {
    if (communityLoadingRef.current) {
      return;
    }
    const next = communityPageRef.current + 1;
    communityPageRef.current = next;
    setCommunityPage(next);
    loadCommunityWallpapers(next, query);
  }, [loadCommunityWallpapers, query]);

  // ── 7. Curation Helpers (Prepend/Remove) ──────────────────────────
  const prependWallpaper = useCallback((wallpaper) => {
    setUserWallpapers(prev => [wallpaper, ...prev]);
    setHomeFeed(prev => [wallpaper, ...prev]);
    setExploreFeed(prev => [wallpaper, ...prev]);
    // Clear search cache so new uploads show up immediately in categories
    searchCacheRef.current = {};
  }, []);

  const removeWallpaper = useCallback((id) => {
    const filterFn = w => w != null && w.id != null && w.id !== id;
    setUserWallpapers(prev => prev.filter(filterFn));
    setHomeFeed(prev => prev.filter(filterFn));
    setExploreFeed(prev => prev.filter(filterFn));
    setSearchResults(prev => prev.filter(filterFn));
  }, []);

  const isReloading = loading && (homePage === 1 || explorePage === 1 || categoriesPage === 1);

  // For Home/Explore: always true (endless). For category/search: track Unsplash result presence.
  // Per-page hasMore for finer-grained observer control
  const homeHasMore    = true; // Unsplash trending never truly ends
  const exploreHasMore = true; // Explore cycles through 12 queries endlessly
  const categoriesHasMore = query.trim() ? searchHasMore : false;

  return {
    homeWallpapers,
    exploreWallpapers,
    categoriesWallpapers,
    searchResults,
    userWallpapers,
    loading,
    homeLoading,
    exploreLoading,
    categoriesLoading,
    error,
    query,
    search,
    clearSearch,
    loadMoreHome,
    loadMoreExplore,
    loadMoreCategories,
    loadMoreCommunity,
    loadCommunityWallpapers,
    homePage,
    explorePage,
    categoriesPage,
    communityPage,
    // Individual hasMore flags so each page's observer can be independently controlled
    homeHasMore,
    exploreHasMore,
    categoriesHasMore,
    communityHasMore,
    // Unified hasMore for backwards compatibility
    hasMore: query.trim() ? searchHasMore : true,
    prependWallpaper,
    removeWallpaper,
    isReloading,
    sessionSeed,
    homeLoadingRef,
    exploreLoadingRef,
    categoriesLoadingRef,
    communityLoadingRef
  };
};

export default useWallpapers;
