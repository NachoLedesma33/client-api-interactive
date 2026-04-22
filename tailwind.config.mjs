/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        glass: {
          50: 'rgba(255, 255, 255, 0.03)',
          100: 'rgba(255, 255, 255, 0.05)',
          200: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.08)',
          highlight: 'rgba(255, 255, 255, 0.15)',
        },
        cyber: {
          dark: '#0A0A0C',
          darker: '#050507',
          panel: '#121216',
          surface: '#1A1A20',
          border: '#1E1E24',
          accent: '#6366F1', // Indigo 500
          neon: '#10B981', // Emerald 500
          glow: 'rgba(99, 102, 241, 0.5)',
        }
      },
      backgroundImage: {
        'mesh-dark': 'radial-gradient(at 40% 20%, hsla(240, 100%, 15%, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(280, 100%, 10%, 0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(260, 100%, 15%, 0.15) 0px, transparent 50%)',
        'mesh-light': 'radial-gradient(at 40% 20%, hsla(240, 100%, 95%, 0.5) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(280, 100%, 90%, 0.5) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(260, 100%, 95%, 0.5) 0px, transparent 50%)',
      },
      boxShadow: {
        'neon': '0 0 15px rgba(99, 102, 241, 0.3)',
        'neon-strong': '0 0 25px rgba(99, 102, 241, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}