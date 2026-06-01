import { useState, useEffect, useRef } from 'react';
import { 
  Search, X, Sparkles, Leaf, Layers, Car, Orbit, Building, Zap, Moon, 
  CloudMoon, Landmark, Coffee, Palette, Gamepad2, Flag, CloudRain, Navigation
} from 'lucide-react';

const CATEGORIES = [
  { label: 'Anime' },
  { label: 'Nature' },
  { label: 'Minimal' },
  { label: 'Cars' },
  { label: 'Space' },
  { label: 'Architecture' },
  { label: 'Cyberpunk' },
  { label: 'Dark' },
  { label: 'Dreamy' },
  { label: 'City' },
  { label: 'Cozy' },
  { label: 'Abstract' },
  { label: 'Gaming' },
  { label: 'Formula 1' },
  { label: 'Rainy' },
  { label: 'Night Drive' },
];

const ICON_MAP = {
  'Anime': Sparkles,
  'Nature': Leaf,
  'Minimal': Layers,
  'Cars': Car,
  'Space': Orbit,
  'Architecture': Building,
  'Cyberpunk': Zap,
  'Dark': Moon,
  'Dreamy': CloudMoon,
  'City': Landmark,
  'Cozy': Coffee,
  'Abstract': Palette,
  'Gaming': Gamepad2,
  'Formula 1': Flag,
  'Rainy': CloudRain,
  'Night Drive': Navigation,
};

const TRENDING_SEARCHES = ['Minimal', 'Cyberpunk', 'Space', 'Anime', 'Dreamy', 'Night Drive'];

const GlobalSearchModal = ({
  isOpen,
  onClose,
  onSearch,
  searchQuery,
  setSearchQuery,
  activeCategory,
  onSelect,
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [animate, setAnimate] = useState(isOpen);
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setAnimate(true);
      });
      // Auto-focus input when opened
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setShouldRender(false), 220);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC close key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setAnimate(false);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (panelRef.current && !panelRef.current.contains(e.target)) {
      handleClose();
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Debounce actual photo search fetch
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch?.(value.trim());
    }, 400);
  };

  const handleCategoryClick = (categoryLabel) => {
    onSelect(categoryLabel);
    handleClose();
  };

  const handleSearchTermClick = (term) => {
    setSearchQuery(term);
    onSearch?.(term);
    handleClose();
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch?.('');
  };

  if (!shouldRender) return null;

  return (
    <div 
      onClick={handleBackdropClick}
      className={`
        fixed inset-0 z-[100] flex justify-center items-start pt-[12vh] px-4 sm:px-6
        bg-black/60 backdrop-blur-[6px] backdrop-fix
        fv-search-overlay
        ${animate ? '' : 'closing'}
      `}
    >
      <div 
        ref={panelRef}
        className={`
          relative w-full max-w-[620px] rounded-[24px] overflow-hidden
          bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-panel)]
          flex flex-col fv-search-panel max-h-[75vh]
          ${animate ? '' : 'closing'}
        `}
      >
        {/* Search header & input */}
        <div className="relative flex items-center p-4 border-b border-[var(--border)] flex-shrink-0">
          <Search className="absolute left-6 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            value={searchQuery}
            onChange={handleChange}
            placeholder="Search aesthetics, wallpapers, authors..."
            className="
              w-full pl-10 pr-20 py-2.5 bg-transparent border-none
              text-[15px] font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)]
              focus:outline-none focus:ring-0
            "
          />
          <div className="absolute right-5 flex items-center gap-2">
            {searchQuery && (
              <button 
                onClick={handleClear}
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors px-1.5 py-0.5 rounded bg-[var(--surface-2)]"
              >
                Clear
              </button>
            )}
            <button 
              onClick={handleClose}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto hide-scrollbar p-5 flex flex-col gap-5">
          {/* Trending Searches */}
          {!searchQuery && (
            <div className="animate-fade-in">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.12em] mb-2.5">
                Trending Aesthetics
              </p>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSearchTermClick(term)}
                    className="
                      px-3 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)]
                      text-[12.5px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                      hover:border-[var(--border-hover)] hover:-translate-y-[0.5px] transition-all duration-200 cursor-pointer
                    "
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Categories Filter */}
          <div className="animate-fade-in">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.12em] mb-2.5">
              Browse Categories
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => {
                const IconComponent = ICON_MAP[cat.label];
                const isActive = activeCategory === cat.label;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => handleCategoryClick(cat.label)}
                    className={`fv-category-chip flex-shrink-0 ${isActive ? 'active' : ''}`}
                  >
                    {IconComponent && (
                      <IconComponent 
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${
                          isActive ? 'text-[var(--accent)] scale-110' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                        }`} 
                      />
                    )}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal footer shortcut guide */}
        <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--surface-2)]/30 flex justify-between items-center text-[10px] text-[var(--text-muted)] font-medium select-none flex-shrink-0">
          <span>Search matches instantly updates feed in background</span>
          <div className="flex items-center gap-2.5">
            <span><kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] font-mono text-[9px]">Esc</kbd> close</span>
            <span><kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] font-mono text-[9px]">↵</kbd> search</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
