/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      animation: {
        marquee: 'marquee 22s linear infinite',
        'fade-in': 'fadeIn 0.35s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      colors: {
        // Official JAI WOMENS WORLD brand palette:
        // Primary Background: #F5F0E9
        // Secondary Background: #FFFFFF
        // Blush Pink: #D8B5A9
        // Muted Rose: #B98270
        // Deep Navy: #172333
        // Primary Text: #171717
        // Secondary Text: #77716F
        // Border: #E9DFD9
        // Soft Pink Background: #F4E8E3
        // Gold Accent: #BFA078
        brand: {
          ivory: '#F5F0E9',
          white: '#FFFFFF',
          blush: '#D8B5A9',
          rose: '#B98270',
          rosedark: '#9F6A5B',
          navy: '#172333',
          navylight: '#243347',
          ink: '#171717',
          muted: '#77716F',
          border: '#E9DFD9',
          softpink: '#F4E8E3',
          gold: '#BFA078',
          golddark: '#9E7F55',

          // Compatibility aliases (so existing classes resolve to the new palette)
          teal: '#172333',
          tealdark: '#0F1722',
          cream: '#F5F0E9',
          sand: '#E9DFD9',
          sandlight: '#F4E8E3',
          magenta: '#172333',
          pink: '#D8B5A9',
          green: '#B98270',
          deepgreen: '#172333',
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'Outfit', 'DM Sans', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        boutique: '0 10px 30px -10px rgba(23, 35, 51, 0.08)',
        soft: '0 8px 30px -8px rgba(23, 35, 51, 0.06)',
        card: '0 4px 20px -2px rgba(23, 35, 51, 0.05)',
      },
      borderRadius: {
        boutique: '6px',
        xl2: '1.25rem'
      }
    }
  },
  plugins: []
};
