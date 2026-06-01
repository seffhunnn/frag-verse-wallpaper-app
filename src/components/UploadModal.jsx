import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, CheckCircle, AlertCircle, ImagePlus, Loader2, LogIn } from 'lucide-react';
import logo from '../assets/logo.png';
import { uploadToCloudinary, normalizeCloudinaryPhoto } from '../services/cloudinaryApi';
import { insertSupabaseWallpaper } from '../services/supabaseApi';
import { supabase } from '../services/supabase';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

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
  const [description, setDescription] = useState('');
  const [tags,        setTags]        = useState('');
  const [status,      setStatus]      = useState('idle');   // idle|selected|uploading|success|error
  const [progress,    setProgress]    = useState(0);
  const [errorMsg,    setErrorMsg]    = useState('');
  const [dragging,    setDragging]    = useState(false);

  const fileInputRef = useRef(null);
  const successTimer = useRef(null);

  // Default author name to logged-in user's name
  useEffect(() => {
    if (user && user.name) {
      setAuthor(user.name);
    }
  }, [user]);

  const handleClose = useCallback(() => {
    if (status === 'uploading') return;
    setFile(null);
    setPreview(null);
    setTitle('');
    setAuthor(user && user.name ? user.name : 'You');
    setDescription('');
    setTags('');
    setStatus('idle');
    setProgress(0);
    setErrorMsg('');
    onClose();
  }, [status, onClose, user]);

  // Auto-close 3.5 s after success to let them read the pending message
  useEffect(() => {
    if (status === 'success') {
      successTimer.current = setTimeout(() => {
        handleClose();
      }, 3500);
    }
    return () => clearTimeout(successTimer.current);
  }, [status, handleClose]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape' && status !== 'uploading') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, status, handleClose]);

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
    // 1. Validate Auth State
    if (!user || !user.id) {
      setErrorMsg('Authentication required. Please sign in first.');
      setStatus('error');
      return;
    }

    // 2. Validate Image Picker
    if (!file) {
      setErrorMsg('Please select an image file first.');
      setStatus('error');
      return;
    }

    // 3. Sanitize & Validate Title
    const sanitizedTitle = title?.trim();
    if (!sanitizedTitle) {
      setErrorMsg('Title is required.');
      setStatus('error');
      return;
    }

    // 4. Sanitize Description & Validate Length
    const sanitizedDescription = description?.trim() || "";
    if (sanitizedDescription.length > 500) {
      setErrorMsg('Description must be 500 characters or less.');
      setStatus('error');
      return;
    }

    // 5. Parse Tags
    const parsedTags = (tags || '')
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    setStatus('uploading');
    setProgress(0);

    try {
      // 6. Upload to Cloudinary
      const res = await uploadToCloudinary(file, (pct) => setProgress(pct));
      
      // 7. Verify Cloudinary URLs exist
      if (!res || !res.secure_url) {
        throw new Error("Failed to upload image. Cloudinary URL is missing.");
      }
      
      const image_url = res.secure_url;
      const thumbnail_url = res.secure_url;

      // 8. Insert into Supabase
      const insertedData = await insertSupabaseWallpaper({
        image_url,
        title: sanitizedTitle,
        category: category || "General",
        author: author || 'You',
        description: sanitizedDescription,
        tags: parsedTags || [],
        uploader_id: user.id
      });

      // 9. Add Success Verification
      if (!insertedData || !insertedData.id) {
        throw new Error("Database insertion verification failed: Record ID not returned.");
      }

      const normalized = normalizeCloudinaryPhoto(res, category);
      normalized.id = insertedData.id;
      normalized.title = sanitizedTitle;
      normalized.author = author || 'You';
      normalized.source = 'user';
      normalized.description = sanitizedDescription;
      normalized.tags = parsedTags;
      
      onUploadSuccess(normalized);
      setStatus('success');
    } catch (err) {
      console.error("Upload failed:", err);
      setErrorMsg(err.message ?? 'Upload failed. Please try again.');
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  // ── Authentication Guard ──
  if (!user) {
    return (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      >
        <div className="relative w-full max-w-sm bg-white dark:bg-[#0e0e15] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-8 text-center space-y-6 animate-scale-in">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto text-violet-500">
            <LogIn className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upload Restrictions</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed">
              Sign in with Google to start uploading and sharing your wallpapers with the community.
            </p>
          </div>
          <button
            onClick={async () => {
              try {
                await signInWithPopup(auth, googleProvider);
              } catch (err) {
                alert(`Authentication failed: ${err.message}`);
              }
            }}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-dark-900 rounded-xl font-bold text-sm transition-all duration-200 hover:bg-black dark:hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-200 dark:shadow-white/5"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
          <button
            onClick={handleClose}
            className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && status !== 'uploading') handleClose(); }}
    >
      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0e0e15] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-scale-in transition-colors duration-500">

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
            <div className="flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-4 py-3 animate-fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-300">Upload Successful!</p>
                <p className="text-xs text-emerald-400/70 mt-0.5">Wallpaper submitted for admin review</p>
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
            <>
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

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 block transition-colors duration-500">Description</label>
                <textarea
                  placeholder="Tell us about this wallpaper..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={status === 'uploading'}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:focus:ring-violet-500/50 focus:border-violet-500/40 transition-all disabled:opacity-60 resize-none"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 block transition-colors duration-500">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. gaming, cyberpunk, neon"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  disabled={status === 'uploading'}
                  className="w-full bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:focus:ring-violet-500/50 focus:border-violet-500/40 transition-all disabled:opacity-60"
                />
              </div>
            </>
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
