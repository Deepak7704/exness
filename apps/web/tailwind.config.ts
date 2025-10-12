import type { Config } from "tailwindcss"

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
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
        }
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out'
      }
    }
  },
  plugins: [],
} satisfies Config