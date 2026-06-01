/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Light Surface System ──────────────────────────────────
        surface: {
          bg:       '#FAFAFA',   // page background
          card:     '#FFFFFF',   // card / panel
          subtle:   '#F4F4F6',   // recessed area
          border:   '#E8E8EC',   // default border
          hover:    '#F0F0F4',   // hover background
        },
        // ── Dark Surface System ───────────────────────────────────
        dark: {
          bg:    '#0F0F11',      // page background
          card:  '#1A1A1F',      // card / panel
          subtle:'#242429',      // recessed area
          900:   '#0F0F11',
          800:   '#1A1A1F',
          700:   '#242429',
          600:   '#2E2E35',
          500:   '#3A3A43',
          border:'rgba(255,255,255,0.07)',
        },
        // ── Text ─────────────────────────────────────────────────
        ink: {
          primary:   '#111111',
          secondary: '#666666',
          muted:     '#999999',
          inverse:   '#FFFFFF',
        },
        // ── Accent — Soft Purple ──────────────────────────────────
        accent: {
          DEFAULT:  '#7C3AED',
          soft:     '#8B5CF6',
          light:    '#A78BFA',
          tint:     '#EDE9FE',   // light mode tint
          dark:     'rgba(139,92,246,0.15)', // dark mode tint
          glow:     'rgba(124,58,237,0.20)',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      borderRadius: {
        card: '18px',
        pill: '999px',
        input: '12px',
        modal: '24px',
      },

      boxShadow: {
        card:       '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        'card-dark': '0 8px 30px rgba(0,0,0,0.4)',
        panel:      '0 4px 24px rgba(0,0,0,0.08)',
        input:      '0 1px 3px rgba(0,0,0,0.06)',
        'input-focus': '0 0 0 3px rgba(124,58,237,0.12)',
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },

      animation: {
        'fade-in':    'fadeIn 0.4s ease-out both',
        'fade-up':    'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in':   'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1) both',
        'slide-up':   'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
        shimmer:      'shimmer 1.8s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
    },
  },
  plugins: [],
};
