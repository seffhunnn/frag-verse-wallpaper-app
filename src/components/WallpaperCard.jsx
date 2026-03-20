import { useState } from 'react';
import { Download, Maximize2 } from 'lucide-react';

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
//   wallpaper {object}  – normalized Unsplash photo object
//   index     {number}  – grid position (gradient fallback)
// ─────────────────────────────────────────────────────────────────
const WallpaperCard = ({ wallpaper = {}, index = 0, onCardClick }) => {
  const {
    id,
    image,
    fullImage,
    title      = 'Untitled',
    author      = 'Unknown',
    authorImage,
    resolution = '4K',
    likes      = 0,
    downloads  = 0,
    authorLink,
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

  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-2xl overflow-hidden card-hover cursor-pointer bg-dark-700 border border-transparent hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(124,58,237,0.35),0_0_40px_rgba(124,58,237,0.15)]"
    >

      {/* ── Image / Placeholder ── */}
      <div className="w-full aspect-[16/10] relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${fallbackGradient}`}>
            <div className="absolute inset-0 shimmer-bg opacity-30" />
          </div>
        )}

        {/* Resolution badge */}
        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-xs text-white font-bold px-2 py-0.5 rounded-lg border border-white/10">
          {resolution}
        </div>

        {/* ── Hover overlay ── */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
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

            {/* Open full-res in new tab */}
            <button
              onClick={(e) => { e.stopPropagation(); window.open(fullImage || image, '_blank', 'noopener,noreferrer'); }}
              title="View full resolution"
              className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white p-1.5 rounded-lg transition-all duration-200 border border-white/10"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Card footer ── */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/10">
            {authorImage ? (
              <img src={authorImage} alt={author} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[9px] font-bold text-white">
                {author.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate leading-tight capitalize">
              {title || 'Untitled'}
            </p>
            {authorLink ? (
              <a
                href={authorLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-slate-500 hover:text-purple-400 truncate leading-tight transition-colors block"
                onClick={(e) => e.stopPropagation()}
              >
                {author}
              </a>
            ) : (
              <p className="text-[10px] text-slate-500 truncate leading-tight">{author}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WallpaperCard;
