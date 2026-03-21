import { useState, useCallback, useEffect, useRef } from 'react';
import Navbar          from './components/Navbar';
import HeroSection     from './components/HeroSection';
import Categories      from './components/Categories';
import WallpaperGrid   from './components/WallpaperGrid';
import WallpaperModal  from './components/WallpaperModal';
import UploadModal     from './components/UploadModal';
import LoginModal      from './components/LoginModal';
import useWallpapers   from './hooks/useWallpapers';
import { supabase } from './services/supabase';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function App() {
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'mohdsaifansari8888@gmail.com'; 
  const { 
    wallpapers, loading, error, query, search, loadMore, hasMore, 
    prependWallpaper, removeWallpaper
  } = useWallpapers();

  const [user,              setUser]              = useState(null);
  const [activeCategory,    setActiveCategory]    = useState(null);
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [uploadModalOpen,   setUploadModalOpen]   = useState(false);
  const [loginModalOpen,    setLoginModalOpen]    = useState(false);
  const [viewMode,          setViewMode]          = useState('all'); // 'all' | 'fragverse'
  const [showToast,         setShowToast]         = useState(false);

  // ── Auth Logic (Temporary/Local) ───────────────────────────────
  useEffect(() => {
    // 1. Initial restore from localStorage
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    // 2. Real-time Firebase Auth listener
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser && fbUser.email === ADMIN_EMAIL) {
        const adminUser = {
          name: fbUser.displayName,
          email: fbUser.email,
          isLoggedIn: true,
          id: fbUser.uid
        };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
      } else {
        // Not admin or not logged in
        setUser(null);
        localStorage.removeItem('user');
      }
    });

    return () => unsub();
  }, [ADMIN_EMAIL]);

  const handleLoginSuccess = useCallback((fbUser) => {
    
    if (fbUser.email !== ADMIN_EMAIL) {
      alert("Access Denied: You are not authorized as an administrator.");
      signOut(auth);
      setLoginModalOpen(false);
      return;
    }

    const adminUser = {
      name: fbUser.displayName,
      email: fbUser.email,
      isLoggedIn: true,
      id: fbUser.uid
    };

    setUser(adminUser);
    localStorage.setItem('user', JSON.stringify(adminUser));
    setLoginModalOpen(false);
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, [ADMIN_EMAIL]);

  // ── Secret Shortcut ───────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      // Ctrl + Shift + L
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
        setLoginModalOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleMyUploads = useCallback(() => {
    setViewMode('fragverse');
    setActiveCategory(null);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }, []);

  const handleBackToHome = useCallback(() => {
    setViewMode('all');
  }, []);

  // ── Favorites Fetching (REMOVED) ───────────────────────────────

  const isAdmin = user && user.isLoggedIn && user.email === ADMIN_EMAIL;

  // ── Category tab clicked ─────────────────────────────────────────
  const handleCategorySelect = (categoryLabel) => {
    setActiveCategory(categoryLabel);
    search(categoryLabel ?? '');
  };

  // ── Navbar search typed ──────────────────────────────────────────
  const handleSearch = (q) => {
    if (q) {
      setActiveCategory(null);
      setViewMode('all');
    }
    search(q);
  };

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
    prependWallpaper(normalizedWallpaper);
    // Modal auto-closes itself after the success animation
  }, [prependWallpaper]);

  const handleDeleteWallpaper = async (wallpaper) => {
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
      }
    } catch (err) {
      alert("An unexpected error occurred during deletion.");
    }
  };


  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('user');
      setViewMode('all');
    } catch (err) {
    }
  }, []);

  // ── Sync states for Observer logic ───────────────────────────
  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

  // ── Infinite Scroll (Stable Intersection Observer) ───────────
  const observer = useRef();
  const lastWallpaperRef = useCallback(node => {
    if (viewMode === 'fragverse') return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      const entry = entries[0];
      // 2. CHECK REFS INSIDE CALLBACK (STABLE)
      if (entry.isIntersecting && hasMoreRef.current && !loadingRef.current) {
        loadMore();
      }
    }, {
      rootMargin: '200px', // Pre-fetch 200px before reaching bottom
      threshold: 0.1
    });

    if (node) observer.current.observe(node);
  }, [loadMore, viewMode]);

  // ── Safety Check (PREVENT CRASH) ──
  if (!wallpapers) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center text-white font-bold animate-pulse text-xl">
        Initializing FragVerse...
      </div>
    );
  }

  // ── Filtered wallpapers for display ──
  const displayedWallpapers = wallpapers.filter((w) => {
    if (viewMode === 'fragverse' && w.source !== 'user') {
      return false;
    }
    return true;
  });

  // ── Dynamic grid heading ─────────────────────────────────────────
  const gridTitle = viewMode === 'fragverse'
    ? 'FragVerse Uploads'
    : activeCategory
    ? `${activeCategory} Wallpapers`
    : query
    ? `Results for "${query}"`
    : 'Trending Wallpapers';

  const gridSubtitle = loading
    ? 'Loading…'
    : viewMode === 'fragverse'
    ? 'Wallpapers uploaded by the community'
    : displayedWallpapers.length > 0
    ? `${displayedWallpapers.length} wallpaper${displayedWallpapers.length !== 1 ? 's' : ''} found`
    : 'Hand-picked by the community';


  return (
    <div className="dark min-h-screen bg-dark-900">
      <Navbar 
        onSearch={handleSearch} 
        onUploadClick={handleUploadClick} 
        onMyUploadsClick={handleMyUploads}
        onLogout={handleLogout}
        user={user}
      />
      <main>
        <HeroSection onSearch={handleSearch} />
        {/* ── Filter Toggles ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-10 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setViewMode('all')}
            className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 ease-in-out flex items-center gap-2 border-2 
              ${viewMode === 'all' 
                ? 'bg-blue-800 text-white border-blue-800 shadow-xl shadow-blue-900/40 scale-105' 
                : 'bg-dark-800 text-slate-400 border-white/5 hover:border-white/10'}`}
          >
            All Wallpapers
          </button>
          <button
            onClick={() => setViewMode('fragverse')}
            className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 ease-in-out flex items-center gap-2 border-2 
              ${viewMode === 'fragverse' 
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xl shadow-emerald-900/40 scale-105' 
                : 'bg-dark-800 text-slate-400 border-white/5 hover:border-white/10'}`}
          >
            FragVerse Uploads
          </button>
        </div>

        {viewMode === 'all' && (
          <Categories
            activeCategory={activeCategory}
            onSelect={handleCategorySelect}
          />
        )}

        {viewMode === 'fragverse' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-8">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              ← Back to All
            </button>
          </div>
        )}
        <WallpaperGrid
          wallpapers={displayedWallpapers}
          loading={loading}
          error={error}
          title={gridTitle}
          subtitle={gridSubtitle}
          onCardClick={handleCardClick}
          loadMore={loadMore}
          hasMore={viewMode === 'all' && hasMore}
          onDeleteWallpaper={handleDeleteWallpaper}
          isAdmin={isAdmin}
          lastWallpaperRef={viewMode === 'all' ? lastWallpaperRef : null}
        />
      </main>

      {/* Fullscreen wallpaper preview modal */}
      <WallpaperModal
        wallpaper={selectedWallpaper}
        onClose={handleModalClose}
      />

      {/* Admin Login Modal (Firebase) */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Cloudinary upload modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={handleUploadClose}
        onUploadSuccess={handleUploadSuccess}
        user={user}
      />

      {/* Admin Login Toast */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/20 animate-slide-up flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
          </div>
          <span className="text-sm font-bold tracking-wide">Admin login activated</span>
        </div>
      )}
    </div>
  );
}

export default App;
