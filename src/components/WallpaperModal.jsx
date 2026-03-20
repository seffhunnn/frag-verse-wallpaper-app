import { useEffect } from 'react';
import { X, Download, ExternalLink, User } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Download helper (same as WallpaperCard)
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
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

// ─────────────────────────────────────────────────────────────────
// WallpaperModal
// Props:
//   wallpaper {object|null} – selected wallpaper; null = closed
//   onClose   {function}   – called to close the modal
// ─────────────────────────────────────────────────────────────────
const WallpaperModal = ({ wallpaper, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    if (!wallpaper) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [wallpaper, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = wallpaper ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [wallpaper]);

  if (!wallpaper) return null;

  const {
    id,
    image,
    fullImage,
    title     = 'Untitled',
    author    = 'Unknown',
    authorImage,
    authorLink,
    downloads = 0,
    resolution = '4K',
  } = wallpaper;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleDownload = () => {
    downloadWallpaper(fullImage || image, `fragverse-${id}.jpg`);
  };

  return (
    /* Dark overlay */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }}
      onClick={handleOverlayClick}
    >
      {/* Modal panel */}
      <div
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden bg-dark-800 border border-purple-500/30 shadow-[0_0_40px_rgba(124,58,237,0.3),0_0_80px_rgba(124,58,237,0.1)] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 py-3 bg-dark-800 border-b border-purple-500/15 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Author avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/10">
              {authorImage ? (
                <img src={authorImage} alt={author} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-white">
                  {author.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate capitalize">{title}</p>
              {authorLink ? (
                <a
                  href={authorLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 hover:text-purple-400 transition-colors flex items-center gap-1"
                >
                  <User className="w-3 h-3" />
                  {author}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <User className="w-3 h-3" /> {author}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Download button */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download {resolution}</span>
              <span className="sm:hidden">Save</span>
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Image area ── */}
        <div className="flex-1 overflow-hidden flex items-center justify-center bg-black/40 min-h-0">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-contain max-h-[75vh]"
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* ── Bottom info bar ── */}
        <div className="px-5 py-3 bg-dark-800 border-t border-purple-500/15 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <span>Click outside or press <kbd className="bg-white/10 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono">Esc</kbd> to close</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" /> {downloads.toLocaleString()}
            </span>
            <span className="font-semibold text-slate-400">{resolution}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WallpaperModal;
