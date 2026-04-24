import { useState, useRef, useEffect } from 'react';
import { Search, Upload, Menu, X, Sparkles, User, LogOut, ChevronDown, ImagePlus, Sun, Moon } from 'lucide-react';
import logo from '../assets/logo.png';

// ─────────────────────────────────────────────────────────────────
// Navbar
// Props:
//   onSearch {function} – called with the search query stringff
// ─────────────────────────────────────────────────────────────────
// ─── Predefined avatar gradients ──────────────────────────────────
const AVATAR_GRADIENTS = [
  'from-purple-600 to-pink-600',
  'from-blue-600 to-cyan-600',
  'from-orange-600 to-red-600',
  'from-emerald-600 to-teal-600',
  'from-indigo-600 to-violet-600',
  'from-rose-600 to-pink-600'
];

const Navbar = ({ onSearch, onUploadClick, onMyUploadsClick, onLogout, user, theme, onToggleTheme, searchQuery, setSearchQuery }) => {
  const [menuOpen, setMenuOpen]           = useState(false);
  const [profileOpen, setProfileOpen]    = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  // Remove local inputValue state: const [inputValue, setInputValue] = useState('');
  const [showSearch, setShowSearch]       = useState(false);
  const debounceRef = useRef(null);

  // Monitor scroll to show/hide search bar
  useEffect(() => {
    const handleScroll = () => {
      // Threshold (~400px) is where hero search usually scrolls away
      setShowSearch(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check in case page starts scrolled
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Debounce 500 ms so we don't fire on every keystroke
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (onSearch) onSearch(value.trim());
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      clearTimeout(debounceRef.current);
      if (onSearch) onSearch(searchQuery.trim());
    }
  };

  // Avatar Helpers
  const avatarLetter = user ? (user.name || user.email || 'U').charAt(0).toUpperCase() : 'U';
  const avatarGradient = user ? (() => {
    const idStr = user.id || 'default';
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
      hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
  })() : AVATAR_GRADIENTS[0];

  return (
    <nav className="sticky top-0 z-50 bg-white/70 dark:bg-black/20 backdrop-blur-md backdrop-fix border-b border-slate-200 dark:border-white/5 shadow-lg transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center glow-purple border border-white/5">
              <img src={logo} alt="FV Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold text-gradient hidden sm:block tracking-tight">
              Frag Verse
            </span>
          </div>

          {/* Search Bar (Conditionally Visible) */}
          <div 
            className={`absolute left-1/2 -translate-x-1/2 flex justify-center w-full max-w-sm lg:max-w-xl transition-all duration-500 ease-in-out px-4 pointer-events-none z-[10]
              ${showSearch 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 -translate-y-4'
              }
              ${searchFocused ? 'max-w-md lg:max-w-2xl' : ''}`}
          >
            <div className="relative flex items-center w-full pointer-events-auto">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search wallpapers, categories, styles…"
                className="search-input w-full bg-white dark:bg-dark-700 border border-slate-200 dark:border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-purple-500/5 focus:border-purple-500/40 transition-all duration-200 shadow-sm dark:shadow-lg dark:shadow-black/20"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); if (onSearch) onSearch(''); }}
                  className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 border border-transparent dark:border-white/5 hover:border-purple-500/20 shadow-sm"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="relative">
                <div 
                  className="flex items-center gap-2 bg-slate-100 dark:bg-dark-700/50 hover:bg-slate-200 dark:hover:bg-dark-600 border border-slate-200 dark:border-white/8 rounded-2xl px-2 py-1.5 cursor-pointer transition-all duration-200 group shadow-sm"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all overflow-hidden shadow-lg`}>
                    <span className="text-[11px] font-bold text-white uppercase">{avatarLetter}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0e0e15]/95 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-20 overflow-hidden animate-scale-in origin-top-right">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5 mb-1">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center truncate">
                          {user.email || 'Welcome Back'}
                        </p>
                      </div>
                      {user && (
                        <>
                          <button 
                            onClick={() => { onMyUploadsClick(); setProfileOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left"
                          >
                            <ImagePlus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            My Uploads
                          </button>
                          <button 
                            onClick={() => { onUploadClick(); setProfileOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left"
                          >
                            <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            Upload New
                          </button>
                        </>
                      )}
                      <div className="border-t border-slate-100 dark:border-white/5 my-1"></div>
                      <button 
                        onClick={() => { onLogout(); setProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : null}

            {/* Upload Button (Admin Only) */}
            {user && (
              <button
                onClick={onUploadClick}
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            )}


           {user && (
              <button
                className="sm:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
              >
      
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
           })
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="sm:hidden pb-4 animate-slide-up">
            {user && (
              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={() => { onMyUploadsClick(); setMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 bg-dark-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl border border-white/5"
                >
                  <ImagePlus className="w-4 h-4 text-purple-400" />
                  My Uploads
                </button>
                <button
                  onClick={() => { onUploadClick(); setMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl"
                >
                  <Upload className="w-4 h-4" />
                  Upload Wallpaper
                </button>
                <button
                  onClick={() => { onLogout(); setMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 text-sm font-medium px-4 py-2.5 rounded-xl border border-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
