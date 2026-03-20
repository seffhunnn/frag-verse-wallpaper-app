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
  { label: 'Anime'    },
  { label: 'Nature'   },
  { label: 'Cars'     },
  { label: 'Space'    },
  { label: 'Abstract' },
  { label: 'City'     },
  { label: 'Ocean'    },
];

const Categories = ({ activeCategory = null, onSelect }) => {
  return (
    <section className="py-6 animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex w-full">
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
