import { useState, useRef, useEffect } from 'react';
import { Search, Upload, Menu, X, Sparkles } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Navbar
// Props:
//   onSearch {function} – called with the search query string
// ─────────────────────────────────────────────────────────────────
const Navbar = ({ onSearch }) => {
  const [menuOpen, setMenuOpen]           = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [inputValue, setInputValue]       = useState('');
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
    setInputValue(value);

    // Debounce 500 ms so we don't fire on every keystroke
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (onSearch) onSearch(value.trim());
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      clearTimeout(debounceRef.current);
      if (onSearch) onSearch(inputValue.trim());
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center glow-purple">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient hidden sm:block">
              Frag Verse
            </span>
          </div>

          {/* Search Bar (Conditionally Visible) */}
          <div 
            className={`flex-1 max-w-xl relative transition-all duration-500 ease-in-out
              ${showSearch 
                ? 'opacity-100 translate-y-0 pointer-events-auto' 
                : 'opacity-0 -translate-y-4 pointer-events-none'
              }
              ${searchFocused ? 'max-w-2xl' : ''}`}
          >
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search wallpapers, categories, styles…"
                className="search-input w-full bg-dark-700 border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/40 transition-all duration-200 shadow-lg shadow-black/20"
              />
              {inputValue && (
                <button
                  onClick={() => { setInputValue(''); if (onSearch) onSearch(''); }}
                  className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30">
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 ring-2 ring-purple-500/30">
              <span className="text-xs font-bold text-white">U</span>
            </div>
            <button
              className="sm:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="sm:hidden pb-4 animate-slide-up">
            <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl mt-2">
              <Upload className="w-4 h-4" />
              Upload Wallpaper
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
