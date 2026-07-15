/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        spotify: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#1DB954',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        cream: {
          50: '#FDFCFA',
          100: '#F9F7F5',
          200: '#F3F0EC',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      animation: {
        'vinyl-spin': 'vinyl-spin 3s linear infinite',
        'equalizer': 'equalizer 0.8s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'note-bounce': 'note-bounce 2s ease-in-out infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'ring-breathe': 'ring-breathe 6s ease-in-out infinite',
        'note-float': 'note-float 7s ease-in-out infinite',
        'spotlight-sway': 'spotlight-sway 6s ease-in-out infinite',
        'float-album': 'float-album 10s ease-in-out infinite',
      },
      keyframes: {
        'vinyl-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'equalizer': {
          '0%, 100%': { height: '4px' },
          '50%': { height: '20px' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(29, 185, 84, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(29, 185, 84, 0.6)' },
        },
        'note-bounce': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-10px) rotate(-5deg)' },
          '75%': { transform: 'translateY(-5px) rotate(5deg)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'ring-breathe': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.15)', opacity: '1' },
        },
        'note-float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)', opacity: '0.1' },
          '25%': { transform: 'translateY(-25px) rotate(-8deg)', opacity: '0.2' },
          '75%': { transform: 'translateY(15px) rotate(8deg)', opacity: '0.08' },
        },
        'spotlight-sway': {
          '0%, 100%': { transform: 'rotate(var(--rot, 0deg))', opacity: '0.3' },
          '50%': { transform: 'rotate(calc(var(--rot, 0deg) + 10deg))', opacity: '0.7' },
        },
        'float-album': {
          '0%, 100%': { transform: 'translateY(0) rotate(var(--rot, 0deg))' },
          '33%': { transform: 'translateY(-14px) rotate(calc(var(--rot, 0deg) + 3deg))' },
          '66%': { transform: 'translateY(8px) rotate(calc(var(--rot, 0deg) - 2deg))' },
        },
      },
      boxShadow: {
        'spotify': '0 4px 14px 0 rgba(29, 185, 84, 0.4)',
        'spotify-lg': '0 10px 30px 0 rgba(29, 185, 84, 0.5)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
      backdropBlur: {
        'glass': '12px',
      },
    },
  },
  plugins: [],
}
