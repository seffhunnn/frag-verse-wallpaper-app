import { memo } from 'react';
import { MOODS } from '../../constants/discovery';

const MoodCard = memo(({ mood, bgImage, active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group snap-start flex-shrink-0 w-[168px] sm:w-[190px] text-left
        rounded-[20px] overflow-hidden border
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]
        active:translate-y-0 active:scale-[0.99]
        ${active
          ? 'border-[rgba(139,92,246,0.45)] ring-1 ring-[rgba(139,92,246,0.2)]'
          : 'border-[var(--border)] hover:border-[var(--border-hover)]'}
      `}
      style={{
        boxShadow: active ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
        minHeight: '200px',
      }}
    >
      <div className="relative h-full min-h-[200px] flex flex-col justify-end p-4">
        {bgImage ? (
          <>
            <img
              src={bgImage}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{
                background: `linear-gradient(165deg, ${mood.color}33 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.82) 100%)`,
              }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(145deg, ${mood.color}44 0%, var(--surface-2) 100%)`,
            }}
          />
        )}

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xl drop-shadow-sm">{mood.emoji}</span>
            {active && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/90 px-1.5 py-0.5 rounded-md bg-[rgba(124,58,237,0.8)]">
                Active
              </span>
            )}
          </div>
          <p className="text-[15px] font-bold text-white tracking-tight leading-tight drop-shadow-md">
            {mood.label}
          </p>
          <p className="mt-1.5 text-[11px] text-white/70 leading-snug line-clamp-2">
            {mood.description}
          </p>
          <p className="mt-2 text-[10px] font-medium text-white/45 uppercase tracking-wider">
            Explore mood →
          </p>
        </div>

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 -40px 60px -20px rgba(139,92,246,0.15)',
          }}
        />
      </div>
    </button>
  );
});

const MoodStrip = memo(({ bgImages = {}, onMoodSelect, activeMood }) => (
  <section className="py-8 px-4 sm:px-6 lg:px-10">
    <div className="mb-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)] mb-1">
        Discovery
      </p>
      <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
        Browse by mood
      </h2>
      <p className="text-sm text-[var(--text-muted)] mt-1 max-w-md">
        Emotional aesthetics — tap a mood to filter the feed below.
      </p>
    </div>

    <div className="flex gap-3.5 overflow-x-auto hide-scrollbar pb-2 snap-x snap-mandatory -mx-1 px-1">
      {MOODS.map((mood) => (
        <MoodCard
          key={mood.id}
          mood={mood}
          bgImage={bgImages[mood.id]}
          active={activeMood === mood.label}
          onClick={() => onMoodSelect(mood)}
        />
      ))}
    </div>
  </section>
));

export default MoodStrip;
