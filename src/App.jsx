import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Navbar          from './components/Navbar';
import Sidebar         from './components/Sidebar';
import HeroSection     from './components/HeroSection';
import WallpaperGrid   from './components/WallpaperGrid';
import WallpaperModal  from './components/WallpaperModal';
import UploadModal     from './components/UploadModal';
import LoginModal      from './components/LoginModal';
import AdminDashboard  from './components/AdminDashboard';
import ExplorePage     from './pages/ExplorePage';
import CategoriesPage  from './pages/CategoriesPage';
import useWallpapers   from './hooks/useWallpapers';
import { supabase } from './services/supabase';
import { fetchUserWallpapers, deleteUserOrAdminWallpaper, getOptimizedImageUrl } from './services/supabaseApi';
import { fetchUnsplashPhotoById } from './services/unsplashApi';
import LoginPage       from './components/LoginPage';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import GlobalSearchModal from './components/GlobalSearchModal';
import StickySearchBar   from './components/explore/StickySearchBar';
import StartupReveal     from './components/StartupReveal';


function App() {
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'mohdsaifansari8888@gmail.com'; 
  const { 
    homeWallpapers, exploreWallpapers, categoriesWallpapers, searchResults, userWallpapers, 
    loading, homeLoading, exploreLoading, categoriesLoading, error, query, search, clearSearch,
    loadMoreHome, loadMoreExplore, loadMoreCategories, loadMoreCommunity, loadCommunityWallpapers,
    homePage, explorePage, categoriesPage, communityPage,
    homeHasMore, exploreHasMore, categoriesHasMore, communityHasMore,
    hasMore, prependWallpaper, removeWallpaper, isReloading, sessionSeed,
    homeLoadingRef, exploreLoadingRef, categoriesLoadingRef, communityLoadingRef
  } = useWallpapers();

  const [revealPhase,       setRevealPhase]       = useState(() => {
    return sessionStorage.getItem("fragverse-intro-played") === "true" ? "completed" : "idle";
  });

  const [user,              setUser]              = useState(null);
  const [activeCategory,    setActiveCategory]    = useState(null);
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [uploadModalOpen,   setUploadModalOpen]   = useState(false);
  const [loginModalOpen,    setLoginModalOpen]    = useState(false);
  const [loginModalAdminMode, setLoginModalAdminMode] = useState(false);
  const [viewMode,          setViewMode]          = useState('all'); // 'all' | 'fragverse'
  const [showToast,         setShowToast]         = useState(false);
  const [toastMessage,      setToastMessage]      = useState('');
  const [theme,             setTheme]             = useState(() => localStorage.getItem('theme') || 'light');
  const [searchQuery,       setSearchQuery]       = useState('');
  const [activeNav,         setActiveNav]         = useState('home');
  const [searchOpen,        setSearchOpen]        = useState(false);

  const [favoriteIds,       setFavoriteIds]       = useState([]);

  const [fetchedFavorites,  setFetchedFavorites]  = useState([]);
  const [favoritesLoading,   setFavoritesLoading]  = useState(false);

  const [userUploads,       setUserUploads]       = useState([]);
  const [userUploadsLoading, setUserUploadsLoading] = useState(false);
  const [userUploadsError,   setUserUploadsError]   = useState(null);
  const [pendingCount,       setPendingCount]       = useState(0);

  const favoritesRequestSeq = useRef(0);
  const missingFavoritesRequestSeq = useRef(0);
  const uploadsRequestSeq = useRef(0);

  // Startup Reveal Animation effects
  useEffect(() => {
    if (revealPhase === 'completed') return;

    const timerUI = setTimeout(() => {
      setRevealPhase('ui-reveal');
    }, 1800);

    const timerGrid = setTimeout(() => {
      setRevealPhase('grid-reveal');
    }, 2300);

    return () => {
      clearTimeout(timerUI);
      clearTimeout(timerGrid);
    };
  }, [revealPhase]);

  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem('fragverse-intro-played', 'true');
    setRevealPhase('completed');
  }, []);

  // Unified pool of all wallpapers
  const wallpapers = useMemo(() => {
    const map = new Map();
    [...homeWallpapers, ...exploreWallpapers, ...categoriesWallpapers, ...fetchedFavorites, ...userWallpapers].forEach(w => {
      if (w != null && w.id != null) map.set(w.id, w);
    });
    return Array.from(map.values());
  }, [homeWallpapers, exploreWallpapers, categoriesWallpapers, fetchedFavorites, userWallpapers]);

  // Stable ref so fetchMissingFavorites can read the latest pool without re-running
  const wallpapersRef = useRef([]);
  useEffect(() => {
    wallpapersRef.current = wallpapers;
  }, [wallpapers]);

  const favoriteIdsRef = useRef(favoriteIds);
  useEffect(() => {
    favoriteIdsRef.current = favoriteIds;
  }, [favoriteIds]);

  const handleToggleFavorite = useCallback(async (id) => {
    if (!user || !user.isLoggedIn) {
      setLoginModalOpen(true);
      return;
    }

    const isAdding = !favoriteIdsRef.current.includes(id);

    try {
      if (isAdding) {

        // 1. Prevent duplicate database insertions
        const { data: existing, error: checkError } = await supabase
          .from('favorites')
          .select('wallpaper_id')
          .eq('user_id', user.id)
          .eq('wallpaper_id', id);

        if (checkError) {
          console.error("Error checking favorite duplicates:", checkError);
        }

        if (!checkError && existing && existing.length > 0) {
          setFavoriteIds(prev => prev.includes(id) ? prev : [...prev, id]);
          return;
        }

        // 2. Perform insert
        const { error } = await supabase
          .from('favorites')
          .insert({ 
            user_id: user.id, 
            wallpaper_id: id,
          });

        // Perform insert

        if (!error) {
          setFavoriteIds(prev => prev.includes(id) ? prev : [...prev, id]);
        } else {
          if (error.code === '23505') {
            setFavoriteIds(prev => prev.includes(id) ? prev : [...prev, id]);
          } else {
            console.error("Supabase insert error:", error);
          }
        }
      } else {
        // Perform delete
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('wallpaper_id', id);

        if (!error) {
          setFavoriteIds(prev => prev.filter(x => x !== id));
        } else {
          console.error("Supabase delete error:", error);
        }
      }
    } catch (err) {
      console.error("Error updating favorites in Supabase:", err);
    }
  }, [user]);

  // ── Load/Sync Favorites on Auth Change ───────────────────────────
  useEffect(() => {
    const loadFavorites = async () => {
      if (user && user.id) {
        const seq = ++favoritesRequestSeq.current;
        setFavoritesLoading(true);
        try {
          const { data, error } = await supabase
            .from('favorites')
            .select('wallpaper_id')
            .eq('user_id', user.id);

          if (seq !== favoritesRequestSeq.current) return;

          if (!error && data) {
            const favoriteIds = data.map(
              (fav) => fav.wallpaper_id
            );
            setFavoriteIds(favoriteIds);
            if (favoriteIds.length === 0) {
              setFavoritesLoading(false);
            }
          } else {
            console.warn("Supabase fetch failed", error);
            setFavoritesLoading(false);
          }
        } catch (err) {
          if (seq !== favoritesRequestSeq.current) return;
          console.warn("Error fetching favorites from Supabase", err);
          setFavoritesLoading(false);
        }
      } else {
        // Guest or logged out - clear favorites completely
        setFavoriteIds([]);
        setFetchedFavorites([]);
        setFavoritesLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  // ── Fetch User Uploads ──────────────────────────────────────────
  const loadUserUploads = useCallback(async () => {
    if (!user || !user.id) {
      setUserUploads([]);
      return;
    }
    const seq = ++uploadsRequestSeq.current;
    setUserUploadsLoading(true);
    setUserUploadsError(null);
    try {
      const data = await fetchUserWallpapers(user.id);
      if (seq !== uploadsRequestSeq.current) return;
      setUserUploads(data);
    } catch (err) {
      if (seq !== uploadsRequestSeq.current) return;
      console.error("Error fetching user wallpapers:", err);
      setUserUploadsError(err.message || 'Failed to load your wallpapers.');
    } finally {
      if (seq === uploadsRequestSeq.current) {
        setUserUploadsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (activeNav === 'your-wallpapers' && user) {
      loadUserUploads();
    }
  }, [activeNav, user, loadUserUploads]);

  // ── Update Pending Count (Admin Only) ───────────────────────────
  const updatePendingCount = useCallback(async () => {
    if (!user || user.email !== ADMIN_EMAIL) {
      setPendingCount(0);
      return;
    }
    try {
      const { count: dbCount, error } = await supabase
        .from('pending_wallpapers')
        .select('*', { count: 'exact', head: true });
      if (!error && dbCount !== null) {
        setPendingCount(dbCount);
      }
    } catch (err) {
      console.error("Error updating pending count:", err);
    }
  }, [user, ADMIN_EMAIL]);

  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      updatePendingCount();
    } else {
      setPendingCount(0);
    }
  }, [user, updatePendingCount]);

  // ── Auto-fetch details for missing favorited wallpapers ──────────
  useEffect(() => {
    const fetchMissingFavorites = async () => {
      if (!user || !user.id || !favoriteIds || favoriteIds.length === 0) {
        setFetchedFavorites([]);
        return;
      }

      const seq = ++missingFavoritesRequestSeq.current;
      setFavoritesLoading(true);
      try {
        // Use ref to avoid making this effect depend on wallpapers/fetchedFavorites
        // (which would create an infinite loop since fetchedFavorites is part of wallpapers)
        const allKnown = [...wallpapersRef.current, ...userWallpapers];
        const knownMap = new Map(allKnown.filter(Boolean).map(w => [w.id, w]));

        const missingIds = favoriteIds.filter(id => id && !knownMap.has(id));
        if (missingIds.length === 0) {
          if (seq === missingFavoritesRequestSeq.current) {
            setFavoritesLoading(false);
          }
          return;
        }

        const newFetched = [];

        const fetchPromises = missingIds.map(async (id) => {
          const isUuid = id.length === 36 || id.includes('-');
          if (!isUuid) {
            try {
              const photo = await fetchUnsplashPhotoById(id);
              if (photo) newFetched.push(photo);
            } catch (err) {
              console.error(`Error fetching Unsplash photo ${id}:`, err);
            }
          } else {
            try {
              const { data, error } = await supabase
                .from('wallpapers')
                .select('*')
                .eq('id', id)
                .maybeSingle();
              if (!error && data) {
                const normalized = {
                  id: data.id,
                  image: getOptimizedImageUrl(data.image_url),
                  thumb: getOptimizedImageUrl(data.thumbnail_url || data.image_url),
                  fullImage: data.image_url,
                  title: data.title || `Wallpaper by ${data.author}`,
                  author: data.author || 'Anonymous',
                  category: data.category || 'General',
                  created_at: data.created_at,
                  isSupabase: true,
                  source: data.source || 'user',
                  user_id: data.uploader_id || data.user_id,
                  description: data.description || '',
                  tags: data.tags || '',
                  status: data.status || 'approved'
                };
                newFetched.push(normalized);
              }
            } catch (err) {
              console.error(`Error fetching Supabase wallpaper ${id}:`, err);
            }
          }
        });

        await Promise.allSettled(fetchPromises);

        if (seq !== missingFavoritesRequestSeq.current) return;

        if (newFetched.length > 0) {
          setFetchedFavorites(prev => {
            const combined = [...prev, ...newFetched];
            const map = new Map();
            combined.forEach(w => {
              if (w && w.id) map.set(w.id, w);
            });
            return Array.from(map.values());
          });
        }
      } catch (err) {
        if (seq !== missingFavoritesRequestSeq.current) return;
        console.error("Error fetching missing favorites:", err);
      } finally {
        if (seq === missingFavoritesRequestSeq.current) {
          setFavoritesLoading(false);
        }
      }
    };

    fetchMissingFavorites();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favoriteIds, userWallpapers, user]);

  // ── Temporary debug logging removed ──

  // ── Synced path navigation helper ──
  const navigateTo = useCallback((navId) => {
    const startTime = performance.now();
    setActiveNav(navId);
    let path = '/';
    if (navId !== 'home') {
      path = `/${navId}`;
    }
    window.history.pushState(null, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ── Sync URL path with activeNav ──
  useEffect(() => {
    const handleLocation = () => {
      const startTime = performance.now();
      const path = window.location.pathname;
      let navId = 'home';
      if (path === '/login') {
        navId = 'login';
      } else if (path === '/admin') {
        navId = 'admin';
      } else if (path === '/explore') {
        navId = 'explore';
      } else if (path === '/categories') {
        navId = 'categories';
      } else if (path === '/favorites') {
        navId = 'favorites';
      } else if (path === '/your-wallpapers') {
        navId = 'your-wallpapers';
      } else {
        navId = 'home';
      }
      setActiveNav(navId);
    };
    window.addEventListener('popstate', handleLocation);
    handleLocation(); // Sync on mount
    return () => window.removeEventListener('popstate', handleLocation);
  }, []);

  // ── Scroll Position Cache & Preservation ─────────────────────────
  const scrollPositionsRef = useRef({
    home_all: 0,
    home_fragverse: 0,
    explore_all: 0,
    explore_fragverse: 0,
    categories_all: 0,
    categories_fragverse: 0,
  });

  const activeNavRefForScroll = useRef(activeNav);
  useEffect(() => {
    activeNavRefForScroll.current = activeNav;
  }, [activeNav]);

  useEffect(() => {
    const handleScroll = () => {
      const key = `${activeNavRefForScroll.current}_${viewMode}`;
      scrollPositionsRef.current[key] = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode]);

  useEffect(() => {
    if (activeNavRefForScroll.current !== 'home') return;
    const key = `${activeNavRefForScroll.current}_${viewMode}`;
    const targetScroll = scrollPositionsRef.current[key] || 0;
    const timer = setTimeout(() => {
      window.scrollTo({ top: targetScroll, behavior: 'instant' });
    }, 40);
    return () => clearTimeout(timer);
  }, [viewMode]);

  // ── Search Keyboard Shortcut (Ctrl+K) ───────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Theme Sync ──────────────────────────────────────────────────
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  // ── Auth Logic (Temporary/Local) ───────────────────────────────
  useEffect(() => {
    // 1. Initial restore from localStorage
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    // 2. Real-time Firebase Auth listener
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const loggedInUser = {
          name: fbUser.displayName || fbUser.email.split('@')[0],
          email: fbUser.email,
          isLoggedIn: true,
          id: fbUser.uid,
          avatar: fbUser.photoURL
        };
        setUser(loggedInUser);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
      } else {
        setUser(prevUser => {
          if (prevUser) {
            setViewMode('all');
            setActiveNav('home');
            window.history.pushState(null, '', '/');
          }
          return null;
        });
        localStorage.removeItem('user');
      }
    });

    return () => unsub();
  }, []);

  const handleLoginSuccess = useCallback((fbUser, isAdminMode = false) => {
    if (isAdminMode && fbUser.email !== ADMIN_EMAIL) {
      alert("Access Denied: You are not authorized as an administrator.");
      signOut(auth);
      setLoginModalOpen(false);
      return;
    }

    const loggedInUser = {
      name: fbUser.displayName || fbUser.email.split('@')[0],
      email: fbUser.email,
      isLoggedIn: true,
      id: fbUser.uid,
      avatar: fbUser.photoURL
    };

    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    
    // Close modal if open
    setLoginModalOpen(false);
    
    // Redirect to home page
    navigateTo('home');
    
    setToastMessage(fbUser.email === ADMIN_EMAIL ? "Admin login activated!" : "Logged in successfully!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, [ADMIN_EMAIL, navigateTo]);

  // ── Secret Shortcut ───────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      // Ctrl + Shift + L
      if (e.ctrlKey && e.shiftKey && (e.key.toLowerCase() === 'l' || e.code === 'KeyL')) {
        e.preventDefault();
        if (user && user.isLoggedIn && user.email === ADMIN_EMAIL) {
          setToastMessage(`Logged in already as Admin!`);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        } else {
          setLoginModalAdminMode(true);
          setLoginModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [user, ADMIN_EMAIL]);

  const handleMyUploads = useCallback(() => {
    navigateTo('your-wallpapers');
  }, [navigateTo]);

  const handleBackToHome = useCallback(() => {
    setViewMode('all');
  }, []);

  // ── Favorites Fetching (REMOVED) ───────────────────────────────

  const isAdmin = user && user.isLoggedIn && user.email === ADMIN_EMAIL;

  // ── Category tab clicked ─────────────────────────────────────────
  const handleCategorySelect = useCallback((categoryLabel) => {
    setActiveCategory((prev) => {
      const next = prev === categoryLabel ? null : categoryLabel;
      setSearchQuery('');
      if (next) search(next);
      else search('');
      return next;
    });
  }, [search, setSearchQuery]);

  const handleCategorySelectNavigate = useCallback((categoryLabel) => {
    setActiveCategory(categoryLabel);
    setActiveNav('categories');
    window.history.pushState(null, '', '/categories');
    search(categoryLabel ?? '');
  }, [search]);

  const handleClearCategory = useCallback(() => {
    setActiveCategory(null);
    setSearchQuery('');
    search('');
  }, [search, setSearchQuery]);

  // ── Navbar search typed ──────────────────────────────────────────
  const handleSearch = useCallback((q) => {
    if (q) {
      setActiveCategory(null);
      setViewMode('all');
    }
    search(q);
  }, [search]);

  // ── Wallpaper modal open / close ─────────────────────────────────
  const handleCardClick = useCallback((wallpaper) => {
    setSelectedWallpaper(wallpaper);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedWallpaper(null);
  }, []);

  // ── Upload modal ─────────────────────────────────────────────────
  const handleUploadClick = useCallback(() => {
    setUploadModalOpen(true);
  }, []);

  const handleUploadClose = useCallback(() => {
    setUploadModalOpen(false);
  }, []);

  const handleLoginRequired = useCallback(() => {
    setUploadModalOpen(false);
  }, []);

  const handleLoginClose = useCallback(() => {
  }, []);

  const handleUploadSuccess = useCallback((normalizedWallpaper) => {
    // Reload user uploads to immediately include the new pending wallpaper
    loadUserUploads();
    updatePendingCount();
  }, [loadUserUploads, updatePendingCount]);

  const handleDeleteWallpaper = useCallback(async (wallpaper) => {
    // 0. Extra Safety Check
    if (!isAdmin) {
      alert("Not authorized ❌");
      return;
    }
    
    // 1. Check Source (Safety)
    if (wallpaper.source !== "user") {
      alert("Cannot delete Unsplash wallpaper");
      return;
    }

    // 2. ID Validation
    if (!wallpaper.id) {
      alert("Invalid wallpaper ID");
      return;
    }

    // 3. Confirmation
    if (!window.confirm("Delete this wallpaper?")) return;

    try {
      const { error } = await supabase
        .from("wallpapers")
        .delete()
        .eq("id", wallpaper.id);

      if (error) {
        alert("Delete failed");
      } else {
        // 4. Update UI via hook
        removeWallpaper(wallpaper.id);
        // Also remove from user uploads state if present
        setUserUploads(prev => prev.filter(w => w.id !== wallpaper.id));
      }
    } catch (err) {
      alert("An unexpected error occurred during deletion.");
    }
  }, [isAdmin, removeWallpaper]);

  const handleDeleteUserWallpaper = useCallback(async (wallpaper) => {
    const isOwner = user && wallpaper.uploader_id === user.id;
    if (!isAdmin && !isOwner) {
      alert("Not authorized ❌");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this wallpaper?")) return;
    try {
      await deleteUserOrAdminWallpaper(wallpaper.id, wallpaper.status, user.id, isAdmin);
      setUserUploads(prev => prev.filter(w => w.id !== wallpaper.id));
      if (wallpaper.status === 'approved') removeWallpaper(wallpaper.id);
      setToastMessage("Wallpaper deleted successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    }
  }, [isAdmin, user, removeWallpaper]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('user');
      setViewMode('all');
      navigateTo('home');
    } catch (err) {
    }
  }, [navigateTo]);

  // ── Sync states for Observer logic ────────────────────────────
  const queryRef = useRef(query);
  const homeObserverLoading = query.trim()
    ? categoriesLoading
    : viewMode === 'fragverse'
    ? loading
    : homeLoading;
  const exploreObserverLoading = query.trim()
    ? categoriesLoading
    : viewMode === 'fragverse'
    ? loading
    : exploreLoading;
  const loadingRef = useRef(loading);
  const homeObserverLoadingRef = useRef(homeObserverLoading);
  const exploreObserverLoadingRef = useRef(exploreObserverLoading);
  const categoriesObserverLoadingRef = useRef(categoriesLoading);
  const activeNavRef = useRef(activeNav);
  const viewModeRef = useRef(viewMode);
  // Per-feed hasMore refs — avoid recreating the observer when these change
  const homeHasMoreRef       = useRef(homeHasMore);
  const exploreHasMoreRef    = useRef(exploreHasMore);
  const categoriesHasMoreRef = useRef(categoriesHasMore);
  const communityHasMoreRef  = useRef(communityHasMore);
  // Stable function refs — updated every render so observer callback always calls latest version
  const loadMoreHomeRef       = useRef(loadMoreHome);
  const loadMoreExploreRef    = useRef(loadMoreExplore);
  const loadMoreCategoriesRef = useRef(loadMoreCategories);
  const loadMoreCommunityRef  = useRef(loadMoreCommunity);

  useEffect(() => { queryRef.current = query; }, [query]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { homeObserverLoadingRef.current = homeObserverLoading; }, [homeObserverLoading]);
  useEffect(() => { exploreObserverLoadingRef.current = exploreObserverLoading; }, [exploreObserverLoading]);
  useEffect(() => { categoriesObserverLoadingRef.current = categoriesLoading; }, [categoriesLoading]);
  useEffect(() => { activeNavRef.current = activeNav; }, [activeNav]);
  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);
  useEffect(() => { homeHasMoreRef.current = homeHasMore; }, [homeHasMore]);
  useEffect(() => { exploreHasMoreRef.current = exploreHasMore; }, [exploreHasMore]);
  useEffect(() => { categoriesHasMoreRef.current = categoriesHasMore; }, [categoriesHasMore]);
  useEffect(() => { communityHasMoreRef.current = communityHasMore; }, [communityHasMore]);
  useEffect(() => { loadMoreHomeRef.current = loadMoreHome; }, [loadMoreHome]);
  useEffect(() => { loadMoreExploreRef.current = loadMoreExplore; }, [loadMoreExplore]);
  useEffect(() => { loadMoreCategoriesRef.current = loadMoreCategories; }, [loadMoreCategories]);
  useEffect(() => { loadMoreCommunityRef.current = loadMoreCommunity; }, [loadMoreCommunity]);

  // ── Infinite Scroll (Stable Intersection Observer) ─────────────────
  const observer = useRef();
  const lastNodeRef = useRef(null); // track the last DOM node for re-attachment

  const lastWallpaperRef = useCallback(node => {
    if (activeNavRef.current !== 'home') return; // STABILIZE: ONLY infinite scroll on Home!
    if (observer.current) observer.current.disconnect();
    
    lastNodeRef.current = node;
    if (!node) return;

    observer.current = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (!entry.isIntersecting) return;
      
      const nav = activeNavRef.current;
      const isFragverse = viewModeRef.current === 'fragverse';
      
      // Crucial Fix: Read synchronous .current values of loading refs from hook to prevent duplicate trigger loops
      const isFeedLoadingSync = isFragverse
        ? communityLoadingRef.current
        : (nav === 'home'       && (queryRef.current.trim() ? categoriesLoadingRef.current : homeLoadingRef.current)) ||
          (nav === 'explore'    && (queryRef.current.trim() ? categoriesLoadingRef.current : exploreLoadingRef.current)) ||
          (nav === 'categories' && categoriesLoadingRef.current);
      
      const isFeedLoadingState =
        (nav === 'home'       && homeObserverLoadingRef.current) ||
        (nav === 'explore'    && exploreObserverLoadingRef.current) ||
        (nav === 'categories' && categoriesObserverLoadingRef.current);

      const isFeedLoading = isFeedLoadingSync || isFeedLoadingState;
      
      // Per-feed hasMore check
      const canLoad = isFragverse
        ? communityHasMoreRef.current
        : (nav === 'home'       && homeHasMoreRef.current) ||
          (nav === 'explore'    && exploreHasMoreRef.current) ||
          (nav === 'categories' && categoriesHasMoreRef.current);

      const pageIdx = isFragverse ? communityPage : nav === 'home' ? homePage : nav === 'explore' ? explorePage : categoriesPage;
      console.log(`[DEBUG] Intersection observer triggered for page section: "${nav}", viewMode: "${viewModeRef.current}". isFeedLoadingSync: ${isFeedLoadingSync}, isFeedLoadingState: ${isFeedLoadingState}, canLoad: ${canLoad}, page: ${pageIdx}`);
      
      if (isFeedLoading) {
        console.log(`[DEBUG] Observer load request BLOCKED — feed is already loading for: "${nav}"`);
        return;
      }
      
      if (!canLoad) {
        console.log(`[DEBUG] Observer load request BLOCKED — no more items left for: "${nav}"`);
        return;
      }

      console.log(`[DEBUG] Observer triggering loadMore for section: "${nav}", viewMode: "${viewModeRef.current}", current page: ${pageIdx}`);
      if (isFragverse) {
        loadMoreCommunityRef.current();
      } else if (nav === 'home') {
        loadMoreHomeRef.current();
      } else if (nav === 'explore') {
        loadMoreExploreRef.current();
      } else if (nav === 'categories') {
        loadMoreCategoriesRef.current();
      }
    }, {
      rootMargin: '800px 0px', // Pre-fetch content ahead of viewport reach
      threshold: 0.01
    });

    observer.current.observe(node);
  }, [homePage, explorePage, categoriesPage, communityPage]);

  // Re-attach observer ONLY when navigation or view mode changes significantly,
  // or when we transition from loading -> not loading (to catch cases where the 
  // last node was already in view but blocked by isFeedLoading).
  useEffect(() => {
    if (lastNodeRef.current && observer.current) {
      // Small delay to ensure DOM is stable after loading states change
      const timer = setTimeout(() => {
        if (lastNodeRef.current && observer.current) {
          observer.current.disconnect();
          observer.current.observe(lastNodeRef.current);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeNav, viewMode, homeObserverLoading, exploreObserverLoading, categoriesLoading, loading]);

  const previewWallpaperPool = useMemo(() => {
    const map = new Map();
    [...wallpapers, ...userWallpapers].forEach((w) => {
      if (w != null && w.id != null) map.set(w.id, w);
    });
    return [...map.values()];
  }, [wallpapers, userWallpapers]);

  // ── Safety Check (PREVENT CRASH) ──
  if (!wallpapers) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ backgroundColor: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-[12px] overflow-hidden">
            <img src="/favicon.ico" alt="" className="w-full h-full object-cover" />
          </div>
          <p className="text-sm font-semibold text-[var(--text-muted)] animate-pulse">
            Loading Fragverse…
          </p>
        </div>
      </div>
    );
  }

  // ── Wallpapers for display ──
  const favoriteWallpapers = useMemo(() => {
    return wallpapers.filter(
      (wallpaper) => wallpaper && favoriteIds.includes(wallpaper.id)
    );
  }, [wallpapers, favoriteIds]);

  const displayedWallpapers = useMemo(() => {
    return activeNav === 'favorites'
      ? favoriteWallpapers
      : viewMode === 'fragverse'
      ? userWallpapers
      : homeWallpapers;
  }, [activeNav, favoriteWallpapers, viewMode, userWallpapers, homeWallpapers]);

  // ── Dynamic grid heading ─────────────────────────────────────────
  const gridTitle = activeNav === 'favorites'
    ? 'My Favorites'
    : viewMode === 'fragverse'
    ? 'FragVerse Community'
    : activeCategory
    ? `${activeCategory} Wallpapers`
    : query
    ? `Results for "${query}"`
    : 'Trending Wallpapers';

  const gridSubtitle = loading
    ? 'Loading…'
    : activeNav === 'favorites'
    ? 'Wallpapers you have liked'
    : viewMode === 'fragverse'
    ? 'Wallpapers from the Fragverse Community'
    : displayedWallpapers.length > 0
    ? `${displayedWallpapers.length} wallpaper${displayedWallpapers.length !== 1 ? 's' : ''} found`
    : 'Hand-picked by the community';

  const handleSidebarNavClick = useCallback((id) => {
    navigateTo(id);
    setViewMode('all');
    setActiveCategory(null);
    setSearchQuery('');
    search('');
  }, [navigateTo, search]);

  const handleLoginClick = useCallback(() => {
    navigateTo('login');
  }, [navigateTo]);

  const handleSearchClick = useCallback(() => {
    setSearchOpen(true);
  }, []);

  const handleFilterAll = useCallback(() => {
    setViewMode('all');
  }, []);

  const handleFilterFragverse = useCallback(() => {
    setViewMode('fragverse');
    // Load community wallpapers when switching to fragverse mode
    if (communityPage === 1) {
      loadCommunityWallpapers(1);
    }
  }, [communityPage, loadCommunityWallpapers]);

  const handleMoodSelectExplore = useCallback((label) => {
    if (!label) {
      handleClearCategory();
      return;
    }
    setActiveCategory(label);
    search(label);
  }, [handleClearCategory, search]);

  const homeGridLoading = query.trim()
    ? categoriesLoading
    : viewMode === 'fragverse'
    ? loading
    : homeLoading;
  const exploreGridLoading = query.trim()
    ? categoriesLoading
    : viewMode === 'fragverse'
    ? loading
    : exploreLoading;
  const homeGridReloading = homeGridLoading && displayedWallpapers.length === 0;
  const exploreGridReloading = exploreGridLoading && exploreWallpapers.length === 0;
  const categoriesGridReloading = categoriesLoading && categoriesWallpapers.length === 0;


  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      revealPhase === 'completed'
        ? ''
        : revealPhase === 'grid-reveal'
        ? 'fv-reveal-pending fv-reveal-ui fv-reveal-grid'
        : revealPhase === 'ui-reveal'
        ? 'fv-reveal-pending fv-reveal-ui'
        : 'fv-reveal-pending'
    }`} style={{ backgroundColor: 'var(--bg)' }}>
      {revealPhase !== 'completed' && (
        <StartupReveal theme={theme} onComplete={handleIntroComplete} />
      )}
      {/* ── Sidebar ── */}
      {activeNav !== 'login' && (
        <Sidebar
          activeNav={activeNav}
          onNavClick={handleSidebarNavClick}
          onUploadClick={handleUploadClick}
          onLoginClick={handleLoginClick}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
          user={user}
          onSearchClick={handleSearchClick}
          pendingCount={pendingCount}
        />
      )}

      {/* ── Content (offset by sidebar width on lg+) ── */}
      <div className={activeNav === 'login' ? '' : 'lg:pl-[220px]'}>
      {activeNav !== 'login' && (
        <Navbar 
          onSearchClick={handleSearchClick}
          onUploadClick={handleUploadClick} 
          onMyUploadsClick={handleMyUploads}
          onLogout={handleLogout}
          user={user}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLoginClick={handleLoginClick}
        />
      )}
      <main>
        {activeNav === 'login' ? (
          <LoginPage 
            onLoginSuccess={(fbUser) => handleLoginSuccess(fbUser, false)} 
            onBackToHome={() => navigateTo('home')} 
          />
        ) : (
          <>
            {/* ── HOME PAGE ── */}
            {activeNav === 'home' && (
              <>
                <StickySearchBar
                   searchQuery={searchQuery}
                   onSearchChange={setSearchQuery}
                   onSearchSubmit={handleSearch}
                   activeMood={activeCategory}
                   onMoodSelect={handleCategorySelect}
                />
                <div className="animate-fade-in fv-home">
            <HeroSection 
              onSearch={handleSearch} 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            <div className="fv-page-container py-2 flex items-center gap-2">
              <button
                id="filter-all"
                onClick={handleFilterAll}
                className={`fv-chip flex-shrink-0 ${viewMode === 'all' ? 'active' : ''}`}
              >
                ✦ All Wallpapers
              </button>
              <button
                id="filter-fragverse"
                onClick={handleFilterFragverse}
                className={`fv-chip flex-shrink-0 ${viewMode === 'fragverse' ? 'active' : ''}`}
              >
                🖼 FragVerse Community
              </button>
            </div>



            {viewMode === 'fragverse' && (
              <div className="fv-page-container py-1.5">
                <button
                  id="back-to-all-btn"
                  onClick={handleBackToHome}
                  className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--accent)]
                             transition-colors duration-200 text-sm font-medium"
                >
                  <span>←</span> Back to All
                </button>
              </div>
            )}

            <div id="wallpaper-grid-section" className="fv-home-grid">
              <WallpaperGrid
                wallpapers={displayedWallpapers}
                loading={homeGridLoading}
                error={error}
                title={gridTitle}
                subtitle={gridSubtitle}
                onCardClick={handleCardClick}
                onToggleFavorite={handleToggleFavorite}
                favoriteIds={favoriteIds}
                loadMore={viewMode === 'fragverse' ? loadMoreCommunity : loadMoreHome}
                hasMore={viewMode === 'fragverse' ? communityHasMore : (query.trim() ? categoriesHasMore : homeHasMore)}
                onDeleteWallpaper={handleDeleteWallpaper}
                isAdmin={isAdmin}
                lastWallpaperRef={lastWallpaperRef}
                isReloading={homeGridReloading}
                sessionSeed={sessionSeed}
                activeCategory={activeCategory}
              />
            </div>
          </div>
        </>
      )}

        {/* ── EXPLORE PAGE ── */}
        {activeNav === 'explore' && (
          <ExplorePage
              exploreWallpapers={exploreWallpapers}
              userWallpapers={userWallpapers}
              loading={exploreGridLoading}
              error={error}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleSearch}
              activeCategory={activeCategory}
              onMoodSelect={handleMoodSelectExplore}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onCardClick={handleCardClick}
              onToggleFavorite={handleToggleFavorite}
              favoriteIds={favoriteIds}
              loadMore={viewMode === 'fragverse' ? loadMoreCommunity : loadMoreExplore}
              hasMore={viewMode === 'fragverse' ? communityHasMore : (query.trim() ? categoriesHasMore : exploreHasMore)}
              lastWallpaperRef={lastWallpaperRef}
              onDeleteWallpaper={handleDeleteWallpaper}
              isAdmin={isAdmin}
              isReloading={exploreGridReloading}
              sessionSeed={sessionSeed}
            />
        )}

        {/* ── CATEGORIES PAGE ── */}
        {activeNav === 'categories' && (
          <CategoriesPage
            wallpapers={viewMode === 'fragverse' ? userWallpapers : categoriesWallpapers}
            previewWallpapers={previewWallpaperPool}
            loading={categoriesLoading}
            error={error}
            activeCategory={activeCategory}
            onCategorySelect={handleCategorySelect}
            onClearCategory={handleClearCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}
            onCardClick={handleCardClick}
            onToggleFavorite={handleToggleFavorite}
            favoriteIds={favoriteIds}
            loadMore={viewMode === 'fragverse' ? loadMoreCommunity : loadMoreCategories}
            hasMore={viewMode === 'fragverse' ? communityHasMore : (viewMode === 'all' && categoriesHasMore)}
            lastWallpaperRef={lastWallpaperRef}
            onDeleteWallpaper={handleDeleteWallpaper}
            isAdmin={isAdmin}
            isReloading={categoriesGridReloading}
            sessionSeed={sessionSeed}
          />
        )}

        {/* ── FAVORITES PAGE ── */}
        {activeNav === 'favorites' && (
          <div className="pt-4 sm:pt-5 animate-fade-in">
            <div className="fv-page-container mb-4">
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-[var(--text-primary)]">Favorites</h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">Your liked wallpapers saved in this browser.</p>
            </div>

            <div id="wallpaper-grid-section" className="fv-home-grid">
              <WallpaperGrid
                wallpapers={displayedWallpapers}
                loading={loading || favoritesLoading}
                error={error}
                title={gridTitle}
                subtitle={gridSubtitle}
                onCardClick={handleCardClick}
                onToggleFavorite={handleToggleFavorite}
                favoriteIds={favoriteIds}
                loadMore={() => {}}
                hasMore={false}
                onDeleteWallpaper={handleDeleteWallpaper}
                isAdmin={isAdmin}
                lastWallpaperRef={null}
                compactLayout={true}
              />
            </div>
          </div>
        )}

        {/* ── YOUR WALLPAPERS PAGE ── */}
        {activeNav === 'your-wallpapers' && (
          <div className="pt-4 sm:pt-5 animate-fade-in">
            <div className="fv-page-container mb-4">
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-[var(--text-primary)]">Your Wallpapers</h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">Manage and track the status of your uploaded wallpapers.</p>
            </div>

            <div id="wallpaper-grid-section" className="fv-home-grid">
              <WallpaperGrid
                wallpapers={userUploads}
                loading={userUploadsLoading}
                error={userUploadsError}
                title="My Submissions"
                subtitle=""
                onCardClick={handleCardClick}
                onToggleFavorite={handleToggleFavorite}
                favoriteIds={favoriteIds}
                loadMore={() => {}}
                hasMore={false}
                onDeleteWallpaper={handleDeleteUserWallpaper}
                isAdmin={isAdmin}
                currentUserUid={user?.id}
                lastWallpaperRef={null}
                showStatusBadge={true}
                compactLayout={true}
              />
            </div>
          </div>
        )}

            {/* ── ADMIN DASHBOARD PAGE ── */}
            {activeNav === 'admin' && (
              <AdminDashboard user={user} isAdmin={isAdmin} onModerationAction={updatePendingCount} />
            )}
          </>
        )}
      </main>
      </div>

      {/* Fullscreen wallpaper preview modal */}
      <WallpaperModal
        wallpaper={selectedWallpaper}
        onClose={handleModalClose}
        onToggleFavorite={handleToggleFavorite}
        isFavorited={selectedWallpaper ? favoriteIds.includes(selectedWallpaper.id) : false}
        relatedWallpapers={wallpapers}
        favoriteIds={favoriteIds}
        onSelectWallpaper={handleCardClick}
      />

      {/* Admin/User Login Modal (Firebase) */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => { setLoginModalOpen(false); setLoginModalAdminMode(false); }}
        onLoginSuccess={handleLoginSuccess}
        isAdminMode={loginModalAdminMode}
      />

      {/* Cloudinary upload modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={handleUploadClose}
        onUploadSuccess={handleUploadSuccess}
        user={user}
      />

      {/* Global Search Command Palette Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        onSelect={handleCategorySelect}
      />

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-8 left-0 right-0 z-[100] flex justify-center pointer-events-none">
          <div className="
            bg-[var(--surface)] border border-[var(--border)]
            text-[var(--text-primary)]
            px-5 py-3 rounded-[14px]
            shadow-panel animate-slide-up
            flex items-center gap-3
            pointer-events-auto
          ">
            <div className="w-5 h-5 rounded-full bg-[var(--accent-tint)]
                            flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            </div>
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
