/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        cyber: {
          grey: {
            900: '#0a0b0d',
            800: '#14171c',
            700: '#1f242d',
            600: '#2d343f',
          },
          cyan: '#00f3ff',
          pink: '#ff00c8',
          black: '#050608',
        },
        space: {
          black: '#050608',
          dark: '#0a0b0d',
          panel: '#14171c',
          accent: '#00f3ff',
          neon: '#00f3ff',
          pink: '#ff00c8',
          glow: 'rgba(0, 243, 255, 0.4)',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 243, 255, 0.4)',
        'glow-pink': '0 0 20px rgba(255, 0, 200, 0.4)',
        'glow-purple': '0 0 20px rgba(255, 0, 200, 0.4)',
        'holographic': '0 0 30px rgba(0, 243, 255, 0.15), inset 0 0 15px rgba(255, 255, 255, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        orbitron: ['Inter', 'sans-serif'],
        rajdhani: ['Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'nebula': 'nebula 20s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.1)' },
        },
        nebula: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: 0.5 },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: 0.8 },
        }
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #02010a 0%, #050414 50%, #0b0a24 100%)',
        'nebula-pattern': "url('https://www.transparenttextures.com/patterns/stardust.png')",
      }
    },
  },
  plugins: [],
}
