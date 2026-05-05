/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // T-Bank brand palette
        brand: {
          DEFAULT: '#FFDD2D',   // T-Bank signature yellow
          light: '#FFE84D',     // lighter variant
          dark: '#F5C800',      // pressed / hover state
        },
        tbank: {
          yellow: '#FFDD2D',
          black: '#1A1A1A',
          gray: '#F6F7F8',      // T-Bank light surface
          border: '#E3E5E8',    // T-Bank border
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        glass: '0 4px 24px rgba(15, 23, 42, 0.07)',
        'glass-dark': '0 8px 32px rgba(0,0,0,0.4)',
        glow: '0 0 28px rgba(255, 221, 45, 0.55)',
        'glow-dark': '0 0 28px rgba(255, 221, 45, 0.30)',
        card: '0 1px 4px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.06)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
