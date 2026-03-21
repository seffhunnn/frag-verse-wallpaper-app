import { useState } from 'react';
import { Search } from 'lucide-react';

const HeroSection = ({ onSearch }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSearch = () => {
    if (onSearch) onSearch(inputValue.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-2 sm:pt-16 sm:pb-4">
      {/* Background glow blobs */}
      <div
        className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, rgba(99,102,241,0.1) 50%, transparent 80%)',
        }}
      />
      <div
        className="absolute bottom-0 left-[10%] w-[300px] h-[400px] rounded-full blur-[80px] pointer-events-none"
        style={{ background: 'rgba(236,72,153,0.08)' }}
      />
      <div
        className="absolute bottom-0 right-[10%] w-[300px] h-[400px] rounded-full blur-[80px] pointer-events-none"
        style={{ background: 'rgba(34,211,238,0.06)' }}
      />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 animate-slide-up">
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight">
            <span className="text-white">Find what </span>
            <span className="text-gradient">feels</span>
            <br />
            <span className="text-white">like you bro.</span>
          </h1>

          {/* Subtext */}
          <p className="text-slate-400 text-base sm:text-[20px] max-w-xl mx-auto leading-relaxed">
            Every wallpaper tells a story. 
            <br />
               ~with love from FragVerse.
          </p>

          {/* Hero search */}
          <div className="max-w-lg mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={'Try "neon city", "anime sunset", "galaxy"…'}
                className="search-input w-full bg-dark-600 border border-white/10 rounded-2xl pl-12 pr-36 py-4 text-sm text-slate-200 placeholder-slate-500 shadow-xl shadow-black/40 transition-all duration-200"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-105"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
