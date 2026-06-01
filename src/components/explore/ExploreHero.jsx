import { Sparkles, Compass, ExternalLink } from 'lucide-react';
import { memo } from 'react';
import useHeroSlideshow, { FADE_DURATION_MS } from '../../hooks/useHeroSlideshow';

const HERO_COPY = [
  { badge: 'Trending This Week', title: 'Discover New Aesthetics', subtitle: 'Curated drops from Unsplash and the Fragverse community.' },
  { badge: "Today's Wallpaper Drop", title: 'Find Your Next Screen', subtitle: 'Immersive visuals for desktop, mobile, and ultrawide.' },
  { badge: 'Editorial Pick', title: 'Explore Without Limits', subtitle: 'Scroll through moods, collections, and endless inspiration.' },
];

function HeroImageLayer({ slide, visible, zIndex }) {
  const src = slide?.heroImage || slide?.image || slide?.thumb;
  if (!src) return null;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        zIndex,
        transition: `opacity ${FADE_DURATION_MS}ms ease-in-out`,
        willChange: 'opacity',
      }}
      aria-hidden={!visible}
    >
      <img
        src={src}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover fv-hero-ken-burns ${visible ? 'fv-hero-ken-burns-active' : ''}`}
        style={{ transform: 'translateZ(0)' }}
      />
    </div>
  );
}

const ExploreHero = memo(({ fallbackWallpapers = [], onExplore, onMoodExplore }) => {
  const {
    slides,
    current,
    currentIndex,
    activeLayer,
    layerSlides,
    bootstrapped,
    hasSlides,
  } = useHeroSlideshow(fallbackWallpapers);

  const copy = HERO_COPY[currentIndex % HERO_COPY.length];
  const showSkeleton = !bootstrapped || (!hasSlides && !fallbackWallpapers?.length);
  const fallbackSlide = fallbackWallpapers?.[0];

  return (
    <section id="explore-hero" className="relative w-full px-4 sm:px-6 lg:px-10 pt-4 pb-2">
      <div
        className="relative overflow-hidden rounded-[22px] border border-[var(--border)] min-h-[320px] sm:min-h-[380px] lg:min-h-[420px] bg-[#0a0a0c]"
        style={{ boxShadow: 'var(--shadow-panel)' }}
      >
        {showSkeleton && (
          <div className="absolute inset-0 fv-skeleton z-0" />
        )}

        <div className="absolute inset-0 z-0">
          {hasSlides ? (
            <>
              <HeroImageLayer
                slide={layerSlides[0]}
                visible={activeLayer === 0}
                zIndex={activeLayer === 0 ? 2 : 1}
              />
              <HeroImageLayer
                slide={layerSlides[1]}
                visible={activeLayer === 1}
                zIndex={activeLayer === 1 ? 2 : 1}
              />
            </>
          ) : (
            bootstrapped &&
            fallbackSlide && (
              <HeroImageLayer slide={fallbackSlide} visible zIndex={2} />
            )
          )}
        </div>

        <div
          className="absolute inset-0 z-[3] pointer-events-none fv-hero-overlay"
          aria-hidden
        />

        <div className="relative z-10 flex flex-col justify-end h-full min-h-[320px] sm:min-h-[380px] lg:min-h-[420px] p-6 sm:p-10">
          <span
            className="inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-4"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', backdropFilter: 'blur(8px)' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {copy.badge}
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight max-w-2xl leading-[1.1]">
            {copy.title}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/75 max-w-lg leading-relaxed">
            {copy.subtitle}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={onExplore} className="fv-btn-primary">
              <Compass className="w-4 h-4" />
              Start exploring
            </button>
            <button
              type="button"
              onClick={onMoodExplore}
              className="fv-btn-ghost !bg-white/10 !border-white/20 !text-white hover:!bg-white/20"
            >
              Browse moods
            </button>
          </div>

          {current?.author && (
            <p className="mt-5 text-[11px] sm:text-xs text-white/55 flex flex-wrap items-center gap-1">
              {current.category && (
                <>
                  <span className="text-white/70 font-medium capitalize">{current.category}</span>
                  <span className="text-white/40">·</span>
                </>
              )}
              {current.authorLink ? (
                <a
                  href={`${current.authorLink}?utm_source=fragverse&utm_medium=referral`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-white/75 hover:text-white transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Photo by {current.author} on Unsplash
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              ) : (
                <span className="text-white/75">Photo by {current.author}</span>
              )}
            </p>
          )}

          {slides.length > 1 && (
            <div className="mt-4 flex items-center gap-1.5" aria-label="Slideshow progress">
              {slides.slice(0, 10).map((s, i) => (
                <span
                  key={s.id}
                  className={`h-1 rounded-full transition-all duration-700 ease-out ${
                    i === currentIndex % 10
                      ? 'w-6 bg-white/90'
                      : 'w-1.5 bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

export default ExploreHero;
