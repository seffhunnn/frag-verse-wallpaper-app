import { memo } from 'react';
import { getMoodMeta } from '../../constants/discovery';

const MoodCategoryCard = memo(({ label, previews = [], active, onClick }) => {
  const meta = getMoodMeta(label);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group relative w-full text-left overflow-hidden rounded-[14px]
        border transition-all duration-300 ease-out
        hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.99]
        ${active
          ? 'border-[var(--accent)] ring-1 ring-[rgba(124,58,237,0.15)]'
          : 'border-[var(--border)] hover:border-[var(--border-hover)]'}
      `}
      style={{
        background: 'var(--surface)',
        boxShadow: active ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
        minHeight: '84px',
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${meta.color} 0%, transparent 70%)` }}
      />

      <div className="relative p-4 flex items-center justify-between h-full min-h-[84px] gap-4">
        {/* Left side: Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg flex-shrink-0" aria-hidden>{meta.emoji}</span>
            <h3 className="text-[14px] sm:text-[14.5px] font-bold text-[var(--text-primary)] tracking-tight truncate">{label}</h3>
          </div>
          <p className="mt-2 text-[11px] text-[var(--text-muted)] leading-relaxed line-clamp-1">
            {meta.description}
          </p>
        </div>

        {/* Right side: Previews */}
        <div className="relative w-[76px] h-[36px] flex-shrink-0">
          {previews.length > 0 ? (
            previews.map((w, i) => (
              <div
                key={w.id}
                className="absolute rounded-[4px] overflow-hidden border border-[var(--surface)] shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5"
                style={{
                  width: 44,
                  height: 30,
                  right: i * 11,
                  bottom: i * 2 + 1,
                  zIndex: 3 - i,
                  transform: `rotate(${(i - 1) * 2}deg)`,
                }}
              >
                <img
                  src={w.thumb || w.image}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          ) : (
            <>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute rounded-[4px] fv-skeleton border border-[var(--surface)]"
                  style={{
                    width: 44,
                    height: 30,
                    right: i * 11,
                    bottom: i * 2 + 1,
                    zIndex: 3 - i,
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.01] dark:group-hover:bg-white/[0.005] transition-colors duration-300 pointer-events-none rounded-[14px]" />
    </button>
  );
});

export default MoodCategoryCard;
