/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
            animation: {
        marquee: 'marquee 26s linear infinite',
        'fade-in': 'fadeIn 0.35s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        sway: 'sway 5.5s ease-in-out infinite',
        'sway-slow': 'sway 7.5s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        petal: 'petal 14s linear infinite',
        shine: 'shine 3.2s ease-in-out infinite',
        'pop-in': 'popIn 0.5s cubic-bezier(.2,.9,.3,1.2) both',
        'reveal-up': 'revealUp 0.8s cubic-bezier(.2,.7,.2,1) both',
        'pulse-ring': 'pulseRing 2.4s ease-out infinite',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0%)' }, '100%': { transform: 'translateX(-33.333%)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        sway: { '0%,100%': { transform: 'rotate(var(--tilt, 0deg)) translateY(0)' }, '50%': { transform: 'rotate(calc(var(--tilt, 0deg) + 1.6deg)) translateY(3px)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        petal: { '0%': { transform: 'translate3d(0,-10%,0) rotate(0deg)', opacity: '0' }, '10%': { opacity: '.9' }, '100%': { transform: 'translate3d(60px,110vh,0) rotate(540deg)', opacity: '0' } },
        shine: { '0%': { transform: 'translateX(-120%) skewX(-18deg)' }, '60%,100%': { transform: 'translateX(220%) skewX(-18deg)' } },
        popIn: { '0%': { opacity: '0', transform: 'scale(.85)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        revealUp: { '0%': { opacity: '0', transform: 'translateY(28px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseRing: { '0%': { boxShadow: '0 0 0 0 rgba(176,47,94,.35)' }, '100%': { boxShadow: '0 0 0 14px rgba(176,47,94,0)' } },
      },
      colors: {
        // JAI WOMENS WORLD palette (pink / raspberry / maroon / navy / gold)
        maroon: { DEFAULT: '#6B1838', deep: '#4A0F28', soft: '#8A2048' },
        gold: { DEFAULT: '#D9A441', light: '#F6D573', deep: '#B4802A' },
        brand: {
          ivory: '#FFF4F3',
          white: '#FFFFFF',
          blush: '#F4A7BA',
          rose: '#B02F5E',
          rosedark: '#8A2048',
          navy: '#12233F',
          navylight: '#1D3358',
          ink: '#171717',
          muted: '#7B5D69',
          border: '#F5D5DB',
          softpink: '#FCE4E8',
          gold: '#D9A441',
          golddark: '#B4802A',

          // Compatibility aliases (so existing classes resolve to the new palette)
          teal: '#12233F',
          tealdark: '#0B1830',
          cream: '#FFF4F3',
          sand: '#F5D5DB',
          sandlight: '#FCE4E8',
          magenta: '#12233F',
          pink: '#F4A7BA',
          green: '#B02F5E',
          deepgreen: '#12233F',
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'Playfair Display', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'Inter', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 2px rgba(217,164,65,.55), 0 18px 40px -12px rgba(176,47,94,.35)',
        hanger: '0 22px 45px -18px rgba(107,24,56,.45)',
        boutique: '0 10px 30px -10px rgba(18, 35, 63, 0.08)',
        soft: '0 8px 30px -8px rgba(18, 35, 63, 0.06)',
        card: '0 4px 20px -2px rgba(18, 35, 63, 0.05)',
      },
      borderRadius: {
        boutique: '6px',
        card: '28px',
        xl2: '1.25rem'
      }
    }
  },
  plugins: []
};
