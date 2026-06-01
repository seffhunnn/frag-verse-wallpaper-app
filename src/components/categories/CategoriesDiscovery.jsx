import { useRef, useMemo, memo } from 'react';
import { Search } from 'lucide-react';
import { CATEGORY_SECTIONS, shuffleArray, createSeededRandom, getPreviewWallpapers } from '../../constants/discovery';
import MoodCategoryCard from './MoodCategoryCard';

const CategoriesDiscovery = memo(({
  wallpapers = [],
  activeCategory,
  onCategorySelect,
  onClearCategory,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  sort,
  onSortChange,
}) => {
  const resultsRef = useRef(null);

  // 5-hour timestamp block for stable periodic categories reshuffling
  const fiveHoursMs = 5 * 60 * 60 * 1000;
  const seedBlock = useMemo(() => Math.floor(Date.now() / fiveHoursMs), []);

  const shuffledSections = useMemo(() => {
    return CATEGORY_SECTIONS.map((section, idx) => {
      const sectionHash = section.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const rng = createSeededRandom(seedBlock + sectionHash + idx * 79);
      return {
        ...section,
        categories: shuffleArray(section.categories, rng)
      };
    });
  }, [seedBlock]);

  const previewsMap = useMemo(() => {
    const map = {};
    shuffledSections.forEach((section) => {
      section.categories.forEach((cat) => {
        if (!map[cat]) {
          map[cat] = getPreviewWallpapers(wallpapers, cat, 3);
        }
      });
    });
    return map;
  }, [wallpapers, shuffledSections]);

  const scrollToResults = () => {
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleCategory = (label) => {
    onCategorySelect(label);
    scrollToResults();
  };

  return (
    <div className="animate-fade-in pb-8">
      {/* Editorial Header */}
      <section className="px-4 sm:px-6 lg:px-10 pt-8 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
            Explore Aesthetics
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mt-1">
            Moods & Themes
          </h1>
          <p className="mt-1.5 text-xs text-[var(--text-muted)] max-w-lg leading-relaxed opacity-85">
            Discover curated collections by emotional frequency rather than simple folders.
          </p>
        </div>
      </section>

      {/* Lightweight Centered Search & Sort Row */}
      <div className="px-4 sm:px-6 lg:px-10 py-3 flex flex-col sm:flex-row items-center gap-3 pb-6 mb-4">
        {/* Spotlight-style Search */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit(searchQuery);
            scrollToResults();
          }}
          className="relative w-full sm:max-w-[320px]"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search moods, aesthetics..."
            className="
              w-full pl-9 pr-4 py-2 rounded-full
              bg-[rgba(255,255,255,0.03)] dark:bg-[rgba(255,255,255,0.02)]
              border border-[var(--border)] text-xs font-medium
              placeholder:text-[var(--text-muted)]
              focus:outline-none focus:border-[rgba(124,58,237,0.3)] focus:bg-transparent
              transition-all duration-200 shadow-sm
            "
          />
        </form>

        {/* Minimal Pill Sort Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] mr-1 hidden sm:inline">Sort:</span>
          {[
            { value: 'latest', label: 'Latest' },
            { value: 'popular', label: 'Popular' },
            { value: 'random', label: 'Shuffle' }
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSortChange(opt.value)}
              className={`
                px-3 py-1 rounded-full text-[11px] font-medium tracking-tight transition-all duration-250 cursor-pointer
                ${sort === opt.value
                  ? 'bg-[var(--accent-tint)] border-[rgba(124,58,237,0.3)] text-[var(--accent)]'
                  : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Sections (Side-by-Side columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-10 py-5">
        {shuffledSections.map((section) => (
          <div key={section.id} className="flex flex-col">
            {/* Section Header */}
            <div className="mb-4 flex-shrink-0">
              <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-[0.12em]">
                {section.title}
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5 opacity-90">
                {section.subtitle}
              </p>
            </div>
            {/* Vertical Stack of Category Cards */}
            <div className="flex flex-col gap-3">
              {section.categories.map((label) => (
                <MoodCategoryCard
                  key={`${section.id}-${label}`}
                  label={label}
                  previews={previewsMap[label] || []}
                  active={activeCategory === label}
                  onClick={() => handleCategory(label)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div ref={resultsRef} className="scroll-mt-24" />
    </div>
  );
});

export default CategoriesDiscovery;
