import { useState, useEffect } from 'react';

const THEME_KEY = 'theme';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggle = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    localStorage.setItem(THEME_KEY, newValue ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newValue);
  };

  if (!mounted) {
    return (
      <button
        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        aria-label="Toggle theme"
      >
        <span className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="relative w-5 h-5">
        <span
          className={`absolute inset-0 transition-transform duration-300 ${
            isDark ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'
          }`}
          style={{ color: '#f59e0b' }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 011.414-1.414zM10 15a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        </span>
        <span
          className={`absolute inset-0 transition-transform duration-300 ${
            isDark ? '-rotate-90 opacity-0' : 'rotate-0 opacity-100'
          }`}
          style={{ color: '#4b5563' }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </span>
      </span>
    </button>
  );
}