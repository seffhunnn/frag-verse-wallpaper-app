import { useState, useEffect } from 'react';
import { Shield, Check, X as CloseIcon, Trash2, Calendar, User, Tag, FileText, Loader2, Sparkles } from 'lucide-react';
import { 
  fetchPendingSupabaseWallpapers, 
  approveSupabaseWallpaper, 
  rejectSupabaseWallpaper, 
  deleteSupabasePendingWallpaper 
} from '../services/supabaseApi';

const AdminDashboard = ({ user, isAdmin, onModerationAction }) => {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const loadPending = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPendingSupabaseWallpapers();
      setPendingList(data);
    } catch (err) {
      setError(err.message || 'Failed to load pending wallpapers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadPending();
    }
  }, [isAdmin]);

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await approveSupabaseWallpaper(id);
      setPendingList(prev => prev.filter(w => w.id !== id));
      alert("Wallpaper approved successfully");
      onModerationAction?.();
    } catch (err) {
      alert(`Approval failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Mark this wallpaper as rejected?")) return;
    setProcessingId(id);
    try {
      await rejectSupabaseWallpaper(id);
      setPendingList(prev => prev.filter(w => w.id !== id));
      alert("Wallpaper rejected");
      onModerationAction?.();
    } catch (err) {
      alert(`Rejection failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this wallpaper from database?")) return;
    setProcessingId(id);
    try {
      await deleteSupabasePendingWallpaper(id);
      setPendingList(prev => prev.filter(w => w.id !== id));
      onModerationAction?.();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4 border border-red-500/20">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Access Denied</h2>
        <p className="text-sm text-[var(--text-muted)] mt-2 max-w-sm">
          This dashboard is restricted to administrators only. Please log in with an authorized account.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-6 animate-fade-in">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
            <Shield className="w-8 h-8 text-[var(--accent)]" />
            Moderation Dashboard
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1.5">
            Review and approve user-submitted wallpapers before they appear publicly.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="bg-[var(--accent-tint)] text-[var(--accent)] px-3.5 py-1.5 rounded-full text-xs font-semibold border border-[var(--accent)/10]">
            {pendingList.length} Pending Submission{pendingList.length !== 1 ? 's' : ''}
          </span>
          <button 
            onClick={loadPending}
            disabled={loading}
            className="fv-btn-ghost text-xs py-2 px-4 rounded-[10px]"
          >
            Refresh Queue
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4 text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin mb-2" />
          <p className="text-sm text-[var(--text-muted)]">Loading moderation queue…</p>
        </div>
      ) : pendingList.length === 0 ? (
        /* Empty State */
        <div className="min-h-[35vh] flex flex-col items-center justify-center p-8 text-center bg-[var(--surface)] border border-[var(--border)] rounded-[20px] shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-tint)] flex items-center justify-center text-[var(--accent)] mb-4">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">All Caught Up!</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1.5 max-w-xs">
            There are no pending wallpapers in the queue. Outstanding submissions have been handled.
          </p>
        </div>
      ) : (
        /* Queue Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingList.map(item => (
            <div 
              key={item.id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] overflow-hidden flex flex-col sm:flex-row gap-5 p-5 shadow-sm transition-all duration-200 hover:border-[var(--border-hover)]"
            >
              {/* Image Preview Container */}
              <div className="w-full sm:w-44 h-48 sm:h-auto rounded-[14px] overflow-hidden bg-[var(--surface-2)] flex-shrink-0 relative group">
                {imageErrors[item.id] ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-400 p-4 text-center">
                    <Shield className="w-6 h-6 text-slate-600 mb-1 animate-pulse" />
                    <span className="text-[10px]">Failed to load image</span>
                  </div>
                ) : (
                  <img 
                    src={item.image} 
                    alt={item.title}
                    onError={() => setImageErrors(prev => ({ ...prev, [item.id]: true }))}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <a 
                    href={item.fullImage || item.image} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm transition-all"
                  >
                    View Original
                  </a>
                </div>
              </div>

              {/* Information & Action Content */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider bg-[var(--accent-tint)] px-2 py-0.5 rounded-[5px] inline-block mb-1">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-[var(--text-primary)] truncate" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                      by <span className="font-medium text-[var(--text-secondary)]">{item.author}</span>
                    </p>
                  </div>

                  {/* Metadata fields */}
                  <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                    {item.description && (
                      <div className="flex items-start gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2" title={item.description}>{item.description}</span>
                      </div>
                    )}
                    {item.tags && (
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
                        <span className="truncate" title={item.tags}>{item.tags}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
                      <span className="truncate" title={item.user_id}>UID: {item.user_id || 'Unknown'}</span>
                    </div>
                    {item.created_at && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Moderation Controls */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--border)]">
                  <button
                    onClick={() => handleApprove(item.id)}
                    disabled={processingId !== null}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-[10px] bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-all duration-150 disabled:opacity-50"
                  >
                    {processingId === item.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(item.id)}
                    disabled={processingId !== null}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-[10px] bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-all duration-150 disabled:opacity-50"
                  >
                    <CloseIcon className="w-3.5 h-3.5" />
                    Reject
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={processingId !== null}
                    title="Permanently Delete"
                    className="px-3 py-2 rounded-[10px] bg-[var(--surface-2)] hover:bg-red-500/10 hover:text-red-500 text-[var(--text-secondary)] border border-[var(--border)] transition-all duration-150 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
