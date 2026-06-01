import { useState, useRef, useEffect, memo } from 'react';
import { Search, Upload, X, LogOut, ChevronDown, ImagePlus, User } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Navbar — always-visible search, Upload / Login / Sign Up actions
// ─────────────────────────────────────────────────────────────────

const Navbar = memo(({
  onSearchClick, onUploadClick, onMyUploadsClick, onLogout,
  user, theme, onToggleTheme,
  onLoginClick, onSignupClick,
}) => {
  const [profileOpen,   setProfileOpen]   = useState(false);

  const avatarLetter = user ? (user.name || user.email || 'A').charAt(0).toUpperCase() : 'A';

  return (
    <nav className="fv-navbar sticky top-0 z-40 transition-colors duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-[60px] gap-4">

          {/* Empty spacer on the left since search is removed from Navbar */}
          <div className="flex-1" />

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Upload button (only show when authenticated) */}
            {user && (
              <button
                id="navbar-upload-btn"
                onClick={onUploadClick}
                className="
                  flex items-center gap-2
                  px-4 py-2 rounded-[10px]
                  bg-[var(--accent)] text-white hover:bg-[rgba(124,58,237,0.9)]
                  border border-transparent
                  text-[13px] font-semibold shadow-sm
                  transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                "
              >
                <Upload className="w-3.5 h-3.5" />
                Upload
              </button>
            )}

            {user ? (
              /* Profile dropdown for admin / logged in users */
              <div className="relative">
                <button
                  id="profile-menu-btn"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="
                    flex items-center gap-1.5
                    bg-[var(--surface-2)] border border-[var(--border)]
                    hover:border-[var(--border-hover)]
                    rounded-[10px] px-2 py-1.5
                    cursor-pointer transition-all duration-200 group
                  "
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Avatar" 
                      className="w-6 h-6 rounded-full flex-shrink-0 object-cover"
                    />
                  ) : (
                    <div className="
                      w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                      bg-[var(--accent)] text-white text-[10px] font-bold
                    ">
                      {avatarLetter}
                    </div>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200
                      ${profileOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <div className="
                      absolute right-0 top-full mt-2 w-48 z-20
                      bg-[var(--surface)] border border-[var(--border)]
                      rounded-modal shadow-panel animate-scale-in origin-top-right
                      overflow-hidden
                    ">
                      <div className="px-4 py-2.5 border-b border-[var(--border)]">
                        <p className="text-[11px] text-[var(--text-muted)] font-medium truncate">
                          {user.email || 'User'}
                        </p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => { onMyUploadsClick(); setProfileOpen(false); }}
                          className="
                            w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                            text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                            hover:bg-[var(--surface-2)] transition-all duration-150
                          "
                        >
                          <ImagePlus className="w-4 h-4 text-[var(--accent)]" />
                          Your Wallpapers
                        </button>
                        <button
                          onClick={() => { onUploadClick(); setProfileOpen(false); }}
                          className="
                            w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                            text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                            hover:bg-[var(--surface-2)] transition-all duration-150
                          "
                        >
                          <Upload className="w-4 h-4 text-emerald-500" />
                          Upload New
                        </button>
                      </div>
                      <div className="border-t border-[var(--border)]">
                        <button
                          onClick={() => { onLogout(); setProfileOpen(false); }}
                          className="
                            w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                            text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10
                            transition-all duration-150
                          "
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Login button for guests - styled in purple theme accent */
              <button
                id="navbar-login-btn"
                onClick={onLoginClick}
                className="
                  px-5 py-2 rounded-[10px]
                  bg-[var(--accent)] text-white hover:bg-[rgba(124,58,237,0.9)]
                  text-[13px] font-semibold shadow-sm
                  transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                  flex items-center gap-2
                "
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
});

export default Navbar;
