// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          black: '#000000',
          'gray-900': '#1C1C1E',
          'gray-800': '#2C2C2E',
          'gray-700': '#3A3A3C',
          'gray-600': '#48484A',
          'gray-500': '#636366',
          'gray-400': '#8E8E93',
          'gray-300': '#98989D',
          'gray-200': '#AEAEB2',
          'accent-red': '#FA114F',
          'accent-red-light': '#FC6C74',
          'accent-green': '#92E82A',
          'accent-green-light': '#3CD27C',
          'accent-cyan': '#00C7BE',
          'accent-cyan-light': '#38B1C5',
          'accent-purple': '#B47EFF',
          'accent-purple-light': '#D8B8DA',
          success: '#3CD27C',
          warning: '#FFD60A',
          error: '#FC6C74',
          info: '#38B1C5',
        },
        fontFamily: {
          sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'Roboto', 'sans-serif'],
        },
        borderRadius: {
          '3xl': '1.5rem',
          '4xl': '2rem',
          '5xl': '2.5rem',
        },
        boxShadow: {
          'glow-green': '0 0 20px rgba(146, 232, 42, 0.3)',
          'glow-red': '0 0 20px rgba(250, 17, 79, 0.3)',
          'glow-cyan': '0 0 20px rgba(0, 199, 190, 0.3)',
          'glow-purple': '0 0 20px rgba(180, 126, 255, 0.3)',
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease-out',
          'slide-up': 'slideUp 0.3s ease-out',
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%': { transform: 'translateY(100%)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
        },
      },
    },
    plugins: [],
  }
  