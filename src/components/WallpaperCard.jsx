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
const WallpaperCard = forwardRef(({ wallpaper = {}, index = 0, onCardClick, onDelete, isAdmin = false }, ref) => {
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
      className="group relative rounded-2xl overflow-hidden card-hover cursor-pointer bg-dark-700 border border-transparent"
    >
      {/* ── Image / Placeholder ── */}
      <div className="w-full aspect-[16/10] relative overflow-hidden bg-black">
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

        {/* Source badge (Moved to left) */}
        {source && (
          <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg text-white font-bold text-[10px] uppercase tracking-wider backdrop-blur-md z-[15] shadow-sm
            ${source === 'unsplash' ? 'bg-blue-600/80 shadow-blue-500/20' : 'bg-green-600/80 shadow-green-500/20'}`}>
            {source === 'unsplash' ? 'Unsplash' : 'FragVerse'}
          </div>
        )}

        {/* ── Hover overlay ── */}
        <div className="absolute inset-[-1px] bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">

              {/* Download button */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                title="Download full resolution"
                className={`flex items-center gap-1.5 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 border border-white/10
                  ${downloading
                    ? 'bg-purple-500/40 cursor-wait'
                    : 'bg-white/15 hover:bg-purple-500/60 hover:border-purple-400/40 hover:scale-105'
                  }`}
              >
                <Download className={`w-3.5 h-3.5 ${downloading ? 'animate-bounce' : ''}`} />
                {downloading ? 'Saving…' : downloads > 0 ? downloads.toLocaleString() : 'Download'}
              </button>

            </div>

              <button
                onClick={(e) => { e.stopPropagation(); window.open(fullImage || image, '_blank', 'noopener,noreferrer'); }}
                title="View full resolution"
                className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white p-1.5 rounded-lg transition-all duration-200 border border-white/10"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {/* Delete button (Supabase + Admin only) */}
              {isAdmin && source === 'user' && (
                <button
                  onClick={handleDelete}
                  title="Delete wallpaper"
                  className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-100 p-1.5 rounded-lg transition-all duration-200 hover:bg-red-500 hover:scale-110 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

      {/* ── Card footer ── */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-dark-600 flex-shrink-0 flex items-center justify-center overflow-hidden">
            {authorImage ? (
              <img src={authorImage} alt={author} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[11px] font-bold text-white">
                {author.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate leading-tight capitalize">
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
              <p className="text-xs text-slate-500 truncate leading-tight">{author}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default WallpaperCard;
