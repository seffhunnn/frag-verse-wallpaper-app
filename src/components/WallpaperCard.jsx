import { useState, forwardRef } from 'react';
import { Download, Maximize2, Trash2, Loader2 } from 'lucide-react';

// Fallback gradient palette when image is unavailable
const GRADIENTS = [
  'from-purple-900 via-indigo-900 to-slate-900',
  'from-rose-900 via-pink-900 to-purple-900',
  'from-cyan-900 via-blue-900 to-indigo-900',
  'from-emerald-900 via-teal-900 to-cyan-900',
  'from-amber-900 via-orange-900 to-rose-900',
  'from-violet-900 via-purple-900 to-fuchsia-900',
  'from-sky-900 via-cyan-900 to-teal-900',
  'from-fuchsia-900 via-pink-900 to-rose-900',
];

// ─────────────────────────────────────────────────────────────────
// Download helper
// Tries blob download first; falls back to new tab if CORS blocks it
// ─────────────────────────────────────────────────────────────────
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
    // Cross-origin fallback: open full-res image in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

// ─────────────────────────────────────────────────────────────────
// WallpaperCard
// Props:
const WallpaperCard = forwardRef(({ wallpaper = {}, index = 0, onCardClick, onDelete, isAdmin = false, isFeatured = false }, ref) => {
  const {
    id,
    image,
    fullImage,
    title      = 'Untitled',
    author      = 'Unknown',
    authorImage,
    likes      = 0,
    downloads  = 0,
    authorLink,
    source,
  } = wallpaper;

  const [downloading, setDownloading] = useState(false);
  const fallbackGradient = GRADIENTS[index % GRADIENTS.length];

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!fullImage) return;
    setDownloading(true);
    await downloadWallpaper(fullImage, `fragverse-${id}.jpg`);
    setDownloading(false);
  };

  const handleCardClick = () => {
    if (onCardClick) onCardClick(wallpaper);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(wallpaper);
  };

  return (
    <div
      ref={ref}
      onClick={handleCardClick}
      style={{ transform: 'translateZ(0)' }}
      className={`group relative rounded-2xl overflow-hidden card-hover cursor-pointer bg-white dark:bg-dark-700 border border-slate-100 dark:border-transparent transition-all duration-500 shadow-sm dark:shadow-none flex flex-col h-full ${isFeatured ? 'ring-2 ring-purple-500/10' : ''}`}
    >
      {/* ── Image / Placeholder ── */}
      <div className={`w-full flex-1 min-h-[280px] relative overflow-hidden bg-black`}>
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${fallbackGradient}`}>
            <div className="absolute inset-0 shimmer-bg opacity-30" />
          </div>
        )}

        {/* Source badge */}
        {source && (
          <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg text-white font-bold text-[10px] uppercase tracking-wider backdrop-blur-md z-[15] shadow-sm
            ${source === 'unsplash' ? 'bg-blue-600/80 shadow-blue-500/20' : 'bg-green-600/80 shadow-green-500/20'}`}>
            {source === 'unsplash' ? 'Unsplash' : 'FragVerse'}
          </div>
        )}

        {/* ── Hover overlay ── */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 z-[20] flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl text-white transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-xl disabled:opacity-50"
              title="Download"
            >
              {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            </button>
            <button
              onClick={handleCardClick}
              className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl text-white transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-xl"
              title="Maximize"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
          {isAdmin && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500/80 hover:bg-red-500 backdrop-blur-md text-white rounded-xl text-[10px] font-bold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-lg"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Permanently
            </button>
          )}
        </div>

        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg z-[15] pointer-events-none group-hover:opacity-0 transition-opacity flex items-center justify-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/90 leading-none">Curated Choice</span>
          </div>
        )}
      </div>

      {/* ── Card footer ── */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-dark-600 flex-shrink-0 flex items-center justify-center overflow-hidden transition-colors duration-500">
            {authorImage ? (
              <img src={authorImage} alt={author} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[11px] font-bold text-slate-800 dark:text-white">
                {author.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight capitalize transition-colors duration-500">
              {title || 'Untitled'}
            </p>
            {authorLink ? (
              <a
                href={authorLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-purple-400 truncate leading-tight transition-colors block"
                onClick={(e) => e.stopPropagation()}
              >
                {author}
              </a>
            ) : (
              <p className="text-xs text-slate-500 truncate leading-tight transition-colors duration-500">{author}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default WallpaperCard;
