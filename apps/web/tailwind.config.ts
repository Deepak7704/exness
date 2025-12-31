import type { Config } from "tailwindcss"

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4a4e69',
          light: '#5a5e79',
          dark: '#3a3e59',
        },
        accent: {
          DEFAULT: '#14110f',
          light: '#2a2724',
          dark: '#0a0908',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'slide-up': {
          'from': {
            'opacity': '0',
            'transform': 'translateY(100%)'
          },
          'to': {
            'opacity': '1',
            'transform': 'translateY(0)'
          }
        },
        'fade-in': {
          'from': {
            'opacity': '0',
          },
          'to': {
            'opacity': '1',
          }
        },
        'fade-in-up': {
          'from': {
            'opacity': '0',
            'transform': 'translateY(30px)'
          },
          'to': {
            'opacity': '1',
            'transform': 'translateY(0)'
          }
        },
        'scale-in': {
          'from': {
            'opacity': '0',
            'transform': 'scale(0.95)'
          },
          'to': {
            'opacity': '1',
            'transform': 'scale(1)'
          }
        },
        'shimmer': {
          '0%': {
            'background-position': '-200% 0'
          },
          '100%': {
            'background-position': '200% 0'
          }
        },
        'float': {
          '0%, 100%': {
            'transform': 'translateY(0px)'
          },
          '50%': {
            'transform': 'translateY(-10px)'
          }
        },
        'pulse-glow': {
          '0%, 100%': {
            'box-shadow': '0 0 20px rgba(74, 78, 105, 0.3)'
          },
          '50%': {
            'box-shadow': '0 0 40px rgba(74, 78, 105, 0.6)'
          }
        }
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.6s ease-out',
        'fade-in-up': 'fade-in-up 0.8s ease-out',
        'scale-in': 'scale-in 0.5s ease-out',
        'shimmer': 'shimmer 3s infinite linear',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
      }
    }
  },
  plugins: [],
} satisfies Config