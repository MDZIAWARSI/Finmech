'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'midnight';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  cycleTheme: () => {},
});

const THEME_STORAGE_KEY = 'finmech_theme_mode_v1';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'midnight')) {
      applyTheme(saved);
    } else {
      // Default to dark mode, or detect if preferred
      applyTheme('dark');
    }
  }, []);

  const applyTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    if (typeof window === 'undefined') return;

    localStorage.setItem(THEME_STORAGE_KEY, newTheme);

    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'midnight');
    root.classList.add(newTheme);

    // Also update meta theme-color for PWA mobile browser chrome
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      if (newTheme === 'light') metaThemeColor.setAttribute('content', '#f8fafc');
      else if (newTheme === 'midnight') metaThemeColor.setAttribute('content', '#000000');
      else metaThemeColor.setAttribute('content', '#090d16');
    }
  };

  const cycleTheme = () => {
    if (theme === 'dark') applyTheme('midnight');
    else if (theme === 'midnight') applyTheme('light');
    else applyTheme('dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: applyTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

