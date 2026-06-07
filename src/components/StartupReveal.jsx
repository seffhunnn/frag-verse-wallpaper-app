import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

/**
 * StartupReveal Component
 * Plays a premium, cinematic intro animation once per session.
 * 
 * Timeline:
 * 0.0s -> Fullscreen solid black overlay
 * 0.5s -> Centered logo and branding purple glow fade in & scale smoothly
 * 1.2s -> Background wallpaper/ambient dark gradient slowly reveals
 * 3.0s -> Overlay fades out completely, enabling user interaction
 */
const StartupReveal = ({ theme, onComplete }) => {
  const isLight = theme === 'light';

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.6, delay: 3.0, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={onComplete}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none pointer-events-auto ${
        isLight ? 'bg-[#fafafa]' : 'bg-black'
      }`}
    >
      {/* 1. Ambient Wallpaper/Gradient Background Reveal (starts at 1.2s) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1.2, ease: 'easeOut' }}
        className={`absolute inset-0 z-0 ${isLight ? 'bg-[#f5f5f7]' : 'bg-[#0e0e15]'}`}
      >
        {/* Soft brand-purple glowing spheres */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] ${
          isLight ? 'bg-violet-500/8' : 'bg-violet-600/10'
        }`} />
        <div className={`absolute top-1/3 left-1/4 w-[350px] h-[350px] rounded-full blur-[120px] ${
          isLight ? 'bg-indigo-500/4' : 'bg-indigo-600/5'
        }`} />
        
        {/* Cinematic Vignette Overlay */}
        <div className={`absolute inset-0 pointer-events-none ${
          isLight ? 'bg-radial-vignette-light' : 'bg-radial-vignette'
        }`} />
      </motion.div>

      {/* 2. Logo & Branding Centered Block (starts at 0.5s) */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Brand Glow Sweep behind the logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: isLight ? [0, 0.3, 0.18] : [0, 0.4, 0.25],
            scale: [0.8, 1.1, 1]
          }}
          transition={{ duration: 2.0, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute w-48 h-48 rounded-full blur-[36px] ${
            isLight ? 'bg-gradient-to-tr from-violet-400 to-indigo-300' : 'bg-gradient-to-tr from-violet-600 to-indigo-500'
          }`}
        />

        {/* Logo Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-[76px] h-[76px] sm:w-[90px] sm:h-[90px] rounded-2xl overflow-hidden border backdrop-blur-md flex items-center justify-center ${
            isLight 
              ? 'border-black/5 bg-white/60 shadow-lg' 
              : 'border-white/10 bg-black/40 shadow-2xl'
          }`}
        >
          <img src={logo} alt="FragVerse Logo" className="w-[82%] h-[82%] object-contain" />
          
          {/* Subtle light sweep animation on the logo */}
          <motion.div
            initial={{ x: '-150%' }}
            animate={{ x: '150%' }}
            transition={{ duration: 1.6, delay: 1.5, ease: 'easeInOut' }}
            className={`absolute inset-0 -skew-x-12 ${
              isLight 
                ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent' 
                : 'bg-gradient-to-r from-transparent via-white/12 to-transparent'
            }`}
          />
        </motion.div>

        {/* Brand Text */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <h1 className={`text-xl sm:text-2xl font-black tracking-[0.18em] uppercase bg-clip-text ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            Frag<span className={isLight ? 'text-violet-600' : 'text-violet-400'}>Verse</span>
          </h1>
          <p className={`text-[9px] sm:text-[10.5px] font-semibold tracking-[0.12em] sm:tracking-[0.16em] uppercase mt-2.5 transition-colors duration-300 ${
            isLight ? 'text-slate-500/80' : 'text-white/40'
          }`}>
            Because Your Wallpaper Says Who You Are.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StartupReveal;
