/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f4f7fb',
          100: '#e8eff7',
          200: '#d0dfef',
          300: '#a7c6e3',
          400: '#77a7d4',
          500: '#5488c5',
          600: '#3e6da8',
          700: '#335787',
          800: '#2d4b70',
          900: '#2a405e',
          950: '#1c2a3e',
        }
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'premium': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 10px 30px -5px rgba(0, 0, 0, 0.06)',
        'float': '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 25px -5px rgba(59, 130, 246, 0.15)',
        'dark-card': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 10px 30px -5px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
