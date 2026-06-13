import { useState, memo } from 'react';
import { Home, Compass, Grid, Upload, Heart, LogIn, UserPlus, LogOut, Shield, Search, Image, Github, Linkedin, Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';

// ─────────────────────────────────────────────────────────────────
// Sidebar — left nav panel
// ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'home',       label: 'Home',       icon: Home    },
  { id: 'explore',    label: 'Explore',    icon: Compass },
  { id: 'categories', label: 'Categories', icon: Grid    },
  { id: 'search',     label: 'Search',     icon: Search  },
];

const COMMUNITY_ITEMS = [
  { id: 'upload',    label: 'Upload',    icon: Upload },
  { id: 'favorites', label: 'Favorites', icon: Heart  },
  { id: 'your-wallpapers', label: 'Your Wallpapers', icon: Image },
];

const ACCOUNT_ITEMS = [
  { id: 'login',  label: 'Login',   icon: LogIn    },
  { id: 'signup', label: 'Sign Up', icon: UserPlus },
];

const SidebarLink = memo(({ item, active, onClick, badge }) => {
  const Icon = item.icon;
  return (
    <button
      id={`sidebar-${item.id}`}
      onClick={() => onClick && onClick(item)}
      className={`
        w-full flex items-center justify-between px-4 py-2.5 rounded-[11px]
        text-[14.5px] font-medium text-left
        transition-all duration-150 group
        ${active
          ? 'bg-[var(--accent-tint)] text-[var(--accent)] font-semibold'
          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
        }
      `}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon
          className={`w-[18px] h-[18px] flex-shrink-0 transition-colors duration-150
            ${active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'}`}
        />
        <span className="truncate">{item.label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
          {badge}
        </span>
      )}
    </button>
  );
});

const SectionLabel = ({ children }) => (
  <p className="px-4 pt-5 pb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)] select-none">
    {children}
  </p>
);

const DiscordIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.32 4.37A19.8 19.8 0 0 0 15.36 2.8a13.9 13.9 0 0 0-.64 1.32 18.5 18.5 0 0 0-5.44 0A13 13 0 0 0 8.64 2.8a19.7 19.7 0 0 0-4.96 1.57C.54 9.04-.31 13.58.11 18.06a19.9 19.9 0 0 0 6.08 3.08c.49-.67.93-1.38 1.3-2.12-.71-.27-1.39-.6-2.03-.97.17-.12.34-.25.5-.38a14.2 14.2 0 0 0 12.08 0c.16.13.33.26.5.38-.64.38-1.32.7-2.04.97.38.74.81 1.45 1.31 2.12a19.9 19.9 0 0 0 6.08-3.08c.5-5.19-.86-9.68-3.57-13.69ZM8.02 15.31c-1.18 0-2.15-1.08-2.15-2.41s.95-2.41 2.15-2.41c1.2 0 2.17 1.09 2.15 2.41 0 1.33-.95 2.41-2.15 2.41Zm7.96 0c-1.18 0-2.15-1.08-2.15-2.41s.95-2.41 2.15-2.41c1.2 0 2.17 1.09 2.15 2.41 0 1.33-.95 2.41-2.15 2.41Z" />
  </svg>
);

const SOCIAL_ITEMS = [
  { label: 'Discord', icon: DiscordIcon, href: 'https://discord.com/users/seffhunnn' },
  { label: 'GitHub', icon: Github, href: 'https://github.com/seffhunnn' },
  { label: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/in/seffhunnn/' },
];

const SidebarSocialIcon = ({ item }) => {
  const Icon = item.icon;
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={item.label}
      title={item.label}
      className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[var(--text-muted)]
                 hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]
                 transition-colors duration-200"
    >
      <Icon className="w-[16px] h-[16px]" />
    </a>
  );
};

const Sidebar = memo(({
  activeNav = 'home',
  onNavClick,
  onUploadClick,
  onLoginClick,
  onLogout,
  theme,
  onToggleTheme,
  user,
  onSearchClick,
  pendingCount = 0,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'mohdsaifansari8888@gmail.com';
  const isAdmin = user && user.email === ADMIN_EMAIL;

  const visibleNavItems = [...NAV_ITEMS];
  if (user && isAdmin) {
    visibleNavItems.push({ id: 'admin', label: 'Dashboard', icon: Shield });
  }

  const handleClick = (item) => {
    closeMobile();
    if (item.id === 'upload') { onUploadClick?.(); return; }
    if (item.id === 'login' || item.id === 'signup')  { onLoginClick?.();  return; }
    if (item.id === 'search') { onSearchClick?.(); return; }
    onNavClick?.(item.id);
  };

  return (
    <>
      {/* ── Mobile hamburger FAB (only visible on < lg) ── */}
      <button
        id="sidebar-hamburger-btn"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        onClick={() => setMobileOpen(!mobileOpen)}
        className="
          fixed bottom-6 left-4 z-[70]
          lg:hidden
          w-11 h-11 rounded-full
          flex items-center justify-center
          bg-[var(--accent)] text-white
          shadow-[0_4px_20px_rgba(124,58,237,0.45)]
          hover:bg-[rgba(124,58,237,0.9)]
          hover:shadow-[0_4px_28px_rgba(124,58,237,0.65)]
          transition-all duration-200 active:scale-95
        "
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* ── Mobile backdrop ── */}
      <div
        className={`
          fixed inset-0 z-[55] bg-black/50 backdrop-blur-[2px] lg:hidden
          transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={closeMobile}
      />

      {/* ── Sidebar panel ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-[60] bg-[var(--surface)] lg:bg-[var(--sidebar-bg)] flex flex-col
          transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ width: '220px' }}
      >
        {/* Mobile X close button (hidden on desktop) */}
        <button
          id="sidebar-close-btn"
          aria-label="Close menu"
          onClick={closeMobile}
          className="
            absolute top-3.5 right-3 z-10
            lg:hidden
            w-7 h-7 rounded-full
            flex items-center justify-center
            text-[var(--text-muted)] hover:text-[var(--text-primary)]
            hover:bg-[var(--surface-2)]
            transition-colors duration-150
          "
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── Logo area ── */}
        <div className="px-5 h-[60px] flex items-center flex-shrink-0">
          <button
            onClick={() => { onNavClick?.('home'); closeMobile(); }}
            className="flex items-center gap-2.5 group"
            aria-label="Back to top"
          >
            <div className="w-8 h-8 rounded-[10px] overflow-hidden flex-shrink-0 shadow-sm">
              <img src={logo} alt="Fragverse" className="w-full h-full object-cover" />
            </div>
            <span className="text-[15px] font-bold text-[var(--text-primary)] tracking-tight
                             group-hover:text-[var(--accent)] transition-colors duration-200">
              Fragverse
            </span>
          </button>
        </div>

        {/* ── Scrollable nav ── */}
        <nav className="flex-1 overflow-y-auto hide-scrollbar px-3 py-3">

          {/* Main nav */}
          <div className="flex flex-col gap-0.5">
            {visibleNavItems.map(item => (
              <SidebarLink
                key={item.id}
                item={item}
                active={activeNav === item.id}
                onClick={handleClick}
                badge={item.id === 'admin' ? pendingCount : undefined}
              />
            ))}
          </div>

          {/* Community (Only show when logged in) */}
          {user && (
            <>
              <SectionLabel>Community</SectionLabel>
              <div className="flex flex-col gap-0.5">
                {COMMUNITY_ITEMS.map(item => (
                  <SidebarLink
                    key={item.id}
                    item={item}
                    active={activeNav === item.id}
                    onClick={handleClick}
                  />
                ))}
              </div>
            </>
          )}

          {!user ? (
            <>
              <SectionLabel>Account</SectionLabel>
              <div className="px-3 py-1.5">
                <button
                  id="sidebar-login-btn"
                  onClick={() => { onLoginClick?.(); closeMobile(); }}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-[11px]
                             bg-[var(--accent)] text-white hover:bg-[rgba(124,58,237,0.9)]
                             text-[13px] font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                >
                  Login
                </button>
              </div>
            </>
          ) : (
            <>
              <SectionLabel>Account</SectionLabel>
              <div className="flex flex-col gap-1.5 px-3 py-1">
                <div className="flex items-center gap-2.5 px-3 py-2 bg-[var(--surface-2)] rounded-[11px] mb-1">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold text-[var(--text-primary)] truncate">
                      {user.name || 'User'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("Log out of Fragverse?")) {
                      onLogout?.();
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-[11px] text-[13px] font-medium text-red-500 hover:bg-red-500/10 text-left transition-all duration-150"
                >
                  <LogOut className="w-[16px] h-[16px] flex-shrink-0" />
                  Logout
                </button>
              </div>
            </>
          )}
        </nav>

        {/* ── Theme toggle — animated sliding pill ── */}
        <div className="px-4 pb-4 flex-shrink-0">
          <div
            className="relative flex rounded-[10px] overflow-hidden border border-[var(--border)] bg-[var(--surface-2)] p-0.5 transition-colors duration-300"
          >
            {/* Sliding indicator */}
            <div
              className="absolute left-0.5 top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-[8px]
                         bg-[var(--surface)] shadow-sm transform-gpu
                         transition-[transform,background-color,box-shadow] duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: theme === 'light' ? 'translate3d(0,0,0)' : 'translate3d(calc(100% + 2px),0,0)' }}
            />
            <button
              onClick={() => { if (theme !== 'light') onToggleTheme?.(); closeMobile(); }}
              className={`
                relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2
                text-[12.5px] font-medium rounded-[8px]
                transition-colors duration-300
                ${theme === 'light' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}
              `}
            >
              ☀️ Light
            </button>
            <button
              onClick={() => { if (theme !== 'dark') onToggleTheme?.(); closeMobile(); }}
              className={`
                relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2
                text-[12.5px] font-medium rounded-[8px]
                transition-colors duration-300
                ${theme === 'dark' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}
              `}
            >
              🌙 Dark
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border)] flex flex-col items-center gap-2">
            <div className="flex flex-col items-center w-full px-2">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1.5 select-none">
                Support FragVerse
              </span>
              <a
                href="https://github.com/sponsors/seffhunnn"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  group fv-sponsor-btn
                  w-full flex items-center justify-center gap-1.5
                  px-3.5 py-2 rounded-full
                  bg-[var(--surface-2)] border border-[var(--border)]
                  text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                  text-[13px] font-semibold
                "
                aria-label="Sponsor seffhunnn on GitHub"
              >
                <Heart className="w-3.5 h-3.5 text-pink-500 fill-none group-hover:fill-pink-500 transition-all duration-200" />
                <span>Sponsor</span>
              </a>
            </div>
            <div className="flex items-center justify-center gap-1 mt-1">
              {SOCIAL_ITEMS.map(item => (
                <SidebarSocialIcon key={item.label} item={item} />
              ))}
            </div>
            <p className="mt-2 text-center text-[10.5px] leading-4 text-[var(--text-muted)]">
              &copy; 2026 Fragverse. All rights reserved.
            </p>
          </div>
        </div>

      </aside>
    </>
  );
});

export default Sidebar;
