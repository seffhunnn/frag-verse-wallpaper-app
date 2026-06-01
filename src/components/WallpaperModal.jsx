import { useEffect, useMemo } from 'react';
import { X, Download, ExternalLink, User, Heart, Tag } from 'lucide-react';
import WallpaperCard from './WallpaperCard';

const downloadWallpaper = async (url, filename) => {
  try {
    const res = await fetch(url);
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
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

const WallpaperModal = ({
  wallpaper,
  onClose,
  onToggleFavorite,
  isFavorited = false,
  relatedWallpapers = [],
  onSelectWallpaper,
  favoriteIds = [],
}) => {
  useEffect(() => {
    if (!wallpaper) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [wallpaper, onClose]);

  useEffect(() => {
    document.body.style.overflow = wallpaper ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [wallpaper]);

  const related = useMemo(() => {
    if (!wallpaper || !relatedWallpapers.length) return [];
    return relatedWallpapers
      .filter((w) => w.id !== wallpaper.id)
      .filter((w) => {
        if (wallpaper.category && w.category) {
          return w.category.toLowerCase() === wallpaper.category.toLowerCase();
        }
        return true;
      })
      .slice(0, 6);
  }, [wallpaper, relatedWallpapers]);

  if (!wallpaper) return null;

  const {
    id,
    image,
    thumb,
    fullImage,
    title = 'Untitled Wallpaper',
    author = 'Unknown',
    authorImage,
    authorLink,
    category = 'General',
    source,
    description: rawDescription,
    tags: rawTags,
  } = wallpaper;

  const tags = Array.isArray(rawTags) && rawTags.length > 0
    ? rawTags
    : typeof rawTags === 'string' && rawTags.trim().length > 0
    ? rawTags.split(',').map((t) => t.trim()).filter(Boolean)
    : [
        category,
        source === 'user' ? 'FragVerse' : 'Unsplash',
        ...(title ? title.split(' ').slice(0, 2) : []),
      ].filter(Boolean);

  const description = rawDescription?.trim()
    ? rawDescription
    : source === 'user'
      ? `Shared with the Fragverse Community — ${category} aesthetic by ${author}.`
      : `High-quality ${category} wallpaper from Unsplash by ${author}.`;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleDownload = () => {
    downloadWallpaper(fullImage || image, `fragverse-${id}.jpg`);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 lg:p-6 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
      onClick={handleOverlayClick}
    >
      <div
        className="relative w-full max-w-6xl my-auto flex flex-col rounded-none sm:rounded-modal overflow-hidden animate-slide-up border border-[var(--border)]"
        style={{ background: 'var(--surface)', maxHeight: 'min(96vh, 1100px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[var(--border)] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[var(--surface-2)] flex items-center justify-center overflow-hidden flex-shrink-0">
              {authorImage ? (
                <img src={authorImage} alt={author} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-[var(--text-secondary)]">
                  {author.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate capitalize">{title}</p>
              {authorLink ? (
                <a
                  href={authorLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-1"
                >
                  <User className="w-3 h-3" />
                  {author}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <User className="w-3 h-3" /> {author}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(id)}
                className={`w-9 h-9 rounded-[10px] flex items-center justify-center border transition-all duration-200 ${
                  isFavorited
                    ? 'bg-[var(--accent-tint)] border-[rgba(124,58,237,0.3)] text-red-500'
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:text-red-500 hover:border-[var(--border-hover)]'
                }`}
                title="Favorite"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            )}
            <button type="button" onClick={handleDownload} className="fv-btn-primary text-sm hidden sm:inline-flex">
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          <div className="relative flex-1 bg-black/50 flex items-center justify-center min-h-[40vh] lg:min-h-0">
            {source && (
              <div
                className={`absolute top-4 left-4 z-20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-md ${
                  source === 'unsplash' ? 'bg-black/50' : 'bg-[rgba(124,58,237,0.9)]'
                }`}
              >
                {source === 'unsplash' ? 'Unsplash' : 'FragVerse'}
              </div>
            )}
            <img
              src={fullImage || image || thumb}
              alt={title}
              className="w-full h-full object-contain max-h-[55vh] lg:max-h-[70vh]"
            />
          </div>

          <aside className="w-full lg:w-[300px] flex-shrink-0 border-t lg:border-t-0 lg:border-l border-[var(--border)] overflow-y-auto p-5 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                About
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{description}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <button type="button" onClick={handleDownload} className="fv-btn-primary w-full sm:hidden">
              <Download className="w-4 h-4" />
              Download wallpaper
            </button>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="border-t border-[var(--border)] px-4 sm:px-5 py-4 flex-shrink-0">
            <p className="text-sm font-bold text-[var(--text-primary)] mb-3">Related wallpapers</p>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
              {related.map((w, i) => (
                <div key={w.id} className="flex-shrink-0 w-[140px]">
                  <WallpaperCard
                    wallpaper={w}
                    index={i}
                    layout="masonry"
                    onCardClick={() => onSelectWallpaper?.(w)}
                    onToggleFavorite={onToggleFavorite}
                    isFavorited={favoriteIds.includes(w.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-5 py-2 border-t border-[var(--border)] text-[11px] text-[var(--text-muted)] hidden sm:block">
          Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] font-mono text-[10px]">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
};

export default WallpaperModal;
