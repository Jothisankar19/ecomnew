/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f0',
          100: '#faefd9',
          200: '#f5ddb3',
          300: '#edc47f',
          400: '#e4a44a',
          500: '#D4AF37',
          600: '#b8941e',
          700: '#9a7518',
          800: '#7d5e18',
          900: '#674e18',
        },
        secondary: {
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
        dark: {
          900: '#f8f8f8',
          800: '#ffffff',
          700: '#f0f0f0',
          600: '#e8e8e8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        display: ['Cormorant Garamond', 'serif'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        marquee: 'marquee 25s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        luxury: '0 25px 50px -12px rgba(212, 175, 55, 0.2)',
        card: '0 4px 20px rgba(0,0,0,0.08)',
        hover: '0 12px 40px rgba(0,0,0,0.12)',
        glow: '0 0 30px rgba(212, 175, 55, 0.3)',
      },
    },
  },
  plugins: [],
}
