import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock images for background scroller
const BG_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=150',
];

const ScrollingRow = ({ images, direction = 1, speed = 25 }) => {
  const doubledImages = useMemo(() => [...images, ...images], [images]);
  
  return (
    <div className="flex gap-4 overflow-hidden py-1 select-none pointer-events-none">
      <motion.div
        animate={{ x: direction > 0 ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        className="flex gap-4 flex-shrink-0"
        style={{ willChange: 'transform' }}
      >
        {doubledImages.map((img, i) => (
          <div key={i} className="w-52 h-36 rounded-2xl overflow-hidden bg-slate-800/20 shadow-xl flex-shrink-0 border border-white/5">
            <img src={img} alt="" className="w-full h-full object-cover opacity-60 grayscale transition-opacity duration-300" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const HeroSection = ({ onSearch, searchQuery, setSearchQuery }) => {
  // Use props instead of local state: const [inputValue, setInputValue] = useState('');

  const handleSearch = () => {
    if (onSearch) onSearch(searchQuery.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <section className="relative overflow-hidden pt-20 pb-16 min-h-[520px] flex items-center justify-center">
      {/* ── Background Scroller ── */}
      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-25 scale-110 pointer-events-none blur-[2px]">
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 dark:to-dark-900 z-10" />
         <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-50/80 dark:to-dark-900/90 z-10" />
         
         <div className="flex flex-col gap-4 -rotate-12 translate-y-[-20%]">
            <ScrollingRow images={BG_IMAGES.slice(0, 4)} direction={1} speed={30} />
            <ScrollingRow images={BG_IMAGES.slice(4, 8)} direction={-1} speed={40} />
            <ScrollingRow images={BG_IMAGES.slice(0, 4)} direction={1} speed={35} />
            <ScrollingRow images={BG_IMAGES.slice(4, 8)} direction={-1} speed={45} />
         </div>
      </div>

      {/* Background glow blobs */}
      <div
        style={{
          background:
            'radial-gradient(ellipse, rgba(124,58,237,0.3) 0%, rgba(99,102,241,0.15) 50%, transparent 80%)',
        }}
        className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none transition-opacity duration-1000 dark:opacity-100 opacity-60 z-[1]"
      />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 z-[10]">
        <div className="text-center space-y-8 animate-slide-up">
          {/* Headline */}
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl lg:text-[85px] font-black leading-[1.1] tracking-tight transition-colors duration-500"
            >
              <span className="text-slate-900 dark:text-white drop-shadow-sm">Find what </span>
              <span className="text-gradient drop-shadow-sm">feels</span>
              <br />
              <span className="text-slate-900 dark:text-white drop-shadow-sm">like you.</span>
            </motion.h1>

            {/* Subtext */}
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-[20px] font-medium max-w-xl mx-auto leading-relaxed transition-colors duration-500">
              Where every wallpaper tells a story. 
              <br />
                 ~with love from FragVerse.
            </p>
          </div>

          {/* Hero search */}
          <div className="max-w-xl mx-auto">
            <div className="relative flex items-center group">
              <div className="absolute inset-0 bg-violet-500/20 blur-2xl group-focus-within:bg-violet-500/40 transition-all duration-500 rounded-full" />
              <Search className="absolute left-5 w-5 h-5 text-slate-400 pointer-events-none z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={'Try "neon city", "anime sunset", "galaxy"…'}
                className="search-input w-full bg-white/70 dark:bg-dark-600/70 backdrop-blur-xl border-2 border-slate-200/50 dark:border-white/10 rounded-[24px] pl-14 pr-40 py-5 text-base text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 shadow-2xl relative z-[1] transition-all duration-300"
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold px-8 py-3.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 z-[2] shadow-lg shadow-violet-500/25"
              >
                Search
              </button>
            </div>
          </div>

          {/* Bottom Tagline */}
          <div className="pt-4 opacity-50 select-none">
            <p className="text-[11px] uppercase tracking-[0.4em] font-black text-slate-500 dark:text-slate-400">
              Your wallpaper defines you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
