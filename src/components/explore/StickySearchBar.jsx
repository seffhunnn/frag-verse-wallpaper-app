import { useState, useEffect, memo } from 'react';
import { Search } from 'lucide-react';

const StickySearchBar = memo(({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  activeMood,
  onMoodSelect,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let lastVisible = false;
    const handleScroll = () => {
      const hero = document.getElementById('homepage-hero') || document.getElementById('explore-hero');
      let threshold = 320;
      if (hero) {
        threshold = hero.offsetTop + hero.offsetHeight;
      }
      const shouldShow = window.scrollY >= threshold;
      if (shouldShow !== lastVisible) {
        lastVisible = shouldShow;
        setVisible(shouldShow);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit?.(searchQuery);
  };

  return (
    <div 
      id="sticky-search-bar"
      style={{ zIndex: 45, top: '72px' }}
      className={`fixed left-1/2 -translate-x-1/2 w-[90%] max-w-[420px]
                  transition-all duration-300 ease-out
                  ${visible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 -translate-y-8 pointer-events-none'}`}
    >
      <div className="
        flex items-center px-3.5 py-1.5 rounded-full
        bg-[rgba(250,250,250,0.85)] dark:bg-[rgba(26,26,31,0.85)]
        border border-[var(--border)] shadow-[var(--shadow-panel)]
        backdrop-blur-md backdrop-fix
      ">
        {/* Centered Search input */}
        <form onSubmit={handleSubmit} className="relative w-full flex items-center gap-2">
          <Search className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search aesthetics, wallpapers…"
            className="
              w-full pl-9 pr-3 py-1.5 rounded-full
              bg-black/5 dark:bg-white/5 border border-transparent
              text-[13px] font-medium placeholder-[var(--text-muted)]
               focus:outline-none focus:border-[rgba(124,58,237,0.3)] focus:bg-transparent
              transition-all duration-200
            "
          />
          <button
            type="submit"
            aria-label="Search"
            className="
              flex-shrink-0 flex items-center justify-center
              w-7 h-7 rounded-full
              bg-[var(--accent)] hover:bg-[var(--accent-hover,#6d28d9)]
              text-white
              shadow-[0_0_8px_rgba(124,58,237,0.35)]
              hover:shadow-[0_0_14px_rgba(124,58,237,0.55)]
              transition-all duration-200 cursor-pointer
            "
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
});

export default StickySearchBar;
