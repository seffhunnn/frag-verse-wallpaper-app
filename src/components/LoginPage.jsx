import { useState, useMemo } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.png';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { motion } from 'framer-motion';

// Background images matching HeroSection
const BG_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=70&w=300',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=70&w=300',
  'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=70&w=300',
  'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?auto=format&fit=crop&q=70&w=300',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=70&w=300',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=70&w=300',
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&q=70&w=300',
  'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=70&w=300',
];

// Infinite scrolling row of wallpaper thumbnails
const ScrollRow = ({ images, direction = 1, speed = 30 }) => {
  const items = useMemo(() => [...images, ...images, ...images, ...images], [images]);

  return (
    <div className="flex gap-3 overflow-hidden select-none pointer-events-none py-1.5">
      <motion.div
        animate={{ x: direction > 0 ? ['-25%', '0%'] : ['0%', '-25%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
        className="flex gap-3 flex-shrink-0"
        style={{ willChange: 'transform' }}
      >
        {items.map((img, i) => (
          <div
            key={i}
            className="w-48 h-32 rounded-[16px] overflow-hidden flex-shrink-0 bg-slate-900 border border-white/5"
          >
            <img
              src={img}
              alt=""
              className="w-full h-full object-cover opacity-90 dark:opacity-85"
              loading="lazy"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const LoginPage = ({ onLoginSuccess, onBackToHome }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLoginSuccess(result.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 dark:bg-[#09090d] overflow-hidden select-none"
    >
      
      {/* ── Background Sliding Tiles ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* 1px glass blur overlay with a soft dark tint */}
        <div className="absolute inset-0 z-10 bg-black/15 dark:bg-black/35 backdrop-blur-[1px]" />
        
        {/* Sliding Rows - center vertically, scale up to 150%, and add more rows to cover corners fully */}
        <div className="absolute inset-0 z-0 -rotate-6 scale-150 translate-y-[-5%] flex flex-col justify-center gap-3">
          <ScrollRow images={BG_IMAGES.slice(0, 5)} direction={1}  speed={32} />
          <ScrollRow images={BG_IMAGES.slice(3, 8)} direction={-1} speed={42} />
          <ScrollRow images={BG_IMAGES.slice(1, 6)} direction={1}  speed={36} />
          <ScrollRow images={BG_IMAGES.slice(4, 8)} direction={-1} speed={45} />
          <ScrollRow images={BG_IMAGES.slice(2, 7)} direction={1}  speed={28} />
          <ScrollRow images={BG_IMAGES.slice(0, 5)} direction={-1} speed={38} />
          <ScrollRow images={BG_IMAGES.slice(3, 8)} direction={1}  speed={34} />
          <ScrollRow images={BG_IMAGES.slice(1, 6)} direction={-1} speed={40} />
          <ScrollRow images={BG_IMAGES.slice(4, 8)} direction={1}  speed={30} />
          <ScrollRow images={BG_IMAGES.slice(2, 7)} direction={-1} speed={35} />
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={onBackToHome}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/50 dark:border-white/10 shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs font-semibold">Back to Gallery</span>
      </button>

      {/* Centered Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 w-full max-w-[420px] bg-white/80 dark:bg-[#0e0e15]/80 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-[28px] shadow-2xl p-8 sm:p-10 flex flex-col items-center justify-between text-center space-y-8"
      >
        
        {/* Fragverse Logo & Welcome Header */}
        <div className="space-y-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded-[20px] overflow-hidden shadow-lg border border-slate-200/50 dark:border-white/10">
            <img src={logo} alt="Fragverse Logo" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome to Fragverse
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed mx-auto">
              Sign in with Google to start saving favorites, uploading wallpapers, and exploring our curation.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg dark:hover:bg-slate-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                {/* Google Icon */}
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
              </>
            )}
          </button>

          {error && (
            <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-[11px] text-center text-red-500 dark:text-red-400 font-semibold">{error}</p>
            </div>
          )}
        </div>

        {/* Footer legal text */}
        <div className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-[280px]">
          By signing in, you agree to our{' '}
          <span className="font-semibold text-slate-500 hover:text-violet-600 dark:text-slate-450 dark:hover:text-violet-450 cursor-pointer transition-colors">Terms</span> and{' '}
          <span className="font-semibold text-slate-500 hover:text-violet-600 dark:text-slate-450 dark:hover:text-violet-450 cursor-pointer transition-colors">Privacy Policy</span>.
        </div>

      </motion.div>
    </motion.div>
  );
};

export default LoginPage;
