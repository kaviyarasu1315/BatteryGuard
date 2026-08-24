/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  // Safelist dynamic classes that might be purged
  safelist: [
    // Status colors used dynamically
    { pattern: /^(bg|text|border)-(slate|amber|emerald|rose|sky|orange|violet|pink|indigo|red|green|blue|purple)-(300|400|500|600)(\/(10|15|20|25|30|50))?$/ },
    // Filter button active states built dynamically
    { pattern: /^(border|bg|text)-(slate|amber|rose)-(400|500)(\/\d+)?$/ },
    // Responsive prefixes
    'md:hidden', 'md:block', 'md:flex', 'md:grid',
    'md:translate-x-0', '-translate-x-full',
    'md:static', 'fixed',
  ],
  theme: {
    extend: {
      screens: {
        xs: '480px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        navy: {
          900: '#050d1a',
          800: '#0a1628',
          700: '#0f2040',
          600: '#142a55',
          500: '#1a3568',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
        'slide-in':   'slideIn 0.3s ease-out',
        'fade-in':    'fadeIn 0.4s ease-out',
      },
      keyframes: {
        glow: {
          '0%':   { boxShadow: '0 0 5px rgba(245,158,11,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(245,158,11,0.6)' },
        },
        slideIn: {
          from: { transform: 'translateX(-20px)', opacity: '0' },
          to:   { transform: 'translateX(0)',     opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
