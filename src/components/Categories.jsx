import CategoryCard from './CategoryCard';

// ─────────────────────────────────────────────────────────────────
// Categories – controlled component
// Props:
//   activeCategory  {string|null} – currently selected category label
//   onSelect        {function}    – called with category label (or null for All)
// ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: 'All'      },
  { label: 'Gaming'   },
  { label: 'Formula 1' },
  { label: 'Aesthetic' },
  { label: 'Nature'   },
  { label: 'Cars'     },
  { label: 'Space'    },
  { label: 'Abstract' },
  { label: 'City'     },
];

const Categories = ({ activeCategory = null, onSelect }) => {
  return (
    <section className="pt-0 pb-1 mb-4 animate-fade-in border-b border-white/5">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-9">
        <div className="flex w-full items-center gap-1 overflow-x-auto hide-scrollbar scroll-smooth py-2">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.label}
              label={cat.label}
              active={
                cat.label === 'All'
                  ? activeCategory === null
                  : activeCategory === cat.label
              }
              onClick={() => onSelect(cat.label === 'All' ? null : cat.label)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
