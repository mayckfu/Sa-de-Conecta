/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "!./src/pages_temp/**",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Arc/Glass palette
        arc: {
          cream:   '#F7E9C9',
          lavender:'#E8E0FF',
          sky:     '#D9E9FF',
          blush:   '#FADFD8',
          base:    '#f5f0fb',
          dark:    '#0f172a',
          'text-main': '#1e293b',
          'text-muted': '#475569',
        },
        // Mocha (kept for any mocha-specific overrides)
        health: {
          50:  '#f7f7f5',
          100: '#efefe9',
          200: '#e5e6d9',
          300: '#d1d2b9',
          400: '#a3a683',
          500: '#606c38',
          600: '#5e503f',
          700: '#4a3f32',
          800: '#3a3227',
          900: '#2d271f',
          950: '#181511',
        },
        // Glass UI accent system
        glass: {
          purple: 'rgba(139,92,246,1)',
          indigo: 'rgba(99,102,241,1)',
          pink:   'rgba(236,72,153,1)',
        }
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
        'glass-sm': '0 2px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
        'glass-lg': '0 8px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.7)',
        'glow-purple': '0 0 20px rgba(139,92,246,0.25)',
        'glow-indigo': '0 0 20px rgba(99,102,241,0.2)',
      },
      backgroundImage: {
        'gradient-arc': 'linear-gradient(135deg, #F7E9C9 0%, #E8E0FF 35%, #D9E9FF 65%, #FADFD8 100%)',
        'gradient-glass-btn': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
        'gradient-primary': 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        'gradient-soft': 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)',
      },
      animation: {
        'in': 'in 0.4s ease both',
        'blob-float': 'float-blob 15s ease-in-out infinite',
      },
      keyframes: {
        'in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
