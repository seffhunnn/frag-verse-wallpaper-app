import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, CheckCircle, AlertCircle, ImagePlus, Loader2 } from 'lucide-react';
import logo from '../assets/logo.png';
import { uploadToCloudinary, normalizeCloudinaryPhoto } from '../services/cloudinaryApi';
import { insertSupabaseWallpaper } from '../services/supabaseApi';
import { supabase } from '../services/supabase';

// ─── Category list (matches Categories.jsx, minus "All") ─────────
const CATEGORIES = ['Gaming', 'Formula 1', 'Aesthetic', 'Nature', 'Cars', 'Space', 'Abstract', 'City', 'Architecture', 'Other'];

// ─── Upload state machine ─────────────────────────────────────────
// idle → selected → uploading → success | error
// ─────────────────────────────────────────────────────────────────

const UploadModal = ({ isOpen, onClose, onUploadSuccess, user }) => {
  const [file,        setFile]        = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [category,    setCategory]    = useState('Nature');
  const [title,       setTitle]       = useState('');
  const [author,      setAuthor]      = useState('You');
  const [status,      setStatus]      = useState('idle');   // idle|selected|uploading|success|error
  const [progress,    setProgress]    = useState(0);
  const [errorMsg,    setErrorMsg]    = useState('');
  const [dragging,    setDragging]    = useState(false);

  const fileInputRef = useRef(null);
  const successTimer = useRef(null);

  // Auto-close 2 s after success
  useEffect(() => {
    if (status === 'success') {
      successTimer.current = setTimeout(() => {
        handleClose();
      }, 2000);
    }
    return () => clearTimeout(successTimer.current);
  }, [status]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape' && status !== 'uploading') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, status]);

  const handleClose = useCallback(() => {
    if (status === 'uploading') return;
    setFile(null);
    setPreview(null);
    setTitle('');
    setAuthor('You');
    setStatus('idle');
    setProgress(0);
    setErrorMsg('');
    onClose();
  }, [status, onClose]);

  const acceptFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WEBP, etc.)');
      setStatus('error');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStatus('selected');
    setErrorMsg('');
  };

  // ── Drag & Drop ──────────────────────────────────────────────────
  const onDragOver  = (e) => { e.preventDefault(); setDragging(true);  };
  const onDragLeave = (e) => { e.preventDefault(); setDragging(false); };
  const onDrop      = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    acceptFile(dropped);
  };

  // ── File picker ──────────────────────────────────────────────────
  const onFileChange = (e) => acceptFile(e.target.files[0]);

  // ── Upload ───────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return;

    // No restrictions needed anymore

    setStatus('uploading');
    setProgress(0);
    try {
      // 1. Upload to Cloudinary
      const res = await uploadToCloudinary(file, (pct) => setProgress(pct));
      
      // 2. Insert into Supabase
      const insertedData = await insertSupabaseWallpaper({
        image_url: res.secure_url,
        title: title || 'Untitled',
        category: category || "General",
        author: author || 'You',
        source: 'user'
      });

      const normalized = normalizeCloudinaryPhoto(res, category);
      
      // CRITICAL: Ensure we use the REAL database ID from Supabase
      if (insertedData && insertedData.id) {
        normalized.id = insertedData.id;
      }
      
      normalized.title = title || 'Untitled';
      normalized.author = author || 'You';
      normalized.source = 'user';
      
      onUploadSuccess(normalized);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message ?? 'Upload failed. Please try again.');
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && status !== 'uploading') handleClose(); }}
    >
      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0e0e15] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in transition-colors duration-500">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/8 transition-colors duration-500">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center glow-purple border border-slate-200 dark:border-white/5">
              <img src={logo} alt="FV Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white transition-colors duration-500">Upload Wallpaper</h2>
          </div>
          {status !== 'uploading' && (
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* ── Success banner ── */}
          {status === 'success' && (
            <div className="flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-4 py-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-300">Upload successful!</p>
                <p className="text-xs text-emerald-400/70 mt-0.5">Your wallpaper has been added to the grid.</p>
              </div>
            </div>
          )}

          {/* ── Error banner ── */}
          {status === 'error' && (
            <div className="flex items-start gap-3 bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-300">Upload failed</p>
                <p className="text-xs text-red-400/80 mt-0.5 break-words">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* ── Drop Zone ── */}
          {status !== 'success' && (
            <div
              onClick={() => { if (status !== 'uploading') fileInputRef.current?.click(); }}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`relative rounded-xl border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer
                ${dragging
                  ? 'border-violet-400 bg-violet-500/10 scale-[1.01]'
                  : preview
                    ? 'border-violet-500/40 bg-transparent'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-dark-800/50 hover:border-violet-500/50 hover:bg-violet-500/5'
                }
                ${status === 'uploading' ? 'pointer-events-none' : ''}
              `}
              style={{ minHeight: '180px' }}
            >
              {preview ? (
                /* Image preview */
                <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Uploading overlay */}
                  {status === 'uploading' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                    </div>
                  )}
                  {/* Replace hint */}
                  {status === 'selected' && (
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-[10px] text-slate-300 px-2 py-1 rounded-lg border border-white/10">
                      Click to replace
                    </div>
                  )}
                </div>
              ) : (
                /* Empty drop zone */
                <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 transition-colors duration-500">
                      Drop your image here
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 transition-colors duration-500">
                      or <span className="text-violet-500 dark:text-violet-400 font-medium">click to browse</span> — JPG, PNG, WEBP supported
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />

          {/* ── Metadata inputs ── */}
          {(status === 'selected' || status === 'uploading') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 block transition-colors duration-500">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Neon City"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={status === 'uploading'}
                  className="w-full bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:focus:ring-violet-500/50 focus:border-violet-500/40 transition-all disabled:opacity-60"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 block transition-colors duration-500">Author</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  disabled={status === 'uploading'}
                  className="w-full bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:focus:ring-violet-500/50 focus:border-violet-500/40 transition-all disabled:opacity-60"
                />
              </div>
            </div>
          )}

          {/* ── Category selector ── */}
          {(status === 'selected' || status === 'uploading') && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={status === 'uploading'}
                className="w-full bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:focus:ring-violet-500/50 focus:border-violet-500/40 transition-all cursor-pointer disabled:opacity-60"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {/* ── Progress bar ── */}
          {status === 'uploading' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Uploading to Cloudinary…</span>
                <span className="text-violet-400 font-bold tabular-nums">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-200 ease-out"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #7c3aed, #6366f1, #a855f7)',
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Action buttons ── */}
          {status !== 'success' && (
            <div className="flex items-center gap-3 pt-1">
              {status !== 'uploading' && (
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
                >
                  Cancel
                </button>
              )}

              <button
                onClick={status === 'error' ? () => { setStatus(file ? 'selected' : 'idle'); setErrorMsg(''); } : handleUpload}
                disabled={(!file && status !== 'error') || status === 'uploading'}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                  ${status === 'uploading'
                    ? 'bg-violet-500/40 text-white/60 cursor-wait'
                    : status === 'error'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02]'
                      : !file
                        ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02]'
                  }`}
              >
                {status === 'uploading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading…
                  </>
                ) : status === 'error' ? (
                  <>
                    <Upload className="w-4 h-4" />
                    Try Again
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Wallpaper
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
