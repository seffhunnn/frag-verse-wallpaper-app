import { useState, forwardRef, useMemo, memo } from 'react';
import { Maximize2, Trash2, Heart, Download, AlertCircle } from 'lucide-react';

const WallpaperCard = memo(forwardRef(({
  wallpaper = {},
  onCardClick,
  onDelete,
  onToggleFavorite,
  isFavorited = false,
  isAdmin = false,
  layout = 'grid',
  showStatusBadge = false,
  showDelete = isAdmin,
  clampAspect = false,
}, ref) => {
  const {
    id,
    image,
    fullImage,
    title = 'Untitled Wallpaper',
    author = 'Unknown',
    source,
    width,
    height,
  } = wallpaper;

  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [liked, setLiked] = useState(false);

  const isMasonry = layout === 'masonry';
  const isCurrentlyLiked = onToggleFavorite ? isFavorited : liked;

  // Stable aspect ratio for the masonry card container.
  // Unsplash images carry real width/height; Supabase uploads don't, so
  // we derive a visually-varied but deterministic ratio from the card's ID.
  const stableAspect = useMemo(() => {
    if (clampAspect) {
      // When clamping (Explore/Categories), force a single consistent ratio:
      // Unsplash always fetches landscape images (4/3). Supabase uploads have no
      // dimensions, so we also default them to 4/3 to match — eliminating the
      // size mismatch between community uploads and Unsplash cards.
      if (!width || !height || height <= 0) {
        return { aspectRatio: '4 / 3' };
      }
      const r = width / height;
      // All clamped cards → 4/3 (Unsplash fetches landscape; community uploads match)
      return { aspectRatio: '4 / 3' };
    }
    // Non-clamped (Home grid): use real dimensions or hash-derived fallback.
    if (width && height && height > 0) {
      return { aspectRatio: `${width} / ${height}` };
    }
    const hash = (id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const ratios = ['4/5', '3/4', '4/5', '2/3', '4/5', '3/4', '16/10', '4/5', '3/4', '1/1'];
    return { aspectRatio: ratios[hash % ratios.length] };
  }, [id, width, height, clampAspect]);


  // Legacy: grid-layout cards still use a simple 4/3 fallback
  const aspectStyle = useMemo(() => {
    if (width && height && height > 0) return { aspectRatio: `${width} / ${height}` };
    return { aspectRatio: '4 / 3' };
  }, [width, height]);



  const handleCardClick = () => {
    if (onCardClick) onCardClick(wallpaper);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(wallpaper);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(id);
    else setLiked((l) => !l);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    const downloadUrl = fullImage || image;
    const filename = `fragverse-${id || 'wallpaper'}.jpg`;
    try {
      const res = await fetch(downloadUrl);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const sourceBadge = source && (
    <div
      className={`absolute top-2.5 left-2.5 z-20 px-2 py-0.5 rounded-[6px] text-white text-[10px] font-semibold uppercase tracking-wide backdrop-blur-md ${
        source === 'unsplash' ? 'bg-black/40' : 'bg-[rgba(124,58,237,0.8)]'
      }`}
    >
      {source === 'unsplash' ? 'Unsplash' : 'FragVerse'}
    </div>
  );

  const status = wallpaper.status;
  const badgeElement = showStatusBadge && status ? (
    <div
      className={`absolute top-2.5 left-2.5 z-20 px-2.5 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wide backdrop-blur-md border ${
        status === 'approved'
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          : status === 'rejected'
          ? 'bg-red-500/10 text-red-400 border-red-500/30'
          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      }`}
    >
      {status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending Review'}
    </div>
  ) : sourceBadge;



  const downloadBtn = (
    <button
      type="button"
      onClick={handleDownload}
      className="
        absolute top-2.5 right-12 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-black/25 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:text-black
      "
    >
      <Download className="w-4 h-4" />
    </button>
  );

  const heartBtn = (
    <button
      type="button"
      onClick={handleLike}
      className={`
        absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200
        ${isCurrentlyLiked ? 'bg-white/90 text-red-500 opacity-100' : 'bg-black/25 text-white opacity-0 group-hover:opacity-100'}
        ${isMasonry && isCurrentlyLiked ? 'opacity-100' : ''}
      `}
    >
      <Heart className={`w-4 h-4 ${isCurrentlyLiked ? 'fill-current' : ''}`} />
    </button>
  );

  if (isMasonry) {
    return (
      <article
        ref={ref}
        onClick={handleCardClick}
        className="group relative cursor-pointer rounded-[16px] overflow-hidden bg-[var(--surface-2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
        style={{ transform: 'translateZ(0)' }}
      >
        {/* Fixed-aspect container — prevents ALL layout shifts during & after image load */}
        <div className="relative w-full" style={stableAspect}>
          {/* Skeleton stays underneath; image fades over it */}
          {image && !imgError && (
            <div
              className="absolute inset-0 fv-skeleton rounded-[16px] transition-opacity duration-700 ease-out"
              style={{ opacity: imgLoaded ? 0 : 1, pointerEvents: 'none' }}
              aria-hidden
            />
          )}

          {/* Image always absolute-fills container — no position swap, no reflow */}
          {image && !imgError ? (
            <img
              src={image}
              alt={title}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`
                absolute inset-0 w-full h-full object-cover fv-card-image
                group-hover:scale-[1.03]
                ${imgLoaded ? 'opacity-100' : 'opacity-0'}
              `}
            />
          ) : imgError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 rounded-[16px] p-4 text-center">
              <AlertCircle className="w-8 h-8 text-slate-500 mb-2" />
              <p className="text-xs font-semibold text-slate-300 truncate max-w-full px-2">{title}</p>
              <p className="text-[10px] text-slate-500 mt-1">Unable to load image</p>
            </div>
          ) : (
            <div className="absolute inset-0 fv-skeleton rounded-[16px]" />
          )}

          {badgeElement}
          {downloadBtn}
          {heartBtn}

          <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
          <div className="absolute inset-0 z-[15] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white">
              <Maximize2 className="w-4 h-4" />
            </span>
          </div>

          {showDelete && (
            <div className="absolute top-12 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/90 text-white text-[10px] font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </article>
    );
  }

  // ── grid-fixed: fills a parent-defined fixed-size cell ─────────────────────
  // Used ONLY by TodaysPicks. Parent provides aspect-ratio; card is absolute inset-0.
  if (layout === 'grid-fixed') {
    return (
      <article
        ref={ref}
        onClick={handleCardClick}
        className="group absolute inset-0 cursor-pointer rounded-[16px] overflow-hidden bg-[var(--surface-2)] transition-all duration-300"
        style={{ transform: 'translateZ(0)' }}
      >
        {/* Skeleton stays underneath; image fades over it */}
        {image && !imgError && (
          <div
            className="absolute inset-0 fv-skeleton transition-opacity duration-700 ease-out"
            style={{ opacity: imgLoaded ? 0 : 1, pointerEvents: 'none' }}
            aria-hidden
          />
        )}
        {image && !imgError ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`
              absolute inset-0 w-full h-full object-cover fv-card-image
              group-hover:scale-[1.04]
              ${imgLoaded ? 'opacity-100' : 'opacity-0'}
            `}
          />
        ) : imgError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 rounded-[16px] p-4 text-center">
            <AlertCircle className="w-8 h-8 text-slate-500 mb-2" />
            <p className="text-xs font-semibold text-slate-300 truncate max-w-full px-2">{title}</p>
            <p className="text-[10px] text-slate-500 mt-1">Unable to load image</p>
          </div>
        ) : (
          <div className="absolute inset-0 fv-skeleton" />
        )}

        {badgeElement}
        {downloadBtn}
        {heartBtn}

        <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 pointer-events-none" />
        <div className="absolute inset-0 z-[15] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white">
            <Maximize2 className="w-4 h-4" />
          </span>
        </div>

        {showDelete && (
          <div className="absolute top-12 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/90 text-white text-[10px] font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </article>
    );
  }

  return (
    <article
      ref={ref}
      onClick={handleCardClick}
      className="group relative fv-card fv-card-hover cursor-pointer overflow-hidden flex flex-col"
      style={{ transform: 'translateZ(0)' }}
    >
      <div className="relative w-full min-h-[200px] overflow-hidden bg-[var(--surface-2)]">
        {/* Skeleton stays underneath; image fades over it */}
        {image && !imgError && (
          <div
            className="absolute inset-0 fv-skeleton transition-opacity duration-700 ease-out"
            style={{ opacity: imgLoaded ? 0 : 1, pointerEvents: 'none' }}
            aria-hidden
          />
        )}

        {image && !imgError ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full min-h-[200px] object-cover fv-card-image group-hover:scale-[1.04] ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : imgError ? (
          <div className="w-full min-h-[200px] flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 rounded-[16px] p-4 text-center">
            <AlertCircle className="w-8 h-8 text-slate-500 mb-2" />
            <p className="text-xs font-semibold text-slate-300 truncate max-w-full px-2">{title}</p>
            <p className="text-[10px] text-slate-500 mt-1">Unable to load image</p>
          </div>
        ) : (
          <div className="w-full min-h-[200px] fv-skeleton" />
        )}

        {badgeElement}
        {downloadBtn}
        {heartBtn}

        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={handleCardClick}
              className="w-10 h-10 rounded-[10px] bg-white/20 hover:bg-white/35 backdrop-blur-sm text-white flex items-center justify-center"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          {showDelete && (
            <div className="absolute bottom-12 left-0 right-0 flex justify-center">
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/85 text-white text-[11px] font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}));

WallpaperCard.displayName = 'WallpaperCard';

export default WallpaperCard;
