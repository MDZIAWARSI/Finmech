'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  const applyThemeToDOM = (t: Theme) => {
    const isDark = t === 'dark';
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.setAttribute('data-theme', t);
    root.style.colorScheme = isDark ? 'dark' : 'light';
    if (document.body) {
      document.body.classList.toggle('dark', isDark);
      document.body.setAttribute('data-theme', t);
    }
  };

  useEffect(() => {
    setMounted(true);
    let initial: Theme = 'light';
    try {
      const stored = localStorage.getItem('finmech_theme') as Theme | null;
      if (stored === 'dark' || stored === 'light') {
        initial = stored;
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        initial = 'dark';
      }
    } catch (_) {}
    setThemeState(initial);
    applyThemeToDOM(initial);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('finmech_theme', newTheme);
    } catch (_) {}
    applyThemeToDOM(newTheme);
  };

  const toggleTheme = () => {
    // Read actual DOM state to avoid any mobile hydration desync
    const isCurrentlyDark = document.documentElement.classList.contains('dark') || document.documentElement.getAttribute('data-theme') === 'dark';
    const next: Theme = isCurrentlyDark ? 'light' : 'dark';
    setTheme(next);
  };

  // Avoid flash during hydration
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

